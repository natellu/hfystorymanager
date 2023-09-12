import { z } from "zod"

export const StoryValidator = z.object({
    storyId: z.string()
})

export type StoryPayload = z.infer<typeof StoryValidator>

export const StoryAddValidator = z.object({
    author: z.string().optional(),
    title: z.string()
})

export type StoryAddPayload = z.infer<typeof StoryAddValidator>

export const UpdateStoryValidator = z.object({
    id: z.string(),
    title: z.string().optional(),
    chapters: z.array(z.string()).optional()
})

export type UpdateStoryPayload = z.infer<typeof UpdateStoryValidator>
