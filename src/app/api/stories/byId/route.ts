import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function GET(req: Request) {
    const session = await getAuthSession()

    if (
        session?.user.role !== UserRole.ADMIN &&
        session?.user.role !== UserRole.MOD
    )
        return new Response("Unauthorized", { status: 401 })

    const url = new URL(req.url)

    try {
        const { id } = z
            .object({
                id: z.string()
            })
            .parse({
                id: url.searchParams.get("id")
            })

        const story = await db.story.findFirst({
            where: {
                id
            },
            include: {
                chapters: true
            }
        })

        return new Response(JSON.stringify(story))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
