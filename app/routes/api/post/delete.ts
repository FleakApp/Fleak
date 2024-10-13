import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUserWithRole } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";
import { saveUserNotification } from "@/use-cases/notifications";

export const schema = z.object({
  post: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  await requireUserWithRole(request, "admin");

  const formData = await request.formData();

  const result = await validateFormData(schema, formData);

  if (!result.success) {
    return json(
      {
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  const exists = await prisma.post.findFirst({
    where: {
      id: result.data.post,
    },
  });

  if (!exists) {
    return json(
      {
        message: `Taki post nie został znaleziony!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.post.delete({
    where: {
      id: exists.id,
    },
  });

  await saveUserNotification(
    exists.userId,
    `Administrator usunął twój post '${exists.title}'!`,
  );

  return json(
    {
      message: `Post został pomyślnie usunięty!`,
      status: "success",
    },
    { status: 300 },
  );
}
