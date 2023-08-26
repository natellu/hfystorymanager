"use client"

import { MoreHorizontalIcon } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { StoryPayload } from "@/lib/validators/story"
import { ExtendedStory } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import axios from "axios"
import { Button } from "../Button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "../DropdownMenu"

interface DataTableRowActionsProps<TData> {
    id?: string
    isStory?: boolean
    data: any
    setData: (data: any) => void
}

export function DataTableRowActions<TData>({
    id,
    isStory,
    data,
    setData
}: DataTableRowActionsProps<TData>) {
    const { mutate: deleteStory } = useMutation({
        mutationFn: async () => {
            if (!isStory || !id) {
                return
            }

            const payload: StoryPayload = {
                storyId: id
            }

            const { data: deletedStory } = await axios.post(
                "/api/stories/delete",
                payload
            )

            const postArray: ExtendedStory[] = [
                ...data.filter((p) => p.id !== id)
            ]

            setData(postArray)
        },
        onError: (err) => {
            toast({
                title: "There was an error.",
                description: "Could not delete story. Please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Story deleted",
                variant: "default"
            })
        }
    })

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="flex h-8 w-8 p-0 data-[state=open]:bg-muted"
                >
                    <MoreHorizontalIcon className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {/*                 <Link href={`/admin/posts/${row.original.id}`}>
                    <DropdownMenuItem onClick={() => console.log("edit")}>
                        Edit
                    </DropdownMenuItem>
                </Link> */}
                <DropdownMenuSeparator />

                <DropdownMenuItem
                    onClick={() => {
                        if (isStory) deleteStory()
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
