import { toast } from "@/hooks/use-toast"
import { UpdatePostPayload } from "@/lib/validators/post"
import { ExtendedPost } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import { Row } from "@tanstack/react-table"
import axios from "axios"
import { FC, useState } from "react"
import { Button } from "../Button"
import { Input } from "../Input"
import { Label } from "../Label"
import { Popover, PopoverContent, PopoverTrigger } from "../Popover"

interface PopoverChapterEditProps {
    id: string
    chapter: number | null
    postData: ExtendedPost[]
    setPostData: (data: ExtendedPost[]) => void
    row: Row<ExtendedPost>
}

const PopoverChapterEdit: FC<PopoverChapterEditProps> = ({
    id,
    chapter,
    postData,
    setPostData,
    row
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
        <Popover>
            <PopoverTrigger asChild>
                <div
                    className={
                        row.getValue("chapter") === undefined ||
                        row.getValue("chapter") === null
                            ? "-m-4 p-4 cursor-pointer border-red-400 border-[1px]"
                            : "-m-4 p-4 cursor-pointer"
                    }
                >
                    <span className=" truncate font-medium max-w-xs">
                        {row.getValue("chapter")}
                    </span>
                </div>
            </PopoverTrigger>
            <PopoverContent className=" w-64 ">
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
                                onChange={(e) =>
                                    setValue(parseInt(e.target.value))
                                }
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
            </PopoverContent>
        </Popover>
    )
}

export default PopoverChapterEdit
