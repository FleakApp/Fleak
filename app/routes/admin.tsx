/* eslint-disable react/no-children-prop */
import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer, Link, NavLink, Outlet, useLoaderData } from "@remix-run/react";

import { useIsMounted } from "@fleak-org/hooks/use-is-mounted";
import { Badge, Button, buttonVariants, cn, ScrollArea } from "@fleak-org/ui";

import Topbar from "@/components/shell/topbar";
import { themeConfig } from "@/config/theme";
import { requireUser, requireUserWithRole } from "@/helpers/auth";
import { useLayout } from "@/providers/layout";
import { prisma } from "@/services/db.server";

export { ErrorBoundary } from "@/components/error-bound";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  await requireUserWithRole(request, "admin");

  const countPosts = await prisma.post.count();
  const countCategories = await prisma.category.count();
  const countUsers = await prisma.user.count();
  const countIssues = await prisma.issue.count();
  const countComments = await prisma.comment.count();

  const countMessages = await prisma.messages.count();
  return defer({
    user,
    countMessages,
    countCategories,
    countPosts,
    countUsers,
    countIssues,
    countComments,
  });
};

export default function Component() {
  const { isLeftPanelOpen: isOpenLeft, toggleLeftPanel: toggleLeft } =
    useLayout();

  const {
    countMessages,
    countCategories,
    countPosts,
    countUsers,
    countIssues,
    countComments,
  } = useLoaderData<typeof loader>();

  const style = {
    navlink: `flex items-center gap-3 rounded-lg p-3 max-h-10 text-primary transition-colors truncate hover:bg-accent hover:text-accent-foreground focus:bg-accent aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground`,
  };

  const config = themeConfig;
  const isMounted = useIsMounted();

  return (
    <div className={cn("z-10 h-screen w-full")}>
      <div className={cn("w-full", config.body.background)}>
        <Topbar isAlwaysSticky={true} />

        <div
          className={cn(
            "relative flex flex-1 flex-row desktop:divide-x",
            "mt-[70px] px-0 pb-[70px] tablet:mt-0 tablet:pb-0",
            config.main.container ? "container" : "-mx-px max-w-full",
          )}
        >
          {isMounted && (
            <>
              {config.layout.left_sidebar && (
                <div
                  className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 transition-all tablet:sticky tablet:top-[70px] tablet:w-0",
                    isOpenLeft ? "desktop:w-72" : "w-0",
                    "z-50 tablet:z-10",
                    "max-h-screen transition-all tablet:max-h-[calc(100vh-70px)]",
                  )}
                >
                  <aside
                    className={cn(
                      "fixed left-0 flex h-full flex-col bg-background transition-all",
                      "z-50 tablet:z-10",
                      "tablet:sticky tablet:top-[70px] tablet:bg-transparent", //

                      "w-72",
                      isOpenLeft ? "translate-x-0" : "-translate-x-full",
                      "max-h-screen transition-all tablet:max-h-[calc(100vh-70px)]",
                    )}
                  >
                    <ScrollArea
                      id="sidebarScrollable"
                      className="max-h-screen w-full px-3 tablet:max-h-[calc(100vh-70px)]"
                    >
                      <div className="min-h-[100vh] flex-1 flex-col gap-y-3 space-y-1 py-3 tablet:min-h-[calc(100vh-70px)]">
                        <h4 className="mb-3 ml-3 mr-3 flex text-xs font-bold text-primary/60">
                          Zarządzaj
                        </h4>

                        <NavLink
                          to="/admin/dashboard"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
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
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Kokpit
                          </div>
                        </NavLink>

                        <NavLink
                          to="/admin/messages"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M4 10.4721C4 9.26932 4 8.66791 4.2987 8.18461C4.5974 7.7013 5.13531 7.43234 6.21115 6.89443L10.2111 4.89443C11.089 4.45552 11.5279 4.23607 12 4.23607C12.4721 4.23607 12.911 4.45552 13.7889 4.89443L17.7889 6.89443C18.8647 7.43234 19.4026 7.7013 19.7013 8.18461C20 8.66791 20 9.26932 20 10.4721V16C20 17.8856 20 18.8284 19.4142 19.4142C18.8284 20 17.8856 20 16 20H8C6.11438 20 5.17157 20 4.58579 19.4142C4 18.8284 4 17.8856 4 16V10.4721Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M4 10L6.41421 12.4142C6.78929 12.7893 7.29799 13 7.82843 13H16.1716C16.702 13 17.2107 12.7893 17.5858 12.4142L20 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Wiadomości
                          </div>
                          <Badge variant="outline" children={countMessages} />
                        </NavLink>
                        <NavLink
                          to="/admin/posts"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 12V17C20 18.8856 20 19.8284 19.4142 20.4142C18.8284 21 17.8856 21 16 21H6.5C5.11929 21 4 19.8807 4 18.5V18.5C4 17.1193 5.11929 16 6.5 16H16C17.8856 16 18.8284 16 19.4142 15.4142C20 14.8284 20 13.8856 20 12V7C20 5.11438 20 4.17157 19.4142 3.58579C18.8284 3 17.8856 3 16 3H8C6.11438 3 5.17157 3 4.58579 3.58579C4 4.17157 4 5.11438 4 7V18.5"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M9 8L15 8"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Posty
                          </div>

                          <Badge variant="outline" children={countPosts} />
                        </NavLink>
                        <NavLink
                          to="/admin/comments"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M20 12C20 8.22876 20 6.34315 18.8284 5.17157C17.6569 4 15.7712 4 12 4V4C8.22876 4 6.34315 4 5.17157 5.17157C4 6.34315 4 8.22876 4 12V18C4 18.9428 4 19.4142 4.29289 19.7071C4.58579 20 5.05719 20 6 20H12C15.7712 20 17.6569 20 18.8284 18.8284C20 17.6569 20 15.7712 20 12V12Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M9 10L15 10"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M9 14H12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Komentarze
                          </div>

                          <Badge variant="outline" children={countComments} />
                        </NavLink>
                        <NavLink
                          to="/admin/categories"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <rect
                                x="4"
                                y="5"
                                width="16"
                                height="5"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                              <rect
                                x="4"
                                y="14"
                                width="16"
                                height="5"
                                rx="1"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Kategorie
                          </div>

                          <Badge variant="outline" children={countCategories} />
                        </NavLink>
                        <NavLink
                          to="/admin/users"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                cx="12"
                                cy="8"
                                r="3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M15.2679 8C15.5332 7.54063 15.97 7.20543 16.4824 7.06815C16.9947 6.93086 17.5406 7.00273 18 7.26795C18.4594 7.53317 18.7946 7.97 18.9319 8.48236C19.0691 8.99472 18.9973 9.54063 18.7321 10C18.4668 10.4594 18.03 10.7946 17.5176 10.9319C17.0053 11.0691 16.4594 10.9973 16 10.7321C15.5406 10.4668 15.2054 10.03 15.0681 9.51764C14.9309 9.00528 15.0027 8.45937 15.2679 8L15.2679 8Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M5.26795 8C5.53317 7.54063 5.97 7.20543 6.48236 7.06815C6.99472 6.93086 7.54063 7.00273 8 7.26795C8.45937 7.53317 8.79457 7.97 8.93185 8.48236C9.06914 8.99472 8.99727 9.54063 8.73205 10C8.46683 10.4594 8.03 10.7946 7.51764 10.9319C7.00528 11.0691 6.45937 10.9973 6 10.7321C5.54063 10.4668 5.20543 10.03 5.06815 9.51764C4.93086 9.00528 5.00273 8.45937 5.26795 8L5.26795 8Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <path
                                d="M16.8816 18L15.9013 18.1974L16.0629 19H16.8816V18ZM20.7202 16.9042L21.6627 16.5699L20.7202 16.9042ZM14.7808 14.7105L14.176 13.9142L13.0194 14.7927L14.2527 15.5597L14.7808 14.7105ZM19.8672 17H16.8816V19H19.8672V17ZM19.7777 17.2384C19.7707 17.2186 19.7642 17.181 19.7725 17.1354C19.7804 17.0921 19.7982 17.0593 19.8151 17.0383C19.8474 16.9982 19.874 17 19.8672 17V19C21.0132 19 22.1414 17.9194 21.6627 16.5699L19.7777 17.2384ZM17 15C18.6416 15 19.4027 16.1811 19.7777 17.2384L21.6627 16.5699C21.1976 15.2588 19.9485 13 17 13V15ZM15.3857 15.5069C15.7702 15.2148 16.282 15 17 15V13C15.8381 13 14.9028 13.3622 14.176 13.9142L15.3857 15.5069ZM14.2527 15.5597C15.2918 16.206 15.7271 17.3324 15.9013 18.1974L17.8619 17.8026C17.644 16.7204 17.0374 14.9364 15.309 13.8614L14.2527 15.5597Z"
                                fill="currentColor"
                              />
                              <path
                                d="M9.21918 14.7105L9.7473 15.5597L10.9806 14.7927L9.82403 13.9142L9.21918 14.7105ZM3.2798 16.9041L4.22227 17.2384L4.22227 17.2384L3.2798 16.9041ZM7.11835 18V19H7.93703L8.09867 18.1974L7.11835 18ZM7.00001 15C7.71803 15 8.22986 15.2148 8.61433 15.5069L9.82403 13.9142C9.09723 13.3621 8.1619 13 7.00001 13V15ZM4.22227 17.2384C4.59732 16.1811 5.35842 15 7.00001 15V13C4.0515 13 2.80238 15.2587 2.33733 16.5699L4.22227 17.2384ZM4.13278 17C4.126 17 4.15264 16.9982 4.18486 17.0383C4.20176 17.0593 4.21961 17.0921 4.22748 17.1354C4.2358 17.181 4.22931 17.2186 4.22227 17.2384L2.33733 16.5699C1.85864 17.9194 2.98677 19 4.13278 19V17ZM7.11835 17H4.13278V19H7.11835V17ZM8.09867 18.1974C8.27289 17.3324 8.70814 16.206 9.7473 15.5597L8.69106 13.8614C6.96257 14.9363 6.356 16.7203 6.13804 17.8026L8.09867 18.1974Z"
                                fill="currentColor"
                              />
                              <path
                                d="M12 14C15.5715 14 16.5919 16.5512 16.8834 18.0089C16.9917 18.5504 16.5523 19 16 19H8C7.44772 19 7.00829 18.5504 7.11659 18.0089C7.4081 16.5512 8.42846 14 12 14Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Użytkownicy
                          </div>
                          <Badge variant="outline" children={countUsers} />
                        </NavLink>

                        <NavLink
                          to="/admin/issues"
                          className={cn(style.navlink, "flex w-full")}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.14939 7.8313C8.57654 5.92179 10.0064 4 12 4V4C13.9936 4 15.4235 5.92179 14.8506 7.8313L13.2873 13.0422C13.2171 13.2762 13.182 13.3932 13.128 13.4895C12.989 13.7371 12.7513 13.9139 12.4743 13.9759C12.3664 14 12.2443 14 12 14V14C11.7557 14 11.6336 14 11.5257 13.9759C11.2487 13.9139 11.011 13.7371 10.872 13.4895C10.818 13.3932 10.7829 13.2762 10.7127 13.0422L9.14939 7.8313Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="19"
                                r="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Zgłoszenia
                          </div>
                          <Badge variant="outline" children={countIssues} />
                        </NavLink>

                        <NavLink
                          to="/admin/deploy"
                          className={cn(
                            style.navlink,
                            "absolute inset-x-0 bottom-5 mx-3 hidden",
                          )}
                        >
                          <div className="flex items-center self-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M9.14939 7.8313C8.57654 5.92179 10.0064 4 12 4V4C13.9936 4 15.4235 5.92179 14.8506 7.8313L13.2873 13.0422C13.2171 13.2762 13.182 13.3932 13.128 13.4895C12.989 13.7371 12.7513 13.9139 12.4743 13.9759C12.3664 14 12.2443 14 12 14V14C11.7557 14 11.6336 14 11.5257 13.9759C11.2487 13.9139 11.011 13.7371 10.872 13.4895C10.818 13.3932 10.7829 13.2762 10.7127 13.0422L9.14939 7.8313Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <circle
                                cx="12"
                                cy="19"
                                r="2"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Deploy aplikacji
                          </div>
                        </NavLink>
                      </div>
                    </ScrollArea>
                  </aside>
                  <button
                    className={`fixed bottom-0 left-0 right-0 top-0 z-[49] order-first bg-black/50 transition-colors desktop:hidden ${
                      isOpenLeft ? "block" : "hidden"
                    }`}
                    onClick={() => toggleLeft()}
                  ></button>
                </div>
              )}

              <main className={cn("relative z-[10] w-full flex-1 items-start")}>
                <div
                  className={cn(
                    config.footer.pinned ? config.body.background : "",
                    config.footer.pinned
                      ? "min-h-[calc(100vh-140px)]"
                      : "min-h-[calc(100vh-70px)]",
                  )}
                >
                  <Outlet />
                </div>

                {/* {config.footer.pinned && <Footer />} */}
              </main>
            </>
          )}
        </div>

        {/* bottom menu */}
        <div className="fixed inset-x-0 bottom-0 z-[40] bg-background shadow tablet:hidden">
          <div className="container flex h-[70px] items-center justify-between px-3">
            <div className="flex">
              <Button
                variant="ghost"
                onClick={toggleLeft}
                type="button"
                size="icon"
                className="p-3"
              >
                <span className="">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="rotate-180"
                  >
                    <path
                      d="M15 3L15 13M15 17L15 21"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M2 11V13C2 16.7712 2 18.6569 3.17157 19.8284C4.34315 21 6.22876 21 10 21H14C17.7712 21 19.6569 21 20.8284 19.8284C22 18.6569 22 16.7712 22 13V11C22 7.22876 22 5.34315 20.8284 4.17157C19.6569 3 17.7712 3 14 3H10C6.22876 3 4.34315 3 3.17157 4.17157C2.51839 4.82475 2.22937 5.69989 2.10149 7"
                      stroke="#1C274C"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </Button>
            </div>
            <div className="flex">
              <Link
                to="/"
                className={`${buttonVariants({ variant: "ghost", size: "icon" })} p-3`}
              >
                <span className="">
                  <svg
                    width="24px"
                    height="24px"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 16.9999H15M3 14.5999V12.1301C3 10.9814 3 10.407 3.14805 9.87807C3.2792 9.40953 3.49473 8.96886 3.78405 8.57768C4.11067 8.13608 4.56404 7.78346 5.47078 7.07822L8.07078 5.056C9.47608 3.96298 10.1787 3.41648 10.9546 3.2064C11.6392 3.02104 12.3608 3.02104 13.0454 3.2064C13.8213 3.41648 14.5239 3.96299 15.9292 5.056L18.5292 7.07822C19.436 7.78346 19.8893 8.13608 20.2159 8.57768C20.5053 8.96886 20.7208 9.40953 20.8519 9.87807C21 10.407 21 10.9814 21 12.1301V14.5999C21 16.8401 21 17.9603 20.564 18.8159C20.1805 19.5685 19.5686 20.1805 18.816 20.564C17.9603 20.9999 16.8402 20.9999 14.6 20.9999H9.4C7.15979 20.9999 6.03969 20.9999 5.18404 20.564C4.43139 20.1805 3.81947 19.5685 3.43597 18.8159C3 17.9603 3 16.8401 3 14.5999Z"
                      stroke="#000000"
                      strokeWidth="1.25"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Link>
            </div>
          </div>
        </div>
        {/* bottom menu */}
      </div>
      {/* {config.footer.pinned === false && <Footer />} */}
    </div>
  );
}
