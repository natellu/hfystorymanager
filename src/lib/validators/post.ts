import { z } from "zod"

export const UpdatePostValidator = z.object({
    id: z.string(),
    storyId: z.string().optional(),
    chapter: z.number().optional(),
    title: z.string().optional()
})

export type UpdatePostPayload = z.infer<typeof UpdatePostValidator>
