"use client"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import { Spinner } from "@nextui-org/react"
import { Story } from "@prisma/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { FC, useCallback, useEffect, useState } from "react"
import { Button } from "./ui/Button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem
} from "./ui/Command"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle
} from "./ui/Dialog"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover"
import { ScrollArea } from "./ui/ScrollArea"

interface PostEditProps {
    postId: string
    setIsOpen: (open: boolean) => void
    isOpen: boolean
    refetchAllPosts: () => void
    stories: Story[] | undefined
}

const PostEdit: FC<PostEditProps> = ({
    isOpen,
    postId,
    setIsOpen,
    refetchAllPosts,
    stories
}) => {
    const [newStoryId, setNewStoryId] = useState("")
    const [openStories, setOpenStories] = useState(false)

    const [post, setPost] = useState<ExtendedPost>()

    useEffect(() => {
        //query post
        if (postId.length > 0) refetch()
    }, [postId])

    const {
        data: fetchedPost,
        refetch: _refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryFn: async () => {
            const query = `/api/posts/byId?id=${postId}`

            const { data } = await axios.get(query)
            setPost(data)
            return data as ExtendedPost
        },
        queryKey: ["queryPostById", postId],
        enabled: false
    })

    //workaround
    const refetch = useCallback(() => {
        setTimeout(() => _refetch(), 0)
    }, [_refetch])

    const { mutate: updatePost } = useMutation({
        mutationFn: async () => {
            if (!post) throw new Error() //todo toast input checks
            //todo author currently not supported

            const payload: UpdatePostPayload = {
                id: post.id,
                storyId: newStoryId,
                chapter: post.chapter || 0,
                title: post.title
            }
            const { data } = await axios.post("/api/posts/update", payload)
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

            //todo move this to parent to reduce fetching when multiple updates ????
            refetchAllPosts()

            refetch()
            setIsOpen(false)
        }
    })

    //todo create story directly
    //todo nicer loading especially when update
    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {post && !isFetching ? (
                    <div className="w-full ">
                        <div className="grid gap-6">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    placeholder="Title"
                                    value={post.title}
                                    onChange={(e) =>
                                        setPost({
                                            ...post,
                                            title: e.target.value
                                        })
                                    }
                                />
                            </div>
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="author">Author</Label>
                                <Input
                                    disabled
                                    type="text"
                                    id="author"
                                    placeholder="Author"
                                    value={post.author}
                                    onChange={(e) =>
                                        setPost({
                                            ...post,
                                            author: e.target.value
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="mt-8 grid gap-6 grid-cols-[1fr_8rem]">
                            <div className="flex flex-col gap-2">
                                <Label htmlFor="">Story</Label>
                                {stories ? (
                                    <Popover
                                        modal={true}
                                        open={openStories}
                                        onOpenChange={setOpenStories}
                                    >
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={openStories}
                                                className=" justify-between col-span-2"
                                            >
                                                {post.Story?.title
                                                    ? stories.find(
                                                          (story) =>
                                                              story.title.toLowerCase() ===
                                                              post.Story.title.toLowerCase()
                                                      )?.title
                                                    : "Select story..."}

                                                <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[200px] p-0">
                                            <ScrollArea className="h-72 rounded-md border">
                                                <Command
                                                    filter={(value, search) => {
                                                        if (
                                                            value.includes(
                                                                search
                                                            )
                                                        )
                                                            return 1
                                                        return 0
                                                    }}
                                                >
                                                    <CommandInput placeholder="Search stories..." />
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
                                                                    onSelect={(
                                                                        currentValue
                                                                    ) => {
                                                                        setPost(
                                                                            {
                                                                                ...post,
                                                                                Story: {
                                                                                    ...post.Story,
                                                                                    title:
                                                                                        currentValue.toLowerCase() ===
                                                                                        post.Story?.title.toLowerCase()
                                                                                            ? ""
                                                                                            : currentValue
                                                                                }
                                                                            }
                                                                        )
                                                                        setNewStoryId(
                                                                            story.id
                                                                        )
                                                                        setOpenStories(
                                                                            false
                                                                        )
                                                                    }}
                                                                    className="grid grid-cols-[1rem_1fr] gap-2"
                                                                >
                                                                    <CheckIcon
                                                                        className={cn(
                                                                            "h-4 w-4",
                                                                            story.title.toLowerCase() ===
                                                                                post.Story?.title.toLowerCase()
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
                            </div>

                            <div className="flex flex-col gap-2">
                                <Label htmlFor="chapter">Chapter</Label>
                                <Input
                                    id="chapter"
                                    type="number"
                                    placeholder="0"
                                    value={
                                        post.chapter === null
                                            ? ""
                                            : post.chapter
                                    }
                                    onChange={(e) =>
                                        setPost({
                                            ...post,
                                            chapter: parseFloat(e.target.value)
                                        })
                                    }
                                />
                            </div>
                        </div>
                        <div className="flex justify-between mt-6">
                            <Button onClick={() => updatePost()}>
                                Update Post
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <Spinner />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default PostEdit
