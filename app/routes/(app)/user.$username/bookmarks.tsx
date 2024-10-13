import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

import { AuthorizationError } from "@fleak-org/remix-auth";

import Empty from "@/components/empty";
import { BookmarkIcon } from "@/components/icons";
import { requireUser } from "@/helpers/auth";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { PostItem } from "../__post";

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  //remove @ at username
  // const userId = String(params.userId).replace("@", "");
  const username = String(params.username).replace("@", "");
  // const username = String(params.username).replace("@", "");

  const loggedUser = (await requireUser(request)) as Omit<User, "password">;

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      likes: {
        where: {
          postId: { not: null },
        },
        include: {
          post: {
            include: {
              user: true,
              likes: true,
              votes: true,
              comments: true,
              category: true,
              _count: {
                select: {
                  comments: {
                    where: {
                      active: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      _count: true,
    },
  });

  if (loggedUser.id !== user?.id) {
    throw new Error("Nie znaleziono takiego użytkownika");
  }

  if (!user) {
    throw new Error("Nie znaleziono takiego użytkownika");
  }

  return json({ user, loggedUser });
};

export default function UserId() {
  const { user } = useLoaderData<typeof loader>();

  return (
    <div className="p-0">
      <div className="grid grid-cols-1 gap-0 divide-y dark:divide-gray-500">
        {user.likes.map((like) => (
          <PostItem
            // @ts-expect-error
            post={like.post}
            key={like.id}
          />
        ))}
      </div>
      {user._count.likes === 0 && (
        <Empty
          icon={BookmarkIcon}
          iconSize={32}
          withoutBorder
          title="Użytkownik nie obserwuje jeszcze żadnego z postów!"
        />
      )}
    </div>
  );
}
