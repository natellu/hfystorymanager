"use client"

import { Table } from "@tanstack/react-table"
import { CrossIcon } from "lucide-react"

import CreatePost from "@/components/CreatePost"
import CreateStory from "@/components/CreateStory"
import { sorted } from "@/components/ui/table/data/Data"
import { TableType } from "@/types/table"
import { Button } from "../Button"
import { Input } from "../Input"
import { DataTableFacetedFilter } from "./DataTableFacetedFilter"
import { DataTableViewOptions } from "./DataTableViewOptions"

interface DataTableToolbarProps<TData> {
    table: Table<TData>
    tableType?: TableType
    refetchData?: () => void
}

export function DataTableToolbar<TData>({
    table,
    tableType,
    refetchData
}: DataTableToolbarProps<TData>) {
    const isFiltered = table.getState().columnFilters.length > 0

    return (
        <div className="flex items-center justify-between gap-4">
            <div className="flex flex-1 items-center space-x-2">
                <Input
                    placeholder="Filter posts..."
                    value={
                        (table
                            .getColumn("title")
                            ?.getFilterValue() as string) ?? ""
                    }
                    onChange={(event) =>
                        table
                            .getColumn("title")
                            ?.setFilterValue(event.target.value)
                    }
                    className="h-8 w-[150px] lg:w-[250px]"
                />
                {table.getColumn("sorted") && (
                    <DataTableFacetedFilter
                        column={table.getColumn("sorted")}
                        title="Sorted"
                        options={sorted}
                    />
                )}

                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={() => table.resetColumnFilters()}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <CrossIcon className="ml-2 h-4 w-4" />
                    </Button>
                )}
            </div>
            {/* Todo: ??????? own component? */}
            {tableType === TableType.STORIES ? (
                <CreateStory refetchData={refetchData} />
            ) : (
                <>
                    {tableType === TableType.POSTS ? (
                        <CreatePost refetchData={refetchData} />
                    ) : null}
                </>
            )}
            <DataTableViewOptions table={table} />
        </div>
    )
}
