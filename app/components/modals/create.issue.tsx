/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useLayoutEffect, useState } from "react";
import type { Post } from "@prisma/client";
import { useFetcher } from "@remix-run/react";
import { Check, ChevronsUpDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { z } from "zod";

import { useModalInstance } from "@fleak-org/react-modals";
import type { FieldErrors } from "@fleak-org/remix-utils";
import {
  Button,
  cn,
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Input,
  Label,
  Loader,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  Textarea,
  useToast,
} from "@fleak-org/ui";

import type { issueSchema } from "@/routes/api/issue/create";

export const CreateIssue = () => {
  const { data, isOpen, close } = useModalInstance<Partial<Post>>();
  const [fieldErrors, setErrors] =
    useState<FieldErrors<z.infer<typeof issueSchema>>>();

  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
    fieldErrors?: FieldErrors<z.infer<typeof issueSchema>>;
  }>();

  const { toast } = useToast();

  const result = fetcher.data;

  useLayoutEffect(() => {
    setErrors(undefined);
  }, [isOpen]);

  useEffect(() => {
    setErrors(result?.fieldErrors);

    if (result && result?.status === "success") {
      toast({ title: String(result?.message) });
      close();
    }
  }, [fetcher.data]);

  const reasons = [
    {
      description: `We remove:
- Clickbait
- Advertising
- Scam
- Script bot
`,
      value: "spam",
      label: "Spam",
    },
    {
      description: `We remove:
- Photos or videos of sexual intercourse
- Contents showing sexual intercourse, genitals or close-ups of fully-nude buttocks
`,
      value: "pornography",
      label: "Pornography",
    },
    {
      description: `We remove:
- Contents that contain credible threat
- Contents that target people to degrade or shame them
- Personal information shared to blackmail or harass
- Threats to post nude photo of you
`,
      value: "hatred-and-bullying",
      label: "hatred and bullying",
    },
    {
      description: `We remove contents encouraging or promoting self injury, which includes suicide, cutting and eating disorders. We may also remove contents identifying victims of self injury if the content attacks or makes fun of them.
`,
      value: "self-harm",
      label: "self harm",
    },
    {
      description: `We remove:
- Photos or videos of extreme graphic violence
- Contents that encourage violence or attack anyone based on their religious, ethnic or sexual background
- Specific threats of physical harm, theft, vandalism or financial harm
`,
      value: "violent-gory-and-harmful-content",
      label: "Violent, gory and harmful content",
    },
    {
      description: `We remove and may report to legal entity about:
- Photos or videos of sexual intercourse with children
- Contents of nude or partially nude children
`,
      value: "child-porn",
      label: "child porn",
    },
    {
      description: `We remove and may report to legal entity about:
- Contents promoting illegal activities, e.g. the use of hard drugs
- Contents intended to sell or distribute drugs
`,
      value: "illegal-activities",
      label: "illegal activities",
    },
    {
      description: `We remove:
- Purposefully fake or deceitful news
- Hoax disproved by a reputable source
`,
      value: "deceptive-content",
      label: "deceptive content",
    },
    //     {
    //       description: `We provides an online platform to allows users to upload and share images, videos, and other content. We take the rights of intellectual property owners very seriously and comply as a service provider with all applicable provisions of the United States Digital Millennium Copyright Act.

    // If you want to report content that you believe violates or infringes your copyright, please tap continue and fill out the 9GAG DMCA Copyright Infringement Notification form. Note that a report alleging infringement or violation of legal rights must come from the rights owner or someone authorized to report on their behalf (e.g. attorney, agent). If you are not the rights owner or their authorized representative, we will not be able to process your report.
    // `,
    //       value: "copyright and trademark infringement",
    //       label: "copyright and trademark infringement",
    //     },
    {
      description: `Report as incorrect tag to help us improve the quality.`,
      value: "incorrect-tag",
      label: "incorrect tag",
    },
  ];

  return (
    <Sheet open={isOpen} onOpenChange={close}>
      <SheetContent className="flex flex-col gap-0 overflow-hidden p-0">
        <SheetHeader className="p-6 pb-0">
          <SheetTitle>Zgłoś problem {fetcher.data?.status}</SheetTitle>
          <SheetDescription>Opisz nam napotkany problem.</SheetDescription>
        </SheetHeader>

        <fetcher.Form
          method="post"
          action="/api/issue/create"
          className={cn(
            `flex h-full flex-col justify-around gap-0 overflow-hidden`,
            fetcher.state !== "idle" && "opacity-50",
          )}
        >
          {/* <div className="h-full flex-1"> </div> */}
          <input type="hidden" name="post" value={data.id} />

          <div className="custom-scroll flex h-full flex-1 flex-col gap-3 overflow-auto p-6">
            <div className="grid gap-3">
              <Label htmlFor="title">Tytuł raportu o problemie</Label>
              <Input
                id="title"
                name="title"
                placeholder="Tytuł raportu o problemie"
                defaultValue={`Zgłoszenie dotyczące postu ID:${data.id}`}
              />

              {fieldErrors?.title && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.title?.join(", ")}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="reason">Powód zgłoszenia</Label>

              <input type="hidden" name="reason" value={value} />

              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    id="reason"
                    aria-expanded={open}
                    className="w-full justify-between hover:bg-transparent aria-[expanded=true]:outline-none aria-[expanded=true]:ring-2 aria-[expanded=true]:ring-ring"
                  >
                    {value
                      ? reasons.find((reason) => reason.value === value)?.label
                      : "Wybierz powód..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full min-w-full p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Wyszukaj powód..." />
                    <CommandList className="custom-scroll max-h-[250px] overflow-auto">
                      <CommandEmpty>No found reason.</CommandEmpty>
                      <CommandGroup className="w-full">
                        {reasons.map((reason) => (
                          <HoverCard key={reason.value}>
                            <HoverCardContent side="left" align="start">
                              <div className="grid gap-2">
                                <h4 className="font-medium capitalize leading-none">
                                  {reason.label}
                                </h4>
                                <div className="prose text-sm text-muted-foreground">
                                  <ReactMarkdown>
                                    {reason.description}
                                  </ReactMarkdown>
                                </div>
                              </div>
                            </HoverCardContent>

                            <HoverCardTrigger asChild>
                              <CommandItem
                                key={reason.value}
                                value={reason.value}
                                onSelect={(currentValue) => {
                                  setValue(
                                    currentValue === value ? "" : currentValue,
                                  );
                                  setOpen(false);
                                }}
                                className="capitalize"
                              >
                                <Check
                                  className={cn(
                                    "absolute right-0 mr-2 h-4 w-4",
                                    value === reason.value
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                {reason.label}
                              </CommandItem>
                            </HoverCardTrigger>
                          </HoverCard>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>

              {fieldErrors?.reason && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.reason?.join(", ")}
                </p>
              )}
            </div>

            <div className="grid gap-3">
              <Label htmlFor="description">Uzasadnienie</Label>

              <Textarea
                id="description"
                name="description"
                placeholder="Uzasadnij zgłoszenie"
                rows={5}
              />

              {fieldErrors?.description && (
                <p className="text-sm text-destructive">
                  {fieldErrors?.description.join(", ")}
                </p>
              )}

              <p className="text-sm text-muted-foreground">
                Uzasadnij napotkany problem, pamiętaj, że im więcej szczegółów
                podasz, tym szybciej będziemy mogli go rozwiązać.
              </p>
            </div>
          </div>

          <SheetFooter className="p-6 tablet:justify-start">
            <Button type="submit">
              Wyślij zgłoszenie
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
