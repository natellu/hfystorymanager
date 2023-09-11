import { useCustomToast } from "@/hooks/use-custom-toast"
import { toast } from "@/hooks/use-toast"
import { Button } from "@nextui-org/react"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { PlusIcon } from "lucide-react"
import { FC, useState } from "react"
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

interface CreatePostProps {
    refetchData?: () => void
}

const CreatePost: FC<CreatePostProps> = ({ refetchData }) => {
    const [open, setOpen] = useState(false)
    const [link, setLink] = useState<string>("")
    const { loginToast } = useCustomToast()

    const { mutate: importPost } = useMutation({
        mutationFn: async () => {
            if (!link) {
                toast({
                    title: "Invalid Input",
                    description: "Link cant be empty",
                    variant: "destructive"
                })

                throw new Error()
            }

            const { data } = await axios.post("/api/posts/import", { link })
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
            setLink("")
            setOpen(false)
        }
    })

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button color="primary" endContent={<PlusIcon />}>
                    Import Post
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Import a new Post</DialogTitle>
                    <DialogDescription>
                        Link can be directly to a reddit post or a user (will
                        only take post from r/hfy)
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Link
                        </Label>
                        <Input
                            id="title"
                            className="col-span-3"
                            value={link}
                            onChange={(e) => setLink(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button onClick={() => importPost()}>Save changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreatePost
