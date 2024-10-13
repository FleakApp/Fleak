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
import { DownVoteIcon, UpVoteIcon } from "../icons";

export default function PostUpVote({
  post,
}: {
  post: Partial<Prisma.PostGetPayload<{ include: { votes: true } }>>;
}) {
  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    // for upVotes realtime update
    action?: string;
    // for upVotes realtime update
    state?: string | number;
  }>();
  const { data: user } = useUser<User>();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === "success") {
      toast({ title: String(fetcher.data?.message) });
    }
  }, [fetcher.data]);

  const isVoted = (vote = "UP") => {
    return (
      user && post.votes?.some((l) => l.userId === user.id && l.type === vote)
    );
  };
  return (
    <fetcher.Form
      method="post"
      action="/api/vote/post"
      className="inline-flex items-center gap-x-2"
    >
      <input type="hidden" name="post" value={post.id} />

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              fetcher.data?.action == "UP" || (isVoted("UP") && "bg-accent"),
            )}
            disabled={fetcher.state == "submitting"}
            name="action"
            value="UP"
            type="submit"
          >
            <UpVoteIcon
              className={
                fetcher.data?.action == "UP" || isVoted("UP")
                  ? "stroke-fleak-500"
                  : ""
              }
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>up post</p>
        </TooltipContent>
      </Tooltip>

      <span className="text-sm font-bold">
        {fetcher.data?.state ?? post.upVotes}
      </span>

      <Tooltip>
        <TooltipTrigger asChild>
          <button
            className={cn(
              buttonVariants({ variant: "ghost", size: "icon" }),
              fetcher.data?.action == "DOWN" ||
                (isVoted("DOWN") && "bg-accent"),
            )}
            disabled={fetcher.state == "submitting"}
            name="action"
            value="DOWN"
            type="submit"
          >
            <DownVoteIcon
              className={
                fetcher.data?.action == "DOWN" || isVoted("DOWN")
                  ? "stroke-rose-400"
                  : ""
              }
            />
          </button>
        </TooltipTrigger>
        <TooltipContent>
          <p>down post</p>
        </TooltipContent>
      </Tooltip>
    </fetcher.Form>
  );
}
