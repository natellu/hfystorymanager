import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { UnlinkPostValidator } from "@/lib/validators/post"
import { Sorted, UserRole } from "@prisma/client"
import { z } from "zod"

export async function POST(req: Request) {
    //todo check if middleware handles this
    const session = await getAuthSession()

    try {
        if (
            session?.user.role !== UserRole.ADMIN &&
            session?.user.role !== UserRole.MOD
        )
            return new Response("Unauthorized", { status: 401 })

        const body = await req.json()

        const { id, storyId } = UnlinkPostValidator.parse(body)

        const updatePost = await db.post.update({
            where: {
                id
            },
            data: {
                Story: {
                    disconnect: true
                },
                sorted: Sorted.SORTED
            }
        })

        return new Response(JSON.stringify(updatePost))
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Could not unlink", { status: 500 })
    }
}
