import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { StoryValidator } from "@/lib/validators/story"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function POST(req: Request) {
    //todo check if middleware handles this
    const session = await getAuthSession()

    try {
        if (
            session?.user.role !== UserRole.ADMIN &&
            session?.user.role !== UserRole.MOD
        )
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { storyId } = StoryValidator.parse(body)

        const deleteStory = await db.story.delete({
            where: {
                id: storyId
            }
        })

        return new Response(JSON.stringify(deleteStory))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not delete story", { status: 500 })
    }
}
