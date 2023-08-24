"use client"
import { DataTable } from "@/components/ui/table/DataTable"

import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import { columns } from "./columns"
import { ExtendedPost } from "@/types/db"

interface pageProps {}

//todo incremental loading

const page = () => {
    const { data, refetch, isFetched, isFetching } = useQuery({
        queryFn: async () => {
            const query = `/api/posts`

            const { data } = await axios.get(query)
            return data
        },
        queryKey: ["query"]
    })

    if (!data) return <div>Loading</div>

    const posts = data as ExtendedPost[]

    return (
        <div className="container mx-auto py-10">
            {posts ? <DataTable columns={columns} data={posts} /> : null}
        </div>
    )
}

export default page
