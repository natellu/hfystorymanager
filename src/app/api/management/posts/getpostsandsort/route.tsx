import { getPosts } from "@/lib/postsManagent"

export async function GET() {
    getPosts(true)

    return new Response("Ok")
}
