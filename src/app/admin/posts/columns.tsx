"use client"
import { Checkbox } from "@/components/ui/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/table/DataTableRowActions"
import { sorted } from "@/components/ui/table/data/Data"

import { ExtendedPost } from "@/types/db"
import { ColumnDef } from "@tanstack/react-table"

export const columns: ColumnDef<ExtendedPost>[] = [
    {
        id: "select",
        header: ({ table }) => (
            <Checkbox
                checked={table.getIsAllPageRowsSelected()}
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
                className="translate-y-[2px]"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
                className="translate-y-[2px]"
            />
        ),
        enableSorting: false,
        enableHiding: false
    },
    {
        accessorKey: "title",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("title")}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "sorted",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Sorted" />
        ),
        cell: ({ row }) => {
            const sortedStatus = sorted.find(
                (sortedStatus) => sortedStatus.value === row.getValue("sorted")
            )

            if (!sortedStatus) {
                return null
            }

            return (
                <div className="flex items-center">
                    {sortedStatus.icon && (
                        <sortedStatus.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{sortedStatus.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        }
    },
    {
        accessorKey: "Story.title",
        header: ({ column }) => {
            return <DataTableColumnHeader column={column} title="Story" />
        },
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("Story_title")}
                    </span>
                </div>
            )
        }
    },
    {
        accessorKey: "chapter",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Chapter" />
        ),
        cell: ({ row }) => {
            return (
                <div className="flex space-x-2">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("chapter")}
                    </span>
                </div>
            )
        }
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />
    }
]
