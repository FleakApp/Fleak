import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { MessagesSquare } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fleak-org/ui";

import Empty from "@/components/empty";
import {
  BookmarkIcon,
  LinkIcon,
  ReplyIcon,
  UpVoteIcon,
  UserVerifyIcon,
} from "@/components/icons";
import { requireUser } from "@/helpers/auth";
import type { Prisma, User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

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
      comments: {
        where: {
          active: true,

          NOT: {
            postId: null,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        include: {
          post: true,
          replies: true,

          user: true,
          reply: {
            include: {
              user: true,
            },
          },
          likes: true,
          _count: true,
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
    <div>
      {user.comments.length === 0 && (
        <Empty
          icon={MessagesSquare}
          iconSize={32}
          withoutBorder
          title="Użytkownik Nie opublikował jeszcze komentarzy!"
        />
      )}

      <div className="grid grid-cols-1 gap-0 divide-y dark:divide-gray-500">
        {user?.comments?.map((comment) => (
          <CommentComponent
            key={comment.id}
            // @ts-ignore
            comment={comment}
          />
        ))}
      </div>
    </div>
  );
}

export const CommentComponent = ({
  comment,
}: {
  comment: Partial<
    Prisma.CommentGetPayload<{
      include: {
        user: true;
        post: true;
        replies: true;
        reply: true;
        likes: true;
        _count: true;
      };
    }>
  >;
}) => {
  return (
    <div key={comment.id} className="media flex p-3 pb-3">
      <div className="mr-4">
        <Avatar className="h-12 w-12 max-w-none rounded-full">
          <AvatarImage src={String(comment.user?.image)} />
          <AvatarFallback>
            {comment.user?.first_name?.charAt(0)}
            {comment.user?.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="media-body">
        {/* user info */}
        <div className="flex items-center">
          {comment.user?.verified ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  <UserVerifyIcon
                    checked={true}
                    className="size-4 fill-blue-500/20 stroke-blue-800"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profil zweryfikowany</p>
              </TooltipContent>
            </Tooltip>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-pointer">
                  <UserVerifyIcon
                    checked={false}
                    className="size-4 fill-rose-500/20 stroke-rose-800"
                  />
                </span>
              </TooltipTrigger>
              <TooltipContent>
                <p>Profil jeszcze nie zweryfikowany</p>
              </TooltipContent>
            </Tooltip>
          )}
          <Link
            className="ml-2 inline-block text-base font-bold"
            to={`/user/@${comment.user?.username}`}
          >
            {`${comment.user?.first_name} ${comment.user?.last_name}`}
          </Link>
        </div>
        <div className="flex gap-1">
          <Link
            className="inline-block text-xs text-slate-500 dark:text-slate-300"
            to={`/user/@${comment.user?.username}`}
          >
            @{comment.user?.username}
          </Link>
          <span className="text-xs text-slate-500 opacity-50 dark:text-slate-300">
            &bull;
          </span>

          <span className="text-xs text-slate-500 dark:text-slate-300">
            {dayjs(comment.createdAt).fromNow()}
          </span>
        </div>
        {/* user info */}

        {comment.reply && (
          <div className="prose dark:prose-invert">
            <Link
              to={{
                pathname: `/feed/${comment.post?.slug}`,
                hash: `comment-${comment.reply.id}`,
              }}
              className="mb-0 italic underline"
            >
              Odpowiedz na do komentarza
            </Link>
            <blockquote className="mb-2 mt-0">
              <ReactMarkdown className="prose dark:prose-invert">
                {comment.reply.content}
              </ReactMarkdown>
            </blockquote>
          </div>
        )}
        <ReactMarkdown className="prose dark:prose-invert">
          {comment?.content}
        </ReactMarkdown>

        <div className="mt-2 flex items-center gap-x-1">
          <Tooltip>
            <TooltipTrigger>
              <Badge variant="ghost" className="flex space-x-1">
                <UpVoteIcon className="size-5" />
                <span className="text-sm font-bold">{comment.upVotes}</span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Głosy</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger>
              <Badge variant="ghost" className="flex space-x-1">
                <BookmarkIcon className="size-4" />

                <span className="text-sm font-bold">
                  {comment._count?.likes}
                </span>
              </Badge>
            </TooltipTrigger>
            <TooltipContent>
              <p>Polubienia</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <Link to={`/feed/${comment.post?.slug}`}>
                <Badge variant="ghost" className="flex space-x-1">
                  <LinkIcon className="size-4" />

                  <span className="block max-w-[100px] truncate text-sm font-bold">
                    {comment.post?.title}
                  </span>
                </Badge>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p>Przejdź do postu</p>
            </TooltipContent>
          </Tooltip>

          {comment.reply && (
            <Tooltip>
              <TooltipTrigger>
                <Link
                  to={{
                    pathname: `/feed/${comment.post?.slug}`,
                    hash: `comment-${comment.reply.id}`,
                  }}
                >
                  <Badge variant="ghost" className="flex space-x-1">
                    <ReplyIcon className="size-4" />

                    <span className="block max-w-[100px] truncate text-sm font-bold">
                      {comment.reply?.content}
                    </span>
                  </Badge>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Przejdź do komantarza</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};
