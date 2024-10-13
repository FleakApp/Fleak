import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export const PostLikeSchema = z.object({
  post: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  const formData = await request.formData();

  const user = (await requireUser(request)) as Omit<User, "password">;

  const result = await validateFormData(PostLikeSchema, formData);

  if (!result.success) {
    return json(
      {
        state: false,
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  const exists = await prisma.like.findFirst({
    where: {
      user: {
        id: user.id,
      },
      post: {
        id: result.data.post,
      },
    },
  });

  if (exists) {
    await prisma.like.delete({ where: { id: exists.id } });

    return json(
      {
        state: false,
        message: `like został usunięty!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.like.create({
    data: {
      post: {
        connect: {
          id: result.data.post,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return json(
    {
      state: true,
      message: `like został utworzony!`,
      status: "success",
    },
    { status: 300 },
  );
}
