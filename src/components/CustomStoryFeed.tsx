import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"
import StoryFeed from "./StoryFeed"

const CustomStoryFeed = async () => {
    const session = await getAuthSession()
    if (!session) return notFound()

    const user = await db.user.findFirst({
        where: {
            id: session?.user.id
        },
        include: {
            subscribedStories: {
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
                }
            }
        }
    })
    //todo remove userids????

    return (
        <StoryFeed initialStorys={user?.subscribedStories!} subscribed={true} />
    )
}

export default CustomStoryFeed
