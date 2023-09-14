import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UpdatePostValidator } from "@/lib/validators/post"
import { Sorted, UserRole } from "@prisma/client"
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
        const validateSchema = z.array(UpdatePostValidator)

        const postsToUpdate = validateSchema.parse(body)

        const updatedPosts = await db.$transaction(
            postsToUpdate.map((p) =>
                db.post.update({
                    where: {
                        id: p.id
                    },
                    data: {
                        chapter: p.chapter,
                        Story: {
                            connect: {
                                id: p.storyId
                            }
                        },
                        sorted: Sorted.SORTED
                    }
                })
            )
        )

        return new Response(JSON.stringify(updatedPosts))
    } catch (error) {
        console.log(error)
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not update", { status: 500 })
    }
}
