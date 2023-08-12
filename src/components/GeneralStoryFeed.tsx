import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { db } from "@/lib/db"
import StoryFeed from "./StoryFeed"

const GeneralStoryFeed = async () => {
    const stories = await db.story.findMany({
        include: {
            chapters: true
        },
        orderBy: {
            title: "asc"
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
    })

    return <StoryFeed initialStorys={stories} />
}

export default GeneralStoryFeed
