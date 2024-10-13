import React, { useEffect, useId, useState } from "react";
import { Slot } from "@radix-ui/react-slot";

import { useIsMounted } from "@fleak-org/hooks/use-is-mounted";
import { useWindowScroll } from "@fleak-org/hooks/use-window-scroll";
import { cn } from "@fleak-org/ui";

export interface StickyHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  isAlwaysSticky?: boolean;
  asChild?: boolean;
  backdrop?: boolean;
  offset?: number;
  withScrollableId?: string;
  baseClassName?: string;
}

const isBrowser = typeof window !== "undefined";

export const getScrollPosition = (props: {
  element: HTMLDivElement;
  useWindow?: boolean;
}) => {
  const { element, useWindow = false } = props;

  if (!isBrowser) return { x: 0, y: 0 };

  if (useWindow) {
    return { x: window.scrollX, y: window.scrollY };
  }

  const target = element ? element : document.body;

  const position = target.getBoundingClientRect();

  return { x: position.left, y: position.top };
};

export const StickyHeader = React.forwardRef<HTMLDivElement, StickyHeaderProps>(
  (
    {
      className,
      baseClassName,
      isAlwaysSticky = false,
      withScrollableId,
      offset = 5,
      backdrop = false,
      asChild = false,
      ...props
    },
    ref,
  ) => {
    const [position, setSticky] = useState(0);
    const id = useId();
    const isMounted = useIsMounted();
    const [windowScroll] = useWindowScroll();

    const pos = getScrollPosition({
      element: document.getElementById(id) as HTMLDivElement,
      useWindow: false,
    });

    const Comp = asChild ? Slot : "div";

    useEffect(() => {
      document
        .getElementById(withScrollableId ?? id)
        ?.addEventListener("scroll", (e) => {
          setSticky(
            document.getElementById(withScrollableId ?? id)?.scrollTop ?? 0,
          );
        });

      // console.log(position);

      return () =>
        document
          .getElementById(withScrollableId ?? id)
          ?.removeEventListener("scroll", (e) => {
            setSticky(0);
          });
    }, []);

    return (
      <Comp
        id={id}
        ref={ref}
        className={cn(
          baseClassName ?? "sticky top-0 z-50 flex flex-1 bg-transparent",

          !withScrollableId
            ? (isMounted && isAlwaysSticky) ||
              // windowScroll?.y > 0 && pos.y <= offset
              (windowScroll?.y > 0 && pos.y <= offset)
              ? backdrop
                ? className
                  ? className
                  : "bg-background/50 shadow-sm backdrop-blur"
                : className
                  ? className
                  : "bg-background shadow-sm"
              : ""
            : (isMounted && isAlwaysSticky) || position > offset
              ? backdrop
                ? className
                  ? className
                  : "bg-background/50 shadow-sm backdrop-blur"
                : className
                  ? className
                  : "bg-background shadow-sm"
              : "",
        )}
        {...props}
      />
    );
  },
);

StickyHeader.displayName = "StickyHeader";
