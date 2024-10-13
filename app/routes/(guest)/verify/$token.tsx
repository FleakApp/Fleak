import type { LoaderFunctionArgs } from "@remix-run/node";

import { AuthorizationError } from "@fleak-org/remix-auth";

import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";
import { back } from "@/services/helpers.server";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const sessionId = await auth.isAuthenticated(request, {
    // failureRedirect: "/signin",
  });

  const user = await prisma.user.findFirst({
    where: {
      id: params.token,
    },
  });

  if (!user) {
    return back(request, {
      url: "/signin",
      title: "Operacja przerwana!",
      message: "Token jest nieprawidłowy",
    });
  }

  // sprawdź czy aby napewno to ten użytkownik powinien zweryfikować swoje konto
  if (sessionId && user.id !== sessionId) {
    throw new AuthorizationError(
      "Ten użytkownik nie potrzebuje takiej operacji",
    );
  }

  if (user.emailVerified !== null) {
    return back(request, {
      url: "/signin",
      message: "Ten adres e-mail został już zweryfikowany!",
    });
  }

  const updated = await prisma.user.update({
    where: {
      id: params.token,
    },
    data: {
      emailVerified: new Date(),
      emailVerifiedToken: null,
    },
  });

  if (updated) {
    return back(request, {
      url: `/signin?email=${updated.email}`,
      message: "Ten adres e-mail został pomyślnie zweryfikowany!",
    });
  }
  return back(request, {
    url: "/signin",
    message: "Token jest nieprawidłowy",
  });
};
