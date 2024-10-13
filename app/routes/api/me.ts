import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

import { fakePromise } from "@fleak-org/remix-utils";

import { requireUser } from "@/helpers/auth";
import type { User } from "@/services/db.server";

export async function loader({ request }: LoaderFunctionArgs) {
  await fakePromise();

  const user = (await requireUser(request)) as Omit<User, "password">;

  return json(user, { status: 200 });
}
