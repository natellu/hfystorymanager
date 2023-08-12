"use client"

import { useOnClickOutside } from "@/hooks/use-on-click-outside"
import { Prisma, Story } from "@prisma/client"
import { useQuery } from "@tanstack/react-query"
import axios from "axios"
import debounce from "lodash.debounce"
import { usePathname, useRouter } from "next/navigation"
import { FC, useCallback, useEffect, useRef, useState } from "react"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "./ui/Command"
import { Users } from "lucide-react"

interface SearchBarProps {}

const SearchBar: FC<SearchBarProps> = ({}) => {
    const router = useRouter()
    const [input, setInput] = useState<string>("")

    const {
        data: queryResults,
        refetch,
        isFetched,
        isFetching
    } = useQuery({
        queryFn: async () => {
            if (!input) return []

            const { data } = await axios.get(`/api/search?q=${input}`)
            return data as (Story & { _count: Prisma.StoryCountOutputType })[]
        },
        queryKey: ["search-query"],
        enabled: false
    })

    const request = debounce(() => {
        refetch()
    }, 300)

    const debounceRequest = useCallback(async () => {
        request()
    }, [])

    const commandRef = useRef<HTMLDivElement>(null)

    useOnClickOutside(commandRef, () => {
        setInput("")
    })

    const pathname = usePathname()

    useEffect(() => {
        setInput("")
    }, [pathname])

    return (
        <Command
            ref={commandRef}
            className="relative rounded-lg border max-w-lg z-50 overflow-visible"
        >
            <CommandInput
                value={input}
                onValueChange={(text) => {
                    setInput(text)
                    debounceRequest()
                }}
                className="outline-none border-none focus:border-none focus:outline-none ring-0"
                placeholder="Search Stories..."
            />

            {input.length > 0 ? (
                <CommandList className="absolute bg-white top-full inset-x-0 shadow rounded-b-md">
                    {isFetched && (
                        <CommandEmpty>No results found.</CommandEmpty>
                    )}

                    {(queryResults?.length ?? 0) > 0 ? (
                        <CommandGroup heading="Stories">
                            {queryResults?.map((story) => (
                                <CommandItem
                                    onSelect={() => {
                                        router.push(`/story/${story.id}`)
                                        router.refresh()
                                    }}
                                    key={story.id}
                                    value={story.title}
                                >
                                    <Users className="mr-2 h-4 w-4" />
                                    <a href={`/story/${story.id}`} className="">
                                        {story.title}
                                    </a>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    ) : null}
                </CommandList>
            ) : null}
        </Command>
    )
}

export default SearchBar
