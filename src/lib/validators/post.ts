import { z } from "zod"

export const UpdatePostValidator = z.object({
    id: z.string(),
    storyId: z.string().optional(),
    chapter: z.number().optional(),
    title: z.string().optional()
})

export type UpdatePostPayload = z.infer<typeof UpdatePostValidator>

export const UnlinkPostValidator = z.object({
    id: z.string(),
    storyId: z.string()
})

export type UnlinkPostPayload = z.infer<typeof UnlinkPostValidator>

export const PostValidator = z.object({
    id: z.string()
})

export type PostPayload = z.infer<typeof PostValidator>
