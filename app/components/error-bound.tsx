/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  isRouteErrorResponse,
  Link,
  useAsyncError,
  useRouteError,
} from "@remix-run/react";

import { buttonVariants } from "@fleak-org/ui";

export function ErrorBoundary() {
  const error = useRouteError();
  const asyncError = useAsyncError() as Error;

  // Check if an error occurred for asynchronous operations
  if (typeof asyncError !== "undefined") {
    return (
      <Wrapper
        status={asyncError?.name ?? "404"}
        statusText={asyncError?.message}
        data={asyncError}
      />
    );
  }

  // Check if an error occurred for app routes
  if (isRouteErrorResponse(error)) {
    return (
      <Wrapper
        status={error.status}
        statusText={error.statusText}
        data={error.data}
      />
    );
    // Check if an error occurred for any errors
  } else if (error instanceof Error) {
    return (
      <Wrapper status={error.name} statusText={error.message} data={error} />
    );
  } else {
    return <h1>Nieznany błąd</h1>;
  }
}

interface WrapperProps {
  icon?: boolean;
  status?: number | string;
  statusText?: string;
  data?: Partial<Error>;
}

export const Wrapper = ({
  icon = true,
  status,
  statusText,
  data,
}: WrapperProps) => {
  return (
    <div className="inset-0 flex size-full min-h-[calc(100vh-140px)] w-full items-center justify-center p-5">
      <div className="text-center">
        {icon && (
          <div className="inline-flex rounded-full bg-orange-100 p-4">
            <div className="rounded-full bg-orange-200 stroke-orange-600 p-4">
              <svg
                className="h-16 w-16"
                viewBox="0 0 28 28"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M14.0002 9.33337V14M14.0002 18.6667H14.0118M25.6668 14C25.6668 20.4434 20.4435 25.6667 14.0002 25.6667C7.55684 25.6667 2.3335 20.4434 2.3335 14C2.3335 7.55672 7.55684 2.33337 14.0002 2.33337C20.4435 2.33337 25.6668 7.55672 25.6668 14Z"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </div>
          </div>
        )}

        <h1 className="mt-5 text-[36px] font-bold text-primary lg:text-[50px]">
          {status ? (status == "Error" ? "Błąd" : status) : "404"}
        </h1>
        <h4 className="mt-5 text-[20px] font-bold text-primary lg:text-[36px]">
          {statusText ?? "Ups! Coś poszło nie tak."}
        </h4>
        <p className="mt-5 text-primary lg:text-lg">
          {data?.message ?? (
            <>
              Strona, której szukasz nie istnieje lub <br />
              została usunięta.
            </>
          )}
        </p>

        <div className="mt-6 flex items-center justify-center gap-x-3">
          <Link
            to="/"
            className={buttonVariants({
              variant: "secondary",
            })}
          >
            Wróć do strony głównej
          </Link>

          <button
            onClick={() => window.history.back()}
            className={buttonVariants({
              variant: "default",
            })}
          >
            Wróć do poprzedniej strony
          </button>
        </div>
      </div>
    </div>
  );
};
