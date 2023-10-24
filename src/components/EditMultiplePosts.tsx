import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import {
    Button,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    Popover,
    PopoverContent,
    PopoverTrigger,
    Spinner,
    Tooltip,
    useDisclosure
} from "@nextui-org/react"
import { Story } from "@prisma/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { CheckIcon, Trash2Icon } from "lucide-react"
import { FC, Key, useEffect, useRef, useState } from "react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem
} from "./ui/Command"
import { Label } from "./ui/Label"
import { ScrollArea } from "./ui/ScrollArea"

interface EditMultiplePostsProps {
    isDisabled: boolean
    selectedPosts: Key[]
    stories: Story[] | undefined
    refetchAllPosts: () => void
}

const EditMultiplePosts: FC<EditMultiplePostsProps> = ({
    selectedPosts,
    isDisabled,
    stories,
    refetchAllPosts
}) => {
    const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure()
    const [isStoriesOpen, setIsStoriesOpen] = useState(false)

    const [newStory, setNewStory] = useState({ title: "", id: "" })
    const [postsToUpdate, setPostsToUpdate] = useState<ExtendedPost[]>()

    const {
        data,
        refetch: _refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryFn: async () => {
            const query = `/api/posts/getManyById`

            const payload = {
                ids: selectedPosts
            }

            const { data } = await axios.post(query, payload)
            setPostsToUpdate(data)
            return data as ExtendedPost[]
        },
        enabled: false,
        queryKey: ["getManyById", selectedPosts]
    })

    useEffect(() => {
        if (isOpen) _refetch()
    }, [isOpen])

    const { mutate: updatePosts, isLoading: updatingPostsLoading } =
        useMutation({
            mutationFn: async () => {
                //todo toast input checks
                if (!postsToUpdate) throw new Error()

                if (newStory.title === "") throw new Error()

                const payload: UpdatePostPayload[] = postsToUpdate.map((p) => {
                    if (p.chapter === null) p.chapter = 0

                    return {
                        id: p.id,
                        storyId: newStory.id,
                        chapter: p.chapter
                    }
                })

                const { data } = await axios.post(
                    "/api/posts/update/many",
                    payload
                )
            },
            onError: (err) => {
                toast({
                    title: "There was an error.",
                    description: "Could not update post. Please try again.",
                    variant: "destructive"
                })
            },
            onSuccess: (data) => {
                toast({
                    title: "Success",
                    description: "Post updated",
                    variant: "default"
                })
                refetchAllPosts()
                onClose()
            }
        })

    const removePost = (id: string) => {
        if (!postsToUpdate) return
        let tempPosts = postsToUpdate.filter((p) => p.id !== id)

        setPostsToUpdate(tempPosts)
    }

    const storySearchInput = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (isStoriesOpen) storySearchInput.current?.focus()
    }, [isStoriesOpen])

    return (
        <div className="">
            <Button isDisabled={isDisabled} onPress={onOpen}>
                Edit {selectedPosts.length} Posts
            </Button>

            <Modal
                isOpen={isOpen}
                scrollBehavior="inside"
                onOpenChange={onOpenChange}
                size="3xl"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="flex flex-col gap-1">
                                Edit Multiple Posts
                            </ModalHeader>
                            <ModalBody>
                                <div className="flex flex-col gap-2">
                                    <Label htmlFor="">Select a story: </Label>
                                    {stories ? (
                                        <Popover
                                            isOpen={isStoriesOpen}
                                            placement="bottom"
                                            showArrow
                                            offset={10}
                                            onOpenChange={(open) =>
                                                setIsStoriesOpen(open)
                                            }
                                        >
                                            <PopoverTrigger>
                                                <Button>
                                                    {newStory.title === ""
                                                        ? "Select Story"
                                                        : newStory.title}{" "}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[400px] p-0">
                                                <ScrollArea className="h-72 rounded-md border w-full">
                                                    <Command
                                                        filter={(
                                                            value,
                                                            search
                                                        ) => {
                                                            if (
                                                                value.includes(
                                                                    search
                                                                )
                                                            )
                                                                return 1
                                                            return 0
                                                        }}
                                                    >
                                                        <CommandInput
                                                            placeholder="Search stories..."
                                                            ref={
                                                                storySearchInput
                                                            }
                                                        />
                                                        <CommandEmpty>
                                                            No story found.
                                                        </CommandEmpty>
                                                        <CommandGroup>
                                                            {stories.map(
                                                                (story) => (
                                                                    <CommandItem
                                                                        value={
                                                                            story.title
                                                                        }
                                                                        key={
                                                                            story.id
                                                                        }
                                                                        onSelect={() => {
                                                                            setNewStory(
                                                                                {
                                                                                    title: story.title,
                                                                                    id: story.id
                                                                                }
                                                                            )
                                                                            setIsStoriesOpen(
                                                                                false
                                                                            )
                                                                        }}
                                                                    >
                                                                        <CheckIcon
                                                                            className={cn(
                                                                                "h-4 w-4",
                                                                                story.id ===
                                                                                    newStory.id
                                                                                    ? "opacity-100"
                                                                                    : "opacity-0"
                                                                            )}
                                                                        />
                                                                        {
                                                                            story.title
                                                                        }
                                                                    </CommandItem>
                                                                )
                                                            )}
                                                        </CommandGroup>
                                                    </Command>
                                                </ScrollArea>
                                            </PopoverContent>
                                        </Popover>
                                    ) : (
                                        <Spinner
                                            label="loading stories"
                                            size="sm"
                                        />
                                    )}

                                    <div className="flex flex-col mt-6 gap-4">
                                        {isFetching ? (
                                            <Spinner label="Loading..." />
                                        ) : null}
                                        {postsToUpdate?.map((p) => (
                                            <div
                                                className="grid grid-cols-[1fr_min-content_min-content] gap-4 items-center border-b-[1px] border-slate-300 p-2"
                                                key={p.id}
                                            >
                                                {p.title}
                                                <Input
                                                    className="w-24"
                                                    id="chapter"
                                                    type="number"
                                                    placeholder="0"
                                                    value={
                                                        (p.chapter === null
                                                            ? ""
                                                            : p.chapter) + ""
                                                    }
                                                    onChange={(e) => {
                                                        const tempPosts = [
                                                            ...postsToUpdate
                                                        ]

                                                        const index =
                                                            tempPosts.findIndex(
                                                                (tp) =>
                                                                    tp.id ===
                                                                    p.id
                                                            )

                                                        tempPosts[
                                                            index
                                                        ].chapter = parseFloat(
                                                            e.target.value
                                                        )

                                                        setPostsToUpdate(
                                                            tempPosts
                                                        )
                                                    }}
                                                />

                                                <Tooltip
                                                    content="Remove the post from this list"
                                                    delay={1000}
                                                >
                                                    <Button
                                                        tabIndex={-1}
                                                        onClick={() =>
                                                            removePost(p.id)
                                                        }
                                                        size="sm"
                                                        isIconOnly
                                                        color="danger"
                                                        aria-label="delete post from this list"
                                                        variant="bordered"
                                                    >
                                                        <Trash2Icon />
                                                    </Button>
                                                </Tooltip>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </ModalBody>
                            <ModalFooter className="flex justify-between mt-6">
                                <Button
                                    disabled={updatingPostsLoading}
                                    color="primary"
                                    onClick={() => updatePosts()}
                                    isLoading={updatingPostsLoading}
                                >
                                    Update
                                </Button>
                                <Button
                                    color="danger"
                                    variant="light"
                                    onPress={onClose}
                                >
                                    Close
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    )
}

export default EditMultiplePosts
