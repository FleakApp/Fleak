import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect } from "@remix-run/node";

export const loader = ({ params }: LoaderFunctionArgs) => {
  // const username = String(params.username).replace("@", "");

  return redirect(`/user/${params.username}/votes`);
};
