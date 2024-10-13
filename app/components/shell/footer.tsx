import { Link } from "@remix-run/react";

import { cn } from "@fleak-org/ui";

import { siteConfig } from "@/config/site";
import { themeConfig } from "@/config/theme";

export default function Footer() {
  const config = themeConfig;

  return (
    <footer className="flex flex-col items-center py-6">
      <div
        className={cn(
          "flex w-full flex-col justify-center gap-4 px-3 tablet:justify-between tablet:px-6",
          config.footer.container
            ? "-mx-px tablet:container"
            : "-mx-px max-w-full",
        )}
      >
        <div className="flex flex-col break-all text-center text-xs font-medium text-accent-foreground">
          © {siteConfig.title} 2024
          <span className="text-xs font-medium text-accent-foreground">
            Wszelkie prawa zastrzeżone.
          </span>
        </div>
        {/* hidden */}
        <div className="item-center flex justify-center gap-x-4 font-medium">
          <Link
            to="/terms"
            preventScrollReset={false}
            className="text-xs leading-5 text-zinc-600 transition hover:text-primary dark:text-zinc-400 dark:hover:text-white"
          >
            Regulamin
          </Link>
          <Link
            to="/privacy"
            preventScrollReset={false}
            className="text-xs leading-5 text-zinc-600 transition hover:text-primary dark:text-zinc-400 dark:hover:text-white"
          >
            Polityka prywatności
          </Link>
        </div>
        {/* hidden */}
        <div className="item-center flex justify-center gap-x-4 font-medium">
          <Link
            to="/about"
            preventScrollReset={false}
            className="text-xs leading-5 text-zinc-600 transition hover:text-primary dark:text-zinc-400 dark:hover:text-white"
          >
            O nas
          </Link>
          {/* <span className="border-e border-gray-300 dark:border-gray-700"></span> */}
          <Link
            to="/contact"
            preventScrollReset={false}
            className="text-xs leading-5 text-zinc-600 transition hover:text-primary dark:text-zinc-400 dark:hover:text-white"
          >
            Kontakt z nami
          </Link>
        </div>
      </div>
    </footer>
  );
}
