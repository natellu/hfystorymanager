"use client"

import CreatePost from "@/components/CreatePost"
import EditMultiplePosts from "@/components/EditMultiplePosts"
import PostEdit from "@/components/PostEdit"
import { toast } from "@/hooks/use-toast"
import { PostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
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
import { Sorted, Story } from "@prisma/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import debounce from "lodash.debounce"
import {
    ChevronDownIcon,
    MoreVerticalIcon,
    MoveUpRightIcon,
    SearchIcon,
    Trash2Icon
} from "lucide-react"
import { Key, useCallback, useEffect, useMemo, useState } from "react"

//todo delete

const Page = () => {
    const [page, setPage] = useState(1)
    const [searchValue, setSearchValue] = useState<string>("")
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>()

    const [rowsPerPage, setRowsPerPage] = useState(10)

    const [stories, setStories] = useState<Story[]>()
    const [isRowDialogOpen, setIsRowDialogOpen] = useState(false)
    const [rowActionId, setRowActionId] = useState("")

    //@ts-ignore
    const [statusFilter, setStatusFilter] = useState<Selection>("all")

    const [selectedPosts, setSelectedPosts] = useState<Key[]>([])

    const INITIAL_VISIBLE_COLUMNS = [
        "title",
        "sorted",
        "storyTitle",
        "chapter",
        "actions"
    ]

    const [visibleColumns, setVisibleColumns] = useState(
        new Set(INITIAL_VISIBLE_COLUMNS)
    )

    const { data: storiesData, refetch: storyRefetch } = useQuery({
        queryFn: async () => {
            const query = "/api/stories/all"

            const { data } = await axios.get(query)

            setStories(data.stories)
            return data.stories
        },
        queryKey: ["query-all-stories"],
        enabled: true
    })

    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            const sortedFilter =
                //@ts-ignore
                statusFilter === "all" ? "" : Array.from(statusFilter).join(",")

            const { data } = await axios.get(
                `/api/posts?page=${page}&limit=${rowsPerPage}&search=${searchValue}&orderColumn=${sortDescriptor?.column}&orderDir=${sortDescriptor?.direction}&sorted=${sortedFilter}`
            )
            setSelectedPosts([])
            return data
        },
        queryKey: ["search-query"],
        enabled: true
    })

    useEffect(() => {
        refetch()
    }, [page, rowsPerPage, sortDescriptor, statusFilter])

    const pages = useMemo(() => {
        return data?.count ? Math.ceil(data.count / rowsPerPage) : 0
    }, [data?.count, rowsPerPage])

    type PostTableData = {
        id: string
        title: string
        sorted: Sorted
        storyTitle: string
        storyId: string
        chapter: number
        created: string
        permalink: string
    }

    const posts: PostTableData[] = useMemo(() => {
        const p = data?.posts?.map((p: ExtendedPost) => {
            const { chapter, id, sorted, Story, title, created, permalink } = p
            const date = new Date(created * 1000)

            return {
                permalink,
                id,
                chapter,
                title,
                sorted,
                created: date.toLocaleDateString(),
                storyTitle: Story?.title,
                storyId: Story?.id
            } as PostTableData
        })

        return p
    }, [data])

    //todo created column to sort by new/old

    const columns = [
        {
            key: "title",
            label: "Title",
            sortable: true
        },
        {
            key: "sorted",
            label: "Sorted",
            sortable: true
        },
        {
            key: "storyTitle",
            label: "Story"
        },
        {
            key: "chapter",
            label: "Chapter",
            sortable: true
        },
        {
            key: "created",
            label: "Posted",
            sortable: true
        },
        {
            key: "actions",
            label: "Actions"
        }
    ]

    const headerColumns = useMemo(() => {
        return columns.filter((column) =>
            Array.from(visibleColumns).includes(column.key)
        )
    }, [visibleColumns])

    useEffect(() => {
        if (selectedPosts.length === 1 && selectedPosts[0] === "all") {
            let s: Key[] = []
            posts.map((p) => s.push(p.id))
            setSelectedPosts(s)
        }
    }, [selectedPosts])

    useEffect(() => {
        setSelectedPosts([])
    }, [page])

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
                            defaultSelectedKeys={"all"}
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            //@ts-ignore
                            selectedKeys={statusFilter}
                            selectionMode="multiple"
                            //@ts-ignore
                            onSelectionChange={setStatusFilter}
                        >
                            {Object.keys(Sorted).map((s) => (
                                <DropdownItem key={s} className="capitalize">
                                    {s}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    {/* todo not closing when clicking outside */}
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
                            selectedKeys={visibleColumns}
                            selectionMode="multiple"
                            //@ts-ignore
                            onSelectionChange={setVisibleColumns}
                        >
                            {columns.map((column) => (
                                <DropdownItem
                                    key={column.key}
                                    className="capitalize"
                                >
                                    {column.key}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                    <CreatePost refetchData={refetch} />
                </div>
            </div>
            <div className="flex justify-between items-center">
                <span className="text-default-400 text-small">
                    Total {data?.count} posts
                </span>
                <label className="flex items-center text-default-400 text-small">
                    Rows per page:
                    <select
                        className="bg-transparent outline-none text-default-400 text-small"
                        onChange={(e) =>
                            setRowsPerPage(parseInt(e.target.value))
                        }
                    >
                        <option value="10">10</option>
                        <option value="20">20</option>
                        <option value="50">50</option>
                    </select>
                </label>
            </div>
        </div>
    )

    const { mutate: deletePost, isLoading: deletePostLoading } = useMutation({
        mutationFn: async (id: string) => {
            if (!id || id === "") throw new Error()

            const payload: PostPayload = {
                id
            }

            const { data } = await axios.post("/api/posts/delete", payload)
        },
        onError: (err) => {
            toast({
                title: "There was an error.",
                description: "Could not delete post. Please try again.",
                variant: "destructive"
            })
        },
        onSuccess: (data) => {
            toast({
                title: "Success",
                description: "Post deleted",
                variant: "default"
            })
            refetch()
        }
    })

    const renderCell = useCallback((item: PostTableData, columnKey: Key) => {
        switch (columnKey) {
            case "actions":
                return (
                    <div className="relative flex justify-end items-center gap-2">
                        <Dropdown>
                            <DropdownTrigger>
                                <Button isIconOnly size="sm" variant="light">
                                    <MoreVerticalIcon className="text-default-300" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu>
                                <DropdownItem
                                    startContent={
                                        <MoveUpRightIcon className="text-xl pointer-events-none flex-shrink-0 text-default-500" />
                                    }
                                    description="View post on reddit"
                                    onClick={() =>
                                        window.open(
                                            `https://reddit.com${item.permalink}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    View on Reddit
                                </DropdownItem>

                                <DropdownItem
                                    startContent={
                                        <MoveUpRightIcon className="text-xl pointer-events-none flex-shrink-0 text-default-500" />
                                    }
                                    description="View full Story"
                                    showDivider
                                    onClick={() =>
                                        window.open(
                                            `/story/${item.storyId}`,
                                            "_blank"
                                        )
                                    }
                                >
                                    View Story
                                </DropdownItem>

                                <DropdownItem
                                    color="danger"
                                    className="text-danger"
                                    description="Permanently delete the file"
                                    startContent={
                                        <Trash2Icon className="text-xl pointer-events-none flex-shrink-0 text-danger-200" />
                                    }
                                    onClick={() => {
                                        deletePost(item.id)
                                    }}
                                >
                                    Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                )
            default:
                return <div>{getKeyValue(item, columnKey)}</div>
        }
    }, [])

    return (
        <div className="container mx-auto py-10">
            <Table
                sortDescriptor={sortDescriptor}
                onSortChange={setSortDescriptor}
                aria-label="Post Table"
                bottomContentPlacement="outside"
                bottomContent={
                    pages > 0 ? (
                        <div className="flex justify-between w-full  ">
                            <EditMultiplePosts
                                refetchAllPosts={refetch}
                                stories={stories}
                                isDisabled={
                                    !selectedPosts || selectedPosts.length === 0
                                }
                                selectedPosts={selectedPosts}
                            />

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
                //@ts-ignore
                selectedKeys={selectedPosts}
                onSelectionChange={(e) => {
                    if (e === "all") {
                        setSelectedPosts(["all"])
                        return
                    }

                    if (Array.from(e).length === 0) {
                        setSelectedPosts([])
                        return
                    }

                    setSelectedPosts(Array.from(e))
                }}
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
                    items={posts ?? []}
                    loadingContent={<Spinner label="Loading..." />}
                >
                    {(item: PostTableData) => (
                        <TableRow key={item.id}>
                            {(columnKey) => (
                                <TableCell>
                                    {renderCell(item, columnKey)}
                                </TableCell>
                            )}
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <PostEdit
                isOpen={isRowDialogOpen}
                setIsOpen={setIsRowDialogOpen}
                postId={rowActionId}
                refetchAllPosts={refetch}
                stories={stories}
            />
        </div>
    )
}

export default Page
