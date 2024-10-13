import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export const FollowSchema = z.object({
  user: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  const formData = await request.formData();

  const user = (await requireUser(request)) as Omit<User, "password">;

  const result = await validateFormData(FollowSchema, formData);

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

  if (user.id === result.data.user) {
    return json(
      {
        message: "Ups chyba nie myślałeś że możesz zaobserwować swój profil",
        status: "success",
      },
      { status: 300 },
    );
  }

  const exists = await prisma.follows.findFirst({
    where: {
      following: {
        id: result.data.user,
      },
      follower: {
        id: user.id,
      },
    },
  });

  if (exists) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        following: {
          deleteMany: [
            {
              followerId: user.id,
              followingId: result.data.user,
            },
          ],
        },
      },
    });

    return json(
      {
        state: false,
        message: `Przestałeś obserwować tego uzytkownika!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.follows.create({
    data: {
      following: {
        connect: {
          id: result.data.user,
        },
      },
      follower: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  return json(
    {
      state: true,
      message: `Dodano do obserwowanych!`,
      status: "success",
    },
    { status: 300 },
  );
}
