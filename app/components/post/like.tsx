import { useEffect } from "react";
import type { Prisma, User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";

import {
  buttonVariants,
  cn,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fleak-org/ui";

import { useUser } from "@/hooks/useUser";
import { BookmarkIcon } from "../icons";

export default function PostLike({
  post,
}: {
  post: Partial<Prisma.PostGetPayload<{ include: { likes: true } }>>;
}) {
  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    // for realtime update
    state: boolean;
  }>();

  const { data: user } = useUser<User>();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === "success") {
      toast({ title: String(fetcher.data?.message) });
    }
  }, [fetcher.data]);

  const isLiked = () => {
    return (user && post.likes?.some((l) => l.userId === user?.id))!;
  };

  return (
    <fetcher.Form
      method="post"
      action="/api/like/post"
      className="inline-flex items-center"
    >
      <input type="hidden" name="post" value={post.id} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="submit"
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              fetcher.formAction === "/api/like/post" &&
                fetcher.state === "submitting" &&
                "bg-accent",
            )}
          >
            <BookmarkIcon
              checked={fetcher.data?.state === true || isLiked() ? true : false}
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Dodaj post do ulubionych</p>
        </TooltipContent>
      </Tooltip>
    </fetcher.Form>
  );
}
