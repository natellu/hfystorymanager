import { Post, Story } from "@prisma/client"

export type ExtendedStory = Story & {
    chapters: Post[]
}

export type ExtendedPost = Post & {
    Story: Story
}
