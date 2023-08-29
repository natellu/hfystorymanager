import GeneralStoryFeed from "@/components/GeneralStoryFeed"

import { getAuthSession } from "@/lib/auth"
import Link from "next/link"

export default async function Home() {
    const session = await getAuthSession()
    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl">Stories</h1>
            <div className="flex items-center space-x-2 py-4">
                {session ? (
                    <Link
                        href="/subscribedStories"
                        className="text-orange-600 underline hover:text-orange-800"
                    >
                        Subscribed stories
                    </Link>
                ) : null}
            </div>
            <div className="">
                {/* Stories */}
                <GeneralStoryFeed />
            </div>
        </>
    )
}
