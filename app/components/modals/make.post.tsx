/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { useEffect, useRef, useState } from "react";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useFetcher, useNavigate } from "@remix-run/react";
import {
  Bold,
  Heading,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  ImageIcon,
  ImageUp,
  Italic,
  LayoutList,
  Link,
  List,
  ListChecks,
  ListOrdered,
  Quote,
  Video,
} from "lucide-react";
import {
  // commands
  boldCommand,
  checkedListCommand,
  codeCommand,
  headingLevel1Command,
  headingLevel2Command,
  headingLevel3Command,
  headingLevel4Command,
  headingLevel5Command,
  headingLevel6Command,
  imageCommand,
  italicCommand,
  linkCommand,
  orderedListCommand,
  quoteCommand,
  strikethroughCommand,
  unorderedListCommand,
  // hook
  useTextAreaMarkdownEditor,
} from "react-headless-mde";
import useSWR from "swr";
import type { z } from "zod";

import { useModalInstance } from "@fleak-org/react-modals";
import type { FieldErrors } from "@fleak-org/remix-utils";
import {
  Button,
  buttonVariants,
  cn,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Input,
  Label,
  Loader,
  RadioGroup,
  RadioGroupItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Textarea,
  useToast,
} from "@fleak-org/ui";

import { accentsTidy } from "@/helpers/misc";
import { CreatePostSchema } from "@/routes/api/post/create";
import Empty from "../empty";
import { InputTags } from "../ui/input-tags";

type AllowedType = "Photo" | "Animated" | "Article" | "Iframe";

