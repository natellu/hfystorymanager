import { toast } from "@/hooks/use-toast"
import { UpdateStoryPayload } from "@/lib/validators/story"
import { ExtendedStory } from "@/types/db"
import { Input, Spinner } from "@nextui-org/react"
import { DialogDescription } from "@radix-ui/react-dialog"
import { useMutation, useQuery } from "@tanstack/react-query"
import axios from "axios"
import { FC, useCallback, useEffect, useState } from "react"
import { Button } from "./ui/Button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/Dialog"
import { Label } from "./ui/Label"

interface StoryEditProps {
    storyId: string
    setIsOpen: (open: boolean) => void
    isOpen: boolean
    refetchAllStories: () => void
}

const StoryEdit: FC<StoryEditProps> = ({
    isOpen,
    storyId,
    setIsOpen,
    refetchAllStories
}) => {
    const [story, setStory] = useState<ExtendedStory>()

    useEffect(() => {
        if (storyId.length > 0) refetch()
    }, [storyId])

    //fetch story
    const {
        data: fetchedStory,
        refetch: _refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryFn: async () => {
            const query = `/api/stories/byId?id=${storyId}`

            const { data } = await axios.get(query)
            setStory(data)
            return data as ExtendedStory
        },
        queryKey: ["queryPostById", storyId],
        enabled: false
    })

    //workaround
    const refetch = useCallback(() => {
        setTimeout(() => _refetch(), 0)
    }, [_refetch])

    //update
    const { mutate: updateStory } = useMutation({
        mutationFn: async () => {
            if (!story) throw new Error() //todo toast input checks
            //todo author currently not supported

            const payload: UpdateStoryPayload = {
                id: story.id,
                title: story.title
            }
            const { data } = await axios.post("/api/stories/update", payload)
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

            refetch()

            //todo move this to parent to reduce fetching when multiple updates ????
            refetchAllStories()

            setIsOpen(false)
        }
    })

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="w-full">
                <DialogHeader>
                    <DialogTitle>Edit Story</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>

                {story && !isFetching ? (
                    <div className="w-full">
                        <div className="grid gap-6">
                            <div className="grid w-full max-w-sm items-center gap-1.5">
                                <Label htmlFor="title">Title</Label>
                                <Input
                                    type="text"
                                    id="title"
                                    placeholder="Title"
                                    value={story.title}
                                    onChange={(e) =>
                                        setStory({
                                            ...story,
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
                                    value={story.author || ""}
                                    onChange={(e) =>
                                        setStory({
                                            ...story,
                                            author: e.target.value
                                        })
                                    }
                                />
                            </div>

                            {/* Edit chapters */}
                        </div>
                        <div className="flex justify-between mt-6">
                            <Button onClick={() => updateStory()}>
                                Update Story
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
                    <Spinner label="loading stories" size="sm" />
                )}
            </DialogContent>
        </Dialog>
    )
}

export default StoryEdit
