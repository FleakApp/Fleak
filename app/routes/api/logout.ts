import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";

const signOut = async (request: Request) => {
  const ref = request.headers.get("Referer") ?? request.headers.get("Referer");

  await auth.logout(request, {
    redirectTo: ref ?? "/signin",
    successMessage: "Pomyślnie wylogowałeś się z aplikacji!",
  });
};

export const loader = async ({ request }: LoaderFunctionArgs) =>
  await signOut(request);

export const action = async ({ request }: ActionFunctionArgs) =>
  await signOut(request);
