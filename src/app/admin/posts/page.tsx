"use client"
import { DataTable } from "@/components/ui/table/DataTable"

import { Checkbox } from "@/components/ui/Checkbox"
import PopoverStoryEdit from "@/components/ui/popovers/PopoverStoryEdit"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/table/DataTableRowActions"
import { sorted } from "@/components/ui/table/data/Data"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import PopoverChapterEdit from "@/components/ui/popovers/PopoverChapterEdit"
import PopoverTitleEdit from "@/components/ui/popovers/PopoverTitleEdit"
import { ExtendedPost } from "@/types/db"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

interface pageProps {}

//todo incremental loading
//todo delete

const page = () => {
    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            const query = `/api/posts`

            const { data } = await axios.get(query)
            setPostData(data)
            return data
        },
        queryKey: ["query-all-posts"]
    })

    const [postData, setPostData] = useState<ExtendedPost[]>(data)

    const columns: ColumnDef<ExtendedPost>[] = useMemo(
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
                        <PopoverTitleEdit
                            row={row}
                            title={row.original.title}
                            id={row.original.id}
                            data={postData}
                            setData={setPostData}
                        />
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
                        (sortedStatus) =>
                            sortedStatus.value === row.getValue("sorted")
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
                    return (
                        <DataTableColumnHeader column={column} title="Story" />
                    )
                },
                cell: ({ row }) => {
                    return (
                        <PopoverStoryEdit
                            row={row}
                            storyId={row.original.storyId}
                            id={row.original.id}
                            postData={postData}
                            setPostData={setPostData}
                        />
                    )
                }
            },
            {
                accessorKey: "chapter",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Chapter" />
                ),
                cell: ({ row }) => {
                    console.log(row.getValue("chapter"))
                    return (
                        <PopoverChapterEdit
                            row={row}
                            chapter={row.original.chapter}
                            id={row.original.id}
                            postData={postData}
                            setPostData={setPostData}
                        />
                    )
                }
            },
            {
                id: "actions",
                cell: ({ row }) => (
                    <DataTableRowActions
                        data={postData}
                        setData={setPostData}
                    />
                )
            }
        ],
        [postData]
    )

    if (!postData) return <div>Loading</div>

    return (
        <div className="container mx-auto py-10">
            {postData ? <DataTable columns={columns} data={postData} /> : null}
        </div>
    )
}

export default page
