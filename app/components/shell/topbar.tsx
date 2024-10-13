/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  Form,
  Link,
  useFetcher,
  useLocation,
  useSearchParams,
} from "@remix-run/react";
import { BellRing, Command, Moon, Sun } from "lucide-react";
import useSWR from "swr";

import { useModal } from "@fleak-org/react-modals";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  buttonVariants,
  cn,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Input,
  Loader,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Skeleton,
  StickyHeader,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useMediaQuery,
  useToast,
} from "@fleak-org/ui";

import { themeConfig } from "@/config/theme";
import { formattedDate } from "@/helpers/misc";
import { useUser } from "@/hooks/useUser";
import type { Notification, Prisma } from "@/services/db.server";
import AuthorityCheck from "../authority-check";
import { Logo } from "../brand/logo";
import Empty from "../empty";
import { BookmarkIcon } from "../icons";
import { $path } from "remix-routes";
import { Theme, useTheme } from "remix-themes";

const Topbar = function ({
  isAlwaysSticky = false,
}: {
  isAlwaysSticky?: boolean;
}) {
  const { data: user } = useUser<
    Prisma.UserGetPayload<{
      include: {
        roles: true;
      };
    }>
  >();
  const [theme, setTheme] = useTheme();

  const [searchParams, setSearchParams] = useSearchParams();
  const params = new URLSearchParams();

  const searchInputRef = useRef<HTMLInputElement>();

  const [openSearch, setOpenSearch] = useState(false);

  const [openNotifications, setOpenNotifications] = useState(true);

  const fetcher = useFetcher<{ message?: string }>();

  const { open: openMakePostModal } = useModal("make.post");
  // const { open: openSignInModal } = useModal(SignInModal);

  const config = themeConfig;

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "q" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();

        searchInputRef.current?.focus();

        if (typeof searchInputRef.current?.value === "undefined") {
          setOpenSearch((prev) => !prev);
        }
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const { toast } = useToast();

  const {
    data: notifications,
    isLoading,
    mutate,
  } = useSWR<{
    result?: Notification[];
    unread?: number;
  }>(
    "/api/notifications",
    async () => {
      const response: {
        result?: Notification[];
        unread?: number;
      } = await fetch("/api/notifications").then((res) => res.json());

      return {
        result: response.result,
        unread: response.unread,
      };
    },
    {
      revalidateOnFocus: true,
    },
  );

  const location = useLocation();

  // close dialog if location changed
  useLayoutEffect(() => {
    setOpenNotifications(false);
  }, [location]);

  useEffect(() => {
    if (fetcher.data) {
      if (fetcher.data.message) {
        toast({ title: String(fetcher.data.message) });
      }

      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      mutate();
    }
  }, [fetcher.data]);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  return (
    <StickyHeader
      isAlwaysSticky={isAlwaysSticky}
      offset={1}
      className="fixed top-0 z-[50] flex h-[70px] w-full items-center dark:border-b dark:border-gray-500 md:sticky"
    >
      <div
        className={cn(
          "flex h-[70px] w-full items-center px-0 transition-all",
          config.tobbar.container ? "container" : "-mx-px max-w-full",
          "px-3 desktop:px-6",
        )}
      >
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center tablet:w-[calc(288px)]">
            <Link to="/" className="flex">
              <Logo />
            </Link>
          </div>

          {openSearch && (
            <fetcher.Form
              method="get"
              action="/"
              id="search"
              onSubmit={() => {
                const ev = searchInputRef.current?.value;

                setTimeout(() => {
                  if (!ev) {
                    params.delete("q");
                  } else {
                    params.set("q", ev);
                  }
                  setSearchParams(params, {
                    preventScrollReset: true,
                  });
                }, 800);
              }}
              className="relative me-3 flex w-full flex-1 items-center"
            >
              {/* <SearchIcon className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" /> */}
              <div className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M11 8C10.606 8 10.2159 8.0776 9.85195 8.22836C9.48797 8.37913 9.15726 8.6001 8.87868 8.87868C8.6001 9.15726 8.37913 9.48797 8.22836 9.85195C8.0776 10.2159 8 10.606 8 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20L17 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>

              <Input
                name="q"
                defaultValue={searchParams.get("q") ?? ""}
                // @ts-ignore
                ref={searchInputRef}
                className="searchRef w-full flex-1 truncate rounded-lg bg-background pl-8 pr-[65px]"
                placeholder="Wpisz treść wyszukiwania..."
                type="text"
              />

              <div className="absolute right-1.5 ms-auto hidden h-10 items-center gap-x-1.5 tablet:flex">
                <Badge variant="outline" className="h-7 cursor-pointer rounded">
                  <Command size={10} /> + q
                </Badge>
              </div>
            </fetcher.Form>
          )}

          <div className="ml-auto flex items-center gap-3">
            <div className="flex">
              <Button
                variant="ghost"
                onClick={() => setOpenSearch((prev) => !prev)}
                className="gap-x-3 p-3"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="11"
                    cy="11"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M11 8C10.606 8 10.2159 8.0776 9.85195 8.22836C9.48797 8.37913 9.15726 8.6001 8.87868 8.87868C8.6001 9.15726 8.37913 9.48797 8.22836 9.85195C8.0776 10.2159 8 10.606 8 11"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20L17 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Button>
            </div>

            {/* <div className="flex">
              {userIsLoading || (userIsValidating && "validating user")}
            </div> */}

            {!user ? (
              <>
                {!isDesktop ? (
                  <Drawer>
                    <DrawerTrigger asChild>
                      <Button variant="secondary" className="w-full p-3">
                        Dołącz do nas
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Posiadasz już swoje konto?</DrawerTitle>
                        <DrawerDescription>
                          Zaloguj się, aby kontynuować.
                        </DrawerDescription>
                      </DrawerHeader>

                      <div className="grid gap-6 px-4 pb-6">
                        <div className="grid gap-3">
                          <Form action="/oauth/google" method="post">
                            <Button
                              type="submit"
                              variant="outline"
                              // disabled={isSubmitting}
                              className="w-full gap-x-2"
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M22.8859 12.2614C22.8859 11.4459 22.8128 10.6618 22.6769 9.90912H11.8459V14.3575H18.035C17.7684 15.795 16.9582 17.013 15.7403 17.8284V20.7139H19.4569C21.6314 18.7118 22.8859 15.7637 22.8859 12.2614Z"
                                  fill="#4285F4"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M11.8459 23.4998C14.9509 23.4998 17.5541 22.47 19.4568 20.7137L15.7402 17.8282C14.7105 18.5182 13.3932 18.9259 11.8459 18.9259C8.85068 18.9259 6.31546 16.903 5.41114 14.1848H1.56909V17.1644C3.46136 20.9228 7.35046 23.4998 11.8459 23.4998Z"
                                  fill="#34A853"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M5.41117 14.1851C5.18117 13.4951 5.05049 12.758 5.05049 12.0001C5.05049 11.2421 5.18117 10.5051 5.41117 9.81506V6.83551H1.56913C0.790265 8.38801 0.345947 10.1444 0.345947 12.0001C0.345947 13.8557 0.790265 15.6121 1.56913 17.1646L5.41117 14.1851Z"
                                  fill="#FBBC05"
                                />
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M11.8459 5.07386C13.5343 5.07386 15.0502 5.65409 16.242 6.79364L19.5405 3.49523C17.5489 1.63955 14.9457 0.5 11.8459 0.5C7.35046 0.5 3.46136 3.07705 1.56909 6.83545L5.41114 9.815C6.31546 7.09682 8.85068 5.07386 11.8459 5.07386Z"
                                  fill="#EA4335"
                                />
                              </svg>
                              Połącz się z Google
                            </Button>
                          </Form>
                        </div>

                        <div className="grid gap-3">
                          <Form action="/oauth/twitter" method="post">
                            <Button type="submit" className="w-full gap-x-2">
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
                                <path
                                  stroke="none"
                                  d="M0 0h24v24H0z"
                                  fill="none"
                                />
                                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                              </svg>
                              Połącz się z twitter
                            </Button>
                          </Form>
                        </div>

                        <div className="grid gap-3">
                          <Form action="/oauth/facebook" method="post">
                            <Button
                              type="submit"
                              variant="outline"
                              // disabled={isSubmitting}
                              className="w-full gap-x-2 bg-[#1877F2] text-white hover:bg-[#1374f2] hover:text-white"
                            >
                              <svg
                                width="25"
                                height="24"
                                viewBox="0 0 25 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <g clipPath="url(#clip0_1_114)">
                                  <rect
                                    width="24"
                                    height="24"
                                    transform="translate(0.845947)"
                                    fill="#1877F2"
                                  />
                                  <path
                                    d="M24.3459 12.0699C24.3459 5.7186 19.1972 0.56988 12.8459 0.56988C6.49467 0.56988 1.34595 5.7186 1.34595 12.0699C1.34595 17.8099 5.55133 22.5674 11.0491 23.4302V15.3941H8.12915V12.0699H11.0491V9.53629C11.0491 6.6541 12.7659 5.06207 15.3928 5.06207C16.651 5.06207 17.967 5.28668 17.967 5.28668V8.11675H16.5169C15.0883 8.11675 14.6428 9.00322 14.6428 9.91266V12.0699H17.8323L17.3224 15.3941H14.6428V23.4302C20.1406 22.5674 24.3459 17.8099 24.3459 12.0699Z"
                                    fill="white"
                                  />
                                </g>
                                <defs>
                                  <clipPath id="clip0_1_114">
                                    <rect
                                      width="24"
                                      height="24"
                                      fill="white"
                                      transform="translate(0.845947)"
                                    />
                                  </clipPath>
                                </defs>
                              </svg>
                              Połącz się z facebook
                            </Button>
                          </Form>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                          </div>
                          <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">
                              lub kontynuuj
                            </span>
                          </div>
                        </div>
                        <div className="">
                          <Link
                            to="/signin"
                            className={cn(
                              buttonVariants({ variant: "outline" }),
                              "w-full p-3",
                            )}
                          >
                            Zaloguj się przez email
                          </Link>
                        </div>
                        <p className="px-4 text-center text-sm text-muted-foreground">
                          Nie posiadasz jeszcze konta?{" "}
                          <Link
                            to="/signup"
                            className="underline underline-offset-4 hover:text-primary"
                          >
                            Zarejestruj się.
                          </Link>
                        </p>
                      </div>
                    </DrawerContent>
                  </Drawer>
                ) : (
                  <>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="secondary" className="w-full p-3">
                          Dołącz do nas
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader className="justify-center">
                          <DialogTitle className="text-center">
                            Posiadasz już swoje konto?
                          </DialogTitle>
                          <DialogDescription className="text-center">
                            Zaloguj się, aby kontynuować.
                          </DialogDescription>
                        </DialogHeader>

                        <div className="grid gap-6 px-4">
                          <div className="grid gap-3">
                            <Form action="/oauth/google" method="post">
                              <Button
                                type="submit"
                                variant="outline"
                                // disabled={isSubmitting}
                                className="w-full gap-x-2"
                              >
                                <svg
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M22.8859 12.2614C22.8859 11.4459 22.8128 10.6618 22.6769 9.90912H11.8459V14.3575H18.035C17.7684 15.795 16.9582 17.013 15.7403 17.8284V20.7139H19.4569C21.6314 18.7118 22.8859 15.7637 22.8859 12.2614Z"
                                    fill="#4285F4"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M11.8459 23.4998C14.9509 23.4998 17.5541 22.47 19.4568 20.7137L15.7402 17.8282C14.7105 18.5182 13.3932 18.9259 11.8459 18.9259C8.85068 18.9259 6.31546 16.903 5.41114 14.1848H1.56909V17.1644C3.46136 20.9228 7.35046 23.4998 11.8459 23.4998Z"
                                    fill="#34A853"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M5.41117 14.1851C5.18117 13.4951 5.05049 12.758 5.05049 12.0001C5.05049 11.2421 5.18117 10.5051 5.41117 9.81506V6.83551H1.56913C0.790265 8.38801 0.345947 10.1444 0.345947 12.0001C0.345947 13.8557 0.790265 15.6121 1.56913 17.1646L5.41117 14.1851Z"
                                    fill="#FBBC05"
                                  />
                                  <path
                                    fillRule="evenodd"
                                    clipRule="evenodd"
                                    d="M11.8459 5.07386C13.5343 5.07386 15.0502 5.65409 16.242 6.79364L19.5405 3.49523C17.5489 1.63955 14.9457 0.5 11.8459 0.5C7.35046 0.5 3.46136 3.07705 1.56909 6.83545L5.41114 9.815C6.31546 7.09682 8.85068 5.07386 11.8459 5.07386Z"
                                    fill="#EA4335"
                                  />
                                </svg>
                                Połącz się z Google
                              </Button>
                            </Form>
                          </div>

                          <div className="grid gap-3">
                            <Form action="/oauth/twitter" method="post">
                              <Button type="submit" className="w-full gap-x-2">
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
                                  <path
                                    stroke="none"
                                    d="M0 0h24v24H0z"
                                    fill="none"
                                  />
                                  <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                                  <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                                </svg>
                                Połącz się z twitter
                              </Button>
                            </Form>
                          </div>

                          <div className="grid gap-3">
                            <Form action="/oauth/facebook" method="post">
                              <Button
                                type="submit"
                                variant="outline"
                                // disabled={isSubmitting}
                                className="w-full gap-x-2 bg-[#1877F2] text-white hover:bg-[#1374f2] hover:text-white"
                              >
                                <svg
                                  width="25"
                                  height="24"
                                  viewBox="0 0 25 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <g clipPath="url(#clip0_1_114)">
                                    <rect
                                      width="24"
                                      height="24"
                                      transform="translate(0.845947)"
                                      fill="#1877F2"
                                    />
                                    <path
                                      d="M24.3459 12.0699C24.3459 5.7186 19.1972 0.56988 12.8459 0.56988C6.49467 0.56988 1.34595 5.7186 1.34595 12.0699C1.34595 17.8099 5.55133 22.5674 11.0491 23.4302V15.3941H8.12915V12.0699H11.0491V9.53629C11.0491 6.6541 12.7659 5.06207 15.3928 5.06207C16.651 5.06207 17.967 5.28668 17.967 5.28668V8.11675H16.5169C15.0883 8.11675 14.6428 9.00322 14.6428 9.91266V12.0699H17.8323L17.3224 15.3941H14.6428V23.4302C20.1406 22.5674 24.3459 17.8099 24.3459 12.0699Z"
                                      fill="white"
                                    />
                                  </g>
                                  <defs>
                                    <clipPath id="clip0_1_114">
                                      <rect
                                        width="24"
                                        height="24"
                                        fill="white"
                                        transform="translate(0.845947)"
                                      />
                                    </clipPath>
                                  </defs>
                                </svg>
                                Połącz się z facebook
                              </Button>
                            </Form>
                          </div>

                          <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                              <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                              <span className="bg-background px-2 text-muted-foreground">
                                lub kontynuuj
                              </span>
                            </div>
                          </div>
                          <div className="">
                            <Link
                              to="/signin"
                              className={cn(
                                buttonVariants({ variant: "outline" }),
                                "w-full p-3",
                              )}
                            >
                              Zaloguj się przez email
                            </Link>
                          </div>
                          <p className="px-4 text-center text-sm text-muted-foreground">
                            Nie posiadasz jeszcze konta?{" "}
                            <Link
                              to="/signup"
                              className="underline underline-offset-4 hover:text-primary"
                            >
                              Zarejestruj się.
                            </Link>
                          </p>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </>
                )}

                {/*  */}
              </>
            ) : (
              <>
                <AuthorityCheck authority={["admin"]}>
                  <div className="flex">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          to="/admin"
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon",
                          })}
                        >
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M6.34315 17.6569C5.22433 16.538 4.4624 15.1126 4.15372 13.5607C3.84504 12.0089 4.00346 10.4003 4.60896 8.93853C5.21446 7.47672 6.23984 6.22729 7.55544 5.34824C8.87103 4.46919 10.4177 4 12 4C13.5823 4 15.129 4.46919 16.4446 5.34824C17.7602 6.22729 18.7855 7.47672 19.391 8.93853C19.9965 10.4003 20.155 12.0089 19.8463 13.5607C19.5376 15.1126 18.7757 16.538 17.6569 17.6569"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                            <path
                              d="M12 12L16 10"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Panel administratora</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </AuthorityCheck>

                <div className="flex">
                  <Tooltip>
                    <Sheet
                      open={openNotifications}
                      onOpenChange={setOpenNotifications}
                    >
                      <TooltipTrigger>
                        <SheetTrigger>
                          <Button
                            variant="ghost"
                            className={`relative gap-x-3 p-3`}
                          >
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M6.44784 7.96942C6.76219 5.14032 9.15349 3 12 3V3C14.8465 3 17.2378 5.14032 17.5522 7.96942L17.804 10.2356C17.8072 10.2645 17.8088 10.279 17.8104 10.2933C17.9394 11.4169 18.3051 12.5005 18.8836 13.4725C18.8909 13.4849 18.8984 13.4973 18.9133 13.5222L19.4914 14.4856C20.0159 15.3599 20.2782 15.797 20.2216 16.1559C20.1839 16.3946 20.061 16.6117 19.8757 16.7668C19.5971 17 19.0873 17 18.0678 17H5.93223C4.91268 17 4.40291 17 4.12434 16.7668C3.93897 16.6117 3.81609 16.3946 3.77841 16.1559C3.72179 15.797 3.98407 15.3599 4.50862 14.4856L5.08665 13.5222C5.10161 13.4973 5.10909 13.4849 5.11644 13.4725C5.69488 12.5005 6.06064 11.4169 6.18959 10.2933C6.19123 10.279 6.19283 10.2645 6.19604 10.2356L6.44784 7.96942Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M8 17C8 17.5253 8.10346 18.0454 8.30448 18.5307C8.5055 19.016 8.80014 19.457 9.17157 19.8284C9.54301 20.1999 9.98396 20.4945 10.4693 20.6955C10.9546 20.8965 11.4747 21 12 21C12.5253 21 13.0454 20.8965 13.5307 20.6955C14.016 20.4945 14.457 20.1999 14.8284 19.8284C15.1999 19.457 15.4945 19.016 15.6955 18.5307C15.8965 18.0454 16 17.5253 16 17"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              {notifications &&
                                Number(notifications?.unread) > 0 && (
                                  <circle
                                    cx="17"
                                    cy="6"
                                    r="3"
                                    fill="currentColor"
                                    stroke="currentColor"
                                    className="animate-pulse fill-rose-400 stroke-rose-400"
                                  />
                                )}
                            </svg>
                          </Button>
                        </SheetTrigger>
                      </TooltipTrigger>
                      <SheetContent className="flex w-80 flex-col gap-0 overflow-hidden p-0 tablet:w-full">
                        {isLoading && notifications?.result === undefined ? (
                          <SheetHeader className="mb-0 border-b p-6">
                            <SheetTitle className="mb-0 h-6">
                              <Skeleton className="h-6 w-2/4" />
                            </SheetTitle>
                            {/* <SheetDescription>
                              <Skeleton className="h-5 w-3/4" />
                            </SheetDescription> */}
                          </SheetHeader>
                        ) : (
                          notifications?.result &&
                          notifications?.result?.length > 0 && (
                            <SheetHeader className="border-b p-6">
                              <SheetTitle className="mb-0 h-5 text-sm font-medium">
                                Najnowsze powiadomienia
                              </SheetTitle>
                              {/* <SheetDescription>
                                Latest notifications.
                              </SheetDescription> */}
                            </SheetHeader>
                          )
                        )}
                        {isLoading && notifications?.result === undefined ? (
                          <div className="flex flex-col divide-y divide-slate-100">
                            {[...Array(5)].map((row, index) => (
                              <div
                                key={index}
                                className="flex items-center space-x-4 p-4"
                              >
                                <Skeleton className="h-8 w-8 shrink-0 rounded-lg" />
                                <div className="grow space-y-2">
                                  <Skeleton className="h-3 w-3/4" />
                                  <Skeleton className="h-3 w-2/4" />
                                </div>
                                <Skeleton className="size-8 rounded-lg" />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <>
                            {notifications?.result?.length === 0 ? (
                              <div className="h-full flex-1">
                                <Empty
                                  className="my-auto flex h-full min-h-full flex-col items-center justify-center"
                                  icon={BellRing}
                                  title="Obecnie brak powiadomień!"
                                  withoutBorder
                                  iconSize={24}
                                />
                              </div>
                            ) : (
                              <ScrollArea className="m-1 h-full flex-1">
                                <div className="">
                                  <ul className="divide-y divide-slate-100">
                                    {notifications?.result?.map(
                                      (notification) => (
                                        <li
                                          key={notification.id}
                                          className="flex items-center gap-4 px-4 py-3"
                                        >
                                          <div className="flex min-h-[2rem] w-full min-w-0 flex-col items-start justify-center gap-0">
                                            <h4 className="w-full truncate text-xs text-primary">
                                              {formattedDate(
                                                notification.createdAt,
                                              )}
                                            </h4>
                                            <p className="w-full text-sm text-primary/80">
                                              {notification.data}
                                            </p>
                                            {notification.url && (
                                              <Link
                                                to={notification.url}
                                                className="w-full text-sm underline"
                                              >
                                                Przejdź
                                              </Link>
                                            )}
                                          </div>

                                          {notification.readAt == null && (
                                            <fetcher.Form
                                              method="post"
                                              action={`/api/notifications/${notification.id}/read`}
                                            >
                                              <Button
                                                variant="ghost"
                                                className="size-8 p-2"
                                                type="submit"
                                              >
                                                {fetcher.formAction ===
                                                `/api/notifications/${notification.id}/read` ? (
                                                  <Loader
                                                    variant="dark"
                                                    className="size-[16px] stroke-primary"
                                                  />
                                                ) : (
                                                  <svg
                                                    width="20"
                                                    height="20"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                  >
                                                    <path
                                                      d="M10.1883 5.23852C11.3752 4.92049 12.6248 4.92049 13.8117 5.23852C14.9986 5.55654 16.0809 6.18139 16.9497 7.05025C17.8186 7.91911 18.4435 9.00138 18.7615 10.1883C19.0795 11.3752 19.0795 12.6248 18.7615 13.8117"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                    <path
                                                      d="M16.9497 16.9497C15.637 18.2625 13.8565 19 12 19C10.1435 19 8.36301 18.2625 7.05025 16.9497C5.7375 15.637 5 13.8565 5 12C5 10.1435 5.7375 8.36301 7.05025 7.05025"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                    />
                                                    <path
                                                      d="M19 19L5 5"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                      strokeLinejoin="round"
                                                    />
                                                    <path
                                                      d="M18.0353 3.1363C18.7135 3.31803 19.3319 3.67508 19.8284 4.17157C20.3249 4.66807 20.682 5.2865 20.8637 5.96472"
                                                      stroke="currentColor"
                                                      strokeWidth="2"
                                                      strokeLinecap="round"
                                                    />
                                                  </svg>
                                                )}
                                              </Button>
                                            </fetcher.Form>
                                          )}
                                        </li>
                                      ),
                                    )}
                                  </ul>
                                </div>
                              </ScrollArea>
                            )}
                          </>
                        )}
                        {/* {notifications && Number(notifications?.unread) > 0 && (
          <div className="mb-0 flex flex-col space-y-2 border-t p-6 text-center tablet:text-left">
            <Button>Oznacz wszystkie powiadomienia jako przeczytane</Button>
          </div>
        )} */}
                      </SheetContent>
                    </Sheet>

                    <TooltipContent>
                      <p>Powiadomienia</p>
                    </TooltipContent>
                  </Tooltip>
                </div>

                <div className="flex">
                  {/* Account */}
                  <DropdownMenu>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <DropdownMenuTrigger
                          asChild
                          className="shadow-none outline-0 ring-0 focus-visible:border-inherit focus-visible:ring-transparent aria-[expanded=true]:rounded-md aria-[expanded=true]:bg-accent"
                        >
                          <div
                            className={`${buttonVariants({
                              variant: "ghost",
                            })} group h-10 w-10 cursor-pointer p-0 tablet:w-auto tablet:gap-3 tablet:p-3`}
                          >
                            <Avatar className="relative size-8 transition-all duration-100 ease-in-out tablet:-ml-2">
                              <AvatarImage
                                src={String(user?.image)}
                                className="block rounded-full outline-none"
                              />
                              <AvatarFallback className="inline-flex items-center rounded-full bg-muted uppercase outline-none transition-all group-hover:bg-white dark:group-hover:bg-background">
                                {user?.first_name?.substring(0, 1)}
                                {user?.last_name?.substring(0, 1)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="invisible hidden flex-col truncate text-left text-foreground tablet:visible tablet:flex">
                              <h4 className="text-sm font-medium text-primary">
                                {`${user?.first_name ?? ""} ${user?.last_name ?? ""}`}
                                {user.first_name === "" ||
                                user.first_name === null
                                  ? "Brak informacji"
                                  : ""}
                              </h4>
                            </div>
                          </div>
                        </DropdownMenuTrigger>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Moje konto</p>
                      </TooltipContent>
                    </Tooltip>
                    <DropdownMenuContent className="custom-scroll max-h-[75vh] w-72 overflow-auto">
                      <DropdownMenuLabel className="flex items-center justify-between p-1">
                        <span className="px-2">Konto</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() =>
                            setTheme(
                              theme === Theme.DARK ? Theme.LIGHT : Theme.DARK,
                            )
                          }
                        >
                          {theme === Theme.DARK ? (
                            <Sun size={16} stroke="currentColor" />
                          ) : (
                            <Moon size={16} stroke="currentColor" />
                          )}
                        </Button>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-1" />
                      <Link
                        to={$path("/user/:username", {
                          username: user.username,
                        })}
                      >
                        <DropdownMenuItem className="font-medium">
                          <span className="me-1.5">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3.08168 13.9445C2.55298 12.9941 2.28862 12.5188 2.28862 12C2.28862 11.4812 2.55298 11.0059 3.08169 10.0555L4.43094 7.63L5.85685 5.24876C6.4156 4.31567 6.69498 3.84912 7.14431 3.5897C7.59364 3.33028 8.13737 3.3216 9.22483 3.30426L12 3.26L14.7752 3.30426C15.8626 3.3216 16.4064 3.33028 16.8557 3.5897C17.305 3.84912 17.5844 4.31567 18.1431 5.24876L19.5691 7.63L20.9183 10.0555C21.447 11.0059 21.7114 11.4812 21.7114 12C21.7114 12.5188 21.447 12.9941 20.9183 13.9445L19.5691 16.37L18.1431 18.7512C17.5844 19.6843 17.305 20.1509 16.8557 20.4103C16.4064 20.6697 15.8626 20.6784 14.7752 20.6957L12 20.74L9.22483 20.6957C8.13737 20.6784 7.59364 20.6697 7.14431 20.4103C6.69498 20.1509 6.4156 19.6843 5.85685 18.7512L4.43094 16.37L3.08168 13.9445Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="12"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </span>
                          <span className="mr-6 truncate">Mój profil</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link
                        to={$path("/user/:username/bookmarks", {
                          username: user.username,
                        })}
                      >
                        <DropdownMenuItem className="font-medium">
                          <span className="me-1.5">
                            <BookmarkIcon width={20} height={20} />
                          </span>
                          <span className="mr-6 truncate">Ulubione</span>
                        </DropdownMenuItem>
                      </Link>
                      <Link to={$path("/profile")}>
                        <DropdownMenuItem className="font-medium">
                          <span className="me-1.5">
                            {/* <Image size={16} strokeWidth={1} /> */}
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M17 4H17.502C18.7134 4 19.319 4 19.7834 4.232C20.2095 4.44495 20.5551 4.79048 20.768 5.21665C21 5.68096 21 6.28664 21 7.498V8M17 20H17.502C18.7134 20 19.319 20 19.7834 19.768C20.2095 19.5551 20.5551 19.2095 20.768 18.7834C21 18.319 21 17.7134 21 16.502V16M7 4H6.498C5.28664 4 4.68096 4 4.21665 4.232C3.79048 4.44495 3.44495 4.79048 3.232 5.21665C3 5.68096 3 6.28664 3 7.498V8M7 20H6.498C5.28664 20 4.68096 20 4.21665 19.768C3.79048 19.5551 3.44495 19.2095 3.232 18.7834C3 18.319 3 17.7134 3 16.502V16"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M7.62584 17.0695C8.0447 16.4649 8.66228 15.9421 9.43355 15.571C10.2049 15.1999 11.0906 15 12 15C12.9094 15 13.7951 15.1999 14.5664 15.571C15.3377 15.9421 15.9553 16.4649 16.3742 17.0695"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <circle
                                cx="12"
                                cy="9"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          <span className="mr-6 truncate">
                            Ustawienia profilu
                          </span>
                        </DropdownMenuItem>
                      </Link>

                      <Link to={$path("/profile/password")}>
                        <DropdownMenuItem className="font-medium">
                          <span className="me-1.5">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="9"
                                cy="14"
                                r="4"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M12 11L15.5 7.5M17 6L15.5 7.5M15.5 7.5L18 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </span>
                          <span className="mr-6 truncate">Bezpieczeństwo</span>
                        </DropdownMenuItem>
                      </Link>
                      <fetcher.Form method="post" action={$path("/api/logout")}>
                        <DropdownMenuItem className="font-medium">
                          <button className="flex w-full items-center">
                            <span className="me-1.5">
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M2 12L1.21913 11.3753L0.719375 12L1.21913 12.6247L2 12ZM11 13C11.5523 13 12 12.5523 12 12C12 11.4477 11.5523 11 11 11V13ZM5.21913 6.3753L1.21913 11.3753L2.78087 12.6247L6.78087 7.6247L5.21913 6.3753ZM1.21913 12.6247L5.21913 17.6247L6.78087 16.3753L2.78087 11.3753L1.21913 12.6247ZM2 13H11V11H2V13Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M10 8.13193V7.38851C10 5.77017 10 4.961 10.474 4.4015C10.9479 3.84201 11.7461 3.70899 13.3424 3.44293L15.0136 3.1644C18.2567 2.62388 19.8782 2.35363 20.9391 3.25232C22 4.15102 22 5.79493 22 9.08276V14.9172C22 18.2051 22 19.849 20.9391 20.7477C19.8782 21.6464 18.2567 21.3761 15.0136 20.8356L13.3424 20.5571C11.7461 20.291 10.9479 20.158 10.474 19.5985C10 19.039 10 18.2298 10 16.6115V16.066"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                              </svg>
                            </span>
                            Wyloguj się
                          </button>
                        </DropdownMenuItem>
                      </fetcher.Form>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="flex">
                  {/* create post */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        onClick={openMakePostModal}
                        className={`hidden gap-x-3 rounded-full bg-fleak-500 p-3 text-white hover:bg-fleak-600 hover:text-white tablet:flex`}
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <mask
                            id="path-1-outside-1_2165_508"
                            maskUnits="userSpaceOnUse"
                            x="3"
                            y="4"
                            width="17"
                            height="17"
                            fill="black"
                          >
                            <rect
                              fill="white"
                              x="3"
                              y="4"
                              width="17"
                              height="17"
                            />
                            <path d="M13.5858 7.41421L6.39171 14.6083C6.19706 14.8029 6.09974 14.9003 6.03276 15.0186C5.96579 15.1368 5.93241 15.2704 5.86564 15.5374L5.20211 18.1915C5.11186 18.5526 5.06673 18.7331 5.16682 18.8332C5.2669 18.9333 5.44742 18.8881 5.80844 18.7979L5.80845 18.7979L8.46257 18.1344C8.72963 18.0676 8.86316 18.0342 8.98145 17.9672C9.09974 17.9003 9.19706 17.8029 9.39171 17.6083L16.5858 10.4142L16.5858 10.4142C17.2525 9.74755 17.5858 9.41421 17.5858 9C17.5858 8.58579 17.2525 8.25245 16.5858 7.58579L16.4142 7.41421C15.7475 6.74755 15.4142 6.41421 15 6.41421C14.5858 6.41421 14.2525 6.74755 13.5858 7.41421Z" />
                          </mask>
                          <path
                            d="M6.39171 14.6083L7.80593 16.0225L7.80593 16.0225L6.39171 14.6083ZM13.5858 7.41421L12.1716 6L12.1716 6L13.5858 7.41421ZM16.4142 7.41421L15 8.82843L15 8.82843L16.4142 7.41421ZM16.5858 7.58579L18 6.17157L18 6.17157L16.5858 7.58579ZM16.5858 10.4142L18 11.8284L16.5858 10.4142ZM9.39171 17.6083L7.9775 16.1941L7.9775 16.1941L9.39171 17.6083ZM5.86564 15.5374L7.80593 16.0225L7.80593 16.0225L5.86564 15.5374ZM5.20211 18.1915L3.26183 17.7065H3.26183L5.20211 18.1915ZM5.80845 18.7979L5.32338 16.8576L5.23624 16.8794L5.15141 16.9089L5.80845 18.7979ZM8.46257 18.1344L7.97751 16.1941L7.9775 16.1941L8.46257 18.1344ZM5.16682 18.8332L6.58103 17.419L6.58103 17.419L5.16682 18.8332ZM5.80844 18.7979L6.29351 20.7382L6.38065 20.7164L6.46549 20.6869L5.80844 18.7979ZM8.98145 17.9672L7.99605 16.2268L7.99605 16.2268L8.98145 17.9672ZM16.5858 10.4142L18 11.8284L18 11.8284L16.5858 10.4142ZM6.03276 15.0186L4.29236 14.0332L4.29236 14.0332L6.03276 15.0186ZM7.80593 16.0225L15 8.82843L12.1716 6L4.9775 13.1941L7.80593 16.0225ZM15 8.82843L15.1716 9L18 6.17157L17.8284 6L15 8.82843ZM15.1716 9L7.9775 16.1941L10.8059 19.0225L18 11.8284L15.1716 9ZM3.92536 15.0524L3.26183 17.7065L7.1424 18.6766L7.80593 16.0225L3.92536 15.0524ZM6.29352 20.7382L8.94764 20.0746L7.9775 16.1941L5.32338 16.8576L6.29352 20.7382ZM3.26183 17.7065C3.233 17.8218 3.15055 18.1296 3.12259 18.4155C3.0922 18.7261 3.06509 19.5599 3.7526 20.2474L6.58103 17.419C6.84671 17.6847 6.99914 18.0005 7.06644 18.2928C7.12513 18.5478 7.10965 18.7429 7.10358 18.8049C7.09699 18.8724 7.08792 18.904 7.097 18.8631C7.10537 18.8253 7.11788 18.7747 7.1424 18.6766L3.26183 17.7065ZM5.15141 16.9089L5.1514 16.9089L6.46549 20.6869L6.46549 20.6869L5.15141 16.9089ZM5.32338 16.8576C5.22531 16.8821 5.17467 16.8946 5.13694 16.903C5.09595 16.9121 5.12762 16.903 5.19506 16.8964C5.25712 16.8903 5.45223 16.8749 5.70717 16.9336C5.99955 17.0009 6.31535 17.1533 6.58103 17.419L3.7526 20.2474C4.44011 20.9349 5.27387 20.9078 5.58449 20.8774C5.87039 20.8494 6.17822 20.767 6.29351 20.7382L5.32338 16.8576ZM7.9775 16.1941C7.95279 16.2188 7.9317 16.2399 7.91214 16.2593C7.89271 16.2787 7.87671 16.2945 7.86293 16.308C7.84916 16.3215 7.83911 16.3312 7.83172 16.3382C7.82812 16.3416 7.82545 16.3441 7.8236 16.3458C7.82176 16.3475 7.8209 16.3483 7.82092 16.3482C7.82094 16.3482 7.82198 16.3473 7.82395 16.3456C7.82592 16.3439 7.82893 16.3413 7.83291 16.338C7.84086 16.3314 7.85292 16.3216 7.86866 16.3098C7.88455 16.2979 7.90362 16.2843 7.92564 16.2699C7.94776 16.2553 7.97131 16.2408 7.99605 16.2268L9.96684 19.7076C10.376 19.476 10.6864 19.1421 10.8059 19.0225L7.9775 16.1941ZM8.94764 20.0746C9.11169 20.0336 9.55771 19.9393 9.96685 19.7076L7.99605 16.2268C8.02079 16.2128 8.0453 16.2001 8.06917 16.1886C8.09292 16.1772 8.11438 16.1678 8.13277 16.1603C8.15098 16.1529 8.16553 16.1475 8.17529 16.1441C8.18017 16.1424 8.18394 16.1412 8.18642 16.1404C8.1889 16.1395 8.19024 16.1391 8.19026 16.1391C8.19028 16.1391 8.18918 16.1395 8.18677 16.1402C8.18435 16.1409 8.18084 16.1419 8.17606 16.1432C8.16625 16.1459 8.15278 16.1496 8.13414 16.1544C8.11548 16.1593 8.09368 16.1649 8.0671 16.1716C8.04034 16.1784 8.0114 16.1856 7.97751 16.1941L8.94764 20.0746ZM15.1716 9C15.3435 9.17192 15.4698 9.29842 15.5738 9.40785C15.6786 9.518 15.7263 9.57518 15.7457 9.60073C15.7644 9.62524 15.7226 9.57638 15.6774 9.46782C15.6254 9.34332 15.5858 9.18102 15.5858 9H19.5858C19.5858 8.17978 19.2282 7.57075 18.9258 7.1744C18.6586 6.82421 18.2934 6.46493 18 6.17157L15.1716 9ZM18 11.8284L18 11.8284L15.1716 8.99999L15.1716 9L18 11.8284ZM18 11.8284C18.2934 11.5351 18.6586 11.1758 18.9258 10.8256C19.2282 10.4292 19.5858 9.82022 19.5858 9H15.5858C15.5858 8.81898 15.6254 8.65668 15.6774 8.53218C15.7226 8.42362 15.7644 8.37476 15.7457 8.39927C15.7263 8.42482 15.6786 8.482 15.5738 8.59215C15.4698 8.70157 15.3435 8.82807 15.1716 9L18 11.8284ZM15 8.82843C15.1719 8.6565 15.2984 8.53019 15.4078 8.42615C15.518 8.32142 15.5752 8.27375 15.6007 8.25426C15.6252 8.23555 15.5764 8.27736 15.4678 8.32264C15.3433 8.37455 15.181 8.41421 15 8.41421V4.41421C14.1798 4.41421 13.5707 4.77177 13.1744 5.07417C12.8242 5.34136 12.4649 5.70664 12.1716 6L15 8.82843ZM17.8284 6C17.5351 5.70665 17.1758 5.34136 16.8256 5.07417C16.4293 4.77177 15.8202 4.41421 15 4.41421V8.41421C14.819 8.41421 14.6567 8.37455 14.5322 8.32264C14.4236 8.27736 14.3748 8.23555 14.3993 8.25426C14.4248 8.27375 14.482 8.32142 14.5922 8.42615C14.7016 8.53019 14.8281 8.6565 15 8.82843L17.8284 6ZM4.9775 13.1941C4.85793 13.3136 4.52401 13.624 4.29236 14.0332L7.77316 16.0039C7.75915 16.0287 7.7447 16.0522 7.73014 16.0744C7.71565 16.0964 7.70207 16.1155 7.69016 16.1313C7.67837 16.1471 7.66863 16.1591 7.66202 16.1671C7.65871 16.1711 7.65613 16.1741 7.65442 16.1761C7.65271 16.178 7.65178 16.1791 7.65176 16.1791C7.65174 16.1791 7.65252 16.1782 7.65422 16.1764C7.65593 16.1745 7.65842 16.1719 7.66184 16.1683C7.66884 16.1609 7.67852 16.1508 7.692 16.1371C7.7055 16.1233 7.72132 16.1073 7.74066 16.0879C7.76013 16.0683 7.78122 16.0472 7.80593 16.0225L4.9775 13.1941ZM7.80593 16.0225C7.8144 15.9886 7.82164 15.9597 7.82839 15.9329C7.8351 15.9063 7.84068 15.8845 7.84556 15.8659C7.85043 15.8472 7.85407 15.8337 7.8568 15.8239C7.85813 15.8192 7.85914 15.8157 7.85984 15.8132C7.86054 15.8108 7.86088 15.8097 7.86088 15.8097C7.86087 15.8098 7.86046 15.8111 7.85965 15.8136C7.85884 15.8161 7.85758 15.8198 7.85588 15.8247C7.85246 15.8345 7.84713 15.849 7.8397 15.8672C7.8322 15.8856 7.82284 15.9071 7.81141 15.9308C7.79993 15.9547 7.78717 15.9792 7.77316 16.0039L4.29236 14.0332C4.06071 14.4423 3.96637 14.8883 3.92536 15.0524L7.80593 16.0225Z"
                            fill="white"
                            mask="url(#path-1-outside-1_2165_508)"
                          />
                          <path
                            d="M12.5 7.5L15.5 5.5L18.5 8.5L16.5 11.5L12.5 7.5Z"
                            fill="white"
                          />
                        </svg>
                        utwórz
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>utwórz</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </StickyHeader>
  );
};

export default Topbar;
