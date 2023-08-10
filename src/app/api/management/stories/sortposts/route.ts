import { SortPostToStories } from "@/lib/postsManagent"

export async function GET() {
    SortPostToStories()
    return new Response("Ok")
}
