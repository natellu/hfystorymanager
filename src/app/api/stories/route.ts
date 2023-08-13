import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function GET(req: Request) {
    const url = new URL(req.url)
    const session = await getAuthSession()
    try {
        const { limit, page, subscribed } = z
            .object({
                limit: z.string(),
                page: z.string(),
                subscribed: z.string().optional()
            })
            .parse({
                limit: url.searchParams.get("limit"),
                page: url.searchParams.get("page"),
                subscribed: url.searchParams.get("subscribed")
            })

        if (subscribed === "true") {
            const user = await db.user.findFirst({
                where: {
                    id: session?.user.id
                },
                include: {
                    subscribedStorys: {
                        take: parseInt(limit),
                        skip: (parseInt(page) - 1) * parseInt(limit),
                        include: {
                            chapters: true
                        }
                    }
                }
            })
            if (!user) throw new Error()

            return new Response(JSON.stringify(user?.subscribedStorys))
        }

        const stories = await db.story.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: {
                title: "asc"
            },
            include: {
                chapters: {
                    take: 3,
                    orderBy: {
                        created: "asc"
                    }
                }
            }
        })

        return new Response(JSON.stringify(stories))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
