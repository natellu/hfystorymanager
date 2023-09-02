"use client"
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { ExtendedStory } from "@/types/db"
import { useIntersection } from "@mantine/hooks"
import { useInfiniteQuery } from "@tanstack/react-query"
import axios from "axios"
import { FC, useEffect, useRef } from "react"
import Story from "./Story"

interface StoryFeedProps {
    initialStorys: ExtendedStory[]
    subscribed?: boolean
}

const StoryFeed: FC<StoryFeedProps> = ({
    initialStorys,
    subscribed = false
}) => {
    const lastStoryRef = useRef<HTMLElement>(null)
    const { ref, entry } = useIntersection({
        root: lastStoryRef.current,
        threshold: 1
    })

    const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
        ["infinite-query", subscribed],
        async ({ pageParam = 1 }) => {
            const query = `/api/stories?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}&subscribed=${subscribed}`
            const { data } = await axios.get(query)
            return data as ExtendedStory[]
        },
        {
            getNextPageParam: (_, pages) => {
                return pages.length + 1
            },
            initialData: {
                pages: [initialStorys],
                pageParams: [1]
            }
        }
    )

    useEffect(() => {
        if (entry?.isIntersecting) fetchNextPage()
    }, [entry, fetchNextPage])

    const stories = data?.pages.flatMap((story) => story) ?? initialStorys

    return (
        <div className="grid grid-cols-3 gap-4">
            {stories.map((story, index) => {
                if (index === stories.length - 1)
                    return (
                        <li key={story.id} ref={ref} className="list-none">
                            <Story story={story} />
                        </li>
                    )

                return <Story story={story} key={story.id} />
            })}
        </div>
    )
}

export default StoryFeed
