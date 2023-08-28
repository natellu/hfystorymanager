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
import CreateStory from "../../CreateStory"
import { Button } from "../Button"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem
} from "../Command"
import { Label } from "../Label"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover"
import { ScrollArea } from "../ScrollArea"

interface PopoverStoryEditProps {
    storyId: string | null
    id: string
    postData: ExtendedPost[]
    setPostData: (data: ExtendedPost[]) => void
    row: Row<ExtendedPost>
}

const PopoverStoryEdit: FC<PopoverStoryEditProps> = ({
    storyId,
    id,
    postData,
    setPostData,
    row
}) => {
    const [stories, setStories] = useState<Story[]>()

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
    }, [data])

    const [open, setOpen] = useState(false)
    const [value, setValue] = useState("")
    const [newStoryId, setNewStoryId] = useState("")

    const { mutate: updatePost } = useMutation({
        mutationFn: async () => {
            if (newStoryId === storyId || newStoryId === "") throw new Error()

            const payload: UpdatePostPayload = {
                id,
                storyId: newStoryId
            }

            const { data } = await axios.post("/api/posts/update", payload)

            const index = postData.findIndex((p) => p.id === id)

            const postArray: ExtendedPost[] = [...postData]
            postArray[index] = data

            setPostData(postArray)
        },
        onError: (err) => {
            toast({
                title: "There was an error.",
                description: "Could not create post. Please try again.",
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

    return (
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={
                        !row.getValue("Story_title")
                            ? "-m-4 p-4 cursor-pointer border-red-400 border-[1px] max-w-[300px] truncate font-medium"
                            : "-m-4 p-4 cursor-pointer max-w-[300px] truncate font-medium "
                    }
                >
                    {row.getValue("Story_title")}
                </div>
            </PopoverTrigger>
            <PopoverContent className="w-[500px]">
                <div className="grid gap-4">
                    <div className="space-y-2">
                        <h4 className="font-medium leading-none">Story</h4>
                        <p className="text-sm text-muted-foreground">
                            Set or Create Story
                        </p>
                    </div>
                    <div className="grid gap-2">
                        <div className="grid grid-cols-3 items-center gap-4">
                            <Label>Story</Label>
                            {stories ? (
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            role="combobox"
                                            aria-expanded={open}
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
                                        <ScrollArea className="h-72 w-48 rounded-md border">
                                            <Command>
                                                <CommandInput placeholder="Search stories..." />
                                                <CommandEmpty>
                                                    No story found.
                                                </CommandEmpty>
                                                <CommandGroup>
                                                    {stories.map((story) => (
                                                        <CommandItem
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
                                                                setOpen(false)
                                                            }}
                                                        >
                                                            <CheckIcon
                                                                className={cn(
                                                                    "mr-2 h-4 w-4",
                                                                    value ===
                                                                        story.id
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
                        <div className="grid grid-cols-3 items-center gap-4 pt-4">
                            <Label htmlFor=""></Label>
                            <Button
                                className="col-span-2 h-8"
                                onClick={() => updatePost()}
                            >
                                Update
                            </Button>
                        </div>
                        {/* todo needs work */}
                        Or Create on
                        <CreateStory />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    )
}

export default PopoverStoryEdit
