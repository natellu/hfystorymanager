import { getAuthSession } from "@/lib/auth"
import { db } from "@/lib/db"
import { Prisma, Sorted, UserRole } from "@prisma/client"
import { z } from "zod"

export async function GET(req: Request) {
    const session = await getAuthSession()

    if (
        session?.user.role !== UserRole.ADMIN &&
        session?.user.role !== UserRole.MOD
    )
        return new Response("Unauthorized", { status: 401 })

    const url = new URL(req.url)
    try {
        const { page, limit, search, orderColumn, orderDir, sorted } = z
            .object({
                page: z.string(),
                limit: z.string(),
                search: z.string().optional(),
                orderColumn: z.string().optional(),
                orderDir: z.string().optional(),
                sorted: z.string().optional()
            })
            .parse({
                page: url.searchParams.get("page"),
                limit: url.searchParams.get("limit"),
                search: url.searchParams.get("search") || undefined,
                orderColumn: url.searchParams.get("orderColumn") || undefined,
                orderDir: url.searchParams.get("orderDir") || undefined,
                sorted: url.searchParams.get("sorted") || undefined
            })

        let sortedWhereQuery: any[] = []
        if (
            sorted === "undefined" ||
            sorted === undefined ||
            sorted.split(",").length === Object.keys(Sorted).length
        ) {
            sortedWhereQuery = []
        } else {
            const sortedFilter = sorted.split(",")
            sortedWhereQuery = []

            sortedFilter.map((s) => {
                sortedWhereQuery.push({
                    sorted: s
                })
            })
        }

        let orderQuery: any = {
            title: Prisma.SortOrder.asc
        }
        if (
            orderColumn === "undefined" ||
            orderDir === "undefined" ||
            orderColumn === undefined
        ) {
            orderQuery = {
                title: Prisma.SortOrder.asc
            }
        } else {
            if (orderDir === "ascending") {
                orderQuery = {
                    [orderColumn]: Prisma.SortOrder.asc
                }
            } else {
                orderQuery = {
                    [orderColumn]: Prisma.SortOrder.desc
                }
            }
        }

        //transaction?
        const countPosts = await db.post.count({
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                },
                OR: sortedWhereQuery.length > 0 ? sortedWhereQuery : undefined
            }
        })

        const posts = await db.post.findMany({
            take: parseInt(limit),
            skip: (parseInt(page) - 1) * parseInt(limit),
            orderBy: orderQuery,
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                },
                OR: sortedWhereQuery.length > 0 ? sortedWhereQuery : undefined
            },
            select: {
                author: true,
                title: true,
                created: true,
                sorted: true,
                id: true,
                chapter: true,
                storyId: true,
                Story: {
                    select: {
                        title: true
                    }
                }
            }
        })

        return new Response(
            JSON.stringify({
                posts,
                count: countPosts
            })
        )
    } catch (error) {
        if (error instanceof z.ZodError)
            return new Response(error.message, { status: 422 })

        return new Response("Something went wrong with fetching stories", {
            status: 500
        })
    }
}
