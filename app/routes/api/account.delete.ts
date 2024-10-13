import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { requireUser } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import { storage } from "@/services/authenticate/session.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const session = await storage.getSession(request.headers.get("Cookie"));

  const user = (await requireUser(request)) as Omit<User, "password">;

  const u = await prisma.user.findFirst({
    where: {
      id: user.id,
    },
  });

  if (!u) {
    return json(
      {
        status: 200,
        message: "Taki użytkownik nie istnieje!",
      },
      {
        status: 200,
      },
    );
  }

  await prisma.user.delete({
    where: {
      id: u.id,
    },
  });

  return json(
    {
      status: 200,
      message: "Konto zostało usunięte!",
    },
    {
      status: 200,
      headers: { "Set-Cookie": await storage.destroySession(session) },
    },
  );
}
