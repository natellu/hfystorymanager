"use client"
import { DataTable } from "@/components/ui/table/DataTable"

import { Checkbox } from "@/components/ui/Checkbox"
import { DataTableColumnHeader } from "@/components/ui/table/DataTableColumnHeader"
import { DataTableRowActions } from "@/components/ui/table/DataTableRowActions"
import { sorted } from "@/components/ui/table/data/Data"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"

import PostEdit from "@/components/PostEdit"
import { ExtendedPost } from "@/types/db"
import { TableType } from "@/types/table"
import { ColumnDef } from "@tanstack/react-table"
import { useMemo, useState } from "react"

interface pageProps {}

//todo incremental loading
//todo delete

const Page = () => {
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
                    const trigger = (
                        <div className="flex space-x-2 cursor-pointer">
                            <span className="max-w-[500px] truncate font-medium">
                                {row.getValue("title")}
                            </span>
                        </div>
                    )
                    return (
                        <PostEdit
                            row={row}
                            trigger={trigger}
                            postData={postData}
                            setPostData={setPostData}
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
                    const trigger = (
                        <div
                            className={
                                !row.getValue("Story_title")
                                    ? "-m-4 p-4 cursor-pointer border-red-400 border-[1px] max-w-[300px] truncate font-medium"
                                    : "-m-4 p-4 cursor-pointer max-w-[300px] truncate font-medium "
                            }
                        >
                            {row.getValue("Story_title")}
                        </div>
                    )
                    return (
                        <PostEdit
                            row={row}
                            trigger={trigger}
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
                    const trigger = (
                        <div
                            className={
                                row.getValue("chapter") === undefined ||
                                row.getValue("chapter") === null
                                    ? "-m-4 p-4 cursor-pointer border-red-400 border-[1px]"
                                    : "-m-4 p-4 cursor-pointer"
                            }
                        >
                            <span className=" truncate font-medium max-w-xs">
                                {row.getValue("chapter")}
                            </span>
                        </div>
                    )
                    return (
                        <PostEdit
                            row={row}
                            trigger={trigger}
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
                        id={row.original.id}
                        tableType={TableType.POSTS}
                    />
                )
            }
        ],
        [postData]
    )

    if (!postData) return <div>Loading</div>

    return (
        <div className="container mx-auto py-10">
            {postData ? (
                <DataTable
                    columns={columns}
                    data={postData}
                    tableType={TableType.POSTS}
                    refetchData={refetch}
                />
            ) : null}
        </div>
    )
}

export default Page
