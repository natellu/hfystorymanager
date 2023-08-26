import { toast } from "@/hooks/use-toast"
import { UnlinkPostPayload } from "@/lib/validators/post"
import { ExtendedStory } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Unlink2Icon } from "lucide-react"
import { FC } from "react"
import { Button } from "./Button"
import { ScrollArea } from "./ScrollArea"
import { Separator } from "./Separator"

interface PopoverChaptersEditProps {
    id: string
    chapters?: any[]
    data: any[]
    setData: (data: any) => void
}

const PopoverChaptersEdit: FC<PopoverChaptersEditProps> = ({
    chapters,
    data,
    id,
    setData
}) => {
    const { mutate: updatePost } = useMutation({
        mutationFn: async (postId: string) => {
            const payload: UnlinkPostPayload = {
                id: postId,
                storyId: id
            }

            const { data: updatedPost } = await axios.post(
                "/api/posts/unlink",
                payload
            )

            const index = data.findIndex((p) => p.id === id)

            const postArray: ExtendedStory[] = [...data]
            const chapters = postArray[index].chapters.filter(
                (chapter) => chapter.id !== updatedPost.id
            )
            postArray[index].chapters = chapters

            setData(postArray)
        },
        onError: (err) => {
            toast({
                title: "There was an error.",
                description: "Could not update post. Please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Post updated",
                variant: "default"
            })
        }
    })

    return (
        <ScrollArea className="h-72  rounded-md border">
            <div className="p-4">
                <h4 className="mb-4 text-sm font-medium leading-none">
                    Chapters
                </h4>
                {chapters!.map((chapter) => (
                    <div key={chapter.id}>
                        <div
                            key={chapter.id}
                            className="text-sm flex justify-between "
                        >
                            <span className="align-bottom inline-block ">
                                {chapter.title}
                            </span>
                            <Button
                                variant={"ghost"}
                                size="xs"
                                onClick={() => {
                                    updatePost(chapter.id)
                                }}
                            >
                                <Unlink2Icon />
                            </Button>
                        </div>
                        <Separator className="my-2" />
                    </div>
                ))}
            </div>
        </ScrollArea>
    )
}

export default PopoverChaptersEdit
