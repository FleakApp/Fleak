import type { LoaderFunctionArgs } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";

export const loader = ({ request, params }: LoaderFunctionArgs) => {
  return auth.authenticate(String(params.provider), request, {
    successRedirect: "/",
    failureRedirect: "/signin",
    successMessage: `Uwierzytelniono za pomocą ${String(params.provider).toUpperCase()}!`,
  });
};
