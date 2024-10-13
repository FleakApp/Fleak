import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export const issueSchema = z.object({
  post: z.string(),
  title: z.string().min(3),
  reason: z.string().min(3),
  description: z.string().min(3),
});

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });
  const user = (await requireUser(request)) as Omit<User, "password">;

  const formData = await request.formData();

  const result = await validateFormData(issueSchema, formData);

  if (!result.success) {
    return formError(result);
  }

  const issue = await prisma.issue.create({
    data: {
      title: result.data.title,
      description: result.data.description,
      reason: result.data.reason,
      user: {
        connect: {
          id: user.id,
        },
      },
      post: {
        connect: {
          id: result.data.post,
        },
      },
    },
  });

  return json(
    {
      message: `Raport ${"`"}${issue.id}${"`"} utworzony!`,
      status: "success",
    },
    { status: 300 },
  );
}
