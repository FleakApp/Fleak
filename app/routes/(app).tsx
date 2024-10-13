/* eslint-disable react-hooks/exhaustive-deps */
import { Suspense, useEffect, useState } from "react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import {
  Await,
  defer,
  Link,
  NavLink,
  Outlet,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import type { ShouldRevalidateFunction } from "@remix-run/react";
import { TrendingUp } from "lucide-react";

import { useIsMounted } from "@fleak-org/hooks/use-is-mounted";
import { useModal } from "@fleak-org/react-modals";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  AvatarImage,
  Button,
  buttonVariants,
  cn,
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  Loader,
  ScrollArea,
  useToast,
} from "@fleak-org/ui";

import Footer from "@/components/shell/footer";
import Topbar from "@/components/shell/topbar";
import { themeConfig } from "@/config/theme";
import { requireUser } from "@/helpers/auth";
import { useLayout } from "@/providers/layout";
import { prisma } from "@/services/db.server";
import { back } from "@/services/helpers.server";

export { ErrorBoundary } from "@/components/error-bound";

export const shouldRevalidate: ShouldRevalidateFunction = ({}) => {
  return true;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const user = await requireUser(request);

  async function load() {
    const categories = prisma.category.findMany({
      where: {
        active: true,
      },
      orderBy: {
        name: "asc",
      },
      include: {
        post: true,
      },
    });

    return categories;
  }

  if (user?.id) {
    const foundUser = await prisma.user.findFirst({
      where: { id: user.id },
      include: { account: true },
    });

    const protected_urls = ["/profile", "/profile/password"];
    const url = new URL(request.url);

    if (!protected_urls.includes(url.pathname)) {
      if (foundUser?.account?.provider === "twitter" && user.email === null) {
        return back(request, {
          url: "/profile/password",
          message: "Prosimy uzupełnić swój adres email",
        });
      }

      if (
        (foundUser?.account?.provider === "twitter" &&
          user.first_name === null) ||
        user.last_name === null
      ) {
        return back(request, {
          url: "/profile",
          message: "Prosimy uzupełnić swój profil",
        });
      }
    }
  }

  return defer({ user, categories: load() });
};

