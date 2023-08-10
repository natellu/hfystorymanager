import { getPosts } from "@/lib/postsManagent"

export async function GET() {
    // "https://www.reddit.com/r/hfy/new.json?limit=100&after=t3_15icm8o"

    getPosts(false)

    return new Response("OK")
}
