/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react/no-unknown-property */
import { useEffect, useState } from "react";
import type { Post, Prisma, User } from "@prisma/client";
import type { SerializeFrom } from "@remix-run/node";
import { Link } from "@remix-run/react";
import dayjs from "dayjs";
import { EyeOff } from "lucide-react";
import Plyr from "plyr";
import ReactMarkdown from "react-markdown";

import { useModal } from "@fleak-org/react-modals";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  buttonVariants,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fleak-org/ui";

import { ArticleWrapper } from "@/components/article-wrapper";
import { CommentsIcon, ReportIcon, UserVerifyIcon } from "@/components/icons";
import PostComments from "@/components/post/comments";
import PostLike from "@/components/post/like";
import PostShare from "@/components/post/share";
import PostTags from "@/components/post/tags";
import PostUpVote from "@/components/post/upVote";
import UserFollow from "@/components/user/follow";
import { useUser } from "@/hooks/useUser";
import { $path } from "remix-routes";

export const PostItem = ({
  post,
  followers = false,
  controls = false,
  comments = false,
  tags = false,
  collapsed = false,
}: {
  collapsed?: boolean;
  tags?: boolean;
  followers?: boolean;
  controls?: boolean;
  comments?: boolean;
  post: SerializeFrom<
    Partial<
      Prisma.PostGetPayload<{
        include: {
          category: true;
          visits: true;
          user: {
            include: {
              followers: {
                include: {
                  follower: true;
                };
              };
              _count: true;
            };
          };
          tags: true;
          likes: true;
          votes: true;

          comments: {
            include: {
              votes: true;
              replies: true;
              likes: true;
              user: true;
            };
          };
          _count: true;
        };
      }>
    >
  >;
}) => {
  const [showSensitive, setShowSensitive] = useState(collapsed);
  const { open: createIssue } = useModal("create.issue");

  const [validIframe, setValidIframe] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const player = new Plyr(`#player-${post.id}`, {
    autoplay: false,
    muted: true,
    controls: !controls
      ? []
      : [
          // 'play-large',
          // 'restart',
          // 'rewind',
          "play",
          // 'fast-forward',
          // 'progress',
          // 'current-time',
          // 'duration',
          "mute",
          "volume",
          // 'captions',
          // 'settings',
          // 'pip',
          // 'airplay',
          // 'download',
          "fullscreen",
        ],
  });

  const { data: user } = useUser<User>();

  const youtubeValid =
    /(https?:\/\/)?((www\.)?youtube\.com|rumble\.com)\/embed\/.+/;

  useEffect(() => {
    if (post.type === "Iframe" && post.iframe?.match(youtubeValid)) {
      setValidIframe(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.type]);

  return (
    <article className="break-inside relative flex flex-col p-3">
      {/* user section */}
      <div className="flex items-center justify-between pb-3">
        <div className="flex">
          <Link
            to={`/user/${post.user?.username}`}
            preventScrollReset={true}
            className="mr-4 inline-block"
          >
            <Avatar className="h-14 w-14 max-w-none rounded-full">
              <AvatarImage src={String(post.user?.image)} />
              <AvatarFallback>
                {post.user?.first_name?.charAt(0)}
                {post.user?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center space-x-2">
              {post.user?.verified ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-pointer">
                      <UserVerifyIcon
                        checked={true}
                        className="size-5 fill-blue-500/20 stroke-blue-800"
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
                        className="size-5 fill-rose-500/20 stroke-rose-800"
                      />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Profil jeszcze nie zweryfikowany</p>
                  </TooltipContent>
                </Tooltip>
              )}
              <Link
                className="inline-block text-lg font-bold"
                to={`/user/${post.user?.username}`}
              >
                {`${post.user?.first_name} ${post.user?.last_name}`}
              </Link>

              {/* Follow/Unfollow */}
              {user?.id !== post.userId && (
                <UserFollow user={post.user as unknown as Partial<User>} />
              )}
              {/* Follow/Unfollow */}

              {followers && Number(post.user?._count.followers) > 0 && (
                <div className="hidden items-center tablet:flex">
                  <div className="h-8 p-2 py-1">Obserwowany przez</div>

                  <div className="flex -space-x-2">
                    {post.user?.followers.map(({ follower }) => (
                      <Avatar
                        key={`f-${follower.id}`}
                        className="inline-block size-6 rounded-full ring-2 ring-white dark:ring-neutral-900"
                      >
                        <AvatarImage src={String(follower.image)} />
                        <AvatarFallback className="text-xs">
                          {follower.first_name?.charAt(0)}
                          {follower.last_name?.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-1">
              <Link
                className="inline-block text-sm text-slate-500 dark:text-slate-300"
                to={`/user/${post.user?.username}`}
              >
                {post.user?.username}
              </Link>
              <span className="text-sm text-slate-500 opacity-50 dark:text-slate-300">
                &bull;
              </span>

              <div className="text-sm text-slate-500 dark:text-slate-300">
                {dayjs(post.createdAt).fromNow()} w{" "}
                <Link
                  className="truncate"
                  to={`/category/${post.category?.slug}`}
                >
                  {post.category?.name}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={() => createIssue(post)}
                variant="ghost"
                size="icon"
                className="flex space-x-1.5"
              >
                <ReportIcon width={20} height={20} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left" align="center">
              <p>Zgłoś post</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
      {/* user section */}

      <Link
        to={$path("/feed/:slug", { slug: post.slug! })}
        // to={`/feed/${post.slug}`}
        preventScrollReset={true}
        className="hover:text-[#89ed00]"
      >
        <h2 className="max-w-xl text-3xl font-extrabold tablet:truncate 2xl:max-w-2xl">
          {post.title}
        </h2>
      </Link>

      {/* post resource */}
      <div className="relative my-3 flex-1 overflow-hidden rounded-lg">
        {post.type === "Photo" && (
          <div className="flex-1 items-center justify-center">
            {/* <Link className="flex" to={`/feed/${post.id}`}> */}
            <img
              alt={post.title}
              // className="mx-auto aspect-square h-auto w-auto w-full rounded-lg bg-center object-cover"
              className="mx-auto aspect-auto h-auto bg-center object-cover"
              src={String(post.image)}
            />
            {/* </Link> */}
          </div>
        )}
        {post.type === "Animated" && (
          <div className="flex-1 items-center justify-center">
            <video
              id={`player-${post.id}`}
              controls={controls}
              autoPlay={true}
              muted
              className="w-full rounded-lg"
              src={String(post.image)}
            />
          </div>
        )}
        {post.type === "Iframe" && !validIframe && (
          <div className="flex-1 items-center justify-center">
            <div className="my-3 flex items-center gap-x-3 rounded-lg border-[3px] border-b-0 border-t-0 border-rose-900 bg-rose-300/30 p-4 text-rose-900">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.14939 7.8313C8.57654 5.92179 10.0064 4 12 4V4C13.9936 4 15.4235 5.92179 14.8506 7.8313L13.2873 13.0422C13.2171 13.2762 13.182 13.3932 13.128 13.4895C12.989 13.7371 12.7513 13.9139 12.4743 13.9759C12.3664 14 12.2443 14 12 14V14C11.7557 14 11.6336 14 11.5257 13.9759C11.2487 13.9139 11.011 13.7371 10.872 13.4895C10.818 13.3932 10.7829 13.2762 10.7127 13.0422L9.14939 7.8313Z"
                  stroke="#33363F"
                  strokeWidth="2"
                  className="stroke-rose-900"
                />
                <circle
                  cx="12"
                  cy="19"
                  r="2"
                  stroke="#33363F"
                  strokeWidth="2"
                  className="stroke-rose-900"
                />
              </svg>
              Wystąpił problem z wyświetleniem tej ramki. Prosimy spróbować
              później.
            </div>
          </div>
        )}
        {post.type === "Iframe" && validIframe && (
          <div className="flex-1 items-center justify-center">
            <div
              className="plyr__video-embed overflow-hidden"
              id={`player-${post.id}`}
              // dangerouslySetInnerHTML={{ __html: String(post.iframe) }}
            >
              <iframe
                title={post.title}
                src={String(post.iframe)}
                allowFullScreen={false}
                allowTransparency={true}
                className="size-full min-h-[300px]"
                allow="autoplay"
              ></iframe>
            </div>
          </div>
        )}
        {post.type === "Article" && String(post.content)?.length > 100 ? (
          <ArticleWrapper
            expandButtonTitle="Pokaż cały artykuł"
            defaultCollapsed={collapsed}
            className={cn("min-h-[150px] w-full overflow-hidden")}
          >
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          </ArticleWrapper>
        ) : (
          post.type === "Article" && (
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>
          )
        )}

        {post.sensitive === true && !showSensitive && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-y-4 bg-background/90 p-6 backdrop-blur">
            <EyeOff />
            Poniższe media zawierają potencjalnie drażliwe treści.
            <Button
              variant="secondary"
              onClick={() => setShowSensitive((prev) => !prev)}
            >
              pokaż treść
            </Button>
          </div>
        )}
      </div>
      {/* post resource */}

      {tags && <PostTags tags={post.tags} />}

      <div className={cn("flex items-center gap-x-0 py-0", comments && "pb-3")}>
        {/* vote post */}
        <div className="me-1 flex items-center gap-x-2 rounded">
          <PostUpVote post={post as Partial<Post>} />
        </div>
        {/* vote post */}

        <Link
          className={cn(
            buttonVariants({ variant: "ghost" }),
            "inline-flex items-center px-2",
          )}
          to={{
            pathname: $path("/feed/:slug", { slug: post.slug! }),
            hash: "#commentWrapper",
          }}
          preventScrollReset={true}
        >
          <span className="mr-2">
            <CommentsIcon />
          </span>
          <span className="text-sm font-bold">
            {post.comments?.length} komentarzy
          </span>
        </Link>

        {/* like post */}
        {post.userId !== user?.id && <PostLike post={post as Partial<Post>} />}
        {/* like post */}

        {/* share post */}
        <div className="ml-auto flex gap-x-3">
          <PostShare post={post as Partial<Post>} />
        </div>
        {/* share post */}
      </div>

      {comments && (
        <PostComments
          // @ts-expect-error
          post={post as Partial<Post>}
          // @ts-expect-error
          comments={post?.comments}
        />
      )}
    </article>
  );
};
