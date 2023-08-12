import Story from "@/components/Story"
import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface pageProps {
    params: {
        slug: string
    }
}

const page = async ({ params: { slug } }: pageProps) => {
    const story = await db.story.findFirst({
        where: {
            id: slug
        },
        include: {
            chapters: {
                orderBy: {
                    created: "desc"
                }
            }
        }
    })

    if (!story) return notFound()

    return <Story story={story} />
}

export default page
