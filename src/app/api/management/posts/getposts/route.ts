import { getPosts } from "@/lib/postsManagent"

export async function GET(req: Request) {
    if (req.headers.get("authorization") !== process.env.MANAGEMEN_HEADER_TOKEN)
        return new Response("Unauthorized", { status: 401 })

    getPosts(false)

    return new Response("OK")
}
