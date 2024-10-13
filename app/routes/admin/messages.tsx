import { useEffect } from "react";
import { json } from "@remix-run/node";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { useFetcher, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

import {
  Button,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
  Loader,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "@fleak-org/ui";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { TrashIcon } from "@/components/icons";
import type { Prisma } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();

  const exists = await prisma.messages.findFirst({
    where: {
      id: String(formData.get("message")),
    },
  });

  if (!exists) {
    return json(
      {
        message: `Wiadomość nie istnieje!`,
        status: "success",
      },
      { status: 300 },
    );
  }

  await prisma.messages.delete({
    where: {
      id: String(formData.get("message")),
    },
  });

  return json(
    {
      message: `Wiadomość została usunięta!`,
      status: "success",
    },
    { status: 300 },
  );
}

export async function loader({ request }: LoaderFunctionArgs) {
  const messages = await prisma.messages.findMany();

  return json({ messages });
}

export default function Posts() {
  const data = useLoaderData<typeof loader>();
  const { toast } = useToast();

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
  }>();

  let toastInstance = {} as {
    id: string;
    dismiss: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    update: (props: any) => void;
  };

  useEffect(() => {
    if (fetcher.state !== "idle") {
      toastInstance = toast({
        title: (
          <div className="flex gap-x-3">
            <Loader variant="dark" /> <span>Wykonywanie operacji...</span>
          </div>
        ),
      });
    }
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === "success") {
      toastInstance &&
        toastInstance.update({
          title: String(fetcher.data?.message),
        });
    }
  }, [fetcher.data]);

  const columns: ColumnDef<
    Prisma.MessagesGetPayload<{
      select: {
        id: true;
        email: true;
        first_name: true;
        last_name: true;
        phone: true;
        message: true;
        createdAt: true;
      };
    }>
  >[] = [
    {
      accessorKey: "reason",
      enableHiding: false,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Wysyłający" />
      ),
      cell: ({ row }) => {
        return (
          <div className="grid w-full gap-2">
            <p className="truncate font-medium">
              {row.original.first_name} {row.original.last_name}
            </p>
            <a
              href={`mailto:${row.original.email}`}
              className="truncate font-medium"
            >
              {row.original.email}
            </a>
            <a
              href={`tel:${row.original.phone}`}
              className="truncate font-medium"
            >
              T: {row.original.phone}
            </a>
          </div>
        );
      },
    },
    {
      accessorKey: "message",
      enableHiding: false,
      enableSorting: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Wiadomość" />
      ),
      cell: ({ row }) => {
        return (
          <div className="grid gap-2">
            <HoverCard>
              <HoverCardTrigger>
                <p className="max-w-[350px] truncate font-medium">
                  {row.original.message.substring(0, 150)}
                </p>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="max-w-[250px] truncate font-medium">
                  {row.original.message}
                </p>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      },
    },
    {
      accessorKey: "createdAt",
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Wysłano" />
      ),
      cell: ({ row }) => {
        return (
          <div className="grid w-full gap-2">
            <p className="truncate font-medium">{row.original.createdAt}</p>
          </div>
        );
      },
    },

    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/admin/messages" method="DELETE">
                  <input type="hidden" name="message" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/messages" &&
                      fetcher.formData?.get("messages") === row.original.id
                        ? true
                        : false
                    }
                  >
                    <TrashIcon
                      width={16}
                      height={16}
                      className="stroke-rose-400"
                    />
                  </Button>
                </fetcher.Form>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Usuń zgłoszenie</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];

  return (
    <div className="h-full flex-1 flex-col divide-y">
      <div className="relative flex items-center gap-x-3 p-6">
        <div>
          <h2 className="text-4xl font-extrabold">Wiadomości</h2>
          {/* <p className="text-sm font-medium">Dashboard description</p> */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y p-6 dark:divide-primary">
        {/* @ts-expect-error */}
        <DataTable data={data.messages} columns={columns} />
      </div>
    </div>
  );
}
