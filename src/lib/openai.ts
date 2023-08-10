import axios from "axios"

export interface OpenAIStreamPayload {
    model: string
    messages: any[]
    temperature: number
    top_p: number
    frequency_penalty: number
    presence_penalty: number
    max_tokens: number
    stream: boolean
    n: number
}

export interface ChatGPTMessage {
    role: ChatGPTAgent
    content: string
}

export interface ChatGPTMessageContent {
    title: string
    id?: string
}

export interface ChatGPTResponse {
    title: string
    chapter: number
    id: string
}

export type ChatGPTAgent = "user" | "system"

export async function OpenAIStream(payload: OpenAIStreamPayload) {
    const { data } = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        JSON.stringify(payload),
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
            }
        }
    )

    const gptRes: ChatGPTResponse[] = JSON.parse(
        data.choices[0].message.content
    )

    console.log(data)

    return gptRes
}
