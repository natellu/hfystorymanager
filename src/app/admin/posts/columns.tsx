"use client"
import { Checkbox } from "@/components/ui/Checkbox"
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
        accessorKey: "sorted",
        header: "Sorted"
    },
    {
        accessorKey: "title",
        header: "Title"
    },

    {
        accessorKey: "Story.title",
        header: "Story"
    },
    {
        accessorKey: "chapter",
        header: "Chapter"
    }
]
