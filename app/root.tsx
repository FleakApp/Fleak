import { useEffect } from "react";
import type {
  LinksFunction,
  LoaderFunctionArgs,
  SerializeFrom,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import type { ClientLoaderFunctionArgs, MetaFunction } from "@remix-run/react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from "@remix-run/react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { init } from "i18next";
import NProgress from "nprogress";
import { SWRConfig } from "swr";
import { z } from "zod";

import { useIsMounted } from "@fleak-org/hooks/use-is-mounted";
import { ModalProvider, ModalRenderer } from "@fleak-org/react-modals";
import { getClientIPAddress } from "@fleak-org/remix-utils";
import { cn, Toaster, TooltipProvider, useToast } from "@fleak-org/ui";

import { auth } from "@/services/authenticate/auth.server";
import { storage } from "@/services/authenticate/session.server";
import { themeSessionResolver } from "@/services/theme.server";
import { zodI18nMap } from "@/services/zod/zodI18nMap";
import { Adsense } from "./components/adsense";
import { CreateCategory } from "./components/modals/create.category";
import { CreateIssue } from "./components/modals/create.issue";
import { EditCategory } from "./components/modals/edit.category";
import { MakePostModal } from "./components/modals/make.post";
import { SignInModal } from "./components/modals/signin";
import PageLoader from "./components/page-loader";
import { siteConfig } from "./config/site";
import { requireUser } from "./helpers/auth";
import { useGlobalLoadingState } from "./helpers/pending";
import { LayoutProvider } from "./providers/layout";
import { prisma } from "./services/db.server";
import translation from "./services/zod/zod.json";
import tailwind from "./tailwind.css?url";
import {
  PreventFlashOnWrongTheme,
  ThemeProvider,
  useTheme,
} from "remix-themes";

import "dayjs/locale/en";
import "dayjs/locale/pl";

dayjs.locale("pl"); // use locale globally

dayjs.extend(relativeTime);
// lng and resources key depend on your locale.
void init({
  lng: "pl",
  resources: {
    pl: { zod: translation },
  },
});

z.setErrorMap(zodI18nMap);
export { ErrorBoundary } from "@/components/error-bound";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwind },
];

export const meta: MetaFunction = () => {
  return [
    { title: siteConfig.title },
    { name: "description", content: siteConfig.description },
    { name: "keywords", content: siteConfig.keywords },
  ];
};

export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  // call the server loader
  const serverData = await serverLoader();
  // And/or fetch data on the client
  // const data = getDataFromClient();
  // Return the data to expose through useLoaderData()
  return serverData as SerializeFrom<typeof loader>;
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const session = await storage.getSession(request.headers.get("Cookie"));
  const { getTheme } = await themeSessionResolver(request);

  // toast message
  const message = session.get(auth.sessionErrorKey) as {
    title?: string;
    message?: string;
    variant?: "default" | "destructive";
  };

  const user = await requireUser(request);
  const ipAddress = getClientIPAddress(request) ?? "localhost";

  if (user && user.id) {
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        ip: ipAddress,
      },
    });
  }

  const url = new URL(request.url).pathname;

  if (!message) {
    return json({
      theme: getTheme(),
      message: null,
      user,
      url,
    } as const);
  }

  return json(
    {
      theme: getTheme(),
      message,
      user,
      url,
    } as const,
    {
      headers: { "Set-Cookie": await storage.commitSession(session) },
    },
  );
};

export default function AppWithProviders() {
  const data = useLoaderData<typeof loader>();

  return (
    <ThemeProvider
      specifiedTheme={data.theme}
      themeAction="/api/actions/set-theme"
    >
      <SWRConfig
        value={{
          shouldRetryOnError: false,
          revalidateOnFocus: true,
          revalidateIfStale: true,
          revalidateOnMount: true,
          // refreshInterval: 1000,
          fetcher: (resource: string, init: ResponseInit) =>
            fetch(resource, init).then((res) => res.json()),
        }}
      >
        <Component />
      </SWRConfig>
    </ThemeProvider>
  );
}

export function Component() {
  const [theme] = useTheme();

  const { message, theme: dataTheme } = useLoaderData<typeof loader>();
  const { toast } = useToast();

  // const transition = useNavigation();
  const isMounted = useIsMounted();

  const state = useGlobalLoadingState();

  // show toasts
  useEffect(() => {
    if (!message) return;

    toast({
      // title: message.title,
      description: message.message,
      variant: message?.variant ?? "default",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

  useEffect(() => {
    // configure nprogress
    NProgress.configure({
      showSpinner: false,
    });
    // when the state is idle, we can complete the progress bar
    if (state === "idle") NProgress.done();
    // and if it's something else, it means it either submits the form or
    // wait for the next location to load and start
    else NProgress.start();
  }, [state]);
  const location = useLocation();

  // useEffect(() => {
  //   handleAds();
  // }, [location.key]);

  // const handleAds = () => {
  //   // check if script exists yet
  //   if (!document.getElementById("adsbygoogleaftermount")) {
  //     const script = document.createElement("script");
  //     script.id = "adsbygoogleaftermount";
  //     script.type = "text/javascript";
  //     script.async = true;
  //     script.src =
  //       "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5769922620232641";
  //     document.head.appendChild(script);
  //   }

  //   // push ad with every location change
  //   // @ts-ignore
  //   window.adsbygoogle = window.adsbygoogle || [];
  //   // @ts-ignore
  //   window.adsbygoogle.push({});
  // };

  return (
    <html lang="pl" className={cn("text-primary", theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(dataTheme)} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,200..1000;1,200..1000&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="google-adsense-account" content="ca-pub-5769922620232641" />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5769922620232641"
          crossOrigin="anonymous"
        ></script>
      </head>
      <body className="max-w-screen relative m-0 max-h-screen min-h-screen overflow-x-hidden p-0 font-sans antialiased selection:bg-accent selection:text-accent-foreground">
        <div key={location.key}>
          <Adsense client="ca-pub-5769922620232641" slot="7259870550" />
        </div>

        <LayoutProvider>
          <ModalProvider
            modals={[
              ["make.post", MakePostModal],
              ["create.issue", CreateIssue],
              ["create.category", CreateCategory],
              ["edit.category", EditCategory],
            ]}
          >
            {!isMounted ? (
              <PageLoader withLogo elipsis />
            ) : (
              <TooltipProvider>
                <Outlet />
              </TooltipProvider>
            )}
            <Toaster />

            <ModalRenderer Component={EditCategory} />
            <ModalRenderer Component={CreateCategory} />
            <ModalRenderer Component={MakePostModal} />
            <ModalRenderer Component={CreateIssue} />
            <ModalRenderer Component={SignInModal} />
          </ModalProvider>
        </LayoutProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
