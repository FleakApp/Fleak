import { useLocation } from "@remix-run/react";
import dayjs from "dayjs";

// export { slugify } from "@fleak-org/remix-utils";

/**
 * @example subtractMinutes(new Date(), 5)
 * @param date Date
 * @param minutes number
 * @returns Date
 */
export const subtractMinutes = (date: Date, minutes: number) => {
  date.setMinutes(date.getMinutes() - minutes);
  return date;
};

/**
 * @example subtractHours(new Date(), 6)
 * @param date Date
 * @param hours number
 * @returns Date
 */
export const subtractHours = (date: Date, hours: number) => {
  date.setHours(date.getHours() - hours);
  return date;
};

export function uuid() {
  return crypto.getRandomValues(new Uint32Array(1))[0].toString();
}
/**
 * @sample isActiveRoute('/admin/users*') || isActiveRoute('/admin/users', true)
 * @param pattern string
 * @param absolute boolean Absolutne dopasowanie
 * @returns boolean
 */
export const isActiveRoute = (pattern: string | RegExp, absolute = false) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { pathname } = useLocation();
  // const resolved = useResolvedPath(pattern as string);

  if (typeof pattern === "string" && absolute) {
    return pathname === pattern;
  }

  return new RegExp(pattern).test(pathname);
};

export function formattedDate(date: Date | string) {
  // dayjs().locale('pl').format();
  return dayjs(date).format("YYYY-MM-DD HH:mm:ss");
}

/**
 * Build clean slug
 *
 * @param str string
 * @returns string
 */
export const slugify = (str: string) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Remove special characters and letters
 *
 * @param str string
 * @returns string
 */
export const accentsTidy = function (str: string, cleanSpecial = true) {
  let r = str; //.toLowerCase();
  r = r.replace(/\s/g, "");
  r = r.replace(/[àáâãäåą]/g, "a");
  r = r.replace(/æ/g, "ae");
  r = r.replace(/çć/g, "c");
  r = r.replace(/ł/g, "l");
  r = r.replace(/[èéêëę]/g, "e");
  r = r.replace(/[ìíîï]/g, "i");
  r = r.replace(/[ñń]/g, "n");
  r = r.replace(/[òóôõö]/g, "o");
  r = r.replace(/œ/g, "oe");
  r = r.replace(/[ùúûü]/g, "u");
  r = r.replace(/[ýÿ]/g, "y");
  r = r.replace(/[żź]/g, "z");
  r = r.replace(/\W/g, "");

  if (cleanSpecial) {
    // remove special characters
    r = r.replace(/[&/\\#,@+()$~%.'":*?<>{}]/g, "");
  }
  return r;
};
