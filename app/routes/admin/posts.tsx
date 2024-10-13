import { useEffect } from "react";
import { json } from "@remix-run/node";
import { Link, useFetcher, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { SquareArrowOutUpRight } from "lucide-react";

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  Badge,
  Button,
  cn,
  Loader,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useToast,
} from "@fleak-org/ui";

import { DataTable } from "@/components/data-table/data-table";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { MaskIcon, TrashIcon } from "@/components/icons";
import type { Prisma } from "@/services/db.server";
import { prisma } from "@/services/db.server";

// const { open: openUpdatePostModal } = useModal("update.post");

export async function loader() {
  const posts = await prisma.post.findMany({
    include: {
      category: true,
      user: true,
      tags: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return json({ posts });
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
    Prisma.PostGetPayload<{
      include: {
        category: true;
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
          <Link
            to={`/user/${row.original.user?.username}`}
            target="_blank"
            rel="noreferrer"
          >
            {/* <SquareArrowOutUpRight size={16} className="me-3 inline-flex" /> */}
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
              <div>
                <h4>
                  {row.original.user?.first_name} {row.original.user?.last_name}
                </h4>
                <p className="text-xs">{row.original.user?.email}</p>
              </div>
              {/* <Avatar>
            <AvatarImage src={row.original.user?.image} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <Badge variant="outline">{row.original.user?.first_name}</Badge> */}
            </div>
          </Link>
        );
      },
    },
    {
      accessorKey: "title",
      enableHiding: false,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tytuł" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Link
              to={`/feed/${row.original.slug}`}
              target="_blank"
              className="max-w-[250px] truncate font-medium"
              rel="noreferrer"
            >
              <SquareArrowOutUpRight size={16} className="me-3 inline-flex" />
              {row.getValue("title")}
            </Link>
          </div>
        );
      },
    },

    {
      accessorKey: "category",
      sortingFn: (rowA, rowB) => {
        return String(rowA.original.category?.name) >
          String(rowB.original.category?.name)
          ? 1
          : -1;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kategoria" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Badge variant="outline" className="truncate">
              {row.original.category?.name}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "type",
      sortingFn: (rowA, rowB) => {
        return rowA.original.type > rowB.original.type ? 1 : -1;
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Typ" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Badge variant="outline" className="truncate">
              {row.original.type}
            </Badge>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.getValue(id));
      },
    },

    {
      accessorKey: "active",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/post/verify" method="PATCH">
                  <input type="hidden" name="post" value={row.original.id} />
                  {/* <DropdownMenuItem asChild> */}
                  <button type="submit" className="flex w-full items-center">
                    {fetcher.state === "submitting" &&
                    fetcher.formAction === "/api/post/verify" &&
                    fetcher.formData?.get("post") === row.original.id ? (
                      <div
                        className={cn(
                          "lds-ellipsis -top-3/4 h-[20px] -translate-y-3/4 scale-[50%]",
                        )}
                      >
                        <div></div>
                        <div></div>
                        <div></div>
                        <div></div>
                      </div>
                    ) : (
                      <Badge variant="outline" className="truncate">
                        {row.original.active ? "aktywny" : "nagatywny"}
                      </Badge>
                    )}
                  </button>
                  {/* </DropdownMenuItem> */}
                </fetcher.Form>
              </TooltipTrigger>
              <TooltipContent>
                <p>Naciśnij aby zaktualizować status</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        // @ts-expect-error
        return value.includes(row.original.active);
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/post/sensitive" method="POST">
                  <input type="hidden" name="post" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/post/sensitive" &&
                      fetcher.formData?.get("post") === row.original.id
                        ? true
                        : false
                    }
                  >
                    <MaskIcon
                      width={16}
                      height={16}
                      className={
                        row.original.sensitive === true ? "stroke-rose-400" : ""
                      }
                    />
                  </Button>
                </fetcher.Form>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Wrażliwa treść</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/post/delete" method="DELETE">
                  <input type="hidden" name="post" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/post/delete" &&
                      fetcher.formData?.get("post") === row.original.id
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
                <p>Usuń post</p>
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
          <h2 className="text-4xl font-extrabold">Posty</h2>
          {/* <p className="text-sm font-medium">Dashboard description</p> */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y p-6 dark:divide-primary">
        {/*  @ts-expect-error  */}
        <DataTable data={data.posts} columns={columns} />
      </div>
    </div>
  );
}
