/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect } from "react";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useFetcher } from "@remix-run/react";
import type { Table } from "@tanstack/react-table";
import {
  BadgeCheck,
  Bomb,
  LockKeyhole,
  MailCheck,
  Videotape,
} from "lucide-react";

import { Button, Input, useToast } from "@fleak-org/ui";

import { StickyHeader } from "../sticky-header";
import { actives, priorities, statuses, types } from "./data";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";
import { DataTableViewOptions } from "./data-table-view-options";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  bulkDeleteUrl?: string;
}

export function DataTableToolbar<TData>({
  table,
  bulkDeleteUrl,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;
  const { toast } = useToast();

  const fetcher = useFetcher<{
    status?: string;
    message?: string;
  }>();

  useEffect(() => {
    if (fetcher.data && fetcher.data?.status === "success") {
      toast({ title: String(fetcher.data?.message) });
    }
  }, [fetcher.data]);

  return (
    <StickyHeader
      offset={70}
      className="sticky top-[70px] -mx-6 bg-white/75 p-4 px-6 shadow-sm backdrop-blur transition-all duration-100"
    >
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-1 items-center space-x-2">
          <Input
            placeholder="Wyszukaj..."
            value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
            onChange={(event) =>
              table.getColumn("title")?.setFilterValue(event.target.value)
            }
            className="h-8 w-[150px] lg:w-[250px]"
          />
          {table.getColumn("status") && (
            <DataTableFacetedFilter
              column={table.getColumn("status")}
              title="Status"
              options={statuses}
            />
          )}
          {table.getColumn("priority") && (
            <DataTableFacetedFilter
              column={table.getColumn("priority")}
              title="Priority"
              options={priorities}
            />
          )}
          {table.getColumn("type") && (
            <DataTableFacetedFilter
              column={table.getColumn("type")}
              title="Typ"
              options={types}
              icon={Videotape}
            />
          )}
          {table.getColumn("active") && (
            <DataTableFacetedFilter
              column={table.getColumn("active")}
              title="Status"
              // @ts-expect-error
              options={actives}
              icon={LockKeyhole}
            />
          )}
          {table.getColumn("verified") && (
            <DataTableFacetedFilter
              column={table.getColumn("verified")}
              title="Status"
              // @ts-expect-error
              options={actives}
              icon={BadgeCheck}
            />
          )}
          {table.getColumn("emailVerified") && (
            <DataTableFacetedFilter
              column={table.getColumn("emailVerified")}
              title="Weryfikacja email"
              // @ts-expect-error
              options={actives}
              icon={MailCheck}
            />
          )}
          {isFiltered && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="ml-auto h-8 px-2 lg:px-3"
            >
              Resetuj filtry
              <Cross2Icon className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>

        {bulkDeleteUrl &&
          table.getFilteredSelectedRowModel().rows.length > 0 && (
            <fetcher.Form
              action={bulkDeleteUrl}
              method="DELETE"
              className="mr-2"
            >
              <input
                type="hidden"
                name="items"
                value={table
                  .getFilteredSelectedRowModel()
                  .rows.map((e) => e.getValue("id"))}
              />

              <Button
                type="submit"
                variant="destructive"
                size="sm"
                className="flex h-8 w-full items-center gap-2 px-2"
                disabled={
                  fetcher.state === "submitting" &&
                  fetcher.formAction === bulkDeleteUrl
                    ? true
                    : false
                }
              >
                <Bomb size={16} className="stroke-white opacity-100" /> Usuń (
                {table.getFilteredSelectedRowModel().rows.length} rekordów)
              </Button>
            </fetcher.Form>
          )}

        <DataTableViewOptions table={table} />
      </div>
    </StickyHeader>
  );
}
