"use client"
import { useCustomToast } from "@/hooks/use-custom-toast"
import { toast } from "@/hooks/use-toast"
import { StoryAddPayload } from "@/lib/validators/story"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { PlusCircleIcon } from "lucide-react"
import { FC, useState } from "react"
import { Button } from "./ui/Button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "./ui/Dialog"
import { Input } from "./ui/Input"
import { Label } from "./ui/Label"

interface CreateStoryProps {
    refetchData?: () => void
}

const CreateStory: FC<CreateStoryProps> = ({ refetchData }) => {
    const { loginToast } = useCustomToast()
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [open, setOpen] = useState(false)

    const { mutate: addStory } = useMutation({
        mutationFn: async () => {
            if (!title) {
                toast({
                    title: "Invalid Input",
                    description: "Title cant be empty",
                    variant: "destructive"
                })

                throw new Error()
            }

            const payload: StoryAddPayload = {
                author,
                title
            }

            const { data } = await axios.post("/api/stories/add", payload)
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) return loginToast()
            }

            toast({
                title: "There was an problem.",
                description: "Something went wrong, please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                title: "Successful",
                description: `Story added`,
                variant: "default"
            })

            if (refetchData) refetchData()

            setTitle("")
            setAuthor("")
            setOpen(false)
        }
    })
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="default"
                    size="sm"
                    className="ml-auto hidden h-8 lg:flex"
                >
                    <PlusCircleIcon className="mr-2 h-4 w-4" /> New Story
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new Story</DialogTitle>
                    <DialogDescription></DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            className="col-span-3"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="author" className="text-right">
                            Author
                        </Label>
                        <Input
                            id="author"
                            className="col-span-3"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                        />
                    </div>
                    {/* Todo add chapters directly */}
                </div>
                <DialogFooter>
                    <Button onClick={() => addStory()}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateStory
