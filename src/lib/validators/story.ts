import { z } from "zod"

export const StorySubscriptionValidator = z.object({
    storyId: z.string().length(24)
})

export type SubscribeToStoryPayload = z.infer<typeof StorySubscriptionValidator>
