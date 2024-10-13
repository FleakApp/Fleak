/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
// Tremor Raw TabNavigation [v0.0.1]

import React from "react";
import * as NavigationMenuPrimitives from "@radix-ui/react-navigation-menu";

import { cn as cx } from "@fleak-org/ui";

export const focusRing = [
  // base
  "outline outline-offset-2 outline-0 focus-visible:outline-2",
  // outline color
  "outline-blue-500 dark:outline-blue-500",
];

function getSubtree(
  options: { asChild: boolean | undefined; children: React.ReactNode },
  content: React.ReactNode | ((children: React.ReactNode) => React.ReactNode),
) {
  const { asChild, children } = options;
  if (!asChild)
    return typeof content === "function" ? content(children) : content;

  const firstChild = React.Children.only(children) as React.ReactElement;
  return React.cloneElement(firstChild, {
    children:
      typeof content === "function"
        ? content(firstChild.props.children)
        : content,
  });
}

const TabNavigation = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Root>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Root>,
    "orientation" | "defaultValue" | "dir"
  >
>(({ className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Root ref={forwardedRef} {...props} asChild={false}>
    <NavigationMenuPrimitives.List
      className={cx(
        // base
        "flex items-center justify-start overflow-x-auto overflow-y-clip whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // border color
        // "border-b border-gray-300 dark:border-gray-500",
        "pb-[1px]",
        className,
      )}
    >
      {children}
    </NavigationMenuPrimitives.List>
  </NavigationMenuPrimitives.Root>
));

TabNavigation.displayName = "TabNavigation";

const TabNavigationLink = React.forwardRef<
  React.ElementRef<typeof NavigationMenuPrimitives.Link>,
  Omit<
    React.ComponentPropsWithoutRef<typeof NavigationMenuPrimitives.Link>,
    "onSelect"
  > & { disabled?: boolean }
>(({ asChild, disabled, className, children, ...props }, forwardedRef) => (
  <NavigationMenuPrimitives.Item className="flex-1" aria-disabled={disabled}>
    <NavigationMenuPrimitives.Link
      aria-disabled={disabled}
      className={cx(
        "group relative flex shrink-0 select-none items-center justify-center",
        disabled ? "pointer-events-none" : "",
      )}
      ref={forwardedRef}
      onSelect={() => {}}
      asChild={asChild}
      {...props}
    >
      {getSubtree({ asChild, children }, (children) => (
        <span
          className={cx(
            // base
            "-mb-px flex h-full items-center justify-center whitespace-nowrap border-b-2 border-transparent px-3 py-3 text-sm font-medium transition-all",
            // text color
            "text-primary",
            // hover
            "group-hover:text-gray-700 group-hover:dark:text-gray-400",
            // border hover
            "group-hover:border-gray-300 group-hover:dark:border-gray-400",
            // selected
            "group-data-[active]:border-gray-900 group-data-[active]:text-gray-900",
            "group-data-[active]:dark:border-gray-50 group-data-[active]:dark:text-gray-50",
            // selected
            "group-data-[state=active]:border-gray-900 group-data-[state=active]:text-gray-900",
            "group-data-[state=active]:dark:border-gray-50 group-data-[state=active]:dark:text-gray-50",
            // disabled
            disabled
              ? "pointer-events-none text-gray-300 dark:text-gray-700"
              : "",
            focusRing,
            className,
          )}
        >
          {children}
        </span>
      ))}
    </NavigationMenuPrimitives.Link>
  </NavigationMenuPrimitives.Item>
));

TabNavigationLink.displayName = "TabNavigationLink";

export { TabNavigation, TabNavigationLink };
