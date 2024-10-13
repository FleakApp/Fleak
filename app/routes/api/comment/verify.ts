import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";

import { requireUser, requireUserWithRole } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { saveUserNotification } from "@/use-cases/notifications";

export const schema = z.object({
  //   action: z.enum(["DOWN", "UP"]),
  comment: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  await requireUserWithRole(request, "admin");

  const formData = await request.formData();

  //   const user = (await requireUser(request)) as Omit<User, "password">;

  const result = await validateFormData(schema, formData);

  if (!result.success) {
    // return formError(result);
    return json(
      {
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  const exists = await prisma.comment.findFirst({
    where: {
      id: result.data.comment,
    },
    include: {
      post: true,
    },
  });

  if (!exists) {
    return json(
      {
        message: `Taki komentarz nie został znaleziony!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.comment.update({
    where: {
      id: exists.id,
    },
    data: {
      active: exists.active === false ? true : false,
    },
  });

  await saveUserNotification(
    exists.userId!,
    exists.active === false
      ? `Administrator zatwierdził twój komentarz!`
      : `Administrator zablokował twój komentarz!`,

    exists.active === false
      ? `${process.env.APP_URL ?? "http://localhost:3000"}/feed/${exists.post?.slug}`
      : ``,
  );

  return json(
    {
      message: `Status został pomyślnie przełączony!`,
      status: "success",
    },
    { status: 300 },
  );
}
