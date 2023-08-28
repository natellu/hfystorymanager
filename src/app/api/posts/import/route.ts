import { getAuthSession } from "@/lib/auth"
import { ImportMultiplePosts, ImportSinglePost } from "@/lib/postsManagent"
import { UserRole } from "@prisma/client"
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

        const { link } = z
            .object({
                link: z.string()
            })
            .parse(body)

        //check if link is user or post

        if (link.startsWith("https://www.reddit.com/user/")) {
            await ImportMultiplePosts(link)
        } else {
            const importedPost = await ImportSinglePost(link)
        }

        return new Response("Ok")
    } catch (error) {
        console.log(error)
        return new Response("Could not import", { status: 500 })
    }
}
