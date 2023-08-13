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
            subscribedStorys: {
                include: {
                    chapters: true
                }
            }
        }
    })

    return (
        <StoryFeed initialStorys={user?.subscribedStorys!} subscribed={true} />
    )
}

export default CustomStoryFeed
