import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { TrendingUp } from "lucide-react";

import Empty from "@/components/empty";
import { requireUser } from "@/helpers/auth";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { PostItem } from "../__post";

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  //remove @ at username
  const username = String(params.username).replace("@", "");
  // const username = String(params.username).replace("@", "");

  const loggedUser = (await requireUser(request)) as Omit<User, "password">;

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      votes: {
        where: {
          postId: { not: null },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          post: {
            include: {
              user: true,
              likes: true,
              votes: true,
              comments: true,

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
        {user.votes.map((vote) => (
          <PostItem
            // @ts-expect-error
            post={vote.post}
            key={vote.id}
          />
        ))}
      </div>
      {user._count.votes === 0 && (
        <Empty
          icon={TrendingUp}
          iconSize={32}
          withoutBorder
          title="Użytkownik Nie ocenił jeszcze żadnego z postów!"
        />
      )}
    </div>
  );
}
