import { createCookieSessionStorage } from "@remix-run/node";

import { createThemeSessionResolver } from "remix-themes";

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === "production";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "theme",
    httpOnly: true,
    path: "/",
    maxAge: 86_400 * 30,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    // Set domain and secure only if in production
    ...(isProduction ? { secure: true } : {}),
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
