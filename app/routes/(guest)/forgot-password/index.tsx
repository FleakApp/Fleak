import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { Form, json, Link } from "@remix-run/react";
import { z } from "zod";

import {
  fakePromise,
  formError,
  validateFormData,
} from "@fleak-org/remix-utils";
import { buttonVariants, cn } from "@fleak-org/ui";

import { FormButton, FormField } from "@/components/form";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";
import { sendResetPasswordEmail } from "@/services/email/email.server";
import { back } from "@/services/helpers.server";
import { createToken } from "@/services/jwt.server";

const resetSchema = z
  .object({
    email: z.string(),
  })
  .superRefine(async (data, ctx) => {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
      },
      select: { id: true },
    });

    if (!existingUser) {
      ctx.addIssue({
        path: ["email"],
        code: z.ZodIssueCode.custom,
        message: "Użytkownik o tym adresie e-mail nie istnieje",
      });
      return;
    }
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  await fakePromise();

  const r = new URL(request.url);

  const formData = await request.formData();

  const result = await validateFormData(resetSchema, formData);

  if (!result.success) {
    return formError(result);
  }

  const data = result.data;

  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (user) {
    const token = createToken({ id: user.id });

    await sendResetPasswordEmail(user, token, r.host);

    return back(request, {
      url: "/signin",
      message: `E-mail z instrukcjami został wysłany`,
    });
  }
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await fakePromise();
  await auth.isAuthenticated(request, {
    successRedirect: "/",
  });
  return json({});
};

export default function ForgotPassword() {
  return (
    <div className="container flex h-full max-w-lg flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Zapomniałeś hasła{" "}
        </h1>
        <p className="text-sm text-muted-foreground">
          Wpisz poniżej swój adres e-mail, aby otrzymać instrukcje dotyczące
          resetowania hasła.
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-3">
            <div>
              <FormField
                label="Adres e-mail"
                name="email"
                placeholder="jim@gmail.com"
              />
            </div>

            <FormButton className="w-full">Przypomnij hasło</FormButton>
          </div>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-2 text-muted-foreground">
              lub kontynuuj
            </span>
          </div>
        </div>

        <div className="grid gap-x-3">
          <Link
            to="/signin"
            className={cn("w-full", buttonVariants({ variant: "outline" }))}
          >
            Wróć do strony logowania
          </Link>
        </div>
      </div>
    </div>
  );
}
