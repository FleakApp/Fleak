/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useState } from "react";
import type { User } from "@prisma/client";
import { Link, useFetcher, useRouteLoaderData } from "@remix-run/react";
import type { z } from "zod";

import { useModalInstance } from "@fleak-org/react-modals";
import type { FieldErrors } from "@fleak-org/remix-utils";
import {
  Button,
  cn,
  Dialog,
  DialogContent,
  Input,
  Label,
  Loader,
  useToast,
} from "@fleak-org/ui";

import { Form } from "@/components/form";
import { useGlobalSubmittingState } from "@/helpers/pending";
import type { SignInSchema } from "@/routes/(guest)/signin";
import { Logo } from "../brand/logo";

export const SignInModal = () => {
  const { isOpen, close } = useModalInstance();
  const [fieldErrors, setErrors] =
    useState<FieldErrors<z.infer<typeof SignInSchema>>>();

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    error?: FieldErrors<z.infer<typeof SignInSchema>>;
    fieldErrors?: FieldErrors<z.infer<typeof SignInSchema>>;
  }>();

  const data = useRouteLoaderData<{
    user?: User;
  }>("root");

  const { toast } = useToast();

  const result = fetcher.data;

  useLayoutEffect(() => {
    setErrors(undefined);
  }, [isOpen]);

  useEffect(() => {
    setErrors(result?.error);
    // setErrors(result?.fieldErrors);

    if (result && result?.status === "success") {
      toast({ title: String(result?.message) });
      close();
    }
    if (data?.user) close();
  }, [fetcher.data, data?.user]);

  const isSubmitting = useGlobalSubmittingState() === "submitting";

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="flex size-full flex-col gap-0 rounded-none tablet:max-h-[90vh] tablet:max-w-lg tablet:rounded-lg">
        <div className="flex h-full flex-col justify-center space-y-6">
          <div className="flex flex-col space-y-2 text-center">
            <div className="flex h-auto items-center justify-center tablet:hidden">
              <Logo />
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-primary">
              Witamy spowrotem! <br /> Zaloguj się, aby kontynuować.
            </h1>
            <p className="text-sm text-muted-foreground">
              Logując się, zyskasz dostęp do treści ekskluzywnych, wyjątkowych
              oferty i jako pierwszy dowiesz się o ekscytujących nowościach i
              aktualizacjach.
            </p>
          </div>
          <div className="grid gap-6 p-2">
            <div className="grid gap-3">
              <Form action="/oauth/google" method="post">
                <Button
                  type="submit"
                  variant="outline"
                  className="w-full gap-x-2"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="size-4"
                  >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                    <path d="M20.945 11a9 9 0 1 1 -3.284 -5.997l-2.655 2.392a5.5 5.5 0 1 0 2.119 6.605h-4.125v-3h7.945z" />
                  </svg>
                  Połącz się z Google
                </Button>
              </Form>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  lub kontynuuj
                </span>
              </div>
            </div>
            <fetcher.Form
              method="post"
              action="/signin"
              className={cn(
                `flex h-full flex-col justify-around gap-0`,
                fetcher.state !== "idle" && "opacity-50",
              )}
            >
              <div className="grid gap-3">
                <div className="grid gap-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    placeholder="name@example.com"
                    type="email"
                    name="email"
                    autoCapitalize="none"
                    autoComplete="email"
                    autoCorrect="off"
                    disabled={isSubmitting}
                    className={cn(
                      fieldErrors?.email
                        ? "border-destructive placeholder:text-destructive focus-visible:ring-transparent"
                        : "",
                    )}
                  />

                  {fieldErrors?.email && (
                    <p className="text-sm text-destructive">
                      {fieldErrors?.email?.join(", ")}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Hasło</Label>
                    <Link
                      to="/forgot-password"
                      onClick={close}
                      className="ml-auto inline-block text-sm text-primary underline"
                    >
                      Zapomniałeś hasła?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    placeholder="••••••"
                    type="password"
                    disabled={isSubmitting}
                    className={cn(
                      fieldErrors?.password
                        ? "border-destructive placeholder:text-destructive focus-visible:ring-transparent"
                        : "",
                    )}
                  />

                  {fieldErrors?.password && (
                    <p className="text-sm text-destructive">
                      {fieldErrors?.password?.join(", ")}
                    </p>
                  )}
                </div>

                <Button type="submit" disabled={fetcher.state !== "idle"}>
                  {fetcher.state !== "idle" && (
                    <Loader className="mr-2 size-4" />
                  )}
                  Zaloguj się przy użyciu swojego adresu e-mail
                </Button>
              </div>
            </fetcher.Form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
