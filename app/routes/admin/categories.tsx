/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from "react";
import { json } from "@remix-run/node";
import { Outlet, useFetcher, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";

import { useModal } from "@fleak-org/react-modals";
import {
  Avatar,
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
import { EditIcon, TrashIcon } from "@/components/icons";
import type { Prisma } from "@/services/db.server";
import { prisma } from "@/services/db.server";

export async function loader() {
  const categories = await prisma.category.findMany({
    include: {
      _count: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return json({ categories });
}

// export async function action({ request }: ActionFunctionArgs) {
//   return json({});
// }

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

  const { open: openCreateCategory } = useModal("create.category");
  const { open: openEditCategory } = useModal("edit.category");

  const columns: ColumnDef<
    Prisma.CategoryGetPayload<{
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
    //       value={row.original.id}
    //       className="translate-y-[2px]"
    //     />
    //   ),
    //   enableSorting: false,
    //   enableHiding: false,
    // },

    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tytuł" />
      ),
      cell: ({ row }) => {
        return (
          <div className="flex items-center space-x-2">
            <Avatar className="size-8">
              {/* @ts-expect-error  */}
              <AvatarImage src={row.original.image} />
              {/* <AvatarFallback>CN</AvatarFallback> */}
            </Avatar>
            <div className="flex flex-col">
              <span className="max-w-[150px] truncate font-medium">
                {row.original.name} ({row.original._count.post} postów)
              </span>
              <span className="max-w-[150px] truncate text-xs font-medium">
                {row.original.description}
              </span>
            </div>
          </div>
        );
      },
      filterFn: (row, id, value: string[]) => {
        return value.includes(row.original.name);
      },
      enableSorting: false,
      enableHiding: false,
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
                <fetcher.Form action="/api/category/verify" method="PATCH">
                  <input
                    type="hidden"
                    name="category"
                    value={row.original.id}
                  />
                  {/* <DropdownMenuItem asChild> */}
                  <button type="submit" className="flex w-full items-center">
                    {fetcher.state === "submitting" &&
                    fetcher.formAction === "/api/category/verify" &&
                    fetcher.formData?.get("category") === row.original.id ? (
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
      filterFn: (row, id, value: boolean[]) => {
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
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex w-full items-center"
                  type="button"
                  onClick={() => openEditCategory(row.original)}
                >
                  <EditIcon width={16} height={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>edytuj kategorię</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <fetcher.Form action="/api/category/delete" method="DELETE">
                  <input
                    type="hidden"
                    name="category"
                    value={row.original.id}
                  />

                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="flex w-full items-center"
                    disabled={
                      fetcher.state === "submitting" &&
                      fetcher.formAction === "/api/category/delete" &&
                      fetcher.formData?.get("category") === row.original.id
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
                <p>Usuń kategorie</p>
              </TooltipContent>
            </Tooltip>
          </div>
        );
      },
    },
  ];
  return (
    <div className="h-full flex-1 flex-col divide-y">
      <div className="relative flex items-center justify-between gap-x-3 p-6">
        <div>
          <h2 className="text-4xl font-extrabold">Kategorie</h2>
          {/* <p className="text-sm font-medium">Dashboard description</p> */}
        </div>

        <Button variant="secondary" onClick={openCreateCategory}>
          Dodaj
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-0 divide-y p-6 dark:divide-primary">
        <DataTable
          data={data.categories}
          columns={columns}
          bulkDeleteUrl="/api/category/deleteMany"
        />
      </div>
      <Outlet />
    </div>
  );
}
