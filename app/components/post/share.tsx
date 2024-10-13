import { useState } from "react";
import type { Post } from "@prisma/client";
import {
  FacebookMessengerShareButton,
  FacebookShareButton,
  TwitterShareButton,
} from "react-share";

import {
  buttonVariants,
  cn,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  toast,
} from "@fleak-org/ui";

import { siteConfig } from "@/config/site";
import { ShareIcon } from "../icons";

export default function PostShare({ post }: { post: Partial<Post> }) {
  const [showShareDropdown, setShowShareDropdown] = useState(false);

  return (
    <div className="ml-auto flex gap-x-3">
      <DropdownMenu
        open={showShareDropdown}
        onOpenChange={setShowShareDropdown}
      >
        <DropdownMenuTrigger>
          <div
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "cursor-pointer gap-x-2 p-2 pe-3",
            )}
          >
            <ShareIcon />

            <span className="hidden text-sm font-bold tablet:inline">
              Udostępnij
            </span>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="flex max-w-[200px] flex-col p-2"
          align="end"
        >
          <button
            type="button"
            onClick={() => {
              void navigator.clipboard.writeText(
                `${siteConfig.url}/feed/${post.slug}`,
              );

              toast({
                title: "Skopiowano do schowka",
                description: `${siteConfig.url}/feed/${post.slug}`,
              });

              setShowShareDropdown(false);
            }}
          >
            <div
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-x-3 p-2.5",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 7m0 2.667a2.667 2.667 0 0 1 2.667 -2.667h8.666a2.667 2.667 0 0 1 2.667 2.667v8.666a2.667 2.667 0 0 1 -2.667 2.667h-8.666a2.667 2.667 0 0 1 -2.667 -2.667z" />
                <path d="M4.012 16.737a2.005 2.005 0 0 1 -1.012 -1.737v-10c0 -1.1 .9 -2 2 -2h10c.75 0 1.158 .385 1.5 1" />
              </svg>
              Skopiuj do schowka
            </div>
          </button>

          <FacebookMessengerShareButton
            appId={siteConfig.messenger.appId}
            url={`${siteConfig.url}/feed/${post.slug}`}
            onClick={() => {
              setShowShareDropdown(false);
            }}
          >
            <div
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-x-3 p-2.5",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M3 20l1.3 -3.9a9 8 0 1 1 3.4 2.9l-4.7 1" />
                <path d="M8 13l3 -2l2 2l3 -2" />
              </svg>
              Messenger
            </div>
          </FacebookMessengerShareButton>

          <FacebookShareButton
            url={`${siteConfig.url}/feed/${post.slug}`}
            onClick={() => {
              setShowShareDropdown(false);
            }}
          >
            <div
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-x-3 p-2.5",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M7 10v4h3v7h4v-7h3l1 -4h-4v-2a1 1 0 0 1 1 -1h3v-4h-3a5 5 0 0 0 -5 5v2h-3" />
              </svg>
              Facebook
            </div>
          </FacebookShareButton>
          <TwitterShareButton
            url={`${siteConfig.url}/feed/${post.slug}`}
            onClick={() => {
              setShowShareDropdown(false);
            }}
          >
            <div
              className={cn(
                buttonVariants({ variant: "ghost" }),
                "w-full justify-start gap-x-3 p-2.5",
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="size-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
              Twitter
            </div>
          </TwitterShareButton>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
