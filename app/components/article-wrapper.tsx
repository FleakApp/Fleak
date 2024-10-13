"use client";

import * as React from "react";

import {
  Button,
  cn,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@fleak-org/ui";

interface ArticleWrapperProps extends React.HTMLAttributes<HTMLDivElement> {
  expandButtonTitle?: string;
  defaultCollapsed: boolean;
}

export function ArticleWrapper({
  expandButtonTitle = "Pokaż zawartość",
  className,
  children,
  defaultCollapsed = false,
  ...props
}: ArticleWrapperProps) {
  const [isOpened, setIsOpened] = React.useState(defaultCollapsed);

  return (
    <Collapsible open={isOpened} onOpenChange={setIsOpened}>
      <div className={cn("relative overflow-hidden", className)} {...props}>
        <CollapsibleContent
          forceMount
          className={cn("overflow-hidden", !isOpened && "max-h-[450px]")}
        >
          <div
          // className={cn(
          //   "[&_pre]:my-0 [&_pre]:max-h-[650px] [&_pre]:pb-[100px]",
          //   !isOpened ? "[&_pre]:overflow-hidden" : "[&_pre]:overflow-auto]",
          // )}
          >
            {children}
          </div>
        </CollapsibleContent>
        {!isOpened && (
          <div className="absolute inset-x-0 bottom-0 flex h-12 items-end justify-center bg-gradient-to-t from-background/90 to-background/0 p-2">
            <CollapsibleTrigger asChild>
              <Button
                variant="secondary" //className="h-8 text-xs"
              >
                {isOpened ? "Zwiń zawartość" : expandButtonTitle}
              </Button>
            </CollapsibleTrigger>
          </div>
        )}
      </div>
    </Collapsible>
  );
}
