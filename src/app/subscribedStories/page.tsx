import CustomStoryFeed from "@/components/CustomStoryFeed"
import { getAuthSession } from "@/lib/auth"
import Link from "next/link"

const page = async () => {
    const session = await getAuthSession()
    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl">
                Subscribed Stories
            </h1>
            <div className="flex items-center space-x-2 py-4">
                {session ? (
                    <Link
                        href="/"
                        className="text-orange-600 underline hover:text-orange-800"
                    >
                        All stories
                    </Link>
                ) : null}
            </div>
            <div className="">
                <CustomStoryFeed />
            </div>
        </>
    )
}

export default page
