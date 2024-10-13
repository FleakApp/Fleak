import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  const id = await auth.isAuthenticated(request, {
    // failureRedirect: "/signin",
  });

  if (!id) return json({});

  const result = await prisma.notification.findMany({
    where: {
      user: { id },
    },
    include: {
      user: {
        select: { id: true },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  const unread = await prisma.notification.count({
    where: {
      readAt: null,
      user: {
        id,
      },
    },
  });

  return json({
    unread,
    result,
  });
}
