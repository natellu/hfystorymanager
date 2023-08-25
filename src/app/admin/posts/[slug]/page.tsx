import EditPost from "@/components/EditPost"
import { db } from "@/lib/db"
import { ExtendedPost } from "@/types/db"
import { notFound } from "next/navigation"

interface pageProps {
    params: {
        slug: string
    }
}

const page = async ({ params: { slug } }: pageProps) => {
    const post = await db.post.findFirst({
        where: {
            id: slug
        },
        include: {
            Story: true
        }
    })

    if (!post) return notFound()

    return <EditPost post={post} />
}

export default page
