import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { StoryAddValidator } from "@/lib/validators/story"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function POST(req: Request) {
    const session = await getAuthSession()

    try {
        if (
            session?.user.role !== UserRole.ADMIN &&
            session?.user.role !== UserRole.MOD
        )
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { title, author } = StoryAddValidator.parse(body)

        const addStory = await db.story.create({
            data: {
                title,
                author
            }
        })

        return new Response(JSON.stringify(addStory))
    } catch (error) {
        console.log(error)
        //todo catch error when title already exist
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not add story", { status: 500 })
    }
}
