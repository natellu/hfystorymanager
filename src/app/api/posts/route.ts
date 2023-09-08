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
        const { page, limit, search } = z
            .object({
                page: z.string(),
                limit: z.string(),
                search: z.string().optional()
            })
            .parse({
                page: url.searchParams.get("page"),
                limit: url.searchParams.get("limit"),
                search: url.searchParams.get("search") || undefined
            })

        //transaction?

        const countPosts = await db.post.count({
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                }
            }
        })

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                title: "asc"
            },
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                }
            },
            select: {
                author: true,
                title: true,
                sorted: true,
                id: true,
                chapter: true,
                storyId: true,
                Story: {
                    select: {
                        title: true
                    }
                }
            }
        })

        return new Response(
            JSON.stringify({
                posts,
                count: countPosts
            })
        )
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
