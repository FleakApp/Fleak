/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from "react";
import type { Post, Prisma, User } from "@prisma/client";
import { Link, useFetcher, useLocation } from "@remix-run/react";
import dayjs from "dayjs";
import { Bold, ImageUp, Italic } from "lucide-react";
import {
  boldCommand,
  checkedListCommand,
  codeCommand,
  headingLevel1Command,
  headingLevel2Command,
  headingLevel3Command,
  headingLevel4Command,
  headingLevel5Command,
  headingLevel6Command,
  imageCommand,
  italicCommand,
  linkCommand,
  orderedListCommand,
  quoteCommand,
  strikethroughCommand,
  unorderedListCommand,
  useTextAreaMarkdownEditor,
} from "react-headless-mde";
import ReactMarkdown from "react-markdown";
import type { z } from "zod";

import type { FieldErrors } from "@fleak-org/remix-utils";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  cn,
  Loader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Textarea,
  toast,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@fleak-org/ui";

import { useUser } from "@/hooks/useUser";
import type { CommentSchema } from "@/routes/api/comment";
import emoji from "../../../mock/emoji.json";
import Empty from "../empty";
import {
  BookmarkIcon,
  CommentAddIcon,
  DownVoteIcon,
  LinkIcon,
  UpVoteIcon,
  UserVerifyIcon,
} from "../icons";

