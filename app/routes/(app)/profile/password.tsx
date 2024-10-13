import { useEffect, useRef } from "react";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  json,
  useActionData,
  useFetcher,
  useLoaderData,
} from "@remix-run/react";
import { z } from "zod";

import {
  fakePromise,
  formError,
  validateFormData,
} from "@fleak-org/remix-utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Loader,
} from "@fleak-org/ui";

import { Form, FormField } from "@/components/form";
import { requireUser } from "@/helpers/auth";
import { useGlobalSubmittingState } from "@/helpers/pending";
import { auth } from "@/services/authenticate/auth.server";
import {
  comparePasswords,
  hashPassword,
} from "@/services/authenticate/password.server";
import type { User } from "@/services/db.server";
import { prisma } from "@/services/db.server";
import { sendVerifyEmail } from "@/services/email/email.server";
import { back } from "@/services/helpers.server";

const passwordSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).optional().or(z.literal("")),

    new_password: z.string().min(8).optional().or(z.literal("")),
    new_password_match: z.string().min(8).optional().or(z.literal("")),
  })
  .superRefine((data, ctx) => {
    if (data.new_password && data.new_password.length === 0) {
      return;
    }

    if (data.new_password_match !== data.new_password) {
      ctx.addIssue({
        path: ["new_password_match"],
        code: "custom",
        message: "Hasło nie pasuje do nowego hasła",
      });
    }
  });

export const action = async ({ request }: ActionFunctionArgs) => {
  const user = (await requireUser(request)) as Omit<User, "password">;

  const formData = await request.formData();

  const result = await validateFormData(
    passwordSchema

      .superRefine(async (data, ctx) => {
        if (data.new_password && data.new_password.length === 0) {
          return;
        }
        const existingUser = await prisma.user.findFirst({
          where: {
            id: { not: user.id },
            email: data.email,
          },
          select: { id: true },
        });

        if (existingUser) {
          ctx.addIssue({
            path: ["email"],
            code: z.ZodIssueCode.custom,
            message: "Użytkownik o tym adresie e-mail już istnieje",
          });
          return;
        }
      })
      .superRefine(async (data, ctx) => {
        if (!data.password) return;

        const existingUser = await prisma.user.findFirst({
          where: {
            id: user.id,
          },
          omit: { password: false },
        });

        const has = await comparePasswords(
          data.password,
          // @ts-expect-error
          existingUser?.password,
        );

        if (!has) {
          ctx.addIssue({
            path: ["password"],
            code: z.ZodIssueCode.custom,
            message: "Hasło jest nieprawidłowe",
          });
          return;
        }
      }),
    formData,
  );

  if (!result.success) {
    return formError(result);
  }

  const data = result.data;

  if (data.email === user.email && !data.new_password) {
    return back(request, {
      message: `Nie wprowadzono zmian w profilu!`,
    });
  }

  if (data.new_password) {
    const hashedPassword = await hashPassword(data.new_password);

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: hashedPassword,
      },
    });

    if (data.email === user.email) {
      return back(request, {
        message: `Hasło zostało pomyślnie zmienione!`,
      });
    }
  }

  if (user.email !== data.email) {
    await sendVerifyEmail(user, user.id);
  }

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      email: data.email,
      emailVerified: user.email !== data.email ? null : user.emailVerified,
    },
  });

  return back(request, {
    message: `${data.new_password ? "Hasło oraz email zostało pomyślnie zmienione" : "Email został pomyślnie zmieniony"}!`,
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await fakePromise();
  const cookie = await auth.isAuthenticated(request, {
    failureRedirect: "/signin",
  });

  const user = await prisma.user.findUnique({
    where: { id: cookie },
  });

  return json({ user });
};

export default function ForgotPassword() {
  const { user } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const submittingState = useGlobalSubmittingState();
  const formRef = useRef<HTMLFormElement>(null);
  const fetcher = useFetcher();

  useEffect(() => {
    if (!actionData) {
      formRef.current?.reset();
    }
  }, [actionData]);

  const onDelete = () => {
    fetcher.submit("api-account-delete", {
      method: "DELETE",
      action: "/api/account/delete",
    });
  };

  return (
    <div className="flex h-full flex-col justify-center space-y-6">
      <Form ref={formRef} method="post" className="space-y-6">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader>
            <CardTitle>Bezpieczeństwo</CardTitle>
            <CardDescription>Zmień swój email oraz hasło</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="">
              <div className="space-y-2">
                <FormField
                  required
                  label="Adres email"
                  name="email"
                  type="email"
                  defaultValue={user?.email ?? ""}
                />
              </div>
              <div className="space-y-2">
                <FormField
                  required
                  label="Aktualne Hasło"
                  name="password"
                  type="password"
                  placeholder="••••••"
                />
              </div>

              <div className="grid gap-4 tablet:grid-cols-2">
                <div className="space-y-2">
                  <FormField
                    label="Nowe Hasło"
                    name="new_password"
                    type="password"
                    placeholder="••••••"
                  />
                </div>
                <div className="space-y-2">
                  <FormField
                    label="Powtórz nowe Hasło"
                    name="new_password_match"
                    type="password"
                    placeholder="••••••"
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="space-x-3">
            <Button disabled={submittingState !== "idle"} className="space-x-3">
              Zaaktualizuj hasło
              {submittingState !== "idle" && <Loader className="ml-3 size-4" />}
            </Button>

            <fetcher.Form
              method="post"
              action="/api/account/delete"
              className="space-y-6"
            >
              <AlertDialog>
                <AlertDialogTrigger>
                  <Button
                    type="button"
                    variant="destructive"
                    className="space-x-3"
                  >
                    Usuń moje konto
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Czy jesteś absolutnie pewien?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      Tej czynności nie można cofnąć. Spowoduje to trwałe
                      usunięcie Twojego konta i usunięcie Twoich danych z
                      naszych serwerów.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    {/* <AlertDialogAction asChild> */}
                    <Button
                      variant="destructive"
                      // type="submit"
                      onClick={onDelete}
                      className="space-x-3"
                      disabled={fetcher.state !== "idle"}
                    >
                      Potwierdzam
                      {fetcher.state !== "idle" && (
                        <Loader className="ml-3 size-4" />
                      )}
                    </Button>
                    {/* </AlertDialogAction> */}
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </fetcher.Form>
          </CardFooter>
        </Card>
      </Form>
    </div>
  );
}
