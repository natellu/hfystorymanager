import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { StorySubscriptionValidator } from "@/lib/validators/story"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user) return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { storyId } = StorySubscriptionValidator.parse(body)

        const subscriptionExists = await db.user.findFirst({
            where: {
                id: session.user.id
            },
            include: {
                subscribedStorys: {
                    where: {
                        id: storyId
                    }
                }
            }
        })

        if (subscriptionExists?.subscribedStorys.length! > 0)
            return new Response(storyId)

        return new Response(null)
    } catch (error) {}
}
