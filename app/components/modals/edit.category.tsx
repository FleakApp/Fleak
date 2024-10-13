/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { Category } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import type { z } from "zod";

import { useModalInstance } from "@fleak-org/react-modals";
import type { FieldErrors } from "@fleak-org/remix-utils";
import {
  Avatar,
  AvatarImage,
  Button,
  cn,
  Input,
  Label,
  Loader,
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  useToast,
} from "@fleak-org/ui";

import type { schema } from "@/routes/api/category/edit";
import { FormField } from "../form";

export const EditCategory = () => {
  const { data, isOpen, close } = useModalInstance<Partial<Category>>();
  const [fieldErrors, setErrors] =
    useState<FieldErrors<z.infer<typeof schema>>>();

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    fieldErrors?: FieldErrors<z.infer<typeof schema>>;
  }>();

  const { toast } = useToast();

  const result = fetcher.data;

  useLayoutEffect(() => {
    setImage(data.image);
    setErrors(undefined);
  }, [isOpen]);

  useEffect(() => {
    setErrors(result?.fieldErrors);

    if (result && result?.status === "success") {
      setImage("");
      toast({ title: String(result?.message) });
      close();
    }
  }, [fetcher.data]);

  const imageInputRef = useRef<HTMLInputElement>(null);

  const [image, setImage] = useState(data.image);

  // @ts-expect-error
  function handleChange(e) {
    setImage(URL.createObjectURL(e.target.files[0]));
  }

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent className="flex flex-col gap-0 overflow-hidden p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Edytuj kategorię</SheetTitle>
          {/* <SheetDescription>Opisz nam napotkany problem.</SheetDescription> */}
        </SheetHeader>

        <fetcher.Form
          encType="multipart/form-data"
          method="post"
          action="/api/category/edit"
          className={cn(
            `flex h-full flex-col justify-around gap-0 overflow-hidden`,
            fetcher.state !== "idle" && "opacity-50",
          )}
        >
          {/* <div className="h-full flex-1"> </div> */}
          <input type="hidden" name="category" value={data.id} />

          <div className="custom-scroll flex h-full flex-1 flex-col gap-3 overflow-auto p-6">
            <div className="flex items-center gap-3">
              <Avatar className="h-20 w-20 rounded-lg">
                {/* @ts-ignore */}
                <AvatarImage src={image} alt="image" />
                {/* <AvatarFallback>JP</AvatarFallback> */}
              </Avatar>

              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  imageInputRef.current?.click();
                }}
              >
                Wybierz zdjęcie
              </Button>

              <FormField
                name="image"
                ref={imageInputRef}
                hidden
                input={
                  <input
                    type="file"
                    id="image"
                    name="image"
                    accept="image/*"
                    onChange={handleChange}
                  />
                }
              />

              {fieldErrors?.image && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.image?.join(", ")}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="name">Nazwa kategorii</Label>
              <Input
                id="name"
                name="name"
                placeholder="Nazwa kategorii"
                defaultValue={data.name}
              />

              {fieldErrors?.name && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.name?.join(", ")}
                </p>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="description">Opisz kategorię</Label>

              <Textarea
                id="description"
                name="description"
                placeholder="Opisz kategorię"
                defaultValue={data.description!}
              />

              {fieldErrors?.description && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.description.join(", ")}
                </p>
              )}
            </div>
          </div>

          <SheetFooter className="p-6 tablet:justify-start">
            <Button type="submit">
              Aktualizuj
              {fetcher.state !== "idle" ? (
                <Loader className="ml-3 size-[16px]" />
              ) : (
                <></>
              )}
            </Button>
            <SheetClose asChild>
              <Button variant="ghost" type="reset">
                Anuluj
              </Button>
            </SheetClose>
          </SheetFooter>
        </fetcher.Form>
      </SheetContent>
    </Sheet>
  );
};
