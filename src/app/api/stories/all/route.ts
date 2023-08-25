import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function GET() {
    const session = await getAuthSession()
    if (
        session?.user.role !== UserRole.ADMIN &&
        session?.user.role !== UserRole.MOD
    )
        return new Response("Unauthorized", { status: 401 })

    try {
        const stories = await db.story.findMany({
            orderBy: {
                title: "asc"
            },
            select: {
                title: true,
                id: true
            }
        })

        return new Response(JSON.stringify(stories))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        console.log(error)
        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
