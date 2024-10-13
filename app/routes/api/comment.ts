import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { subtractHours } from "@/helpers/misc";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { savefollowerNotification } from "@/use-cases/notifications";

export const CommentSchema = z.object({
  content: z.string().min(3),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  const formData = await request.formData();

  const user = (await requireUser(request)) as Omit<User, "password">;

  const result = await validateFormData(CommentSchema, formData);

  if (!result.success) {
    return formError(result);
  }

  const replyId = formData.get("reply_id");

  const str = String(formData.get("content"));

  const content = str;

  // const res = content.match(/\B@\w+/g);
  // console.log("Comment Mentions found:", res);

  // if (res && res?.length > 0) {
  //   res?.map((men) => {

  //     const exists = await prisma

  //     content = content.replaceAll(
  //       men,
  //       `[${men}](https://viral.codewebs.pl/user/${men})`,
  //     );
  //   });
  // }

  // const urlExpression =
  //   /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  // const matchedUrls = content.match(urlExpression);
  // // console.log("Post url founds:", matchedUrls);

  // if (matchedUrls && matchedUrls?.length > 0) {
  //   matchedUrls?.map((url) => {
  //     content = content.replaceAll(url, `[${url}](${url})`);
  //   });
  // }

  const countCommentsByHour = await prisma.comment.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: subtractHours(new Date(), 1),
      },
    },
  });

  if (countCommentsByHour >= 15) {
    return json(
      {
        message: `Komentarz nie został utworzony! (${countCommentsByHour}/15 na 1H)`,
        status: "success",
      },
      { status: 300 },
    );
  }

  try {
    if (replyId) {
      await prisma.comment.create({
        data: {
          content,

          active: true,
          reply: {
            connect: {
              id: String(replyId),
            },
          },

          user: {
            connect: {
              id: user.id,
            },
          },
          post: {
            connect: {
              id: String(formData.get("post_id")),
            },
          },
        },
      });
    } else {
      await prisma.comment.create({
        data: {
          content,

          active: true,
          user: {
            connect: {
              id: user.id,
            },
          },
          post: {
            connect: {
              id: String(formData.get("post_id")),
            },
          },
        },
      });
    }
  } catch (_e) {
    return json(
      {
        message: `Komentarz nie został utworzony! (spróbuj ponownie za chwilę)`,
        status: "success",
      },
      { status: 300 },
    );
  }

  const post = await prisma.post.findFirst({
    where: {
      id: String(formData.get("post_id")),
    },
    include: {
      user: true,
    },
  });

  const awailableFollowers = await prisma.user.findFirst({
    where: {
      id: String(post?.user?.id),
    },
    select: {
      followers: {
        select: {
          followerId: true,
          following: {
            select: {
              username: true,
            },
          },
        },
      },
    },
  });

  const send = async (follower: string) => {
    await savefollowerNotification(
      follower,
      `Użytkownik ${user.username} dodał nowy komentarz w poscie ${post?.title.substring(0, 9)}... dodanym przez @${post?.user?.username} `,
      `${process.env.APP_URL ?? "http://localhost:3000"}/feed/${post?.id}`,
    );
  };

  if (awailableFollowers?.followers) {
    for (const follower of awailableFollowers.followers) {
      await send(follower.followerId);
    }
  }

  return json(
    {
      message: `Komentarz został utworzony!`,
      status: "success",
    },
    { status: 300 },
  );
}
