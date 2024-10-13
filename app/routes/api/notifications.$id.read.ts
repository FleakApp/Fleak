import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

// import { readNotification } from "@/use-cases/notifications";

export async function action({ request, params }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const notification = await prisma.notification.findUniqueOrThrow({
    where: { id: params.id },
  });

  await notification.makeReadAt();

  // await readNotification(String(params.id));

  return json({ message: "Powiadomienie oznaczone jako przeczytane!" });
}