export default function Component() {
  const fetcher = useFetcher<{
    status?: number;
    message?: string;
    error?: string;
  }>();

  const {
    isLeftPanelOpen: isOpenLeft,
    isRightPanelOpen: isOpenRight,
    toggleLeftPanel: toggleLeft,
    toggleRightPanel: toggleRight,
  } = useLayout();
  const { user, categories } = useLoaderData<typeof loader>();

  const [codeReceived, setCodeReceived] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // is before received code?
    if (user?.emailVerifiedToken !== null) {
      setCodeReceived(true);
    }

    if (fetcher.data) {
      toast({ title: String(fetcher.data.message) });
    }
  }, [fetcher.data]);

  const style = {
    navlink: `flex items-center gap-3 rounded-lg p-3 max-h-10 text-primary transition-colors truncate hover:bg-accent hover:text-accent-foreground focus:bg-accent aria-[current=page]:bg-accent aria-[current=page]:font-medium aria-[current=page]:text-accent-foreground`,
  };
  const { open: openMakePostModal } = useModal("make.post");

  const config = themeConfig;
  const isMounted = useIsMounted();

  return (
    <div className={cn("z-10 h-screen w-full overflow-x-hidden")}>
      <div
        className={cn(
          // "tablet:overflow-initial w-full overflow-x-hidden",
          config.body.background,
        )}
      >
        <Topbar isAlwaysSticky={true} />

        <div
          className={cn(
            "z-49 relative flex flex-1 flex-row",
            "mt-[70px] px-0 pb-[65px] dark:divide-gray-500 tablet:mt-0 tablet:pb-0 desktop:divide-x",
            config.main.container ? "container" : "-mx-px max-w-full",
            "desktop:px-6",
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
                      <div className="flex-1 flex-col gap-y-3 space-y-1 py-3">
                        <h4 className="mb-3 ml-3 mr-3 hidden text-xs font-bold text-primary/60 tablet:flex">
                          Popularne
                        </h4>

                        <NavLink
                          to="/"
                          className={cn(
                            style.navlink,
                            "hidden w-full tablet:flex",
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
                                d="M9 16.9999H15M3 14.5999V12.1301C3 10.9814 3 10.407 3.14805 9.87807C3.2792 9.40953 3.49473 8.96886 3.78405 8.57768C4.11067 8.13608 4.56404 7.78346 5.47078 7.07822L8.07078 5.056C9.47608 3.96298 10.1787 3.41648 10.9546 3.2064C11.6392 3.02104 12.3608 3.02104 13.0454 3.2064C13.8213 3.41648 14.5239 3.96299 15.9292 5.056L18.5292 7.07822C19.436 7.78346 19.8893 8.13608 20.2159 8.57768C20.5053 8.96886 20.7208 9.40953 20.8519 9.87807C21 10.407 21 10.9814 21 12.1301V14.5999C21 16.8401 21 17.9603 20.564 18.8159C20.1805 19.5685 19.5686 20.1805 18.816 20.564C17.9603 20.9999 16.8402 20.9999 14.6 20.9999H9.4C7.15979 20.9999 6.03969 20.9999 5.18404 20.564C4.43139 20.1805 3.81947 19.5685 3.43597 18.8159C3 17.9603 3 16.8401 3 14.5999Z"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Strona główna
                          </div>
                        </NavLink>
                        <NavLink
                          to="/hot"
                          className={cn(
                            style.navlink,
                            "hidden w-full tablet:flex",
                          )}
                          prefetch="intent"
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
                                d="M7.37087 7.99982C8.36197 6.47544 9.34354 4.90951 9.95605 3.37694C10.2157 2.72714 11.0161 2.42181 11.5727 2.84585C14.9439 5.41391 20 10.3781 20 15C20 16.1736 19.8008 17.1655 19.4698 17.9998M5.46561 10.9998C4.61333 12.4537 4 13.8131 4 15C4 18.1069 6.24558 20.3088 8.08142 21.3715C8.50204 21.615 8.91147 21.1071 8.69077 20.6741C8.20479 19.7206 7.73333 18.4893 7.73333 17.5C7.73333 16.1286 8.77825 15.0265 9.52461 14.3198C9.71604 14.1386 10.016 14.1414 10.182 14.3462C10.4901 14.7265 10.7982 15.2079 11.1063 15.5975C11.2872 15.8262 11.6241 15.806 11.7828 15.5614C12.7689 14.0418 12.9976 12.1029 13.0507 10.6537C13.0667 10.2163 13.5786 10.0014 13.8721 10.3261C15.1559 11.7465 16.8 14.0494 16.8 16C16.8 17.8159 15.7823 19.7462 14.9019 21.0115C14.6438 21.3823 14.9274 21.8853 15.3588 21.751C15.8734 21.5909 16.4265 21.3507 16.9653 21.0115"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Hot
                          </div>
                        </NavLink>

                        <NavLink
                          to="/trending"
                          className={cn(
                            style.navlink,
                            "hidden w-full tablet:flex",
                          )}
                        >
                          <div className="flex items-center self-center">
                            <TrendingUp size={20} />
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Trendy
                          </div>
                        </NavLink>

                        <NavLink
                          to="/waiting"
                          className={cn(
                            style.navlink,
                            "hidden w-full tablet:flex",
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
                                d="M5.63604 5.63604C4.1637 7.10837 3.24743 9.04567 3.04334 11.1178C2.83925 13.19 3.35997 15.2688 4.51677 17.0001C5.67358 18.7314 7.3949 20.008 9.38744 20.6125C11.38 21.2169 13.5204 21.1117 15.4441 20.3149C17.3678 19.5181 18.9557 18.0789 19.9373 16.2426C20.9188 14.4062 21.2333 12.2864 20.8271 10.2442C20.4209 8.202 19.3191 6.36384 17.7095 5.04291C16.1 3.72197 14.0822 3 12 3"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M12 12L6 6"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M12 3V5"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M21 12L19 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M12 19V21"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                              <path
                                d="M5 12L3 12"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                              />
                            </svg>
                          </div>

                          <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                            Oczekujące
                          </div>
                        </NavLink>

                        <h4 className="mb-3 ml-3 mr-3 py-3 text-xs font-bold text-primary/60 tablet:mt-3">
                          Kategorie
                        </h4>

                        <Suspense
                          fallback={
                            <div className="flex min-h-[80px] items-center justify-center">
                              <Loader variant="primary" elipsis />
                            </div>
                          }
                        >
                          <Await resolve={categories}>
                            {(categories) => (
                              <div className="space-y-1">
                                {categories?.map((category) => (
                                  <>
                                    <NavLink
                                      key={category.id}
                                      to={`/category/${category.slug}`}
                                      className={cn(
                                        "flex w-full max-w-full",
                                        style.navlink,
                                      )}
                                    >
                                      <div className="flex shrink-0 items-center self-center">
                                        <Avatar className="size-6">
                                          <AvatarImage
                                            className="block rounded"
                                            src={String(category.image)}
                                          />
                                          <AvatarFallback className="uppercase">
                                            {category.name.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                      </div>

                                      <div className="w-full truncate text-sm">
                                        {category.name}
                                      </div>

                                      {/* {category.post?.length > 0 && (
                                        <Badge variant="outline">
                                          {category.post?.length}
                                        </Badge>
                                      )} */}
                                    </NavLink>
                                  </>
                                ))}
                              </div>
                            )}
                          </Await>
                        </Suspense>
                      </div>
                      <Footer />
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

              <main className={cn("relative z-[49] w-full flex-1 items-start")}>
                <>
                  {user?.email && user?.emailVerified === null && (
                    <div className="px-6">
                      <AlertDialog defaultOpen>
                        <AlertDialogContent>
                          {codeReceived ||
                          (fetcher.data && fetcher.data.status === 200) ? (
                            <>
                              <AlertDialogHeader>
                                <AlertDialogTitle className="mb-3 text-center">
                                  Potwierdź adres e-mail
                                </AlertDialogTitle>

                                <AlertDialogDescription className="mb-3 text-center">
                                  Wpisz kod przesłany na Twój adres e-mail
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <fetcher.Form
                                method="patch"
                                action="/api/verify/email"
                                className="mx-auto flex max-w-md flex-col items-center"
                              >
                                <InputOTP name="token" maxLength={6}>
                                  <InputOTPGroup>
                                    <InputOTPSlot index={0} />
                                    <InputOTPSlot index={1} />
                                    <InputOTPSlot index={2} />
                                    <InputOTPSlot index={3} />
                                    <InputOTPSlot index={4} />
                                    <InputOTPSlot index={5} />
                                  </InputOTPGroup>
                                </InputOTP>

                                {fetcher.data && fetcher.data.error && (
                                  <p className="mt-3 text-sm text-destructive">
                                    {fetcher.data.error}
                                  </p>
                                )}

                                <AlertDialogFooter className="mt-6 w-full sm:justify-start">
                                  <Button
                                    variant="outline"
                                    className={`w-full gap-x-3 p-3`}
                                  >
                                    Zweryfikuj
                                    {fetcher.formAction ===
                                      "/api/verify/email" &&
                                      fetcher.state === "submitting" && (
                                        <Loader
                                          variant="dark"
                                          className="size-[16px] stroke-primary"
                                        />
                                      )}
                                  </Button>
                                </AlertDialogFooter>
                              </fetcher.Form>
                            </>
                          ) : (
                            <>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Problem z weryfikacją konta
                                </AlertDialogTitle>

                                <AlertDialogDescription>
                                  Wygląda na to, że Twój adres e-mail nie został
                                  zweryfikowany.
                                  <br />
                                  <br />
                                  Aby zapewnić integralność naszej platformy,
                                  musimy oznaczyć Twoje konto jako
                                  niezweryfikowane, co powoduje brak możliwości
                                  korzystania z naszej platformy, dopóki problem
                                  nie zostanie rozwiązany. <br />
                                  <br />
                                  Aby zweryfikować swój adres e-mail, kliknij
                                  poniższy przycisk i postępuj zgodnie z
                                  instrukcjami w wysłanej wiadomości e-mail.
                                </AlertDialogDescription>
                              </AlertDialogHeader>

                              <AlertDialogFooter className="sm:justify-start">
                                <fetcher.Form
                                  method="post"
                                  action="/api/verify/email"
                                >
                                  <Button
                                    variant="outline"
                                    disabled={
                                      typeof fetcher.data !== "undefined"
                                    }
                                    className={`ml-auto gap-x-3 p-3`}
                                  >
                                    {fetcher.data
                                      ? "E-mail weryfikacyjny został wysłany"
                                      : "Wyślij email weryfikacyjny"}
                                    {fetcher.formAction ===
                                      "/api/verify/email" &&
                                      fetcher.state === "submitting" && (
                                        <Loader
                                          variant="dark"
                                          className="size-[16px] stroke-primary"
                                        />
                                      )}
                                  </Button>
                                </fetcher.Form>
                              </AlertDialogFooter>
                            </>
                          )}
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </>

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

              {config.layout.right_sidebar && (
                <div
                  className={cn(
                    "fixed inset-y-0 right-0 z-50 w-72 transition-all tablet:sticky tablet:top-[70px] tablet:w-0",
                    isOpenRight ? "desktop:w-72" : "w-0",
                    "z-50 tablet:z-10",
                    "max-h-screen transition-all tablet:max-h-[calc(100vh-70px)]",
                  )}
                >
                  <aside
                    className={cn(
                      "fixed right-0 flex h-full flex-col bg-background transition-all",
                      "z-50 tablet:z-10",
                      "tablet:sticky tablet:top-[70px] tablet:bg-transparent",

                      "w-72",
                      isOpenRight ? "translate-x-0" : "translate-x-full",
                      "max-h-screen transition-all tablet:max-h-[calc(100vh-70px)]",
                    )}
                  >
                    <ScrollArea className="max-h-screen w-full px-3 tablet:max-h-[calc(100vh-70px)]">
                      <div className="relative flex w-full flex-col space-y-3 py-3">
                        {/* {[...Array<string>(5)].map((e, i) => (
                          <Card
                            key={i}
                            className="flex max-w-64 flex-col items-center justify-center space-y-3 p-3"
                          >
                            <svg
                              width="56"
                              height="56"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M4.17157 4.17157C3 5.34315 3 7.22876 3 11V13C3 13.165 3 13.3264 3.0001 13.4842L4.73385 11.9982L4.76277 11.9734C5.5916 11.2629 6.25232 10.6966 6.81891 10.3285C7.39961 9.95134 7.9626 9.72703 8.58499 9.81521C8.73012 9.83578 8.87315 9.86906 9.01245 9.91469C9.60982 10.1104 10.0159 10.5602 10.3704 11.155C10.7163 11.7354 11.0591 12.5352 11.4891 13.5386L11.4891 13.5386L11.5041 13.5737C11.7182 14.0731 11.8601 14.4016 11.9946 14.6282C12.1241 14.8462 12.2017 14.8901 12.2483 14.9069C12.275 14.9165 12.3023 14.9238 12.3302 14.9288C12.3783 14.9374 12.4678 14.9382 12.6909 14.8125C12.9223 14.682 13.2115 14.4664 13.649 14.1383L13.6693 14.123C14.1297 13.7777 14.5047 13.4964 14.834 13.2972C15.1771 13.0897 15.5065 12.948 15.8827 12.9093C15.9569 12.9016 16.0315 12.8973 16.1061 12.8964C16.4837 12.8915 16.8264 12.9935 17.1898 13.1594C17.5383 13.3185 17.9408 13.5533 18.4347 13.8414L18.4567 13.8542L20.9855 15.3293C21 14.6442 21 13.8726 21 13V11C21 7.22876 21 5.34315 19.8284 4.17157C18.6569 3 16.7712 3 13 3H11C7.22876 3 5.34315 3 4.17157 4.17157ZM20.9413 16.4613L17.9528 14.718C17.4317 14.414 17.0722 14.205 16.7746 14.0692C16.4869 13.9378 16.296 13.894 16.119 13.8963C16.0743 13.8969 16.0295 13.8995 15.985 13.904L15.9338 13.4067L15.985 13.904C15.8094 13.9221 15.6242 13.9879 15.3516 14.1528C15.07 14.3232 14.7346 14.574 14.249 14.9383L14.222 14.9585L14.222 14.9585C13.8188 15.2609 13.4773 15.5171 13.182 15.6835C12.8719 15.8584 12.5345 15.981 12.1547 15.9133C12.0712 15.8984 11.989 15.8764 11.9092 15.8476C11.547 15.7171 11.316 15.444 11.1348 15.1388C10.9625 14.8487 10.7954 14.4586 10.5983 13.9986L10.5983 13.9986L10.585 13.9676C10.1365 12.9212 9.81914 12.1833 9.51142 11.667C9.20829 11.1583 8.96329 10.9509 8.70118 10.865C8.6176 10.8376 8.53178 10.8177 8.4447 10.8053C8.17161 10.7666 7.86019 10.8446 7.36364 11.1672C6.85956 11.4946 6.24899 12.0166 5.38464 12.7574L3.00609 14.7962C3.03516 17.4031 3.20295 18.8598 4.17157 19.8284C5.34315 21 7.22876 21 11 21H13C16.7712 21 18.6569 21 19.8284 19.8284C20.568 19.0888 20.8407 18.0647 20.9413 16.4613Z"
                                fill="currentColor"
                                fillOpacity="0.25"
                                stroke="currentColor"
                              />
                              <circle
                                cx="16"
                                cy="8"
                                r="2"
                                fill="currentColor"
                                stroke="currentColor"
                              />
                            </svg>

                            <span>advertise</span>
                          </Card>
                        ))} */}
                      </div>
                    </ScrollArea>
                  </aside>
                  <button
                    className={`fixed bottom-0 left-0 right-0 top-0 z-[49] order-first bg-black/50 transition-colors desktop:hidden ${
                      isOpenRight ? "block" : "hidden"
                    }`}
                    onClick={() => toggleRight()}
                  ></button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="fixed bottom-[77px] right-3 z-[50] flex tablet:hidden">
          <Button
            variant="ghost"
            onClick={openMakePostModal}
            type="button"
            size="icon"
            className="size-14 rounded-full bg-fleak-500 p-2 text-white hover:bg-fleak-600 hover:text-white focus:bg-fleak-600"
          >
            <span className="">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <mask
                  id="path-12-outside-1_2165_508"
                  maskUnits="userSpaceOnUse"
                  x="3"
                  y="4"
                  width="17"
                  height="17"
                  fill="black"
                >
                  <rect fill="white" x="3" y="4" width="17" height="17" />
                  <path d="M13.5858 7.41421L6.39171 14.6083C6.19706 14.8029 6.09974 14.9003 6.03276 15.0186C5.96579 15.1368 5.93241 15.2704 5.86564 15.5374L5.20211 18.1915C5.11186 18.5526 5.06673 18.7331 5.16682 18.8332C5.2669 18.9333 5.44742 18.8881 5.80844 18.7979L5.80845 18.7979L8.46257 18.1344C8.72963 18.0676 8.86316 18.0342 8.98145 17.9672C9.09974 17.9003 9.19706 17.8029 9.39171 17.6083L16.5858 10.4142L16.5858 10.4142C17.2525 9.74755 17.5858 9.41421 17.5858 9C17.5858 8.58579 17.2525 8.25245 16.5858 7.58579L16.4142 7.41421C15.7475 6.74755 15.4142 6.41421 15 6.41421C14.5858 6.41421 14.2525 6.74755 13.5858 7.41421Z" />
                </mask>
                <path
                  d="M6.39171 14.6083L7.80593 16.0225L7.80593 16.0225L6.39171 14.6083ZM13.5858 7.41421L12.1716 6L12.1716 6L13.5858 7.41421ZM16.4142 7.41421L15 8.82843L15 8.82843L16.4142 7.41421ZM16.5858 7.58579L18 6.17157L18 6.17157L16.5858 7.58579ZM16.5858 10.4142L18 11.8284L16.5858 10.4142ZM9.39171 17.6083L7.9775 16.1941L7.9775 16.1941L9.39171 17.6083ZM5.86564 15.5374L7.80593 16.0225L7.80593 16.0225L5.86564 15.5374ZM5.20211 18.1915L3.26183 17.7065H3.26183L5.20211 18.1915ZM5.80845 18.7979L5.32338 16.8576L5.23624 16.8794L5.15141 16.9089L5.80845 18.7979ZM8.46257 18.1344L7.97751 16.1941L7.9775 16.1941L8.46257 18.1344ZM5.16682 18.8332L6.58103 17.419L6.58103 17.419L5.16682 18.8332ZM5.80844 18.7979L6.29351 20.7382L6.38065 20.7164L6.46549 20.6869L5.80844 18.7979ZM8.98145 17.9672L7.99605 16.2268L7.99605 16.2268L8.98145 17.9672ZM16.5858 10.4142L18 11.8284L18 11.8284L16.5858 10.4142ZM6.03276 15.0186L4.29236 14.0332L4.29236 14.0332L6.03276 15.0186ZM7.80593 16.0225L15 8.82843L12.1716 6L4.9775 13.1941L7.80593 16.0225ZM15 8.82843L15.1716 9L18 6.17157L17.8284 6L15 8.82843ZM15.1716 9L7.9775 16.1941L10.8059 19.0225L18 11.8284L15.1716 9ZM3.92536 15.0524L3.26183 17.7065L7.1424 18.6766L7.80593 16.0225L3.92536 15.0524ZM6.29352 20.7382L8.94764 20.0746L7.9775 16.1941L5.32338 16.8576L6.29352 20.7382ZM3.26183 17.7065C3.233 17.8218 3.15055 18.1296 3.12259 18.4155C3.0922 18.7261 3.06509 19.5599 3.7526 20.2474L6.58103 17.419C6.84671 17.6847 6.99914 18.0005 7.06644 18.2928C7.12513 18.5478 7.10965 18.7429 7.10358 18.8049C7.09699 18.8724 7.08792 18.904 7.097 18.8631C7.10537 18.8253 7.11788 18.7747 7.1424 18.6766L3.26183 17.7065ZM5.15141 16.9089L5.1514 16.9089L6.46549 20.6869L6.46549 20.6869L5.15141 16.9089ZM5.32338 16.8576C5.22531 16.8821 5.17467 16.8946 5.13694 16.903C5.09595 16.9121 5.12762 16.903 5.19506 16.8964C5.25712 16.8903 5.45223 16.8749 5.70717 16.9336C5.99955 17.0009 6.31535 17.1533 6.58103 17.419L3.7526 20.2474C4.44011 20.9349 5.27387 20.9078 5.58449 20.8774C5.87039 20.8494 6.17822 20.767 6.29351 20.7382L5.32338 16.8576ZM7.9775 16.1941C7.95279 16.2188 7.9317 16.2399 7.91214 16.2593C7.89271 16.2787 7.87671 16.2945 7.86293 16.308C7.84916 16.3215 7.83911 16.3312 7.83172 16.3382C7.82812 16.3416 7.82545 16.3441 7.8236 16.3458C7.82176 16.3475 7.8209 16.3483 7.82092 16.3482C7.82094 16.3482 7.82198 16.3473 7.82395 16.3456C7.82592 16.3439 7.82893 16.3413 7.83291 16.338C7.84086 16.3314 7.85292 16.3216 7.86866 16.3098C7.88455 16.2979 7.90362 16.2843 7.92564 16.2699C7.94776 16.2553 7.97131 16.2408 7.99605 16.2268L9.96684 19.7076C10.376 19.476 10.6864 19.1421 10.8059 19.0225L7.9775 16.1941ZM8.94764 20.0746C9.11169 20.0336 9.55771 19.9393 9.96685 19.7076L7.99605 16.2268C8.02079 16.2128 8.0453 16.2001 8.06917 16.1886C8.09292 16.1772 8.11438 16.1678 8.13277 16.1603C8.15098 16.1529 8.16553 16.1475 8.17529 16.1441C8.18017 16.1424 8.18394 16.1412 8.18642 16.1404C8.1889 16.1395 8.19024 16.1391 8.19026 16.1391C8.19028 16.1391 8.18918 16.1395 8.18677 16.1402C8.18435 16.1409 8.18084 16.1419 8.17606 16.1432C8.16625 16.1459 8.15278 16.1496 8.13414 16.1544C8.11548 16.1593 8.09368 16.1649 8.0671 16.1716C8.04034 16.1784 8.0114 16.1856 7.97751 16.1941L8.94764 20.0746ZM15.1716 9C15.3435 9.17192 15.4698 9.29842 15.5738 9.40785C15.6786 9.518 15.7263 9.57518 15.7457 9.60073C15.7644 9.62524 15.7226 9.57638 15.6774 9.46782C15.6254 9.34332 15.5858 9.18102 15.5858 9H19.5858C19.5858 8.17978 19.2282 7.57075 18.9258 7.1744C18.6586 6.82421 18.2934 6.46493 18 6.17157L15.1716 9ZM18 11.8284L18 11.8284L15.1716 8.99999L15.1716 9L18 11.8284ZM18 11.8284C18.2934 11.5351 18.6586 11.1758 18.9258 10.8256C19.2282 10.4292 19.5858 9.82022 19.5858 9H15.5858C15.5858 8.81898 15.6254 8.65668 15.6774 8.53218C15.7226 8.42362 15.7644 8.37476 15.7457 8.39927C15.7263 8.42482 15.6786 8.482 15.5738 8.59215C15.4698 8.70157 15.3435 8.82807 15.1716 9L18 11.8284ZM15 8.82843C15.1719 8.6565 15.2984 8.53019 15.4078 8.42615C15.518 8.32142 15.5752 8.27375 15.6007 8.25426C15.6252 8.23555 15.5764 8.27736 15.4678 8.32264C15.3433 8.37455 15.181 8.41421 15 8.41421V4.41421C14.1798 4.41421 13.5707 4.77177 13.1744 5.07417C12.8242 5.34136 12.4649 5.70664 12.1716 6L15 8.82843ZM17.8284 6C17.5351 5.70665 17.1758 5.34136 16.8256 5.07417C16.4293 4.77177 15.8202 4.41421 15 4.41421V8.41421C14.819 8.41421 14.6567 8.37455 14.5322 8.32264C14.4236 8.27736 14.3748 8.23555 14.3993 8.25426C14.4248 8.27375 14.482 8.32142 14.5922 8.42615C14.7016 8.53019 14.8281 8.6565 15 8.82843L17.8284 6ZM4.9775 13.1941C4.85793 13.3136 4.52401 13.624 4.29236 14.0332L7.77316 16.0039C7.75915 16.0287 7.7447 16.0522 7.73014 16.0744C7.71565 16.0964 7.70207 16.1155 7.69016 16.1313C7.67837 16.1471 7.66863 16.1591 7.66202 16.1671C7.65871 16.1711 7.65613 16.1741 7.65442 16.1761C7.65271 16.178 7.65178 16.1791 7.65176 16.1791C7.65174 16.1791 7.65252 16.1782 7.65422 16.1764C7.65593 16.1745 7.65842 16.1719 7.66184 16.1683C7.66884 16.1609 7.67852 16.1508 7.692 16.1371C7.7055 16.1233 7.72132 16.1073 7.74066 16.0879C7.76013 16.0683 7.78122 16.0472 7.80593 16.0225L4.9775 13.1941ZM7.80593 16.0225C7.8144 15.9886 7.82164 15.9597 7.82839 15.9329C7.8351 15.9063 7.84068 15.8845 7.84556 15.8659C7.85043 15.8472 7.85407 15.8337 7.8568 15.8239C7.85813 15.8192 7.85914 15.8157 7.85984 15.8132C7.86054 15.8108 7.86088 15.8097 7.86088 15.8097C7.86087 15.8098 7.86046 15.8111 7.85965 15.8136C7.85884 15.8161 7.85758 15.8198 7.85588 15.8247C7.85246 15.8345 7.84713 15.849 7.8397 15.8672C7.8322 15.8856 7.82284 15.9071 7.81141 15.9308C7.79993 15.9547 7.78717 15.9792 7.77316 16.0039L4.29236 14.0332C4.06071 14.4423 3.96637 14.8883 3.92536 15.0524L7.80593 16.0225Z"
                  fill="white"
                  mask="url(#path-12-outside-1_2165_508)"
                />
                <path
                  d="M12.5 7.5L15.5 5.5L18.5 8.5L16.5 11.5L12.5 7.5Z"
                  fill="white"
                />
              </svg>
            </span>
          </Button>
        </div>

        {/* bottom menu */}
        <div className="max-w-screen fixed inset-x-0 bottom-0 z-[49] rounded-t-xl bg-background shadow backdrop-blur dark:border-t tablet:hidden">
          <div className="flex items-center justify-between gap-3 p-3">
            <div className="flex size-10">
              <Button
                variant="ghost"
                onClick={toggleLeft}
                type="button"
                size="icon"
                className="p-3"
              >
                <span className="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20 20L18.2678 18.2678M18.2678 18.2678C18.7202 17.8154 19 17.1904 19 16.5C19 15.1193 17.8807 14 16.5 14C15.1193 14 14 15.1193 14 16.5C14 17.8807 15.1193 19 16.5 19C17.1904 19 17.8154 18.7202 18.2678 18.2678ZM15.6 10H18.4C18.9601 10 19.2401 10 19.454 9.89101C19.6422 9.79513 19.7951 9.64215 19.891 9.45399C20 9.24008 20 8.96005 20 8.4V5.6C20 5.03995 20 4.75992 19.891 4.54601C19.7951 4.35785 19.6422 4.20487 19.454 4.10899C19.2401 4 18.9601 4 18.4 4H15.6C15.0399 4 14.7599 4 14.546 4.10899C14.3578 4.20487 14.2049 4.35785 14.109 4.54601C14 4.75992 14 5.03995 14 5.6V8.4C14 8.96005 14 9.24008 14.109 9.45399C14.2049 9.64215 14.3578 9.79513 14.546 9.89101C14.7599 10 15.0399 10 15.6 10ZM5.6 10H8.4C8.96005 10 9.24008 10 9.45399 9.89101C9.64215 9.79513 9.79513 9.64215 9.89101 9.45399C10 9.24008 10 8.96005 10 8.4V5.6C10 5.03995 10 4.75992 9.89101 4.54601C9.79513 4.35785 9.64215 4.20487 9.45399 4.10899C9.24008 4 8.96005 4 8.4 4H5.6C5.03995 4 4.75992 4 4.54601 4.10899C4.35785 4.20487 4.20487 4.35785 4.10899 4.54601C4 4.75992 4 5.03995 4 5.6V8.4C4 8.96005 4 9.24008 4.10899 9.45399C4.20487 9.64215 4.35785 9.79513 4.54601 9.89101C4.75992 10 5.03995 10 5.6 10ZM5.6 20H8.4C8.96005 20 9.24008 20 9.45399 19.891C9.64215 19.7951 9.79513 19.6422 9.89101 19.454C10 19.2401 10 18.9601 10 18.4V15.6C10 15.0399 10 14.7599 9.89101 14.546C9.79513 14.3578 9.64215 14.2049 9.45399 14.109C9.24008 14 8.96005 14 8.4 14H5.6C5.03995 14 4.75992 14 4.54601 14.109C4.35785 14.2049 4.20487 14.3578 4.10899 14.546C4 14.7599 4 15.0399 4 15.6V18.4C4 18.9601 4 19.2401 4.10899 19.454C4.20487 19.6422 4.35785 19.7951 4.54601 19.891C4.75992 20 5.03995 20 5.6 20Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </Button>
            </div>
            <div className="flex-1">
              <Link
                to="/"
                className={`${buttonVariants({
                  variant: "ghost",
                  size: location.pathname === "/" ? "default" : "icon",
                })} ${location.pathname === "/" && "bg-accent"} w-full gap-x-3 p-3`}
              >
                <span className="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M9 16.9999H15M3 14.5999V12.1301C3 10.9814 3 10.407 3.14805 9.87807C3.2792 9.40953 3.49473 8.96886 3.78405 8.57768C4.11067 8.13608 4.56404 7.78346 5.47078 7.07822L8.07078 5.056C9.47608 3.96298 10.1787 3.41648 10.9546 3.2064C11.6392 3.02104 12.3608 3.02104 13.0454 3.2064C13.8213 3.41648 14.5239 3.96299 15.9292 5.056L18.5292 7.07822C19.436 7.78346 19.8893 8.13608 20.2159 8.57768C20.5053 8.96886 20.7208 9.40953 20.8519 9.87807C21 10.407 21 10.9814 21 12.1301V14.5999C21 16.8401 21 17.9603 20.564 18.8159C20.1805 19.5685 19.5686 20.1805 18.816 20.564C17.9603 20.9999 16.8402 20.9999 14.6 20.9999H9.4C7.15979 20.9999 6.03969 20.9999 5.18404 20.564C4.43139 20.1805 3.81947 19.5685 3.43597 18.8159C3 17.9603 3 16.8401 3 14.5999Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>

                {location.pathname === "/" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                    Strona Główna
                  </div>
                )}
              </Link>
            </div>
            <div className="flex-1">
              <Link
                to="/hot"
                className={`${buttonVariants({
                  variant: "ghost",
                  size: location.pathname === "/hot" ? "default" : "icon",
                })} ${location.pathname === "/hot" && "bg-accent"} w-full gap-x-3 p-3`}
              >
                <span className="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.37087 7.99982C8.36197 6.47544 9.34354 4.90951 9.95605 3.37694C10.2157 2.72714 11.0161 2.42181 11.5727 2.84585C14.9439 5.41391 20 10.3781 20 15C20 16.1736 19.8008 17.1655 19.4698 17.9998M5.46561 10.9998C4.61333 12.4537 4 13.8131 4 15C4 18.1069 6.24558 20.3088 8.08142 21.3715C8.50204 21.615 8.91147 21.1071 8.69077 20.6741C8.20479 19.7206 7.73333 18.4893 7.73333 17.5C7.73333 16.1286 8.77825 15.0265 9.52461 14.3198C9.71604 14.1386 10.016 14.1414 10.182 14.3462C10.4901 14.7265 10.7982 15.2079 11.1063 15.5975C11.2872 15.8262 11.6241 15.806 11.7828 15.5614C12.7689 14.0418 12.9976 12.1029 13.0507 10.6537C13.0667 10.2163 13.5786 10.0014 13.8721 10.3261C15.1559 11.7465 16.8 14.0494 16.8 16C16.8 17.8159 15.7823 19.7462 14.9019 21.0115C14.6438 21.3823 14.9274 21.8853 15.3588 21.751C15.8734 21.5909 16.4265 21.3507 16.9653 21.0115"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                {location.pathname === "/hot" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                    Hot
                  </div>
                )}
              </Link>
            </div>
            <div className="flex-1">
              <Link
                to="/trending"
                className={`${buttonVariants({ variant: "ghost", size: location.pathname === "/trending" ? "default" : "icon" })} ${location.pathname === "/trending" && "bg-accent"} w-full gap-x-3 p-3`}
              >
                <span className="">
                  <TrendingUp size={20} />
                </span>

                {location.pathname === "/trending" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                    Trendy
                  </div>
                )}
              </Link>
            </div>
            <div className="flex-1">
              <Link
                to="/waiting"
                className={`${buttonVariants({ variant: "ghost", size: location.pathname === "/waiting" ? "default" : "icon" })} ${location.pathname === "/waiting" && "bg-accent"} w-full gap-x-3 p-3`}
              >
                <span className="">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5.63604 5.63604C4.1637 7.10837 3.24743 9.04567 3.04334 11.1178C2.83925 13.19 3.35997 15.2688 4.51677 17.0001C5.67358 18.7314 7.3949 20.008 9.38744 20.6125C11.38 21.2169 13.5204 21.1117 15.4441 20.3149C17.3678 19.5181 18.9557 18.0789 19.9373 16.2426C20.9188 14.4062 21.2333 12.2864 20.8271 10.2442C20.4209 8.202 19.3191 6.36384 17.7095 5.04291C16.1 3.72197 14.0822 3 12 3"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 12L6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 3V5"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M21 12L19 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M12 19V21"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M5 12L3 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>

                {location.pathname === "/waiting" && (
                  <div className="flex w-full flex-1 flex-col items-start justify-center gap-0 overflow-hidden truncate text-sm">
                    Oczekujące
                  </div>
                )}
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
