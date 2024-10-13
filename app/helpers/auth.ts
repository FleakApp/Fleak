import type { SerializeFrom } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useRouteLoaderData } from "@remix-run/react";

import { notFound } from "@fleak-org/remix-utils";

import type { loader as rootLoader } from "@/root";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUser(user: any): user is SerializeFrom<typeof rootLoader>["user"] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
  return user && typeof user === "object" && typeof user.id === "string";
}

export function useOptionalUser() {
  const data = useRouteLoaderData<typeof rootLoader>("root");
  if (!data || !isUser(data.user)) return undefined;
  return data.user;
}

export function useUser() {
  const optionalUser = useOptionalUser();
  if (!optionalUser) throw new Error("No user found in root loader.");

  return optionalUser;
}

export async function requireUser(
  request: Request,
  { redirectTo }: { redirectTo?: string | null } = {},
) {
  // user id from session
  const session = await auth.isAuthenticated(request);

  let user = null;

  try {
    // fetch user from database
    user = session
      ? await prisma.user.findUniqueOrThrow({
          where: { id: session },
          include: {
            // password: false,
            roles: {
              select: {
                name: true,
              },
            },
          },
        })
      : null;
  } catch (e) {
    await auth.logout(request, {
      redirectTo: "/",
      successMessage:
        "Weryfikacja konta nie powiodła się, zostałeś wylogowany!",
    });
  }

  if (!user) {
    if (!redirectTo) {
      return null;
    } else {
      throw redirect(redirectTo);
    }
  }

  return user;
}

export function userHasRole(
  user: Pick<ReturnType<typeof useUser>, "roles"> | null | undefined,
  role: string,
) {
  if (!user) return false;
  return user.roles.some((r) => r.name === role);
}

/**
 * Get user info from request with specific role name
 *
 * @param request Request
 * @param name string
 * @example await requireUserWithRole(request, `admin`);
 */
export async function requireUserWithRole(
  request: Request,
  name: string,
  redirect?: string,
) {
  const user = await requireUser(request, { redirectTo: "/signin" });

  const hasRole = userHasRole(user, name);

  if (!hasRole) {
    throw notFound("Unauthorized");

    throw json(
      {
        error: "Unauthorized",
        requiredRole: name,
        message: `Unauthorized: required role: ${name}`,
      },
      { status: 404 },
    );
  }

  return user;
}
