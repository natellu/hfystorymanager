import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UpdatePostValidator } from "@/lib/validators/post"
import { Sorted, UserRole } from "@prisma/client"
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

        const { id, storyId, chapter, title } = UpdatePostValidator.parse(body)

        const updatePost = await db.post.update({
            where: {
                id
            },
            data: {
                Story: storyId
                    ? {
                          connect: {
                              id: storyId
                          }
                      }
                    : undefined,
                chapter: chapter || undefined,
                title: title || undefined,
                sorted: Sorted.SORTED
            },
            select: {
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

        return new Response(JSON.stringify(updatePost))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not update", { status: 500 })
    }
}
