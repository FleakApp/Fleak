/// <reference types="vite/client" />
/// <reference types="@remix-run/node" />

import type { LucideIcon } from "lucide-react";

import type { Role, User } from "@/services/db.server";

declare global {
  type UserCookieType = User["id"];

  interface PageTab {
    name: string;
    href: string;
    current?: boolean | string;
    count?: string;
    className?: string;
  }

  interface PageHandleArgs {
    aside?: ReactNode;
    // Create a page title
    header?: ReactNode;
    // Create a page description
    description?: ReactNode;
    // Create additional widgets
    widgets?: ReactNode;
    // Create additional tabs to your navigation
    tabs?: PageTab[];
    // Use the header module
    withoutHeader?: boolean;
    // Create breadcrumb
    breadcrumb?: ReactNode[];
  }

  interface SidebarMenuGroup {
    group: string;
    authority?: Role["name"][] | undefined;
    items: SidebarMenuLink<{ submenu?: SidebarMenuLink[] }>[];
  }

  type SidebarMenuLink<T = unknown> = T & {
    authority?: Role["name"][] | undefined;
    href: string;
    icon?: LucideIcon;
    title: string;
    current?: RegExp | string;
    badge?: number;
  };
}
