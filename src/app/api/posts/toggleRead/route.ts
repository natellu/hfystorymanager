import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { z } from "zod"

export async function POST(req: Request) {
    try {
        const session = await getAuthSession()
        if (!session?.user || !session.user.id)
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { postId, read } = z
            .object({
                postId: z.string(),
                read: z.boolean()
            })
            .parse(body)

        if (read) {
            const updatedPost = await db.post.update({
                where: {
                    id: postId
                },
                data: {
                    Users: {
                        connect: [
                            {
                                id: session.user.id
                            }
                        ]
                    }
                },
                include: {
                    Users: session
                        ? {
                              where: {
                                  id: session.user.id
                              }
                          }
                        : false
                }
            })

            return new Response(JSON.stringify(updatedPost))
        }

        const updatedPost = await db.post.update({
            where: {
                id: postId
            },
            data: {
                Users: {
                    disconnect: [
                        {
                            id: session.user.id
                        }
                    ]
                }
            },
            include: {
                Users: session
                    ? {
                          where: {
                              id: session.user.id
                          }
                      }
                    : false
            }
        })

        return new Response(JSON.stringify(updatedPost))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not update", { status: 500 })
    }
}
