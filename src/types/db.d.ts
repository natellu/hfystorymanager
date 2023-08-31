import { Post, Story } from "@prisma/client"

type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>
type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

export type ExtendedStory = Story & {
    chapters: PartialBy<Post, "userIds">[]
}

export type ExtendedPost = Post & {
    Story: Story
}
