/* eslint-disable @typescript-eslint/no-unused-vars */
import { Resend } from "resend";

import { ResetPasswordEmail, VerifyEmail } from "@fleak-org/mailing/templates";

import type { User } from "@/models/user";
import { prisma } from "@/services/db.server";

function getRndInteger(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const resend = new Resend(" ");

export async function sendVerifyEmail(
  user: Omit<User, "password">,
  token: string,
  hostname?: string,
) {
  try {
    if (!user.email) return;

    const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

    const code = getRndInteger(100000, 999999);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        emailVerifiedToken: String(code),
      },
    });

    await resend.emails.send({
      from: "Fleak <auth@fleak.pl>",
      to: user.email,
      subject: "Weryfikacja adresu email",
      react: <VerifyEmail link={`${APP_URL}/verify/${token}`} code={code} />,
    });
  } catch (error) {
    console.log(error);
  }
}

export async function sendResetPasswordEmail(
  user: Omit<User, "password">,
  token: string,
  hostname?: string,
) {
  try {
    if (!user.email) return;

    const APP_URL = process.env.APP_URL ?? "http://localhost:3000";

    await resend.emails.send({
      from: "Fleak <auth@fleak.pl>",
      to: user.email,
      subject: "Resetowanie hasła",
      react: <ResetPasswordEmail link={`${APP_URL}/verify/${token}`} />,
    });
  } catch (error) {
    console.log(error);
  }
}
