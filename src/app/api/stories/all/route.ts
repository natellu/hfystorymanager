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

    try {
        const url = new URL(req.url)
        const { page, limit, search, orderColumn, orderDir, sorted } = z
            .object({
                page: z.string().optional(),
                limit: z.string().optional(),
                search: z.string().optional(),
                orderColumn: z.string().optional(),
                orderDir: z.string().optional(),
                sorted: z.string().optional()
            })
            .parse({
                page: url.searchParams.get("page") || undefined,
                limit: url.searchParams.get("limit") || undefined,
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

        const countStories = await db.story.count({
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                },
                OR: sortedWhereQuery.length > 0 ? sortedWhereQuery : undefined
            }
        })

        const stories = await db.story.findMany({
            take: limit ? parseInt(limit) : undefined,
            skip:
                page && limit
                    ? (parseInt(page) - 1) * parseInt(limit)
                    : undefined,
            orderBy: orderQuery,
            where: {
                title: {
                    contains: search || undefined,
                    mode: "insensitive"
                },
                OR: sortedWhereQuery.length > 0 ? sortedWhereQuery : undefined
            },
            select: {
                title: true,
                id: true,
                chapters: {
                    select: {
                        id: true,
                        title: true
                    }
                }
            }
        })

        return new Response(
            JSON.stringify({
                stories,
                count: countStories
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
