import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { validateFormData } from "@fleak-org/remix-utils";

import { requireUserWithRole } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

export const schema = z.object({
  issue: z.string(),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin?ref=" + request.headers.get("referer"),
  });

  await requireUserWithRole(request, "admin");

  const formData = await request.formData();

  const result = await validateFormData(schema, formData);

  if (!result.success) {
    return json(
      {
        message: JSON.stringify(result),
        status: "success",
      },
      { status: 300 },
    );
  }

  const exists = await prisma.issue.findFirst({
    where: {
      id: result.data.issue,
    },
  });

  if (!exists) {
    return json(
      {
        message: `Takie Zgłoszenie nie zostało znalezione!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.issue.delete({
    where: {
      id: exists.id,
    },
  });

  return json(
    {
      message: `Zgłoszenie zostało pomyślnie usunięte!`,
      status: "success",
    },
    { status: 300 },
  );
}
