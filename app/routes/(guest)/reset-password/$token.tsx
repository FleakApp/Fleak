import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json, Link, useParams } from "@remix-run/react";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";
import { buttonVariants, cn } from "@fleak-org/ui";

import { Form, FormButton, FormField } from "@/components/form";
import { hashPassword } from "@/services/authenticate/password.server";
import { prisma } from "@/services/db.server";
import { back } from "@/services/helpers.server";
import { decryptToken } from "@/services/jwt.server";

const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: z.string().min(8),
    password_match: z.string().min(8),
  })
  .superRefine((data, ctx) => {
    if (data.password_match !== data.password) {
      ctx.addIssue({
        path: ["password_match"],
        code: "custom",
        message: "Hasła nie pasują do siebie",
      });
    }
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const result = await validateFormData(resetPasswordSchema, formData);

  if (!result.success) {
    return formError(result);
  }

  const data = result.data;

  const payload = decryptToken<{ id: string }>(String(data.token));

  const hashedPassword = await hashPassword(data.password);

  await prisma.user.update({
    where: { id: payload?.id },
    data: { password: hashedPassword },
  });

  return back(request, {
    url: "/signin",
    message: "Hasło zostało pomyślnie zmienione",
    // title: "Po",
  });
  // return back(request, "/signin", "Password successfylly changed");
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  resetPasswordSchema.safeParse(params);
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const payload = decryptToken<{ id: string }>(String(params.token));
  } catch (e) {
    return back(request, {
      url: "/signin",
      message: "Token jest nieprawidłowy",
      title: "Operacja przerwana",
    });
  }

  return json({});
};

export default function ResetPassword() {
  const { token } = useParams();

  return (
    <div className="container flex h-full max-w-lg flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Zresetuj hasło{" "}
        </h1>
        <p className="text-sm text-muted-foreground">
          Wpisz poniżej nowe hasło. <br />
          Pamiętaj, żeby nikt inny nie znał twojego nowego hasła.{" "}
        </p>
      </div>
      <div className="grid gap-6">
        <Form method="post">
          <div className="grid gap-3">
            <input name="token" type="hidden" value={token} />
            <div>
              <FormField
                required
                label="Hasło"
                name="password"
                type="password"
                placeholder="••••••"
              />
            </div>
            <div>
              <FormField
                required
                label="Powtórz hasło"
                name="password_match"
                type="password"
                placeholder="••••••"
              />
            </div>
            <FormButton className="w-full">Zmień swoje hasło</FormButton>
          </div>
        </Form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-neutral-50 px-2 text-muted-foreground">
              lub
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
