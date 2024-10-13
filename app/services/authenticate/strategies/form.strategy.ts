import bcrypt from "bcryptjs";

import { AuthorizationError, FormStrategy } from "@fleak-org/remix-auth";

import { prisma as db, prisma } from "@/services/db.server";
import { sendVerifyEmail } from "@/services/email/email.server";

const strategy = new FormStrategy(async ({ form }) => {
  const email = form.get("email");
  const password = form.get("password");

  const user = await db.user.findUnique({
    where: {
      email: String(email),
    },
    omit: {
      password: false,
    },
  });

  if (!user) {
    throw new AuthorizationError(
      "Nie znaleziono użytkownika o tym adresie e-mail",
    );
  }

  if (!user || !(await bcrypt.compare(password as string, user.password!))) {
    throw new AuthorizationError("Nieprawidłowe dane uwierzytelniające");
  }

  if (user && user.emailVerified === null) {
    await sendVerifyEmail(user, user.id);

    // throw new AuthorizationError(
    //   "Konto niezweryfikowane. Przeczytaj swoją skrzynkę e-mail.",
    // );
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      loginAt: new Date(),
    },
  });

  return user.id;
});

export { strategy };
