import { Outlet } from "@remix-run/react";

import Topbar from "@/components/shell/topbar";

export { ErrorBoundary } from "@/components/error-bound";

export default function Component() {
  return (
    <div className="z-10 h-screen w-full">
      <div className="z-[30] flex min-h-screen w-full flex-row bg-neutral-50 dark:bg-background">
        <div className="flex-1 flex-col">
          <Topbar isAlwaysSticky={true} />
          <main className="relative mt-[70px] flex-1 items-start py-8 tablet:mt-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
