import { toast } from "@/hooks/use-toast"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { FC, useState } from "react"
import { Button } from "./Button"
import { Input } from "./Input"
import { Label } from "./Label"

interface PopoverChapterEditProps {
    id: string
    chapter: number | null
    postData: ExtendedPost[]
    setPostData: (data: ExtendedPost[]) => void
}

const PopoverChapterEdit: FC<PopoverChapterEditProps> = ({
    id,
    chapter,
    postData,
    setPostData
}) => {
    const [value, setValue] = useState<number>(chapter ?? 0)

    const { mutate: updatePost } = useMutation({
        mutationFn: async () => {
            if (chapter === value || value < 0) throw new Error()

            const payload: UpdatePostPayload = {
                id,
                chapter: value
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
        <div className="grid gap-4">
            <div className="space-y-2">
                <h4 className="font-medium leading-none">Story</h4>
                <p className="text-sm text-muted-foreground">
                    Set or Create Story
                </p>
            </div>
            <div className="grid gap-2">
                <div className="grid grid-cols-3 items-center gap-4">
                    <Label>Chapter</Label>
                    <Input
                        type="number"
                        className="col-span-2 h-8"
                        value={value}
                        onChange={(e) => setValue(parseInt(e.target.value))}
                    />
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
            </div>
        </div>
    )
}

export default PopoverChapterEdit
