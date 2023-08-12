import { Post, Story } from "@prisma/client"

export type ExtendedStory = Story & {
    chapters: Post[]
}
