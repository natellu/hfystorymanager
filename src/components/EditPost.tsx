"use client"

import { FC, useState } from "react"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "./ui/Card"
import { Input } from "./ui/Input"
import { Post } from "@prisma/client"

interface EditPostProps {
    post: Post
}

const EditPost: FC<EditPostProps> = ({ post }) => {
    const [tempPost, setTempPost] = useState(post)

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex justify-between">
                    <Input
                        type="text"
                        placeholder="Title"
                        value={tempPost.title}
                    />
                </CardTitle>
                <CardDescription>Author: u/{tempPost.author}</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
            <CardFooter></CardFooter>
        </Card>
    )
}

export default EditPost
