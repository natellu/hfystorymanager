import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UpdateStoryValidator } from "@/lib/validators/story"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()

        if (
            session?.user.role !== UserRole.ADMIN &&
            session?.user.role !== UserRole.MOD
        )
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { id, title, chapters } = UpdateStoryValidator.parse(body)

        const updatedStory = await db.story.update({
            where: {
                id
            },
            data: {
                title: title || undefined
                //chapters
            }
        })

        return new Response(JSON.stringify(updatedStory))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not update", { status: 500 })
    }
}
