import { toast } from "@/hooks/use-toast"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost, ExtendedStory } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"
import axios from "axios"
import { FC, useState } from "react"
import { Button } from "../Button"
import { Input } from "../Input"
import { Label } from "../Label"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover"

interface PopoverTitleEditProps {
    title: string
    id: string
    data: any[]
    row: Row<ExtendedPost> | Row<ExtendedStory>
    setData: (data: any[]) => void
}

const PopoverTitleEdit: FC<PopoverTitleEditProps> = ({
    title,
    id,
    data,
    row,
    setData
}) => {
    const [newTitle, setNewTitle] = useState(title)

    const { mutate: updatePost } = useMutation({
        mutationFn: async () => {
            if (newTitle === title || newTitle === "") throw new Error()

            const payload: UpdatePostPayload = {
                id,
                title: newTitle
            }

            const { data: updatedPost } = await axios.post(
                "/api/posts/update",
                payload
            )

            const index = data.findIndex(
                (p: ExtendedPost | ExtendedStory) => p.id === id
            )

            const postArray: ExtendedPost[] = [...data]
            postArray[index] = updatedPost

            setData(postArray)
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
                <div className="flex space-x-2 cursor-pointer">
                    <span className="max-w-[500px] truncate font-medium">
                        {row.getValue("title")}
                    </span>
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
                            <Label>Title</Label>
                            <Input
                                type="text"
                                value={newTitle}
                                onChange={(e) => setNewTitle(e.target.value)}
                                className="col-span-2 h-8"
                            ></Input>
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
            </PopoverContent>
        </Popover>
    )
}

export default PopoverTitleEdit
