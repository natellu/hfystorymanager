import { FC } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/Card"
import { ExtendedStory } from "@/types/db"

interface StoryProps {
    story: ExtendedStory
}

const Story: FC<StoryProps> = ({ story }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{story.title}</CardTitle>
                <CardDescription>
                    Author:{" "}
                    <a href={`https://www.reddit.com/u/${story.author}`}>
                        {story.author}
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid gap-2">
                    {story.chapters?.map((post) => (
                        <a
                            href={`https://reddit.com${post.permalink}`}
                            key={post.postId}
                        >
                            {post.title}
                        </a>
                    ))}
                </div>
            </CardContent>
            <CardFooter></CardFooter>
        </Card>
    )
}

export default Story
