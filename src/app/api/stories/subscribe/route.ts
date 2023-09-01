import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { StoryValidator } from "@/lib/validators/story"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (!session?.user || !session.user.id)
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { storyId } = StoryValidator.parse(body)

        const subscriptionExists = await db.user.findFirst({
            where: {
                id: session.user.id
            },
            include: {
                subscribedStories: {
                    where: {
                        id: storyId
                    }
                }
            }
        })

        if (subscriptionExists?.subscribedStories.length! > 0) {
            await db.user.update({
                where: {
                    id: session.user.id
                },
                data: {
                    subscribedStories: {
                        disconnect: [{ id: storyId }]
                    }
                }
            })

            return new Response(storyId)
        }

        await db.user.update({
            where: {
                id: session.user.id
            },
            data: {
                subscribedStories: {
                    connect: [{ id: storyId }]
                }
            }
        })

        return new Response(storyId)
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not subscribe", { status: 500 })
    }
}
