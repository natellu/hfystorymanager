import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Sorted, UserRole } from "@prisma/client"
import { z } from "zod"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const session = await getAuthSession()

    if (
        session?.user.role !== UserRole.ADMIN &&
        session?.user.role !== UserRole.MOD
    )
        return new Response("Unauthorized", { status: 401 })

    try {
        const posts = await db.post.findMany({
            orderBy: {
                title: "asc"
            },
            select: {
                title: true,
                sorted: true,
                id: true,
                chapter: true,
                Story: {
                    select: {
                        title: true
                    }
                }
            }
        })

        return new Response(JSON.stringify(posts))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        console.log(error)
        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
