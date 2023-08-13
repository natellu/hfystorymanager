import { useCustomToast } from "@/hooks/use-custom-toast"
import { toast } from "@/hooks/use-toast"
import { SubscribeToStoryPayload } from "@/lib/validators/story"
import { useMutation } from "@tanstack/react-query"
import axios, { AxiosError } from "axios"
import { CheckCheck, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { FC, startTransition, useEffect, useState } from "react"
import { Button } from "./ui/Button"

interface SubscribeLeaveToggleProps {
    storyId: string
    isSubscribed: boolean
}

const SubscribeLeaveToggle: FC<SubscribeLeaveToggleProps> = ({
    storyId,
    isSubscribed: isSubscribedInitial
}) => {
    const router = useRouter()
    const { loginToast } = useCustomToast()
    const [isSubscribed, setIsSubscribed] =
        useState<boolean>(isSubscribedInitial)

    useEffect(() => {
        setIsSubscribed(isSubscribedInitial)
    }, [isSubscribedInitial])

    const { mutate: subscribe, isLoading: isSubscribeLoading } = useMutation({
        mutationFn: async () => {
            const payload: SubscribeToStoryPayload = {
                storyId
            }

            const { data } = await axios.post("/api/story/subscribe", payload)

            return data as string
        },
        onError: (err) => {
            if (err instanceof AxiosError) {
                if (err.response?.status === 401) return loginToast()
            }

            return toast({
                title: "There was an problem.",
                description: "Something went wrong, please try again.",
                variant: "destructive"
            })
        },
        onSuccess: () => {
            startTransition(() => {
                setIsSubscribed(true)
                router.refresh()
            })

            return toast({
                title: "Subscribed",
                description: `Subscribing successful`,
                variant: "default"
            })
        }
    })

    const { mutate: unsubscribe, isLoading: isUnSubscribingLoading } =
        useMutation({
            mutationFn: async () => {
                const payload: SubscribeToStoryPayload = {
                    storyId
                }

                const { data } = await axios.post(
                    "/api/story/subscribe",
                    payload
                )

                return data as string
            },
            onError: (err) => {
                if (err instanceof AxiosError) {
                    if (err.response?.status === 401) return loginToast()
                }

                return toast({
                    title: "There was an problem.",
                    description: "Something went wrong, please try again.",
                    variant: "destructive"
                })
            },
            onSuccess: () => {
                startTransition(() => {
                    setIsSubscribed(false)
                    router.refresh()
                })

                return toast({
                    title: "Unsubscribed",
                    description: `Unsubscribing successful`,
                    variant: "default"
                })
            }
        })

    return isSubscribed ? (
        <Button
            size="xs"
            variant="ghost"
            className="left"
            onClick={() => unsubscribe()}
        >
            <X />
        </Button>
    ) : (
        <Button
            size="xs"
            variant="ghost"
            className="left"
            onClick={() => subscribe()}
        >
            <CheckCheck />
        </Button>
    )
}

export default SubscribeLeaveToggle
