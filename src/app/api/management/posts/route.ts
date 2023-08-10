import { db } from "@/lib/db"
import { Post } from "@prisma/client"
import axios, { AxiosHeaders } from "axios"
import { ObjectId } from "bson"

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
}

export async function GET(req: Request) {
    // "https://www.reddit.com/r/hfy/new.json?limit=100&after=t3_15icm8o"

    let post = await db.post.findFirst({
        orderBy: {
            created: "desc"
        },
        take: 1
    })
    getPosts(post?.name)

    return new Response("OK")
}

async function getPosts(newestInDB?: string) {
    const delay = (ms: number) => new Promise((res) => setTimeout(res, ms))

    let d: any = null

    const {
        data: {
            data: { children: data }
        }
    } = await axios.get("https://www.reddit.com/r/hfy/new.json?limit=100", {
        headers
    })

    d = data

    let lastRun = false
    while (Object.keys(d).length > 0) {
        let posts: Post[] = []

        for (const key in Object.keys(d)) {
            let {
                id: postId,
                title,
                subreddit,
                author,
                name,
                permalink,
                created,
                score,
                archived,
                selftext,
                storyId
            }: Post = { ...d[key].data }

            if (name === newestInDB) {
                console.log("newest in db reached")
                lastRun = true
                break
            }

            const postExist = await db.post.findFirst({
                where: {
                    postId: postId
                }
            })

            if (postExist) {
                console.log(`Post Exists ${title}`) //todo remove??? put in own route
            } else {
                posts.push({
                    id: new ObjectId().toString(),
                    postId,
                    title,
                    subreddit,
                    author,
                    name,
                    permalink,
                    created,
                    score,
                    archived,
                    selftext,
                    storyId
                })
            }
        }

        console.log(posts.length)
        await db.post.createMany({
            data: posts
        })

        if (lastRun) return

        const {
            data: {
                data: { children: data }
            },
            headers: resHeader
        } = await axios.get(
            `https://www.reddit.com/r/hfy/new.json?limit=100&after=${
                d[d.length - 1].data.name
            }`,
            { headers }
        )

        await delay(2300)

        if (resHeader["x-ratelimit-remaining"] < 5) {
            console.log(`Waiting for ${resHeader["x-ratelimit-reset"]} seconds`)
            await delay(resHeader["x-ratelimit-reset"] * 1000)
        }
        d = data
    }
}
