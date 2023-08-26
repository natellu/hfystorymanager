"use client"

import { StoryPayload } from "@/lib/validators/story"
import { ExtendedStory } from "@/types/db"
import axios from "axios"
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

interface StoryProps {
    story: ExtendedStory
    showSubscribe?: boolean
}

const Story: FC<StoryProps> = ({ story, showSubscribe }) => {
    const { data: session } = useSession()

    const [isSubscribed, setIsSubscribed] = useState(false)

    useEffect(() => {
        if (session && showSubscribe) {
            const fetchData = async () => {
                const payload: StoryPayload = {
                    storyId: story.id
                }

                const { data } = await axios.post(
                    "/api/story/isSubscribed",
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

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <a href={`/story/${story.id}`}>{story.title}</a>{" "}
                    {showSubscribe ? (
                        <SubscribeLeaveToggle
                            storyId={story.id}
                            isSubscribed={isSubscribed}
                        />
                    ) : null}
                </CardTitle>
                <CardDescription>
                    Author:{" "}
                    <a href={`https://www.reddit.com/u/${story.author}`}>
                        {story.author}
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    {story.chapters?.map((post) => (
                        <a
                            href={`https://reddit.com${post.permalink}`}
                            key={post.postId}
                        >
                            {post.title}
                        </a>
                    ))}
                </div>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    )
}

export default Story
