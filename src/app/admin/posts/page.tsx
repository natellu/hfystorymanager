"use client"

import { ExtendedPost } from "@/types/db"
import {
    Button,
    Dropdown,
    DropdownMenu,
    DropdownTrigger,
    Input,
    Pagination,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableColumn,
    TableHeader,
    TableRow,
    getKeyValue
} from "@nextui-org/react"
import { Sorted } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import debounce from "lodash.debounce"
import { ChevronDownIcon, PlusIcon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

interface pageProps {}

//todo incremental loading
//todo delete

const fetcher = (url: string) => axios.get(url).then((res) => res.data)

const Page = () => {
    const [page, setPage] = useState(1)
    const [searchValue, setSearchValue] = useState<string>("")
    const rowsPerPage = 10

    /*     const { data, isLoading } = useSWR(
        `/api/posts?page=${page}&limit=${rowsPerPage}`,
        fetcher,
        {
            keepPreviousData: true
        }
    ) */

    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            const { data } = await axios.get(
                `/api/posts?page=${page}&limit=${rowsPerPage}&search=${searchValue}`
            )
            return data
        },
        queryKey: ["search-query"],
        enabled: true
    })

    useEffect(() => {
        refetch()
    }, [page])

    const pages = useMemo(() => {
        return data?.count ? Math.ceil(data.count / rowsPerPage) : 0
    }, [data?.count, rowsPerPage])

    const loadingState =
        isFetching || data?.posts?.length === 0 ? "loading" : "idle"

    type PostTableData = {
        id: string
        title: string
        sorted: Sorted
        storyTitle: string
        chapter: number
    }

    const posts: PostTableData[] = useMemo(() => {
        const p = data?.posts?.map((p: ExtendedPost) => {
            const { chapter, id, sorted, Story, title } = p

            return {
                id,
                chapter,
                title,
                sorted,
                storyTitle: Story?.title
            }
        })

        return p
    }, [data])

    const columns = [
        {
            key: "title",
            label: "Title"
        },
        {
            key: "sorted",
            label: "Sorted"
        },
        {
            key: "storyTitle",
            label: "Story"
        },
        {
            key: "chapter",
            label: "Chapter"
        }
    ]

    const hasSearchFilter = Boolean(searchValue)

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

    const topContent = (
        <div className="flex flex-col gap-4">
            <div className="flex justify-between gap-3 items-end">
                <Input
                    isClearable
                    className="w-full sm:max-w-[44%]"
                    placeholder="Search by name..."
                    startContent={<SearchIcon />}
                    value={searchValue}
                    onClear={() => onClear()}
                    onValueChange={(text) => {
                        setSearchValue(text)
                        debounceRequest()
                    }}
                />
                <div className="flex gap-3">
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button
                                endContent={
                                    <ChevronDownIcon className="text-small" />
                                }
                                variant="flat"
                            >
                                Status
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            /* selectedKeys={statusFilter} */
                            selectionMode="multiple"
                            /* onSelectionChange={setStatusFilter} */
                        >
                            {/*  {statusOptions.map((status) => (
                                    <DropdownItem
                                        key={status.uid}
                                        className="capitalize"
                                    >
                                        {capitalize(status.name)}
                                    </DropdownItem>
                                ))} */}
                        </DropdownMenu>
                    </Dropdown>
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button
                                endContent={
                                    <ChevronDownIcon className="text-small" />
                                }
                                variant="flat"
                            >
                                Columns
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            /* selectedKeys={visibleColumns}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns} */
                        >
                            {/* {columns.map((column) => (
                                    <DropdownItem
                                        key={column.uid}
                                        className="capitalize"
                                    >
                                        {capitalize(column.name)}
                                    </DropdownItem>
                                ))} */}
                        </DropdownMenu>
                    </Dropdown>
                    <Button color="primary" endContent={<PlusIcon />}>
                        Add New
                    </Button>
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {data?.count} users
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
                topContent={topContent}
                topContentPlacement="outside"
            >
                <TableHeader columns={columns}>
                    {(column) => (
                        <TableColumn key={column.key}>
                            {column.label}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody
                    isLoading={isFetching}
                    items={posts ?? []}
                    loadingContent={<Spinner label="Loading..." />}
                >
                    {(item: PostTableData) => (
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
        </div>
    )
}

export default Page
