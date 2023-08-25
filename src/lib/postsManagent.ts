import { db } from "@/lib/db"
import { Post, Sorted } from "@prisma/client"
import axios from "axios"
import { ObjectId } from "bson"

import { gptPrompt } from "@/lib/gpt-prompt"
import {
    ChatGPTMessage,
    ChatGPTResponse,
    OpenAIStream,
    OpenAIStreamPayload
} from "@/lib/openai"

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36"
}

export async function getPosts(alsoSort: boolean) {
    let post = await db.post.findFirst({
        orderBy: {
            created: "desc"
        },
        take: 1
    })

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

            if (name === post?.name) {
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
                    storyId,
                    chapter: null,
                    sorted: Sorted.NOTSORTED
                })
            }
        }

        if (posts.length > 0)
            await db.post.createMany({
                data: posts
            })

        if (lastRun) break

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

    if (alsoSort) {
        SortPostToStories()
    }
}

export async function SortPostToStories() {
    let posts: Post[] = []
    do {
        console.log("Sorting Posts to Stories")

        posts = await db.post.findMany({
            where: {
                storyId: {
                    isSet: false
                }
            },
            take: 20
        })

        let p = ""
        posts.map((post) => (p += `${post.id}:${post.title}\n`))

        const prompts: ChatGPTMessage[] = [
            {
                content: p,
                role: "user"
            }
        ]

        prompts.unshift({
            content: gptPrompt,
            role: "system"
        })

        let tokenguess: number = prompts.reduce((acc, pr) => {
            return acc + pr.content.length
        }, 0)

        /* https://help.openai.com/en/articles/4936856-what-are-tokens-and-how-to-count-them */
        tokenguess = tokenguess / 4 //4 chars ~ 1 token

        const payload: OpenAIStreamPayload = {
            model: "gpt-3.5-turbo",
            messages: prompts,
            temperature: 0.4,
            top_p: 1,
            frequency_penalty: 0,
            presence_penalty: 0,
            max_tokens: 2000,
            stream: false,
            n: 1
        }

        const data: ChatGPTResponse[] = await OpenAIStream(payload)
        if (data) {
            for (const p of data) {
                const storyExists = await db.story.findFirst({
                    where: {
                        title: p.title
                    }
                })

                if (storyExists) {
                    const updateStory = await db.story.update({
                        where: {
                            title: p.title
                        },
                        data: {
                            chapters: {
                                connect: { id: p.id }
                            }
                        }
                    })

                    const updatePost = await db.post.update({
                        where: {
                            id: p.id
                        },
                        data: {
                            chapter: Number(p.chapter),
                            sorted: Sorted.GPTSORTED
                        }
                    })
                } else {
                    const post = await db.post.findFirst({
                        where: {
                            id: p.id
                        }
                    })

                    const create = await db.story.create({
                        data: {
                            title: p.title,
                            chapters: {
                                connect: { id: p.id }
                            },
                            author: post?.author
                        }
                    })

                    const updatePost = await db.post.update({
                        where: {
                            id: p.id
                        },
                        data: {
                            chapter: Number(p.chapter),
                            sorted: Sorted.GPTSORTED
                        }
                    })
                }
            }
        }
    } while (posts.length > 0)
}
