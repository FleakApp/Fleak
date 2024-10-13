import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { MessagesSquare } from "lucide-react";

import Empty from "@/components/empty";
import { prisma } from "@/services/db.server";
import { PostItem } from "../__post";

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  //remove @ at username
  const username = String(params.username).replace("@", "");
  // const username = String(params.username).replace("@", "");

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      posts: {
        where: {
          active: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          user: {
            include: {
              followers: {
                include: {
                  follower: true,
                },
              },
              _count: true,
            },
          },
          tags: true,
          likes: true,
          votes: true,

          comments: {
            where: {
              active: true,
            },
            include: {
              replies: true,
              likes: true,
              user: true,
            },
          },
          _count: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Nie znaleziono takiego użytkownika");
  }

  return json({ user });
};

export default function UserId() {
  const { user } = useLoaderData<typeof loader>();

  const posts = user.posts;

  return (
    <div>
      {user.posts.length === 0 && (
        <Empty
          icon={MessagesSquare}
          iconSize={32}
          withoutBorder
          title="Użytkownik Nie opublikował jeszcze żadnych postów!"
        />
      )}
      <div className="grid grid-cols-1 gap-0 divide-y dark:divide-primary">
        {posts?.map((post) => (
          <>
            <PostItem
              key={post.id}
              // @ts-ignore, @ts-expect-check: post invalid type
              post={post}
              tags={false}
              comments={false}
              followers={false}
            />
          </>
        ))}
      </div>
    </div>
  );
}
