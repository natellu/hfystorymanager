import Story from "@/components/Story"
import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { ExtendedStory } from "@/types/db"
import { notFound } from "next/navigation"

interface pageProps {
    params: {
        slug: string
    }
}

const page = async ({ params: { slug } }: pageProps) => {
    const session = await getAuthSession()
    const story = await db.story.findFirst({
        where: {
            id: slug
        },
        include: {
            chapters: {
                orderBy: {
                    created: "desc"
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
            }
        }
    })

    if (!story) return notFound()

    const tempStorys: ExtendedStory = story

    tempStorys?.chapters.map((c) => delete c.userIds)

    return <Story story={tempStorys} showSubscribe={true} />
}

export default page
