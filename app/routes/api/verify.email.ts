import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { requireUser } from "@/helpers/auth";
import { auth } from "@/services/authenticate/auth.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { sendVerifyEmail } from "@/services/email/email.server";

export async function action({ request }: ActionFunctionArgs) {
  await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const formData = await request.formData();

  const user = (await requireUser(request)) as Omit<User, "password">;

  if (request.method === "POST") {
    try {
      await sendVerifyEmail(user, user.id);

      return json(
        {
          status: 200,
          message:
            "E-mail weryfikacyjny został wysłany. Sprawdź swoją skrzynkę pocztową!",
        },
        {
          status: 200,
        },
      );
    } catch (e) {
      return json(
        {
          status: 200,
          message:
            "Nie udało się wysłać wiadomości weryfikacyjnej na podany adres email!",
        },
        {
          status: 200,
        },
      );
    }
  }

  const u = await prisma.user.findFirst({
    where: {
      id: user.id,
      AND: {
        emailVerifiedToken: String(formData.get("token")),
      },
    },
  });

  if (!u) {
    return json(
      {
        status: 200,
        message: "Token e-mail jest zniekształcony!",
        error: "Token e-mail jest zniekształcony!",
      },
      {
        status: 200,
      },
    );
  }

  await prisma.user.update({
    where: {
      id: u.id,
      AND: {
        emailVerifiedToken: String(formData.get("token")),
      },
    },
    data: {
      emailVerifiedToken: null,
      emailVerified: new Date(),
    },
  });

  return json(
    {
      status: 200,
      message: "Weryfikacja e-mail przebiegła pomyślnie!",
    },
    {
      status: 200,
    },
  );
}
