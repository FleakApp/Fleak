import type { ActionFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

import { auth } from "@/services/authenticate/auth.server";

export const loader = () => redirect("/signin");

export const action = ({ request, params }: ActionFunctionArgs) => {
  return auth.authenticate(params.provider!, request);
};
