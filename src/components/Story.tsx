"use client"

import { useCustomToast } from "@/hooks/use-custom-toast"
import { toast } from "@/hooks/use-toast"
import { StoryPayload } from "@/lib/validators/story"
import { ExtendedStory } from "@/types/db"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { useSession } from "next-auth/react"
import { FC, useEffect, useState } from "react"
import SubscribeLeaveToggle from "./SubscribeLeaveToggle"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/Card"
import { Checkbox } from "./ui/Checkbox"

interface StoryProps {
    story: ExtendedStory
    showSubscribe?: boolean
}

const Story: FC<StoryProps> = ({ story, showSubscribe }) => {
    const [storyData, setStoryData] = useState(story)
    const { data: session } = useSession()

    const [isSubscribed, setIsSubscribed] = useState(false)

    const { loginToast } = useCustomToast()

    useEffect(() => {
        if (session && showSubscribe) {
            const fetchData = async () => {
                const payload: StoryPayload = {
                    storyId: story.id
                }

                const { data } = await axios.post(
                    "/api/stories/isSubscribed",
                    payload
                )

                if (data === story.id) {
                    setIsSubscribed(true)
                } else {
                    setIsSubscribed(false)
                }
            }

            fetchData()
        }
    }, [session])

    const { mutate: togglePostRead } = useMutation({
        mutationFn: async ({
            postId,
            read
        }: {
            postId: string
            read: boolean
        }) => {
            const { data } = await axios.post("/api/posts/toggleRead", {
                postId,
                read
            })

            return data
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) return loginToast()
            }

            toast({
                title: "There was an problem.",
                description: "Something went wrong, please try again!",
                variant: "destructive"
            })
        },
        onSuccess: (data) => {
            const tempData = { ...story }
            const index = tempData.chapters.findIndex((c) => c.id === data.id)
            tempData.chapters[index] = data

            setStoryData({ ...tempData })

            toast({
                title: "Successful",
                description: `Post updated`,
                variant: "default"
            })
        }
    })

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <a href={`/story/${storyData.id}`}>{storyData.title}</a>{" "}
                    {showSubscribe ? (
                        <SubscribeLeaveToggle
                            storyId={storyData.id}
                            isSubscribed={isSubscribed}
                        />
                    ) : null}
                </CardTitle>
                <CardDescription>
                    Author:{" "}
                    <a href={`https://www.reddit.com/u/${storyData.author}`}>
                        {storyData.author}
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    {storyData.chapters?.map((post) => (
                        <div key={post.postId}>
                            {
                                //@ts-ignore
                                post.Users ? (
                                    <Checkbox
                                        className="mr-2"
                                        onCheckedChange={(checked: boolean) =>
                                            togglePostRead({
                                                postId: post.id,
                                                read: checked
                                            })
                                        }
                                        //@ts-ignore todo????
                                        checked={post.Users?.length > 0}
                                    />
                                ) : null
                            }
                            <a
                                href={`https://reddit.com${post.permalink}`}
                                rel="noopener noreferrer"
                                target="_blank"
                            >
                                {post.title}
                            </a>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    )
}

export default Story
