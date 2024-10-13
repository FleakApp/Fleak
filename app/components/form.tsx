import * as React from "react";
import type { FormProps as BaseFormProps } from "@remix-run/react";
import {
  Form as BaseForm,
  useActionData,
  useNavigation,
} from "@remix-run/react";

import type { ActionData } from "@fleak-org/remix-utils";
import { Button, cn, Input, Label, Loader } from "@fleak-org/ui";
import type { ButtonProps, InputProps, TextareaProps } from "@fleak-org/ui";

import { useGlobalSubmittingState } from "@/helpers/pending";

export const Form = React.forwardRef(function _Form(
  props: BaseFormProps,
  ref: React.ForwardedRef<HTMLFormElement> | null,
) {
  const form = useActionData<ActionData<unknown>>();

  return (
    <BaseForm
      aria-describedby="form-error"
      aria-invalid={form?.formError ? true : undefined}
      ref={ref}
      {...props}
    >
      {props.children}
    </BaseForm>
  );
});

export function FormFieldLabel(
  props: React.DetailedHTMLProps<
    React.LabelHTMLAttributes<HTMLLabelElement>,
    HTMLLabelElement
  > & {
    name?: string;
    required?: boolean;
    className?: string;
  },
) {
  return (
    <Label htmlFor={props.name} {...props}>
      {props.children}

      {/* required asterisk */}
      {props.required && (
        <span className="ml-1 text-destructive">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="inline size-2"
          >
            <path d="M12.9998 3L12.9996 10.267L19.294 6.63397L20.294 8.36602L14.0006 11.999L20.294 15.634L19.294 17.366L12.9996 13.732L12.9998 21H10.9998L10.9996 13.732L4.70557 17.366L3.70557 15.634L9.99857 12L3.70557 8.36602L4.70557 6.63397L10.9996 10.267L10.9998 3H12.9998Z"></path>
          </svg>
        </span>
      )}
    </Label>
  );
}

export function FormFieldError(
  props: React.DetailedHTMLProps<
    React.HTMLAttributes<HTMLParagraphElement>,
    HTMLParagraphElement
  > & {
    className?: string;
  },
) {
  return (
    <p {...props} className="text-sm text-destructive">
      {props.children}
    </p>
  );
}

interface FormFieldProps extends InputProps {
  name: string;
  label?: string;
  input?: React.ReactElement;
  defaultValue?: string;
  errors?: string | string[] | null;
  shouldPassProps?: boolean;
  required?: boolean;
}

export const FormField = React.forwardRef<HTMLInputElement, FormFieldProps>(
  function FormField({ label, errors, input, ...props }, ref) {
    const form = useActionData<ActionData<Record<string, unknown>>>();

    const fieldErrors = errors ?? form?.fieldErrors?.[props.name];

    const className = cn(
      fieldErrors
        ? "border-destructive placeholder:text-destructive focus-visible:ring-transparent"
        : "",
    );

    const sharedProps = {
      id: props.name,
      ...props,
      ref,
      name: props.name,
      className,
    };

    const clonedInput = input && React.cloneElement(input, sharedProps);

    return (
      <>
        {label && (
          <FormFieldLabel name={props.name} required={props.required}>
            {label}
          </FormFieldLabel>
        )}

        {clonedInput ?? <Input {...sharedProps} />}

        {typeof fieldErrors === "string" ? (
          <FormFieldError>{fieldErrors}</FormFieldError>
        ) : (
          <FormFieldError>{fieldErrors?.join(", ")}</FormFieldError>
        )}
      </>
    );
  },
);

export function FormError({ error }: { error?: string }) {
  const form = useActionData<ActionData<Record<string, unknown>>>();
  if (!form?.formError && !error) return null;
  return (
    <FormFieldError id="form-error">{form?.formError ?? error}</FormFieldError>
  );
}

export const FormButton = function _FormButton(
  props: React.PropsWithChildren<ButtonProps>,
) {
  const submittingState = useGlobalSubmittingState();

  return (
    <Button
      disabled={submittingState !== "idle"}
      {...props}
      className="space-x-3"
    >
      {props.children}
      {submittingState !== "idle" && <Loader className="ml-3 size-4" />}
    </Button>
  );
};
