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
  force: z.optional(z.string()),
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

  if (result.data.force) {
    await prisma.post.update({
      where: {
        id: exists.id,
      },
      data: {
        active: result.data.force === "true" ? true : false,
      },
    });

    await saveUserNotification(
      exists.userId!,
      result.data.force === "true"
        ? `Administrator zatwierdził twój post '${exists.title}'!`
        : `Administrator zablokował twój post '${exists.title}'!`,

      result.data.force === "true"
        ? `${process.env.APP_URL ?? "http://localhost:3000"}/feed/${exists.slug}`
        : ``,
    );

    return json(
      {
        message: `Force Status został pomyślnie przełączony!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.post.update({
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
      ? `Administrator zatwierdził twój post '${exists.title}'!`
      : `Administrator zablokował twój post '${exists.title}'!`,

    exists.active === false
      ? `${process.env.APP_URL ?? "http://localhost:3000"}/feed/${exists.slug}`
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
