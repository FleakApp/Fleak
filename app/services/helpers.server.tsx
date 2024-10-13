import type { TypedResponse } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";
import {
  commitSession,
  getSession,
} from "@/services/authenticate/session.server";

interface Toast {
  title?: string;
  message?: string;
}

/**
 * @example back(request, { ?url, ?title, ?message })
 */
async function back(
  request: Request,
  options?: { url?: string | null; title?: string; message?: string | Toast },
): Promise<TypedResponse<never>> {
  const session = await getSession(request.headers.get("Cookie"));

  let url = String(options?.url);

  if (!options?.url) {
    url = new URL(request.url).pathname;
  }

  if (typeof options?.message === "string") {
    session.flash(auth.sessionErrorKey, {
      title: options.title,
      message: options.message,
    });
  } else {
    session.flash(auth.sessionErrorKey, options?.message);
  }

  return redirect(url, {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
}

export { back };
