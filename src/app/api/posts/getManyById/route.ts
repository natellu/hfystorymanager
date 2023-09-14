import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UserRole } from "@prisma/client"
import { z } from "zod"

export async function POST(req: Request) {
    const session = await getAuthSession()
    if (
        session?.user.role !== UserRole.ADMIN &&
        session?.user.role !== UserRole.MOD
    )
        return new Response("Unauthorized", { status: 401 })

    try {
        const body = await req.json()
        const { ids } = z
            .object({
                ids: z.array(z.string())
            })
            .parse(body)

        const posts = await db.post.findMany({
            where: {
                id: {
                    in: ids
                }
            },
            orderBy: {
                chapter: "asc"
            }
        })

        return new Response(JSON.stringify(posts))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not delete post", { status: 500 })
    }
}
