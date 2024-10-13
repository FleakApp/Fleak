import { Link } from "@remix-run/react";

import { Loader } from "@fleak-org/ui";

import { Logo } from "./brand/logo";

interface PageLoaderProps {
  withLogo?: boolean;
  elipsis?: boolean;
}

export default function PageLoader({
  withLogo = false,
  elipsis = true,
}: PageLoaderProps) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-background">
      {withLogo && (
        <Link to="/" className="mb-6">
          <Logo />
        </Link>
      )}

      <Loader variant="primary" elipsis={elipsis} />
    </div>
  );
}