export default function PostComments({
  post,
  comments,
}: {
  post: Post;
  comments: Prisma.CommentGetPayload<{
    include: {
      user: true;
      likes: true;
      replies: {
        include: {
          user: true;
          likes: true;
        };
      };
    };
  }>[];
}) {
  const [fieldErrors, setErrors] =
    useState<FieldErrors<z.infer<typeof CommentSchema>>>();
  //   const { toast } = useToast();
  const [value, setValue] = useState("");
  const [openEmoji, setOpenEmoji] = useState(false);

  const location = useLocation();

  const [reply, setReply] = useState<string>("");

  const { ref: refTextarea, commandController } = useTextAreaMarkdownEditor({
    commandMap: {
      // word logic
      bold: boldCommand,
      code: codeCommand,
      italic: italicCommand,
      strikethrough: strikethroughCommand,

      // word complex
      image: imageCommand,
      link: linkCommand,

      // line logic
      headingLevel1: headingLevel1Command,
      headingLevel2: headingLevel2Command,
      headingLevel3: headingLevel3Command,
      headingLevel4: headingLevel4Command,
      headingLevel5: headingLevel5Command,
      headingLevel6: headingLevel6Command,
      quote: quoteCommand,

      // list
      orderedList: orderedListCommand,
      unorderedList: unorderedListCommand,
      checkedList: checkedListCommand,
    },
  });

  const ref = useRef<HTMLFormElement>(null);
  const ref2 = useRef<HTMLTextAreaElement>(null);
  const refForm = ref.current;
  const refInput = refTextarea.current;

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    fieldErrors?: FieldErrors<z.infer<typeof CommentSchema>>;

    // for upVotes realtime update
    action?: string;
    // for upVotes realtime update
    newValue?: string | number;
  }>();

  const result = fetcher.data;

  const { data: user } = useUser<User>();

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace("#", "");
      const elementScrollTop = document
        .getElementById(h)
        ?.getBoundingClientRect();

      setReply(h.replace("comment-", ""));

      window.scrollTo({
        top: Number(elementScrollTop?.y) - 70,
        behavior: "smooth",
      });
    }
  }, [location]);

  useEffect(() => {
    if (location.hash) {
      const h = location.hash.replace("#", "");
      const elementScrollTop = document
        .getElementById(h)
        ?.getBoundingClientRect();

      window.scrollTo({
        top: Number(elementScrollTop?.y) - 70,
        behavior: "smooth",
      });
    }
  }, [location.hash]);

  useEffect(() => {
    if (location.hash) return;

    refInput?.focus();
  }, [reply]);

  useEffect(() => {
    setErrors(result?.fieldErrors);

    if (result && result?.status === "success") {
      toast({ title: String(result?.message) });
      setReply("");
      setValue("");
      refForm?.reset();
    }
  }, [fetcher.data]);

  const onEmojiClick = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    emojiObject: string,
  ) => {
    const { selectionStart, selectionEnd } = refInput!;

    // replace selected text with clicked emoji
    const newVal =
      value.slice(0, selectionStart) + emojiObject + value.slice(selectionEnd);
    setValue(newVal);

    setOpenEmoji(false);
    refInput?.focus();
  };

  function CommentComponent({
    comment,
    isReply = false,
    showFeatures = true,
  }: {
    isReply?: boolean;
    showFeatures?: boolean;
    comment: Partial<
      Prisma.CommentGetPayload<{
        include: {
          user: true;
          post: true;
          replies: true;
          votes: true;
          reply: true;
          likes: true;
        };
      }>
    >;
  }) {
    if (!isReply && comment.replyId !== null) return;

    const isVoted = (vote = "UP") => {
      return (
        user &&
        comment.votes?.some((l) => l.userId === user.id && l.type === vote)
      );
    };

    return (
      <div className="">
        <div
          key={comment.id}
          id={`comment-${comment.id}`}
          className={cn(
            "media flex p-1",
            reply === comment.id && "ring-2 ring-primary",
            //   isLoading === "loading" ? "opacity-50" : "",
            isReply ? "rounded-md" : "rounded-lg",
          )}
        >
          <div className="mr-4">
            <Avatar className="h-12 w-12 max-w-none rounded-full">
              <AvatarImage src={String(comment.user?.image)} />
              <AvatarFallback>
                {comment.user?.first_name?.charAt(0)}
                {comment.user?.last_name?.charAt(0)}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="media-body flex-1">
            {/* user info */}
            <div className="flex items-center">
              {/* <Link
                className="mr-2 inline-block text-base font-bold"
                to={`/user/@${comment.user?.username}`}
              >
                {`${comment.user?.first_name} ${comment.user?.last_name}`}
              </Link> */}
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
                to={`/user/${comment.user?.username}`}
              >
                {`${comment.user?.first_name} ${comment.user?.last_name}`}
              </Link>
            </div>
            <div className="flex gap-1">
              <Link
                className="inline-block text-xs text-slate-500 dark:text-slate-300"
                to={`/user/${comment.user?.username}`}
              >
                {comment.user?.username}
              </Link>
              <span className="text-xs text-slate-500 opacity-50 dark:text-slate-300">
                &bull;
              </span>

              <span className="text-xs text-slate-500 dark:text-slate-300">
                {dayjs(comment.createdAt).fromNow()}
              </span>
            </div>
            {/* user info */}

            {/* {comment.reply && (
              <div className="rounded-lg border border-fleak-500">
                <CommentComponent
                  key={comment.reply.id}
                  isReply={true}
                  comment={comment.reply}
                  showFeatures={false}
                />
              </div>
            )} */}

            {comment.reply && (
              <div className="prose dark:prose-invert">
                <a
                  href={`#comment-${comment.reply.id}`}
                  className="mb-0 italic underline"
                >
                  Odpowiedz na do komentarza
                </a>
                <blockquote className="mb-2 mt-0">
                  <ReactMarkdown className="prose dark:prose-invert">
                    {comment.reply.content}
                  </ReactMarkdown>
                </blockquote>
              </div>
            )}

            <ReactMarkdown className="prose dark:prose-invert">
              {comment.content}
            </ReactMarkdown>

            {showFeatures && (
              <div className="mt-2 flex items-center gap-x-1">
                <div className="flex items-center gap-x-2 rounded">
                  <fetcher.Form
                    method="post"
                    action="/api/vote/comment"
                    className="inline-flex items-center gap-x-2"
                  >
                    <input type="hidden" name="comment" value={comment.id} />

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          name="action"
                          value="UP"
                          type="submit"
                          className={cn(
                            fetcher.data?.action == "UP" &&
                              fetcher.formData?.get("comment") === comment.id &&
                              "bg-accent",
                          )}
                        >
                          <UpVoteIcon
                            className={cn(
                              "size-5",
                              (fetcher.formData?.get("comment") ===
                                comment.id &&
                                fetcher.data?.action == "UP") ||
                                isVoted("UP")
                                ? "stroke-fleak-500"
                                : "",
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>up comment</p>
                      </TooltipContent>
                    </Tooltip>

                    <span className="text-sm font-bold">
                      {fetcher.formData?.get("comment") === comment.id &&
                      fetcher.state === "idle" &&
                      fetcher.data?.newValue
                        ? fetcher.data?.newValue
                        : comment.upVotes}
                    </span>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          name="action"
                          value="DOWN"
                          type="submit"
                        >
                          <DownVoteIcon
                            className={cn(
                              "size-5",
                              (fetcher.formData?.get("comment") ===
                                comment.id &&
                                fetcher.data?.action == "DOWN") ||
                                isVoted("DOWN")
                                ? "stroke-rose-400"
                                : "",
                            )}
                          />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>down comment</p>
                      </TooltipContent>
                    </Tooltip>
                  </fetcher.Form>
                </div>

                {/* TODO: like comment */}
                <fetcher.Form
                  method="post"
                  action="/api/like/comment"
                  className="inline-flex items-center"
                >
                  <input type="hidden" name="type" value="comment" />
                  <input type="hidden" name="comment" value={comment.id} />

                  <Button
                    // className={cn(
                    //   buttonVariants({ variant: "ghost", size: "xs" }),
                    //   "py-1.5",
                    // )}
                    variant="ghost"
                    size="icon"
                    type="submit"
                  >
                    <span className="flex">
                      <BookmarkIcon
                        className="size-4"
                        checked={
                          user &&
                          comment.likes?.some((l) => l.userId === user.id)
                        }
                      />
                    </span>
                    {/* <span className="text-sm font-bold">
                    {comment.likes?.length ?? 0}
                  </span> */}
                  </Button>
                </fetcher.Form>
                {/* !isReply && user && ( */}
                {user && (
                  <Button
                    onClick={() => {
                      setReply(String(comment.id));
                      // setValue(`> ${comment.content}`);
                    }}
                    variant="ghost"
                    size="icon"
                    className="w-auto px-3"
                  >
                    Odpowiedz
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
        {showFeatures && (
          <>
            {Number(comment?.replies?.length) > 0 && (
              <div className="mt-1 grid gap-2 pl-6">
                {comment?.replies?.map((reply) => (
                  <CommentComponent
                    key={reply.id}
                    isReply={true}
                    comment={reply}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="relative" id="commentWrapper">
        <fetcher.Form ref={ref} method="post" action="/api/comment">
          <input type="hidden" name="post_id" value={post.id} />
          <input type="hidden" name="reply_id" value={reply} />

          <Textarea
            ref={refTextarea}
            style={{ resize: "none" }}
            rows={5}
            name="content"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            disabled={
              !user ||
              (fetcher.formAction === "/api/comment" &&
                fetcher.state === "submitting")
            }
            placeholder="Napisz komentarz"
            className="custom-scroll scroll-pb-20 pb-14 pr-20 dark:border-white"
          />

          <span className="absolute bottom-3 left-3 -mt-3 flex w-full items-center space-x-3">
            <div className="flex gap-x-3">
              <Button
                variant="secondary"
                size="icon"
                type="button"
                disabled={
                  fetcher.formAction === "/api/comment" &&
                  fetcher.state === "submitting"
                }
                onClick={() => {
                  commandController.executeCommand("bold");
                }}
              >
                <Bold size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                type="button"
                disabled={
                  fetcher.formAction === "/api/comment" &&
                  fetcher.state === "submitting"
                }
                onClick={() => {
                  commandController.executeCommand("italic");
                }}
              >
                <Italic size={16} />
              </Button>

              <Button
                variant="secondary"
                size="icon"
                type="button"
                disabled={
                  fetcher.formAction === "/api/comment" &&
                  fetcher.state === "submitting"
                }
                onClick={() => {
                  commandController.executeCommand("image");
                }}
              >
                <ImageUp size={16} />
              </Button>
              <Button
                variant="secondary"
                size="icon"
                type="button"
                disabled={
                  fetcher.formAction === "/api/comment" &&
                  fetcher.state === "submitting"
                }
                onClick={() => {
                  commandController.executeCommand("link");
                }}
              >
                <LinkIcon width={16} height={16} />
              </Button>
            </div>

            <Popover open={openEmoji} onOpenChange={setOpenEmoji}>
              <PopoverTrigger asChild>
                <Button
                  disabled={
                    fetcher.formAction === "/api/comment" &&
                    fetcher.state === "submitting"
                  }
                  type="button"
                  variant="secondary"
                  size="icon"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="icon icon-tabler icons-tabler-outline icon-tabler-mood-plus size-5"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M20.985 12.528a9 9 0 1 0 -8.45 8.456" />
                    <path d="M16 19h6" />
                    <path d="M19 16v6" />
                    <path d="M9 10h.01" />
                    <path d="M15 10h.01" />
                    <path d="M9.5 15c.658 .64 1.56 1 2.5 1s1.842 -.36 2.5 -1" />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent side="top" className="p-0">
                <ScrollArea className="h-64 p-3">
                  <div className="grid grid-cols-5 gap-2">
                    {emoji.map((emoji) => (
                      <Button
                        key={emoji.value}
                        type="button"
                        onClick={(e) => onEmojiClick(e, emoji.value)}
                        variant="ghost"
                        size="icon"
                        title={emoji.listValue}
                      >
                        {emoji.value}
                      </Button>
                    ))}
                    {/* {emoji.map((emoji) => (
                          <Button
                            key={emoji.name}
                            type="button"
                            onClick={(e) => onEmojiClick(e, emoji.alt)}
                            variant="ghost"
                            size="icon"
                            title={emoji.name}
                          >
                            {emoji.alt}
                          </Button>
                        ))} */}
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>

            <Button
              disabled={
                !user ||
                value.length < 3 ||
                (fetcher.formAction === "/api/comment" &&
                  fetcher.state === "submitting")
              }
              type="submit"
              variant="secondary"
              className="ml-auto gap-x-3 font-bold"
            >
              <span>Opublikuj</span>
              {fetcher.formAction === "/api/comment" &&
              fetcher.state === "submitting" ? (
                <Loader variant="dark" />
              ) : (
                <CommentAddIcon />
              )}
            </Button>
          </span>

          {/* TODO: user not signed */}
          {!user && (
            <span className="absolute inset-0 flex items-center justify-center space-x-3 rounded-lg bg-background/25 p-6 backdrop-blur-sm">
              <Link
                to="/signin"
                className="rounded-lg bg-accent p-3 text-center text-sm"
              >
                Dodawanie komentarzy dostępne jest tylko dla zalogowanych
                użytkowników
              </Link>
            </span>
          )}
        </fetcher.Form>
      </div>

      {fieldErrors?.content && (
        <p className="mt-2 text-sm text-destructive">
          {fieldErrors?.content?.join(", ")}
        </p>
      )}

      {Number(comments?.length) > 0 && (
        <h2 className="my-3 text-xl font-bold">
          {comments?.length} komentarzy do tego postu
        </h2>
      )}

      {comments?.map(
        (comment) =>
          comment.replyId === null && (
            <div className="mb-3 grid" key={comment.id}>
              <CommentComponent comment={comment} />
            </div>
          ),
      )}

      <>
        <button
          className="w-full pb-3 pt-3 tablet:pb-0"
          onClick={() => {
            const wrapperScroll = document.getElementById("commentWrapper");
            const windowScroll = window.scrollY;

            const offset = 120;
            const wrapperY = Math.abs(
              Number(wrapperScroll?.getBoundingClientRect()?.y),
            );

            // focus comment form input
            ref2.current?.focus();

            // disable scrolling if comments as null
            if (comments?.length === 0) return;

            window.scrollTo({
              top: Math.abs(windowScroll - wrapperY - offset),
              behavior: "instant",
            });
          }}
        >
          <Empty
            icon={EmptyIcon}
            iconSize={32}
            // withoutBorder
            title={
              comments?.length === 0
                ? "Nie opublikowano jeszcze komentarzy, bądź pierwszy"
                : "Opublikuj swój komentarz"
            }
          />
        </button>
      </>
    </>
  );
}

const EmptyIcon = () => <CommentAddIcon width="32" height="32" />;
