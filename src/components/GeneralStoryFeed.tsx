import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExtendedStory } from "@/types/db"
import StoryFeed from "./StoryFeed"

const GeneralStoryFeed = async () => {
    const session = await getAuthSession()
    const stories = await db.story.findMany({
        include: {
            chapters: {
                orderBy: {
                    created: "desc"
                },
                include: {
                    Users: session
                        ? {
                              where: {
                                  id: session.user.id
                              }
                          }
                        : false
                }
            }
        },
        orderBy: {
            title: "asc"
        },
        take: INFINITE_SCROLLING_PAGINATION_RESULTS
    })

    const tempStorys: ExtendedStory[] = stories

    tempStorys?.map((story) => story.chapters.map((c) => delete c.userIds))

    return <StoryFeed initialStorys={tempStorys} />
}

export default GeneralStoryFeed
