"use client"

import { MoreHorizontalIcon } from "lucide-react"

import { toast } from "@/hooks/use-toast"
import { PostPayload } from "@/lib/validators/post"
import { StoryPayload } from "@/lib/validators/story"
import { ExtendedPost, ExtendedStory } from "@/types/db"
import { TableType } from "@/types/table"
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
    tableType?: TableType
    data: any
    setData: (data: any) => void
}

export function DataTableRowActions<TData>({
    id,
    tableType,
    data,
    setData
}: DataTableRowActionsProps<TData>) {
    const { mutate: deleteStory } = useMutation({
        mutationFn: async () => {
            if (tableType !== TableType.STORIES || !id) {
                return
            }

            const payload: StoryPayload = {
                storyId: id
            }

            const { data: deletedStory } = await axios.post(
                "/api/stories/delete",
                payload
            )

            const storyArray: ExtendedStory[] = [
                ...data.filter((p: ExtendedStory) => p.id !== id)
            ]

            setData(storyArray)
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

    const { mutate: deletePost } = useMutation({
        mutationFn: async () => {
            if (tableType !== TableType.POSTS || !id) {
                return
            }

            const payload: PostPayload = {
                id
            }

            const { data: deletedPost } = await axios.post(
                "/api/posts/delete",
                payload
            )

            const postArray: ExtendedPost[] = [
                ...data.filter((p: ExtendedPost) => p.id !== id)
            ]

            setData(postArray)
        },
        onError: (err) => {
            toast({
                title: "There was an error.",
                description: "Could not delete post. Please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            toast({
                title: "Success",
                description: "Post deleted",
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
                        if (tableType === TableType.STORIES) deleteStory()
                        if (tableType === TableType.POSTS) deletePost()
                    }}
                >
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
