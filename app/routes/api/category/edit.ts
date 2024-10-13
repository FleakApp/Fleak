import type { ActionFunctionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";

import { requireUserWithRole } from "@/helpers/auth";
import { slugify } from "@/helpers/misc";
import { auth } from "@/services/authenticate/auth.server";
import { uploadCloudinaryStream } from "@/services/cloudinary.server";
import { prisma } from "@/services/db.server";

export const schema = z.object({
  category: z.string(),

  name: z.string().min(3).max(32),
  description: z.string().min(3).max(164),
  image: z.any().optional(),
});

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_UPLOAD_SIZE = 1024 * 1024 * 4.5; // 4.5MB

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  await requireUserWithRole(request, "admin");

  const uploadHandler = composeUploadHandlers(
    createMemoryUploadHandler({ maxPartSize: 30_000_000 }),
  );
  // const formData = await request.formData();
  const formData = await parseMultipartFormData(request, uploadHandler);

  const result = await validateFormData(
    schema.superRefine((data: { image?: File }, ctx) => {
      let err = "";

      if (data.image && data.image.size > MAX_UPLOAD_SIZE) {
        err = "Rozmiar pliku musi być mniejszy niż 4,5 MB";
      } else if (
        data.image &&
        data.image.size > 0 &&
        !ACCEPTED_IMAGE_TYPES.includes(data.image.type)
      ) {
        err = "Plik musi być obrazem";
      }

      if (err) {
        ctx.addIssue({
          path: ["image"],
          code: z.ZodIssueCode.custom,
          message: err,
        });
        return;
      }
    }),
    formData,
  );

  if (!result.success) {
    return formError(result);
  }

  const original = await prisma.category.findFirst({
    where: {
      id: result.data.category,
    },
  });

  const imgSrc = formData.get("image") as File;

  let uploaded: string | null = null;

  if (imgSrc && imgSrc.size > 0) {
    const upload = await uploadCloudinaryStream(imgSrc, false);
    uploaded = upload.result.secure_url;
  }

  await prisma.category.update({
    where: {
      id: result.data.category,
    },
    data: {
      name: result.data.name,
      description: result.data.description,
      image: uploaded ?? original?.image,
      active: true,
      slug: slugify(result.data.name),
    },
  });

  return json(
    {
      message: `Kategoria została zaktualizowana!`,
      status: "success",
    },
    { status: 300 },
  );
}
