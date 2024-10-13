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
  comment: z.string(),
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

  let comment = await prisma.comment.findFirst({
    where: {
      id: result.data.comment,
    },
  });

  const exists = await prisma.vote.findFirst({
    where: {
      comment: {
        id: result.data.comment,
      },
      user: {
        id: user.id,
      },
    },
  });

  if (exists) {
    let newVal: number | { increment: number } | { decrement: number } = Number(
      comment?.upVotes,
    );

    if (exists.type === "UP" && result.data.action === "DOWN") {
      newVal = { decrement: 1 };
    }

    if (exists.type === "DOWN" && result.data.action === "UP") {
      newVal = { increment: 1 };
    }

    if (result.data.action === "DOWN" && exists.type === "DOWN") {
      newVal = Number(comment?.upVotes);
    }

    if (result.data.action === "UP" && exists.type === "UP") {
      newVal = Number(comment?.upVotes);
    }

    comment = await prisma.comment.update({
      where: { id: result.data.comment },
      data: {
        upVotes: newVal,
      },
    });

    return json(
      {
        action: result.data.action,
        newValue: comment?.upVotes,
        message: `Twoja ocena została zaaktualizowana!`,
        status: "success",
      },
      { status: 300 },
    );

    // return json(
    //   {
    //     newValue: comment?.upVotes,
    //     message: `Oceniłeś już ten komentarz!`,
    //     status: "success",
    //   },
    //   { status: 300 },
    // );
  }

  //   if (result.data.action == "DOWN" && comment?.upVotes === 0) {
  //     return json(
  //       {
  //         newValue: comment?.upVotes,
  //         message: `Komentarz został pomyślnie oceniony!`,
  //         status: "success",
  //       },
  //       { status: 300 },
  //     );
  //   }

  comment = await prisma.comment.update({
    where: { id: result.data.comment },
    data: {
      upVotes:
        result.data.action === "UP" ? { increment: 1 } : { decrement: 1 },
    },
  });
  //   }

  // await prisma.post.update({
  // 	where: { id: result.data.post },
  // 	data: {
  // 		upVotes:
  // 			result.data.action === "UP" ? { increment: 1 } : { decrement: 1 },
  // 	},
  // });

  await prisma.vote.create({
    data: {
      type: result.data.action,
      comment: {
        connect: {
          id: result.data.comment,
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
      newValue: comment?.upVotes,
      message: `Komentarz został pomyślnie oceniony!`,
      status: "success",
    },
    { status: 300 },
  );
}
