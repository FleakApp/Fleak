import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import type {
  ActionFunctionArgs,
  LoaderFunctionArgs,
  MetaFunction,
} from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useActionData, useSearchParams } from "@remix-run/react";
import { z } from "zod";

import { Button, cn, Input, Label, Loader } from "@fleak-org/ui";

import { siteConfig } from "@/config/site";
import { useGlobalSubmittingState } from "@/helpers/pending";
import { auth } from "@/services/authenticate/auth.server";
import { prisma } from "@/services/db.server";

export const meta: MetaFunction = () => {
  return [{ title: `${siteConfig.title} - Sign In!` }];
};

export const SignInSchema = z.object({
  email: z.string().email().min(10),
  password: z.string().min(8),
  remember: z.boolean().optional(),
});

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  const submission = await parseWithZod(formData, {
    schema: SignInSchema.superRefine(async (data, ctx) => {
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
    }),
    async: true,
  });

  if (submission.status !== "success") {
    return json(submission.reply());
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");

  await auth.authenticate("form", request, {
    successRedirect: ref ?? "/",
    failureRedirect: "/signin",
    context: { formData: formData },
    successMessage: "Uwierzytelnione e-mailem!",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await auth.isAuthenticated(request, {
    successRedirect: "/",
  });
  return json({});
};

export default function Component() {
  const hasDev = process.env.NODE_ENV !== "production";

  const [searchParams, _] = useSearchParams();

  // const navigation = useNavigation();
  // const isLoading = navigation.state === "submitting";

  const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    // Sync the result of last submission
    lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: SignInSchema });
    },
    // Validate the form on blur event triggered
    shouldValidate: "onSubmit",
  });

  const isSubmitting = useGlobalSubmittingState() === "submitting";

  return (
    <div className="container flex h-full max-w-lg flex-col justify-center space-y-6">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-primary">
          Witamy spowrotem! <br /> Zaloguj się, aby kontynuować.
        </h1>
        <p className="text-sm text-muted-foreground">
          Logując się, zyskasz dostęp do treści ekskluzywnych, wyjątkowych
          oferty i jako pierwszy dowiesz się o ekscytujących nowościach i
          aktualizacjach.
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Form action="/oauth/google" method="post">
            <Button
              type="submit"
              variant="outline"
              // disabled={isSubmitting}
              className="w-full gap-x-2"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M22.8859 12.2614C22.8859 11.4459 22.8128 10.6618 22.6769 9.90912H11.8459V14.3575H18.035C17.7684 15.795 16.9582 17.013 15.7403 17.8284V20.7139H19.4569C21.6314 18.7118 22.8859 15.7637 22.8859 12.2614Z"
                  fill="#4285F4"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.8459 23.4998C14.9509 23.4998 17.5541 22.47 19.4568 20.7137L15.7402 17.8282C14.7105 18.5182 13.3932 18.9259 11.8459 18.9259C8.85068 18.9259 6.31546 16.903 5.41114 14.1848H1.56909V17.1644C3.46136 20.9228 7.35046 23.4998 11.8459 23.4998Z"
                  fill="#34A853"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.41117 14.1851C5.18117 13.4951 5.05049 12.758 5.05049 12.0001C5.05049 11.2421 5.18117 10.5051 5.41117 9.81506V6.83551H1.56913C0.790265 8.38801 0.345947 10.1444 0.345947 12.0001C0.345947 13.8557 0.790265 15.6121 1.56913 17.1646L5.41117 14.1851Z"
                  fill="#FBBC05"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M11.8459 5.07386C13.5343 5.07386 15.0502 5.65409 16.242 6.79364L19.5405 3.49523C17.5489 1.63955 14.9457 0.5 11.8459 0.5C7.35046 0.5 3.46136 3.07705 1.56909 6.83545L5.41114 9.815C6.31546 7.09682 8.85068 5.07386 11.8459 5.07386Z"
                  fill="#EA4335"
                />
              </svg>
              Połącz się z Google
            </Button>
          </Form>
        </div>

        <div className="grid gap-3">
          <Form action="/oauth/twitter" method="post">
            <Button type="submit" className="w-full gap-x-2">
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
                className="size-6"
              >
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
              </svg>
              Połącz się z twitter
            </Button>
          </Form>
        </div>

        <div className="grid gap-3">
          <Form action="/oauth/facebook" method="post">
            <Button
              type="submit"
              variant="outline"
              // disabled={isSubmitting}
              className="w-full gap-x-2 bg-[#1877F2] text-white hover:bg-[#1374f2] hover:text-white"
            >
              <svg
                width="25"
                height="24"
                viewBox="0 0 25 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g clipPath="url(#clip0_1_114)">
                  <rect
                    width="24"
                    height="24"
                    transform="translate(0.845947)"
                    fill="#1877F2"
                  />
                  <path
                    d="M24.3459 12.0699C24.3459 5.7186 19.1972 0.56988 12.8459 0.56988C6.49467 0.56988 1.34595 5.7186 1.34595 12.0699C1.34595 17.8099 5.55133 22.5674 11.0491 23.4302V15.3941H8.12915V12.0699H11.0491V9.53629C11.0491 6.6541 12.7659 5.06207 15.3928 5.06207C16.651 5.06207 17.967 5.28668 17.967 5.28668V8.11675H16.5169C15.0883 8.11675 14.6428 9.00322 14.6428 9.91266V12.0699H17.8323L17.3224 15.3941H14.6428V23.4302C20.1406 22.5674 24.3459 17.8099 24.3459 12.0699Z"
                    fill="white"
                  />
                </g>
                <defs>
                  <clipPath id="clip0_1_114">
                    <rect
                      width="24"
                      height="24"
                      fill="white"
                      transform="translate(0.845947)"
                    />
                  </clipPath>
                </defs>
              </svg>
              Połącz się z facebook
            </Button>
          </Form>
        </div>

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
        <Form method="post" id={form.id} onSubmit={form.onSubmit}>
          <div className="grid gap-3">
            <div className="grid gap-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                placeholder="name@example.com"
                type="email"
                name={fields.email.name}
                defaultValue={String(
                  searchParams.has("email")
                    ? searchParams.get("email")
                    : hasDev
                      ? "admin@codewebs.com"
                      : "",
                )}
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isSubmitting}
                className={cn(
                  fields.email.errors
                    ? "border-destructive placeholder:text-destructive focus-visible:ring-transparent"
                    : "",
                )}
              />

              {fields.email.errors && (
                <p className="text-destructive">{fields.email.errors}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Hasło</Label>
                <Link
                  to="/forgot-password"
                  className="ml-auto inline-block text-sm text-primary underline"
                >
                  Zapomniałeś hasła?
                </Link>
              </div>
              <Input
                id="password"
                name={fields.password.name}
                placeholder="••••••"
                defaultValue={hasDev ? "password" : ""}
                type="password"
                disabled={isSubmitting}
                className={cn(
                  fields.password.errors
                    ? "border-destructive placeholder:text-destructive focus-visible:ring-transparent"
                    : "",
                )}
              />
              {fields.password.errors && (
                <p className="text-destructive">{fields.password.errors}</p>
              )}
            </div>

            <Button disabled={isSubmitting}>
              {isSubmitting && <Loader className="mr-2 size-4" />}
              Zaloguj się przy użyciu swojego adresu e-mail
            </Button>
          </div>
        </Form>
      </div>

      <p className="px-8 text-center text-sm text-muted-foreground">
        Kontynuując, zgadzasz się z naszymi{" "}
        <Link
          to="/terms"
          className="underline underline-offset-4 hover:text-primary"
        >
          Warunkami usług
        </Link>{" "}
        I{" "}
        <Link
          to="/privacy"
          className="underline underline-offset-4 hover:text-primary"
        >
          Polityką prywatności
        </Link>
        .
      </p>
    </div>
  );
}
