"use client"

import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "./ui/Button"

const UserAuthForm = ({}) => {
    const [isLoading, setIsLoading] = useState(false)

    const { toast } = useToast()

    const loginWithReddit = async () => {
        setIsLoading(true)
        try {
            await signIn("reddit", { callbackUrl: "/" })
        } catch (error) {
            toast({
                title: "Error",
                description:
                    "There was a problem logging in. Please try again later.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex justify-center">
            <Button
                size="sm"
                className="w-full"
                isLoading={isLoading}
                onClick={loginWithReddit}
            >
                Reddit
            </Button>
        </div>
    )
}

export default UserAuthForm
