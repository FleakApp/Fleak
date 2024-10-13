import type { PropsWithChildren } from "react";
import { useMemo } from "react";
import { useRouteLoaderData } from "@remix-run/react";

import { loader as rootLoader } from "@/root";

interface AuthorityCheckProps {
  authority: string[] | undefined;
}

const AuthorityCheck = (props: PropsWithChildren<AuthorityCheckProps>) => {
  const { authority, children } = props;

  const data = useRouteLoaderData<typeof rootLoader>("root");

  const userAuthority = data?.user
    ? data?.user?.roles?.map((role) => role.name)
    : ["guest"];

  function useAuthority(
    userAuthority?: string[],
    authority?: string[],
    emptyCheck = false,
  ) {
    if (!authority || !userAuthority || typeof authority === "undefined") {
      return !emptyCheck;
    }

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const matched = useMemo(() => {
      return authority.some((role) => userAuthority.includes(role));
    }, [authority, userAuthority]);

    return matched;
  }

  const matched = useAuthority(userAuthority, authority);

  return matched ? children : null;
};

export default AuthorityCheck;
