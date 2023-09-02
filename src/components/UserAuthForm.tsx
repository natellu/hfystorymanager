"use client"

import { useToast } from "@/hooks/use-toast"
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "./ui/Button"
import { Input } from "./ui/Input"

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

    const loginWithCreds = async () => {
        setIsLoading(true)
        try {
            await signIn("credentials", {
                callbackUrl: "/",
                username,
                password
            })
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

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")

    return (
        <div className="flex flex-col gap-10">
            <div className="">
                <Input
                    className="mt-2"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Username"
                />

                <Input
                    className="mt-2"
                    type="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                />

                <Button
                    isLoading={isLoading}
                    size="sm"
                    onClick={loginWithCreds}
                    className="mt-2 w-full"
                >
                    Sign In
                </Button>
            </div>
            <div className="">
                Or Sign in with
                <Button
                    size="sm"
                    className="w-full"
                    isLoading={isLoading}
                    onClick={loginWithReddit}
                >
                    Reddit
                </Button>
            </div>
        </div>
    )
}

export default UserAuthForm
