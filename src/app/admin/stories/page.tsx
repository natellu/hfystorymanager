"use client"
import CreateStory from "@/components/CreateStory"
import StoryEdit from "@/components/StoryEdit"
import { ExtendedStory } from "@/types/db"
import {
    Input,
    Pagination,
    SortDescriptor,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    getKeyValue
} from "@nextui-org/react"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import debounce from "lodash.debounce"
import { SearchIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

const Page = ({}) => {
    const [page, setPage] = useState(1)
    const [searchValue, setSearchValue] = useState<string>("")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()
    const rowsPerPage = 10

    const { data, refetch, isFetching } = useQuery({
        queryFn: async () => {
            const sortedFilter =
                //@ts-ignore
                statusFilter === "all" ? "" : Array.from(statusFilter).join(",")

            const query = `/api/stories/all?page=${page}&limit=${rowsPerPage}&search=${searchValue}&orderColumn=${sortDescriptor?.column}&orderDir=${sortDescriptor?.direction}&sorted=${sortedFilter}`
            const { data } = await axios.get(query)

            return data
        },
        queryKey: ["query-all-stories"]
    })

    useEffect(() => {
        refetch()
    }, [page])

    useEffect(() => {
        if (!sortDescriptor) return
        refetch()
    }, [sortDescriptor])

    const pages = useMemo(() => {
        return data?.count ? Math.ceil(data.count / rowsPerPage) : 0
    }, [data?.count, rowsPerPage])

    type StoryTableData = {
        id: string
        title: string
        chapters: number
    }

    const stories: StoryTableData[] = useMemo(() => {
        const p = data?.stories?.map((p: ExtendedStory) => {
            const { title, chapters, id } = p

            return {
                id,
                chapters: chapters.length,
                title
            } as StoryTableData
        })

        return p
    }, [data])

    const columns = [
        {
            key: "title",
            label: "Title",
            sortable: true
        },
        {
            key: "chapters",
            label: "Chapters",
            sortable: true
        }
    ]

    const INITIAL_VISIBLE_COLUMNS = ["title", "chapters"]

    const [visibleColumns, setVisibleColumns] = useState(
        new Set(INITIAL_VISIBLE_COLUMNS)
    )

    const headerColumns = useMemo(() => {
        return columns.filter((column) =>
            Array.from(visibleColumns).includes(column.key)
        )
    }, [visibleColumns])

    const onClear = useCallback(() => {
        setSearchValue("")
        setPage(1)
    }, [])

    const request = debounce(() => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(async () => {
        request()
    }, [])

    const [isRowDialogOpen, setIsRowDialogOpen] = useState(false)
    const [rowActionId, setRowActionId] = useState("")

    //@ts-ignore
    const [statusFilter, setStatusFilter] = useState<Selection>("all")

    useEffect(() => {
        //@ts-ignore
        if (statusFilter === "all") return

        refetch()
    }, [statusFilter])

    const topContent = (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3 items-end">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by title..."
                    startContent={<SearchIcon />}
                    value={searchValue}
                    onClear={() => onClear()}
                    onValueChange={(text) => {
                        setSearchValue(text)
                        debounceRequest()
                    }}
                />
                <div className="flex gap-3">
                    <CreateStory refetchData={refetch} />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {data?.count} stories
                </span>
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent outline-none text-default-400 text-small"
                        /*  onChange={onRowsPerPageChange} */
                    >
                        <option value="5">5</option>
                        <option value="10">10</option>
                        <option value="15">15</option>
                    </select>
                </label>
            </div>
        </div>
    )

    return (
        <div className="container mx-auto py-10">
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                aria-label="Post Table"
                bottomContentPlacement="outside"
                bottomContent={
                    pages > 0 ? (
                        <div className="flex w-full justify-center">
                            <Pagination
                                isCompact
                                showControls
                                showShadow
                                color="primary"
                                page={page}
                                total={pages}
                                onChange={(page) => {
                                    setPage(page)
                                }}
                            />
                        </div>
                    ) : null
                }
                color={"default"}
                selectionMode="multiple"
                selectionBehavior={"toggle"}
                onRowAction={(id) => {
                    setRowActionId(id as string)
                    setIsRowDialogOpen(true)
                }}
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={headerColumns}>
                    {(column) => (
                        <TableColumn
                            key={column.key}
                            allowsSorting={column.sortable}
                        >
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    isLoading={isFetching}
                    items={stories ?? []}
                    loadingContent={<Spinner label="Loading..." />}
                >
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {getKeyValue(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <StoryEdit
                isOpen={isRowDialogOpen}
                setIsOpen={setIsRowDialogOpen}
                storyId={rowActionId}
                refetchAllStories={refetch}
            />
        </div>
    )
}

export default Page
