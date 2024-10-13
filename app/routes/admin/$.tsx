import type { MetaFunction } from "@remix-run/node";

import { Wrapper } from "@/components/error-bound";
import { siteConfig } from "@/config/site";

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.title} - Nie znaleziono takiej strony!` }];
};

export default function Component() {
  return (
    <div className="flex size-full h-full flex-1 items-center justify-center">
      <Wrapper icon={false} statusText="Nie znaleziono takiej strony" />
    </div>
  );
}
