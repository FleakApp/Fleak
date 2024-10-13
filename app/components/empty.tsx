import type React from "react";
import type { LucideProps } from "lucide-react";
import { Info } from "lucide-react";

import { cn } from "@fleak-org/ui";

interface EmptyProps {
  title?: string;
  className?: string;
  withoutBorder?: boolean;
  // icon?: React.ComponentType<LucideProps>;
  icon?: React.ComponentType<LucideProps>;
  iconSize?: LucideProps["size"];
}

export default function Empty({
  icon,
  className,
  iconSize = 32,
  withoutBorder,
  title = "Create a new resource",
}: EmptyProps) {
  const Icon = icon ?? Info;

  return (
    <div
      className={cn(
        "relative block size-full cursor-pointer p-12 text-center transition-all duration-150 focus:outline-none focus:ring-0",
        !withoutBorder &&
          "rounded-lg border-2 border-dashed border-muted-foreground hover:translate-y-0.5 hover:border-muted-foreground/75",
        className,
        "flex flex-col items-center justify-center",
      )}
    >
      <Icon size={iconSize} className="mx-auto stroke-1 text-primary" />

      <span className="font-inherit mt-2 block text-sm text-primary">
        {title}
      </span>
    </div>
  );
}
