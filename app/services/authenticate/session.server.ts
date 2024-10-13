import * as process from "node:process";
import { createCookieSessionStorage } from "@remix-run/node";

// You can default to 'development' if process.env.NODE_ENV is not set
const isProduction = process.env.NODE_ENV === "production";

export const storage = createCookieSessionStorage({
  cookie: {
    name: "fleak",
    httpOnly: true,
    path: "/",
    maxAge: 86_400 * 30,
    sameSite: "lax",
    secrets: [process.env.SESSION_SECRET!],
    // Set domain and secure only if in production
    ...(isProduction ? { secure: true } : {}),
  },
});

// // you can also export the methods individually for your own usage
export const { getSession, commitSession, destroySession } = storage;
