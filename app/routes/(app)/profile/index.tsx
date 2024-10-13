/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useRef, useState } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
import { json, useLoaderData } from "@remix-run/react";
import { z } from "zod";

import {
  fakePromise,
  formError,
  validateFormData,
} from "@fleak-org/remix-utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Loader,
  Textarea,
} from "@fleak-org/ui";

import { Form, FormField } from "@/components/form";
import { requireUser } from "@/helpers/auth";
import { accentsTidy } from "@/helpers/misc";
import { useGlobalSubmittingState } from "@/helpers/pending";
import { auth } from "@/services/authenticate/auth.server";
import { uploadCloudinaryStream } from "@/services/cloudinary.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { back } from "@/services/helpers.server";

const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];
const MAX_UPLOAD_SIZE = 1024 * 1024 * 4.5; // 4.5MB

const updateSchema = z.object({
  first_name: z.string().min(3).max(64),
  last_name: z.string().min(3).max(64),
  username: z.string().min(3).max(64),
  bio: z.string().max(250).optional(),
  image: z.any().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const userCookied = (await requireUser(request)) as Omit<User, "password">;

  const uploadHandler = composeUploadHandlers(
    createMemoryUploadHandler({ maxPartSize: 30_000_000 }),
  );

  const user = await prisma.user.findUnique({
    where: { id: userCookied.id },
    include: { account: true },
  });

  const formData = await parseMultipartFormData(request, uploadHandler);

  const result = await validateFormData(
    updateSchema

      .superRefine(async (data, ctx) => {
        const existingUser = await prisma.user.findFirst({
          where: {
            id: { not: user.id },
            username: data.username,
          },
          select: { id: true },
        });

        if (existingUser) {
          ctx.addIssue({
            path: ["username"],
            code: z.ZodIssueCode.custom,
            message: "Użytkownik o tym loginie już istnieje",
          });
          return;
        }
      })
      .superRefine((data: { image?: File }, ctx) => {
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

  const imgSrc = formData.get("image") as File;

  let uploaded: string | null = null;

  if (imgSrc && imgSrc.size > 0) {
    const upload = await uploadCloudinaryStream(imgSrc, false);
    uploaded = upload.result.secure_url;
  }

  const data = {
    ...result.data,
    first_name: accentsTidy(result.data.first_name),
    last_name: accentsTidy(result.data.last_name),
    username:
      // not update username if logged by twitter
      user?.account?.provider === "twitter"
        ? accentsTidy(user.username, true)
        : accentsTidy(result.data.username, true),
  };

  // if (user.email !== data.email) {
  //   await sendVerifyEmail(user, user.id);
  // }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      ...data,
      image: uploaded ? uploaded : user.image,
      // emailVerified: user.email !== data.email ? null : user.emailVerified,
    },
  });

  return back(request, {
    message: `Twoje konto zostało zaaktualizowane!`,
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await fakePromise();
  const cookie = await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const user = await prisma.user.findUnique({
    where: { id: cookie },
    include: { account: true },
  });

  return json({ user });
};

export default function ForgotPassword() {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const { user } = useLoaderData<typeof loader>();
  const [avatar, setAvatar] = useState(user?.image);
  const submittingState = useGlobalSubmittingState();

  function handleChange(e: any) {
    setAvatar(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <div className="flex h-full flex-col justify-center space-y-6">
      <Form method="post" className="space-y-6" encType="multipart/form-data">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Zaktualizuj swój profil</CardTitle>
            <CardDescription>
              Wprowadź zmiany w informacjach swojego profilu.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="h-20 w-20 rounded-full">
                <AvatarImage src={String(avatar)} alt="User profile" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  avatarInputRef.current?.click();
                }}
              >
                Wybierz zdjęcie
              </Button>

              <FormField
                name="image"
                ref={avatarInputRef}
                hidden
                input={
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                }
              />
            </div>
            <div className="">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <FormField
                    label="Imię"
                    name="first_name"
                    defaultValue={user?.first_name ?? ""}
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    label="Nazwisko"
                    name="last_name"
                    defaultValue={user?.last_name ?? ""}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <FormField
                  label="Nazwa użytkownika"
                  name="username"
                  // disabled={
                  //   user?.account?.provider === "twitter" ? true : false
                  // }
                  defaultValue={String(user?.username)}
                />

                {user?.account?.provider === "twitter" && (
                  <p className="text-xs text-foreground">
                    Twoja nazwa użytkownika pozostanie bez zmian ponieważ konto
                    jest powiązane z kontem X.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <FormField
                  label="Bio"
                  name="bio"
                  defaultValue={String(user?.bio)}
                  input={<Textarea />}
                  className="min-h-[200px]"
                  // @ts-expect-error
                  rows="7"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button disabled={submittingState !== "idle"} className="space-x-3">
              Zaaktualizuj profil
              {submittingState !== "idle" && <Loader className="ml-3 size-4" />}
            </Button>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
