"use client"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import { Story } from "@prisma/client"
import { useMutation, useQuery } from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"
import axios from "axios"
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react"
import { FC, useEffect, useState } from "react"
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
    DialogTitle,
    DialogTrigger
} from "./ui/Dialog"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/Popover"
import { ScrollArea } from "./ui/ScrollArea"

interface PostEditProps {
    row: Row<ExtendedPost>
    trigger: JSX.Element
    postData: ExtendedPost[]
    setPostData: (data: ExtendedPost[]) => void
}

const PostEdit: FC<PostEditProps> = ({
    row,
    trigger,
    postData,
    setPostData
}) => {
    const [stories, setStories] = useState<Story[]>()
    const [value, setValue] = useState("") //todo rename
    const [newStoryId, setNewStoryId] = useState("")
    const [openStories, setOpenStories] = useState(false)
    const [open, setOpen] = useState(false)

    const [title, setTitle] = useState<string>(row.original.title)
    const [author, setAuthor] = useState<string>(row.original.author)
    const [chapter, setChapter] = useState<number>(row.original.chapter ?? 0)

    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            const query = "/api/stories/all"

            const { data } = await axios.get(query)
            return data
        },
        queryKey: ["query-all-stories"]
    })

    useEffect(() => {
        setStories(data)
        if (row.original.Story)
            setValue(row.original.Story?.title.toLowerCase())
    }, [data])

    const { mutate: updatePost } = useMutation({
        mutationFn: async () => {
            const id = row.original.id
            /* if (newStoryId === storyId || newStoryId === "")
                    throw new Error() */
            //todo check inputs

            //todo author currently not supported
            const payload: UpdatePostPayload = {
                id,
                storyId: newStoryId,
                chapter,
                title
            }

            const { data } = await axios.post("/api/posts/update", payload)
            console.log(data)

            const index = postData.findIndex((p) => p.id === id)

            const postArray: ExtendedPost[] = [...postData]
            postArray[index] = data

            setPostData(postArray)
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
        }
    })

    //todo create story directly

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{trigger}</DialogTrigger>
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>Edit Post</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="w-full ">
                    <div className="grid gap-6">
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                type="text"
                                id="title"
                                placeholder="Title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="author">Author</Label>
                            <Input
                                type="text"
                                id="author"
                                placeholder="Author"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="mt-8 grid gap-6 grid-cols-[1fr_8rem]">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="">Story</Label>
                            {stories ? (
                                <Popover
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
                                            {value
                                                ? stories.find(
                                                      (story) =>
                                                          story.title.toLowerCase() ===
                                                          value.toLowerCase()
                                                  )?.title
                                                : "Select story..."}

                                            <ChevronsUpDownIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-[200px] p-0">
                                        <ScrollArea className="h-72 rounded-md border">
                                            <Command
                                                filter={(value, search) => {
                                                    if (value.includes(search))
                                                        return 1
                                                    return 0
                                                }}
                                            >
                                                <CommandInput placeholder="Search stories..." />
                                                <CommandEmpty>
                                                    No story found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {stories.map((story) => (
                                                        <CommandItem
                                                            value={story.title}
                                                            key={story.id}
                                                            onSelect={(
                                                                currentValue
                                                            ) => {
                                                                setValue(
                                                                    currentValue.toLowerCase() ===
                                                                        value.toLowerCase()
                                                                        ? ""
                                                                        : currentValue
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
                                                                        value.toLowerCase()
                                                                        ? "opacity-100"
                                                                        : "opacity-0"
                                                                )}
                                                            />
                                                            {story.title}
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup>
                                            </Command>
                                        </ScrollArea>
                                    </PopoverContent>
                                </Popover>
                            ) : null}
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="chapter">Chapter</Label>
                            <Input
                                id="chapter"
                                type="number"
                                placeholder="0"
                                value={chapter}
                                onChange={(e) =>
                                    setChapter(parseInt(e.target.value))
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
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default PostEdit
