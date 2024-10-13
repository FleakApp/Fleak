import { json } from "@remix-run/node";
import type { ActionFunctionArgs } from "@remix-run/node";
import { Form } from "@remix-run/react";
import { z } from "zod";

import { formError, validateFormData } from "@fleak-org/remix-utils";
import { Button, Input, Textarea } from "@fleak-org/ui";

import { FormButton, FormField } from "@/components/form";
import { prisma } from "@/services/db.server";
import { back } from "@/services/helpers.server";

const phoneRegex = new RegExp(
  /^([+]?[\s0-9]+)?(\d{3}|[(]?[0-9]+[)])?([-]?[\s]?[0-9])+$/,
);

const schema = z.object({
  email: z.string().min(3),
  first_name: z.string().min(3),
  last_name: z.string().min(3),

  phone: z.string().regex(phoneRegex, "Numer telefonu nieprawidłowy!"),

  message: z.string().min(25).max(200),
});

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const result = await validateFormData(schema, formData);

  if (!result.success) {
    return formError(result);
  }

  const data = result.data;

  await prisma.messages.create({
    data,
  });

  return back(request, {
    url: "/",
    message: `E-mail został wysłany, Skontaktujemy się jak najszybciej się da.`,
  });
}

export default function Contact() {
  return (
    <div className="mx-auto max-w-[85rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
      <div className="mx-auto max-w-2xl lg:max-w-5xl">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white sm:text-4xl">
            Skontaktuj się z nami
          </h1>
          <p className="mt-1 text-gray-600 dark:text-neutral-400">
            Chętnie porozmawiamy o tym, jak możemy Ci pomóc.
          </p>
        </div>

        <div className="mt-12 grid items-center gap-6 lg:grid-cols-2 lg:gap-16">
          <div className="flex flex-col rounded-xl border bg-background p-4 dark:border-neutral-700 sm:p-6 lg:p-8">
            <h2 className="mb-8 text-xl font-semibold text-gray-800 dark:text-neutral-200">
              Wypełnij formularz
            </h2>

            <Form method="POST">
              <div className="grid gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <FormField name="first_name" placeholder="Imię" />
                  </div>
                  <div>
                    <FormField name="last_name" placeholder="Nazwisko" />
                  </div>
                </div>

                <div>
                  <FormField
                    name="email"
                    type="email"
                    placeholder="Adres e-mail"
                  />
                </div>

                <div>
                  <FormField
                    name="phone"
                    type="phone"
                    placeholder="Numer telefonu"
                  />
                </div>

                <div>
                  <FormField
                    name="message"
                    placeholder="Treść wiadomości"
                    input={<Textarea rows={5} />}
                  />
                </div>
              </div>

              <div className="mt-4 grid">
                <FormButton type="submit">Wyślij wiadomość</FormButton>
              </div>

              <div className="mt-3 text-center">
                <p className="text-sm text-gray-500 dark:text-neutral-500">
                  Skontaktujemy się z Tobą w ciągu 1–2 dni roboczych.
                </p>
              </div>
            </Form>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-neutral-800">
            <div className="flex gap-x-7 py-6">
              <svg
                className="mt-1.5 size-6 shrink-0 text-gray-800 dark:text-neutral-200"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">
                  Baza wiedzy
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Chętnie pomożemy w przypadku jakichkolwiek pytań lub problemów
                  z kodem.
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="/"
                >
                  Skontaktuj się z pomocą techniczną
                  <svg
                    className="size-2.5 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex gap-x-7 py-6">
              <svg
                className="mt-1.5 size-6 shrink-0 text-gray-800 dark:text-neutral-200"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4c0-1.1.9-2 2-2h8a2 2 0 0 1 2 2v5Z" />
                <path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
              </svg>
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">
                  Często zadawane pytania
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Odpowiedzi na nurtujące Cię pytania znajdziesz w naszej sekcji
                  FAQ.
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="/"
                >
                  Odwiedź FAQ
                  <svg
                    className="size-2.5 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>
            <div className="flex gap-x-7 py-6">
              <svg
                className="mt-1.5 size-6 shrink-0 text-gray-800 dark:text-neutral-200"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m7 11 2-2-2-2" />
                <path d="M11 13h4" />
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              </svg>
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">
                  Interfejsy API dla programistów
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Przeczytaj nasz szybki przewodnik dla programistów.
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="/"
                >
                  Skontaktuj się ze sprzedażą
                  <svg
                    className="size-2.5 shrink-0 transition ease-in-out group-hover:translate-x-1 group-focus:translate-x-1"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M0.975821 6.92249C0.43689 6.92249 -3.50468e-07 7.34222 -3.27835e-07 7.85999C-3.05203e-07 8.37775 0.43689 8.79749 0.975821 8.79749L12.7694 8.79748L7.60447 13.7596C7.22339 14.1257 7.22339 14.7193 7.60447 15.0854C7.98555 15.4515 8.60341 15.4515 8.98449 15.0854L15.6427 8.68862C16.1191 8.23098 16.1191 7.48899 15.6427 7.03134L8.98449 0.634573C8.60341 0.268455 7.98555 0.268456 7.60447 0.634573C7.22339 1.00069 7.22339 1.59428 7.60447 1.9604L12.7694 6.92248L0.975821 6.92249Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>
              </div>
            </div>

            <div className="flex gap-x-7 py-6">
              <svg
                className="mt-1.5 size-6 shrink-0 text-gray-800 dark:text-neutral-200"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" />
                <path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" />
              </svg>
              <div className="grow">
                <h3 className="font-semibold text-gray-800 dark:text-neutral-200">
                  Skontaktuj się z nami za pomocą poczty elektronicznej
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-neutral-500">
                  Jeśli wolisz napisać do nas e-mail, skorzystaj z
                </p>
                <a
                  className="mt-2 inline-flex items-center gap-x-2 text-sm font-medium text-gray-600 hover:text-gray-800 focus:text-gray-800 focus:outline-none dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:text-neutral-200"
                  href="mailto:contact@fleak.com"
                >
                  contact@fleak.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
