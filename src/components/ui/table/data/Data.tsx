import { Laptop2, Shovel, Circle } from "lucide-react"

import { Sorted } from "@prisma/client"

export const sorted = [
    {
        value: Sorted.GPTSORTED,
        label: "GPT",
        icon: Laptop2
    },
    {
        value: Sorted.SORTED,
        label: "Sorted",
        icon: Shovel
    },
    {
        value: Sorted.NOTSORTED,
        label: "Not Sorted",
        icon: Circle
    }
]
