/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { NavLink, useFetcher, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

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
import { TrashIcon } from "@/components/icons";
import { formattedDate } from "@/helpers/misc";
import type { Prisma } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export async function loader() {
  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    include: {
      _count: {
        select: {
          votes: true,
          posts: true,
          comments: {
            where: {
              NOT: {
                postId: null,
              },
            },
          },
        },
      },
    },
  });

  return json({ users });
}

export default function Posts() {
  const data = useLoaderData<typeof loader>();
  const { toast } = useToast();

  const fetcher = useFetcher<{
    status?: string | boolean;
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
    Prisma.UserGetPayload<{
      include: {
        _count: true;
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
            to={`/user/${row.original.username}`}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex space-x-2">
              <Tooltip>
                <TooltipTrigger>
                  <Avatar className="size-9">
                    {/* @ts-expect-error */}
                    <AvatarImage src={row.original.image} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                </TooltipTrigger>
                <TooltipContent>
                  <p>
                    {row.original.first_name} {row.original.last_name}
                  </p>
                </TooltipContent>
              </Tooltip>

              <div className="flex flex-col">
                <span>
                  {row.original.first_name} {row.original.last_name}
                </span>
                <p className="text-xs">{row.original.email}</p>
              </div>
            </div>
          </NavLink>
        );
      },
    },

    {
      accessorKey: "activity",
      enableHiding: false,
      enableSorting: false,
      sortingFn: (rowA, rowB) => {
        return rowA.original._count.posts - rowB.original._count.posts; //-1, 0, or 1 - access any row data using rowA.original and rowB.original
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Aktywność" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Badge variant="outline" className="truncate">
              {row.original.ip ?? "localhost"} ::{" "}
              {formattedDate(
                String(row.original.loginAt ?? row.original.createdAt),
              )}
            </Badge>
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
      accessorKey: "posts",
      enableHiding: false,
      sortingFn: (rowA, rowB) => {
        return rowA.original._count.posts - rowB.original._count.posts; //-1, 0, or 1 - access any row data using rowA.original and rowB.original
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Posty" />
      ),
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/user/@${row.original.username}/posts`}
            target="_blank"
            className="flex space-x-2"
            rel="noreferrer"
          >
            <Badge variant="outline" className="truncate">
              {row.original._count.posts} postów
            </Badge>
          </NavLink>
        );
      },
    },
    {
      accessorKey: "comments",
      enableHiding: false,
      sortingFn: (rowA, rowB) => {
        return rowA.original._count.comments - rowB.original._count.comments; //-1, 0, or 1 - access any row data using rowA.original and rowB.original
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Kamentarze" />
      ),
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/user/@${row.original.username}/comments`}
            target="_blank"
            className="flex space-x-2"
            rel="noreferrer"
          >
            <Badge variant="outline" className="truncate">
              {row.original._count.comments} komentarzy
            </Badge>
          </NavLink>
        );
      },
    },
    {
      accessorKey: "votes",
      enableHiding: false,
      sortingFn: (rowA, rowB) => {
        return rowA.original._count.votes - rowB.original._count.votes; //-1, 0, or 1 - access any row data using rowA.original and rowB.original
      },
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Oceny" />
      ),
      cell: ({ row }) => {
        return (
          <NavLink
            to={`/user/@${row.original.username}`}
            target="_blank"
            className="flex space-x-2"
            rel="noreferrer"
          >
            <Badge variant="outline" className="truncate">
              {row.original._count.votes} ocen
            </Badge>
          </NavLink>
        );
      },
    },
    {
      accessorKey: "verified",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/users/verify" method="PATCH">
                  <input type="hidden" name="user" value={row.original.id} />
                  {/* <DropdownMenuItem asChild> */}
                  <button type="submit" className="flex w-full items-center">
                    {fetcher.state === "submitting" &&
                    fetcher.formAction === "/api/users/verify" &&
                    fetcher.formData?.get("user") === row.original.id ? (
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
                        {row.original.verified
                          ? formattedDate(row.original.verified)
                          : "nagatywny"}
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
      filterFn: (row, id, value: boolean[]) => {
        return value.includes(row.original.verified === null ? false : true);
      },
    },
    {
      accessorKey: "emailVerified",
      enableSorting: true,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Weryfikacja email" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                {/* <Badge
                  variant="outline"
                  className={cn(
                    "rounded-lg",
                    row.original.emailVerified
                      ? "border-green-500 bg-green-500 text-white"
                      : "border-rose-400 bg-rose-400 text-white",
                  )}
                >
                  {row.original.emailVerified ? "pozytywny" : "nagatywny"}
                </Badge> */}

                <fetcher.Form action="/api/users/email/verify" method="PATCH">
                  <input type="hidden" name="user" value={row.original.id} />
                  {/* <DropdownMenuItem asChild> */}
                  <button type="submit" className="flex w-full items-center">
                    {fetcher.state === "submitting" &&
                    fetcher.formAction === "/api/users/email/verify" &&
                    fetcher.formData?.get("user") === row.original.id ? (
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
                      <Badge
                        variant="outline"
                        // className={cn(
                        //   "rounded-lg",
                        //   row.original.emailVerified
                        //     ? "border-green-500 bg-green-500 text-white"
                        //     : "border-rose-400 bg-rose-400 text-white",
                        // )}
                      >
                        {row.original.emailVerified
                          ? formattedDate(row.original.emailVerified)
                          : "nagatywny"}
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
      filterFn: (row, id, value: boolean[]) => {
        return value.includes(
          row.original.emailVerified === null ? false : true,
        );
      },
    },
    // {
    //   id: "actions",
    //   cell: ({ row }) => (
    //     <DropdownMenu>
    //       <DropdownMenuTrigger asChild>
    //         <Button
    //           variant="ghost"
    //           className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
    //         >
    //           <DotsHorizontalIcon className="h-4 w-4" />
    //           <span className="sr-only">Open menu</span>
    //         </Button>
    //       </DropdownMenuTrigger>
    //       <DropdownMenuContent align="end" className="min-w-[160px]">
    //         {/* <DropdownMenuItem>Edit</DropdownMenuItem> */}

    //         {/* <fetcher.Form action="/api/users/verify" method="PATCH">
    //           <input type="hidden" name="user" value={row.original.id} />
    //           <DropdownMenuItem asChild>
    //             <button type="submit" className="w-full">
    //               Aktualizuj status konta
    //             </button>
    //           </DropdownMenuItem>
    //         </fetcher.Form>
    //         <fetcher.Form action="/api/users/email/verify" method="PATCH">
    //           <input type="hidden" name="user" value={row.original.id} />
    //           <DropdownMenuItem asChild>
    //             <button type="submit" className="w-full">
    //               Aktualizuj status email
    //             </button>
    //           </DropdownMenuItem>
    //         </fetcher.Form> */}
    //         {/* <DropdownMenuItem>Make a copy</DropdownMenuItem>
    //       <DropdownMenuItem>Favorite</DropdownMenuItem>
    //       <DropdownMenuSeparator />

    //       <DropdownMenuSeparator />
    //       <DropdownMenuItem>
    //         Delete
    //         <DropdownMenuShortcut>⌘⌫</DropdownMenuShortcut>
    //       </DropdownMenuItem> */}
    //       </DropdownMenuContent>
    //     </DropdownMenu>
    //   ),
    // },

    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="flex space-x-2">
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/users/delete" method="DELETE">
                  <input type="hidden" name="user" value={row.original.id} />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/users/delete" &&
                      fetcher.formData?.get("user") === row.original.id
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
                <p>Usuń użytkownika</p>
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
          <h2 className="text-4xl font-extrabold">Użytkownicy</h2>
          {/* <p className="text-sm font-medium">Dashboard description</p> */}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y p-6 dark:divide-primary">
        {/* @ts-expect-error */}
        <DataTable data={data.users} columns={columns} />
      </div>
    </div>
  );
}
