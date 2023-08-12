import GeneralStoryFeed from "@/components/GeneralStoryFeed"
import Image from "next/image"

export default function Home() {
    return (
        <>
            <h1 className="font-bold text-3xl md:text-4xl">New Posts</h1>
            <div className="">
                {/* Stories */}
                <GeneralStoryFeed />
            </div>
        </>
    )
}
