/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { Link, NavLink, useFetcher, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { ShieldBan, ShieldCheck, SquareArrowOutUpRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
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

export async function loader() {
  const comments = await prisma.comment.findMany({
    include: {
      post: true,
      user: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ comments });
}

export default function Posts() {
  const data = useLoaderData<typeof loader>();
  const { toast } = useToast();

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
  }>();

  // useEffect(() => {
  //   if (fetcher.data && fetcher.data?.status === "success") {
  //     toast({ title: String(fetcher.data?.message) });
  //   }
  // }, [fetcher.data]);

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
    Prisma.CommentGetPayload<{
      include: {
        post: true;
        user: true;
      };
    }>
  >[] = [
    // {
    //   id: "select",
    //   header: ({ table }) => (
    //     <Checkbox
    //       checked={
    //         table.getIsAllPageRowsSelected() ||
    //         (table.getIsSomePageRowsSelected() && "indeterminate")
    //       }
    //       onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
    //       aria-label="Select all"
    //       className="translate-y-[2px]"
    //     />
    //   ),
    //   cell: ({ row }) => (
    //     <Checkbox
    //       checked={row.getIsSelected()}
    //       onCheckedChange={(value) => row.toggleSelected(!!value)}
    //       aria-label="Select row"
    //       className="translate-y-[2px]"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },
    {
      accessorKey: "user",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Autor" />
      ),
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/user/${row.original.user?.username}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="size-9">
                    {/* @ts-expect-error */}
                    <AvatarImage src={row.original.user?.image} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {row.original.user?.first_name}{" "}
                    {row.original.user?.last_name}
                  </p>
                </TooltipContent>
              </Tooltip>

              <div className="flex flex-col">
                <span>
                  {row.original.user?.first_name} {row.original.user?.last_name}
                </span>
                <p className="text-xs">{row.original.user?.email}</p>
              </div>
            </div>
          </NavLink>
        );
      },
    },
    {
      accessorKey: "comment",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Komentarz" />
      ),
      cell: ({ row }) => {
        return (
          <div className="grid gap-2">
            <HoverCard>
              <HoverCardTrigger>
                <p className="max-w-[350px] truncate font-medium">podgląd</p>
              </HoverCardTrigger>
              <HoverCardContent className="min-w-[500px] max-w-[850px] font-medium">
                <ReactMarkdown className="prose">
                  {row.original.content}
                </ReactMarkdown>
              </HoverCardContent>
            </HoverCard>
            {/* <p className="max-w-[350px] truncate font-medium">
              {row.original.title}
            </p> */}
            {/* <p className="max-w-[250px] truncate font-medium">
              {row.original.description}
            </p> */}
          </div>
        );
      },
    },

    {
      id: "post",
      enableSorting: false,
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Post" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Link
              to={`/feed/${row.original.post?.slug}`}
              target="_blank"
              className="flex max-w-[250px] items-center truncate font-medium"
              rel="noreferrer"
            >
              <SquareArrowOutUpRight size={16} className="me-3 inline-flex" />
              Podgląd
            </Link>
          </div>
        );
      },
    },
    //   {
    //     accessorKey: "type",
    //     header: ({ column }) => (
    //       <DataTableColumnHeader column={column} title="Typ" />
    //     ),
    //     cell: ({ row }) => {
    //       return (
    //         <div className="flex space-x-2">
    //           <Badge variant="outline">{row.original.type}</Badge>
    //         </div>
    //       );
    //     },
    //     filterFn: (row, id, value: string[]) => {
    //       return value.includes(row.getValue(id));
    //     },
    //   },

    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/comment/verify" method="POST">
                  <input type="hidden" name="comment" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/comment/verify" &&
                      fetcher.formData?.get("comment") === row.original.id
                        ? true
                        : false
                    }
                  >
                    {row.original?.active ? (
                      <ShieldBan size={16} className="stroke-rose-400" />
                    ) : (
                      <ShieldCheck size={16} />
                    )}
                    {/* <Ban size={16} className="stroke-rose-400" /> */}
                  </Button>
                </fetcher.Form>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>
                  {row.original?.active ? "Zablokuj" : "Odblokuj"} komentarz
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/comment/delete" method="DELETE">
                  <input type="hidden" name="comment" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/comment/delete" &&
                      fetcher.formData?.get("comment") === row.original.id
                        ? true
                        : false
                    }
                  >
                    {/* <Trash size={16} className="stroke-rose-400" /> */}
                    <TrashIcon
                      width={16}
                      height={16}
                      className="stroke-rose-400"
                    />
                  </Button>
                </fetcher.Form>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Usuń komentarz</p>
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
          <h2 className="text-4xl font-extrabold">Komentarze</h2>
          {/* <p className="text-sm font-medium">Dashboard description</p> */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y p-6 dark:divide-primary">
        {/* @ts-expect-error */}
        <DataTable data={data.comments} columns={columns} />
      </div>
    </div>
  );
}
