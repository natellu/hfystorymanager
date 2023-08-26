"use client"
import { Checkbox } from "@/components/ui/Checkbox"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/Popover"
import PopoverChaptersEdit from "@/components/ui/PopoverChaptersEdit"
import PopoverTitleEdit from "@/components/ui/PopoverTitleEdit"
import { DataTable } from "@/components/ui/table/DataTable"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/table/DataTableRowActions"
import { ExtendedStory } from "@/types/db"
import { TableType } from "@/types/table"
import { useQuery } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import axios from "axios"
import { FC, useMemo, useState } from "react"

interface pageProps {}

const page: FC<pageProps> = ({}) => {
    const { data, refetch } = useQuery({
        queryFn: async () => {
            const query = "/api/stories/all"
            const { data } = await axios.get(query)
            setStoriesData(data)
            return data
        },
        queryKey: ["query-all-stories"]
    })

    const [storiesData, setStoriesData] = useState<ExtendedStory[]>(data)

    const columns: ColumnDef<ExtendedStory>[] = useMemo(
        () => [
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
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="flex space-x-2">
                                    <span className="max-w-[500px] truncate font-medium">
                                        {row.getValue("title")}
                                    </span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[500px]">
                                <PopoverTitleEdit
                                    title={row.original.title}
                                    id={row.original.id}
                                    data={storiesData}
                                    setData={setStoriesData}
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }
            },
            {
                accessorKey: "chapters",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Chapters" />
                ),
                cell: ({ row }) => {
                    return (
                        <Popover>
                            <PopoverTrigger asChild>
                                <div className="flex space-x-2 p-4">
                                    <span className="max-w-[500px] truncate font-medium">
                                        {row.original.chapters.length}
                                    </span>
                                </div>
                            </PopoverTrigger>
                            <PopoverContent className="w-[500px]">
                                <PopoverChaptersEdit
                                    chapters={row.original.chapters}
                                    id={row.original.id}
                                    data={storiesData}
                                    setData={setStoriesData}
                                />
                            </PopoverContent>
                        </Popover>
                    )
                }
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <DataTableRowActions
                        id={row.original.id}
                        isStory={true}
                        data={storiesData}
                        setData={setStoriesData}
                    />
                )
            }
        ],
        [storiesData]
    )

    return (
        <div className="container mx-auto py-10 p-4">
            {storiesData ? (
                <DataTable
                    columns={columns}
                    data={storiesData}
                    tableType={TableType.STORIES}
                    refetchData={refetch}
                />
            ) : null}
        </div>
    )
}

export default page
