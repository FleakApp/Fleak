/* eslint-disable @typescript-eslint/ban-ts-comment */
import { parseWithZod } from "@conform-to/zod";
import type { ActionFunctionArgs } from "@remix-run/node";
import {
  unstable_composeUploadHandlers as composeUploadHandlers,
  unstable_createMemoryUploadHandler as createMemoryUploadHandler,
  json,
  unstable_parseMultipartFormData as parseMultipartFormData,
} from "@remix-run/node";
// const sizeOf = require('buffer-image-size');
import sizeOf from "buffer-image-size";
import { z } from "zod";

import { fakePromise, formError, slugify } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { accentsTidy, subtractMinutes } from "@/helpers/misc";
import { auth } from "@/services/authenticate/auth.server";
import { uploadCloudinaryStream } from "@/services/cloudinary.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { savefollowerNotification } from "@/use-cases/notifications";

const typeEnum = z.enum(["Photo", "Animated", "Article", "Iframe"]);

export const CreatePostSchema = z.discriminatedUnion("type", [
  z.object({
    title: z.string().min(3).max(60),
    category: z.string().min(3),
    type: typeEnum.extract(["Photo"]),
    tags: z.string().optional(),
    image: z.any().optional(),
    content: z.string().optional(),
  }),
  z.object({
    title: z.string().min(3).max(60),
    category: z.string().min(3),
    type: typeEnum.extract(["Animated"]),
    tags: z.string().optional(),
    image: z.any().optional(),
    iframe: z.any().optional(),
    content: z.string().optional(),
  }),
  z.object({
    title: z.string().min(3).max(60),
    category: z.string().min(3),
    content: z.string().min(3),
    tags: z.string().optional(),
    image: z.any().optional(),
    iframe: z.any().optional(),
    type: typeEnum.extract(["Article"]),
  }),
  z.object({
    title: z.string().min(3).max(60),
    category: z.string().min(3),
    content: z.string().min(3).optional(),
    tags: z.string().optional(),
    iframe: z.any().optional(),
    type: typeEnum.extract(["Iframe"]),
  }),
]);
type AllowedType = "Photo" | "Animated" | "Article" | "Iframe";

export async function action({ request }: ActionFunctionArgs) {
  await fakePromise();

  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const user = (await requireUser(request)) as Omit<User, "password">;

  const uploadHandler = composeUploadHandlers(
    createMemoryUploadHandler({ maxPartSize: 60_000_000 }),
  );

  const formData = await parseMultipartFormData(request, uploadHandler);

  const imgSrc = formData.get("image") as File;

  let uploaded: string | null = null;

  if (imgSrc) {
    try {
      const upload = await uploadCloudinaryStream(imgSrc, true);
      // @ts-expect-error
      uploaded = upload.result.secure_url;
    } catch (e) {
      console.error(e);

      formError({
        fieldErrors: {
          image: ["Request error"],
        },
      });
    }
  }

  const result = await parseWithZod(formData, {
    schema: CreatePostSchema.superRefine((data, ctx) => {
      if (data.type === "Photo" || data.type === "Animated") {
        if (!uploaded) {
          ctx.addIssue({
            path: ["image"],
            code: z.ZodIssueCode.custom,
            message: "Resource is required",
          });
          return;
        }
      }
    })
      .superRefine(async (data, ctx) => {
        let err = "";

        if (data.type === "Photo") {
          const img = formData.get("image") as File;
          const buffer = await img.arrayBuffer();
          const bytes = new Int8Array(buffer);
          const dimensions = sizeOf(Buffer.from(bytes));

          if (dimensions.width < 500) {
            err = "Szeokość pliku musi być większa niż 500px";
          }
          if (dimensions.height < 300) {
            err = "Wysokość pliku musi być większa niż 300px";
          }
          if (dimensions.height > 2000) {
            err = "Wysokość pliku musi być mniejsza niż 2000px";
          }

          if (err) {
            ctx.addIssue({
              path: ["image"],
              code: z.ZodIssueCode.custom,
              message: err,
            });
            return;
          }
        }
      })
      .superRefine((data, ctx) => {
        if (data.tags) {
          const tags = data.tags?.split(",");

          if (tags.length > 6) {
            ctx.addIssue({
              path: ["tags"],
              code: z.ZodIssueCode.custom,
              message: "Możesz dodać maksymalnie 6 tagów",
            });
            return;
          }
        }
      })
      .superRefine((data, ctx) => {
        if (data.type === "Iframe") {
          const iframe = formData.has("iframe")
            ? String(formData.get("iframe"))
            : "";

          const youtubeValid =
            /(https?:\/\/)?((www\.)?youtube\.com|rumble\.com)\/embed\/.+/;

          if (!iframe.match(youtubeValid)) {
            ctx.addIssue({
              path: ["iframe"],
              code: z.ZodIssueCode.custom,
              message:
                "Niprawidłowy adres url ramki. Dopuszcalne ramki z serwisów youtube, rumble",
            });
            return;
          }
        }
      }),
    async: true,
  });

  if (result.status !== "success") {
    return json(result.reply());
  }

  const countPostsByMinutes = await prisma.post.count({
    where: {
      userId: user.id,
      createdAt: {
        gte: subtractMinutes(new Date(), 5),
      },
    },
  });

  if (countPostsByMinutes >= 1) {
    return json(
      {
        message: `Post nie został utworzony! Osiągnąłeś limit odczekaj 5min.`,
        status: "success",
      },
      { status: 300 },
    );
  }

  const content = String(formData.get("content"));

  // const urlExpression =
  //   /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  // const matchedUrls = content.match(urlExpression);
  // // console.log("Post url founds:", matchedUrls);

  // if (matchedUrls && matchedUrls?.length > 0) {
  //   matchedUrls?.map((url) => {
  //     content = content.replaceAll(url, `[${url}](${url})`);
  //   });
  // }

  const post = await prisma.post.create({
    data: {
      title: String(formData.get("title")),
      slug: slugify(String(formData.get("title"))),

      content,
      type: String(formData.get("type")) as AllowedType,
      image: String(uploaded),

      iframe: formData.has("iframe") ? String(formData.get("iframe")) : "",

      sensitive: formData.has("sensitive") ? true : false,

      active: false,
      category: {
        connect: {
          id: String(formData.get("category")),
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  if (result.payload.tags) {
    const tgs = String(result.payload.tags)?.split(",") ?? [];

    const tags = tgs?.filter((content: string) => {
      // remove special characters
      const string = accentsTidy(content);

      return string.length > 0;
    });

    const prepared = tags?.map((content: string) => {
      // remove special characters
      const string = accentsTidy(content);

      return {
        where: {
          id: string,
        },
        create: {
          content: string,
        },
      };
    });

    await prisma.post.update({
      where: {
        id: post.id,
      },
      data: {
        tags: {
          connectOrCreate: [...prepared],
        },
      },
    });
  }

  const awailableFollowers = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
    select: {
      followers: {
        select: {
          followerId: true,
        },
      },
    },
  });

  const send = async (follower: string) => {
    await savefollowerNotification(
      follower,
      `Użytkownik @${user.username} dodał nowy post.`,
      `${process.env.APP_URL ?? "http://localhost:3000"}/feed/${post.slug}`,
    );
  };

  if (awailableFollowers?.followers) {
    for (const follower of awailableFollowers.followers) {
      await send(follower.followerId);
    }
  }

  return json(
    {
      message: `Post został utworzony!`,
      redirect: `/feed/${post.slug}`,
      status: "success",
    },
    { status: 300 },
  );
}
