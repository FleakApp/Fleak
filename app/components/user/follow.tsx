import { useEffect } from "react";
import type { Prisma, User } from "@prisma/client";
import { useFetcher } from "@remix-run/react";

import { Button, toast } from "@fleak-org/ui";

import { useUser } from "@/hooks/useUser";
import { FollowIcon } from "../icons";

export default function UserFollow({
  user,
}: {
  user: Partial<
    Prisma.UserGetPayload<{
      include: {
        followers: true;
      };
    }>
  >;
}) {
  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    // for realtime update
    state: boolean;
  }>();

  const { data: currentUser } = useUser<User>();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === "success") {
      toast({ title: String(fetcher.data?.message) });
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form
      method="post"
      action="/api/follow/user"
      className="items-center gap-x-2 tablet:inline-flex"
    >
      <input type="hidden" name="user" value={user.id} />

      <Button
        variant="ghost"
        className="h-8 cursor-pointer gap-x-2 p-2 py-1"
        type="submit"
      >
        <FollowIcon
          width="20px"
          height="20px"
          checked={
            fetcher.data?.state === true ||
            (currentUser &&
              user.followers?.some(
                (follower) => follower.followerId === currentUser.id,
              ))
          }
        />

        <span className="hidden tablet:flex">
          {fetcher.data?.state === true ||
          (currentUser &&
            user.followers?.some(
              (follower) => follower.followerId === currentUser.id,
            ))
            ? "Przestań obserwować"
            : "Obserwuj"}
        </span>
      </Button>
    </fetcher.Form>
  );
}
