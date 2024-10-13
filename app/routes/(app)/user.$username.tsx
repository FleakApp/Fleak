import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { NavLink, Outlet, useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { useInView } from "react-intersection-observer";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  cn,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fleak-org/ui";

import {
  BookmarkIcon,
  CommentsIcon,
  PostIcon,
  UpVoteIcon,
  UserVerifyIcon,
} from "@/components/icons";
import { TabNavigation, TabNavigationLink } from "@/components/ui/tabs";
import UserFollow from "@/components/user/follow";
import { siteConfig } from "@/config/site";
import { useUser } from "@/hooks/useUser";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { $path } from "remix-routes";

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  //remove @ at username
  const username = String(params.username).replace("@", "");

  const user = await prisma.user.findFirst({
    where: {
      username,
    },
    include: {
      followers: {
        include: {
          follower: true,
          following: true,
        },
      },
      _count: {
        select: {
          posts: {
            where: {
              active: true,
            },
          },
          comments: {
            where: {
              active: true,
            },
          },

          likes: {
            where: {
              postId: { not: null },
            },
          },
          votes: true,
          followers: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("Nie znaleziono takiego użytkownika");
  }

  return json({ user });
};

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  return [
    {
      title: `${siteConfig.title} : ${data?.user ? `${data?.user.first_name} ${data?.user.last_name}` : "404 Not found"}`,
    },
    { name: "description", content: siteConfig.description },
  ];
};

export default function UserId() {
  const { user } = useLoaderData<typeof loader>();

  const { data: currentUser } = useUser<User>();

  const { ref, inView } = useInView({
    threshold: 0,
  });

  return (
    <div className="h-full flex-1 flex-col divide-y dark:divide-gray-500">
      {/* user-info */}
      <div className="relative flex flex-col">
        <div className="relative flex items-start gap-x-3 p-6 px-3">
          <div className="tablet:shrink-0">
            <Avatar className="relative size-[64px] transition-all duration-100 ease-in-out">
              <AvatarImage
                src={String(user?.image)}
                className="block rounded-full outline-none"
              />
              <AvatarFallback className="inline-flex items-center rounded-full bg-muted uppercase outline-none transition-all group-hover:bg-white dark:group-hover:bg-background">
                {user?.first_name?.substring(0, 1)}
                {user?.last_name?.substring(0, 1)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="w-full flex-1">
            <div className="flex items-center justify-between gap-x-2">
              {user?.verified ? (
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

              <h2 className="mr-auto truncate text-2xl font-extrabold tablet:text-4xl">
                {user.first_name} {user.last_name}
              </h2>

              {/* Follow/Unfollow */}
              {user.id !== currentUser?.id && (
                <UserFollow user={user as unknown as Partial<User>} />
              )}
              {/* Follow/Unfollow */}
            </div>

            <div className="flex space-x-2">
              <p className="text-sm font-bold">{user.username}</p>
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm font-bold">
                Zarejestrowany: {dayjs(user.createdAt).fromNow()}
              </p>

              {Number(user?._count.followers) > 0 && (
                <div className="hidden items-center tablet:flex">
                  <div className="h-8 p-2 py-1">Obserwowany przez</div>

                  <div className="flex -space-x-2">
                    {user?.followers.map(({ follower }) => (
                      <Tooltip key={`f-${follower.id}`}>
                        <TooltipTrigger asChild>
                          <Avatar
                            key={`f-${follower.id}`}
                            className="inline-block size-6 rounded-full ring-2 ring-white transition-all hover:z-50 dark:ring-neutral-900"
                          >
                            <AvatarImage src={String(follower.image)} />
                            <AvatarFallback className="text-xs">
                              {follower.first_name?.charAt(0)}
                              {follower.last_name?.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </TooltipTrigger>
                        <TooltipContent className="z-[999]">
                          <p>
                            {follower.first_name}
                            {follower.last_name}
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="px-3 pb-3">{user.bio}</div>
      </div>
      {/* user-info */}

      <div className="relative flex-1 pt-0">
        <div ref={ref}></div>
        <div
          className={cn(
            "sticky top-0 z-50 flex-1 bg-transparent transition-all duration-100 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            inView
              ? "border-b border-gray-200 dark:border-gray-500"
              : "top-[70px] border-0 bg-background shadow-sm",
          )}
        >
          <TabNavigation className="px-3">
            <NavLink
              to={$path("/user/:username/votes", { username: user.username })}
            >
              {({ isActive }) => (
                <TabNavigationLink active={isActive}>
                  <div className="flex items-center gap-x-2">
                    <UpVoteIcon width={20} height={20} />
                    Głosy
                    <Badge variant="secondary">{user._count.votes}</Badge>
                  </div>
                </TabNavigationLink>
              )}
            </NavLink>
            <NavLink
              to={$path("/user/:username/posts", { username: user.username })}
            >
              {({ isActive }) => (
                <TabNavigationLink active={isActive}>
                  <div className="flex items-center gap-x-2">
                    <PostIcon width={20} height={20} />
                    Posty
                    <Badge variant="secondary">{user._count.posts}</Badge>
                  </div>
                </TabNavigationLink>
              )}
            </NavLink>
            <NavLink
              to={$path("/user/:username/comments", {
                username: user.username,
              })}
            >
              {({ isActive }) => (
                <TabNavigationLink active={isActive}>
                  <div className="flex items-center gap-x-2">
                    <CommentsIcon width={20} height={20} />
                    Komentarze
                    <Badge variant="secondary">{user._count.comments}</Badge>
                  </div>
                </TabNavigationLink>
              )}
            </NavLink>
            {user.id === currentUser?.id && (
              <NavLink
                to={$path("/user/:username/bookmarks", {
                  username: user.username,
                })}
              >
                {({ isActive }) => (
                  <TabNavigationLink active={isActive}>
                    <div className="flex items-center gap-x-2">
                      <BookmarkIcon width={20} height={20} />
                      Ulubione
                      <Badge variant="secondary">{user._count.likes}</Badge>
                    </div>
                  </TabNavigationLink>
                )}
              </NavLink>
            )}
          </TabNavigation>
        </div>

        <Outlet />
      </div>
    </div>
  );
}