export const MakePostModal = () => {
  const { isOpen, close } = useModalInstance();
  const { ref, commandController } = useTextAreaMarkdownEditor({
    commandMap: {
      // word logic
      bold: boldCommand,
      code: codeCommand,
      italic: italicCommand,
      strikethrough: strikethroughCommand,

      // word complex
      image: imageCommand,
      link: linkCommand,

      // line logic
      headingLevel1: headingLevel1Command,
      headingLevel2: headingLevel2Command,
      headingLevel3: headingLevel3Command,
      headingLevel4: headingLevel4Command,
      headingLevel5: headingLevel5Command,
      headingLevel6: headingLevel6Command,
      quote: quoteCommand,

      // list
      orderedList: orderedListCommand,
      unorderedList: unorderedListCommand,
      checkedList: checkedListCommand,
    },
  });
  const { data: categories } = useSWR<{
    result: {
      id: string;
      name: string;
    }[];
  }>("/api/fetch/categories", (url: string) =>
    fetch(url).then((r) => r.json()),
  );

  const [type, setType] = useState<AllowedType>("Photo");

  const [selected, setSelected] = useState<string[]>([]);

  const fetcher = useFetcher<{
    error?: Record<string, any[]>;

    status?: string;
    message?: string;
    redirect?: string;
    fieldErrors?: FieldErrors<z.infer<typeof CreatePostSchema>>;
  }>();

  const [image, setImage] = useState("");

  const [iframe, setIframe] = useState("");
  const [video, setVideo] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const navigate = useNavigate();
  const isSubmitting = fetcher.state === "submitting";

  const { toast } = useToast();

  const result = fetcher.data;

  useEffect(() => {
    if (result && result?.status === "success") {
      setImage("");
      setVideo("");
      setIframe("");
      setSelected([]);
      toast({ title: String(result?.message) });

      if (result.redirect) navigate(result.redirect);
      close();
    }
  }, [fetcher.data]);

  // const lastResult = useActionData<typeof action>();

  const [form, fields] = useForm({
    // lastResult,

    // Reuse the validation logic on the client
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: CreatePostSchema,
      });
    },

    // Validate the form on blur event triggered
    shouldValidate: "onSubmit",
    shouldRevalidate: "onSubmit",
  });

  function handleChangeImage(e: any) {
    setImage(URL.createObjectURL(e?.target.files[0]));
  }

  function handleChangeVideo(e: any) {
    setVideo(URL.createObjectURL(e?.target.files[0]));
  }

  function handleChangeIframe(e: any) {
    setIframe(e?.target.value);
  }

  function handleChangeTags(e: string[]) {
    const tags = e?.filter((content: string) => {
      // remove special characters
      const string = accentsTidy(content);

      return string.length > 0;
    });

    setSelected(tags);
  }

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="flex size-full flex-col gap-0 overflow-hidden rounded-none p-0 tablet:max-h-[90vh] tablet:max-w-lg tablet:rounded-lg">
        <fetcher.Form
          id={form.id}
          onSubmit={form.onSubmit}
          method="post"
          action="/api/post/create"
          className={cn(
            `flex h-full flex-col justify-around gap-0 overflow-hidden`,
            isSubmitting && "opacity-50",
          )}
          encType="multipart/form-data"
        >
          <div
            id="scrollableElement"
            className="custom-scroll grid h-full flex-1 gap-3 overflow-auto p-6"
          >
            <DialogHeader className="flex w-full items-center justify-between p-0">
              <DialogTitle className="w-full text-xl font-bold">
                Utwórz swój post
              </DialogTitle>
              {/* <DialogDescription>Utwórz swój post</DialogDescription> */}
            </DialogHeader>

            <div className="mt-3 grid gap-3">
              <Label htmlFor="title">Tytuł</Label>
              <Input id="title" name="title" placeholder="Wprowadź tytuł" />
              {fields.title.errors && (
                <div className="text-sm text-destructive">
                  {fields.title.errors}
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="type">Kategoria</Label>

              <Select name="category">
                <SelectTrigger id="category" className="">
                  <SelectValue placeholder="Wybierz kategorie" />
                </SelectTrigger>
                <SelectContent className="max-h-56">
                  {categories?.result.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fields.category.errors && (
                <div className="text-sm text-destructive">
                  {fields.category.errors}
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="tags">Tagi</Label>

              <input type="hidden" name="tags" hidden value={selected} />

              <InputTags
                value={selected}
                onChange={(value) => handleChangeTags(value as string[])}
                placeholder="Wpisz tagi, oddzielając je przecinkami..."
                className="w-full"
              />

              {fetcher.data?.error?.tags?.[0] && (
                <div className="text-sm text-destructive">
                  {fetcher.data?.error?.tags?.[0]}
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="type">Typ</Label>
              <RadioGroup
                name="type"
                defaultValue={type}
                onValueChange={(v: AllowedType) => setType(v)}
                className="mb-0 grid grid-cols-2 gap-3 p-0"
              >
                <div>
                  <RadioGroupItem
                    value="Article"
                    id="Article"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="Article"
                    className={cn(
                      "m-px flex cursor-pointer flex-col items-center justify-between rounded-md border bg-popover p-4 transition-colors duration-150 hover:text-accent-foreground peer-data-[state=checked]:m-0 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon mb-3 size-6"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M3 4m0 2a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2z" />
                      <path d="M7 8h10" />
                      <path d="M7 12h10" />
                      <path d="M7 16h10" />
                    </svg>
                    Artykuł
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="Photo"
                    id="Photo"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="Photo"
                    className={cn(
                      "m-px flex cursor-pointer flex-col items-center justify-between rounded-md border bg-popover p-4 transition-colors duration-150 hover:text-accent-foreground peer-data-[state=checked]:m-0 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon mb-3 size-6"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M15 8h.01" />
                      <path d="M3 6a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v12a3 3 0 0 1 -3 3h-12a3 3 0 0 1 -3 -3v-12z" />
                      <path d="M3 16l5 -5c.928 -.893 2.072 -.893 3 0l5 5" />
                      <path d="M14 14l1 -1c.928 -.893 2.072 -.893 3 0l3 3" />
                    </svg>
                    {/* <Pickaxe className="mb-3 h-6 w-6" /> */}
                    Zdjęcie
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="Animated"
                    id="Animated"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="Animated"
                    className={cn(
                      "m-px flex cursor-pointer flex-col items-center justify-between rounded-md border bg-popover p-4 transition-colors duration-150 hover:text-accent-foreground peer-data-[state=checked]:m-0 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon mb-3 size-6"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M15 10l4.553 -2.276a1 1 0 0 1 1.447 .894v6.764a1 1 0 0 1 -1.447 .894l-4.553 -2.276v-4z" />
                      <path d="M3 6m0 2a2 2 0 0 1 2 -2h8a2 2 0 0 1 2 2v8a2 2 0 0 1 -2 2h-8a2 2 0 0 1 -2 -2z" />
                    </svg>
                    Film
                  </Label>
                </div>
                <div>
                  <RadioGroupItem
                    value="Iframe"
                    id="Iframe"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="Iframe"
                    className={cn(
                      "m-px flex cursor-pointer flex-col items-center justify-between rounded-md border bg-popover p-4 transition-colors duration-150 hover:text-accent-foreground peer-data-[state=checked]:m-0 peer-data-[state=checked]:border-2 peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary [&:has([data-state=checked])]:border-primary",
                    )}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="icon mb-3 size-6"
                    >
                      <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                      <path d="M2 8a4 4 0 0 1 4 -4h12a4 4 0 0 1 4 4v8a4 4 0 0 1 -4 4h-12a4 4 0 0 1 -4 -4v-8z" />
                      <path d="M10 9l5 3l-5 3z" />
                    </svg>
                    Iframe
                  </Label>
                </div>
              </RadioGroup>

              {fields.type.errors && (
                <div className="text-sm text-destructive">
                  {fields.type.errors}
                </div>
              )}
            </div>

            {type === "Photo" && (
              <div className="grid gap-3">
                <Label htmlFor="image">Obraz</Label>
                <Input
                  id="image"
                  name="image"
                  ref={imageInputRef}
                  placeholder="Wybierz obraz"
                  type="file"
                  accept="image/*"
                  hidden
                  className="hidden"
                  onChange={handleChangeImage}
                />
                {/* <input id="img-field" type="file" name="img" accept="image/*" /> */}

                {image ? (
                  <img
                    className="rounded-lg"
                    src={String(image)}
                    alt={image.toLowerCase()}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      imageInputRef.current?.click();
                    }}
                  >
                    <Empty icon={ImageIcon} title="Wybierz obraz" />
                  </button>
                )}
                {fields.image.errors && (
                  <div className="text-sm text-destructive">
                    {fields.image.errors}
                  </div>
                )}
              </div>
            )}

            {type === "Animated" && (
              <div className="grid gap-3">
                <Label htmlFor="image">Wideo</Label>
                <Input
                  id="image"
                  name="image"
                  placeholder="Wybierz film"
                  type="file"
                  ref={videoInputRef}
                  hidden
                  accept="video/*"
                  className="hidden"
                  onChange={handleChangeVideo}
                />
                {video ? (
                  <video
                    id="player2"
                    controls={true}
                    autoPlay={true}
                    muted
                    className="w-full rounded-lg"
                    src={String(video)}
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      videoInputRef.current?.click();
                    }}
                  >
                    <Empty icon={Video} title="Wybierz film" />
                  </button>
                )}
                {fields.image.errors && (
                  <div className="text-sm text-destructive">
                    {fields.image.errors}
                  </div>
                )}
              </div>
            )}

            {type === "Iframe" && (
              <div className="grid gap-3">
                <Label htmlFor="iframe">Iframe</Label>
                <Input
                  id="iframe"
                  name="iframe"
                  placeholder="Wprowadź adres url iframe"
                  onChange={handleChangeIframe}
                />
                {fields.iframe.errors && (
                  <div className="text-sm text-destructive">
                    {fields.iframe.errors}
                  </div>
                )}

                {fetcher.data?.error?.iframe?.[0] && (
                  <div className="text-sm text-destructive">
                    {fetcher.data?.error?.iframe?.[0]}
                  </div>
                )}
              </div>
            )}

            {type === "Article" && (
              <div className="grid gap-3">
                <Label htmlFor="content">Opis</Label>

                <div className="flex gap-x-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "gap-x-2",
                      )}
                    >
                      <Heading size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel1");
                        }}
                      >
                        <Heading1 size={16} />
                        Nagłówek H1
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel2");
                        }}
                      >
                        <Heading2 size={16} />
                        Nagłówek H2
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel3");
                        }}
                      >
                        <Heading3 size={16} />
                        Nagłówek H3
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel4");
                        }}
                      >
                        <Heading4 size={16} />
                        Nagłówek H4
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel5");
                        }}
                      >
                        <Heading5 size={16} />
                        Nagłówek H5
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("headingLevel6");
                        }}
                      >
                        <Heading6 size={16} />
                        Nagłówek H6
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("bold");
                    }}
                  >
                    <Bold size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("italic");
                    }}
                  >
                    <Italic size={16} />
                  </Button>

                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("image");
                    }}
                  >
                    <ImageUp size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("link");
                    }}
                  >
                    <Link size={16} />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("quote");
                    }}
                  >
                    <Quote size={16} />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={cn(
                        buttonVariants({ variant: "outline", size: "icon" }),
                        "gap-x-2",
                      )}
                    >
                      <LayoutList size={16} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("orderedList");
                        }}
                      >
                        <ListOrdered size={16} />
                        orderedList
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("unorderedList");
                        }}
                      >
                        <List size={16} />
                        unorderedList
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-x-2"
                        onClick={() => {
                          commandController.executeCommand("checkedList");
                        }}
                      >
                        <ListChecks size={16} />
                        checkedList
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {/* <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => {
                      commandController.executeCommand("code");
                    }}
                  >
                    <Code size={16} />
                  </Button> */}
                </div>

                <Textarea
                  ref={ref}
                  id="content"
                  name="content"
                  placeholder="Wprowadź opis"
                  rows={7}
                />
                {fields.content.errors && (
                  <div className="text-sm text-destructive">
                    {fields.content.errors}
                  </div>
                )}
              </div>
            )}

            {fetcher.data?.error?.image?.[0] && (
              <div className="text-sm text-destructive">
                {fetcher.data?.error?.image?.[0]}
              </div>
            )}

            <div className="flex items-center gap-x-3">
              <Switch id="sensitive-mode" name="sensitive" />
              <Label htmlFor="sensitive-mode">
                Post jest drastyczny, zawiera nagość, etc.
              </Label>
            </div>

            <DialogFooter className="pt-3 tablet:justify-start">
              <Button type="submit">
                Utwórz post
                {isSubmitting ? <Loader className="ml-3 size-[16px]" /> : <></>}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" type="reset">
                  Anuluj
                </Button>
              </DialogClose>
            </DialogFooter>
          </div>
        </fetcher.Form>
      </DialogContent>
    </Dialog>
  );
};

// export default CreatePostModal;
