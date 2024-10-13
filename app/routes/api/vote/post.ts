import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { subtractHours } from "@/helpers/misc";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export const PostVoteSchema = z.object({
  action: z.enum(["DOWN", "UP"]),
  post: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  const formData = await request.formData();

  const user = (await requireUser(request)) as Omit<User, "password">;

  const result = await validateFormData(PostVoteSchema, formData);

  if (!result.success) {
    return json(
      {
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  // const countVotesByHours = await prisma.vote.count({
  //   where: {
  //     userId: user.id,
  //     createdAt: {
  //       gte: subtractHours(new Date(), 1),
  //     },
  //   },
  // });

  // if (countVotesByHours >= 10) {
  //   return json(
  //     {
  //       message: `Głos nie został utworzony! limit (${countVotesByHours}/10 na godzinę)`,
  //       status: "success",
  //     },
  //     { status: 300 },
  //   );
  // }

  let post = await prisma.post.findFirst({
    where: {
      id: result.data.post,
    },
  });

  const exists = await prisma.vote.findFirst({
    where: {
      post: {
        id: result.data.post,
      },
      user: {
        id: user.id,
      },
    },
  });

  if (exists) {
    await prisma.vote.update({
      where: {
        id: exists.id,
      },
      data: {
        type: result.data.action,
      },
    });

    let newVal: number | { increment: number } | { decrement: number } = Number(
      post?.upVotes,
    );

    if (exists.type === "UP" && result.data.action === "DOWN") {
      newVal = { decrement: 1 };
    }

    if (exists.type === "DOWN" && result.data.action === "UP") {
      newVal = { increment: 1 };
    }

    if (result.data.action === "DOWN" && exists.type === "DOWN") {
      newVal = Number(post?.upVotes);
    }

    if (result.data.action === "UP" && exists.type === "UP") {
      newVal = Number(post?.upVotes);
    }

    post = await prisma.post.update({
      where: { id: result.data.post },
      data: {
        upVotes: newVal,
      },
    });

    return json(
      {
        action: result.data.action,
        state: post?.upVotes,
        message: `Twoja ocena została zaaktualizowana!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  post = await prisma.post.update({
    where: { id: result.data.post },
    data: {
      upVotes:
        result.data.action === "UP" ? { increment: 1 } : { decrement: 1 },
    },
  });

  await prisma.vote.create({
    data: {
      type: result.data.action,
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
      action: result.data.action,
      state: post?.upVotes,
      message: `Post został pomyślnie oceniony!`,
      status: "success",
    },
    { status: 300 },
  );
}
