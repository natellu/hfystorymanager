"use client"

import { User } from "next-auth"
import { FC } from "react"
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuSeparator
} from "./ui/DropdownMenu"
import UserAvatar from "./UserAvatar"

import Link from "next/link"
import { signOut, useSession } from "next-auth/react"
import { UserRole } from "@prisma/client"

interface UserAccountNavProps {
    user: Pick<User, "name" | "image" | "email">
}

const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {
    const { data: session } = useSession()

    return (
        <DropdownMenu>
            <DropdownMenuTrigger>
                <UserAvatar
                    className="h-8 w-8"
                    user={{
                        name: user.name || null,
                        image: user.image || null
                    }}
                />
            </DropdownMenuTrigger>

            <DropdownMenuContent className="bg-white" align="end">
                <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                        {user.name && (
                            <p className="font-medium">{user.name}</p>
                        )}
                        {user.email && (
                            <p className="w-[200] truncate text-sm text-zinc-700">
                                {user.email}
                            </p>
                        )}
                    </div>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="/">Stories</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {session?.user.role === UserRole.ADMIN ||
                session?.user.role === UserRole.MOD ? (
                    <>
                        <DropdownMenuItem asChild>
                            <Link href="/admin">Admin</Link>
                        </DropdownMenuItem>
                        {session?.user.role === UserRole.ADMIN ? (
                            <DropdownMenuItem asChild>
                                <Link href="/admin/users">Users</Link>
                            </DropdownMenuItem>
                        ) : null}
                        <DropdownMenuItem asChild>
                            <Link href="/admin/stories">Stories</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/admin/posts">Posts</Link>
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />
                    </>
                ) : null}

                <DropdownMenuItem
                    onSelect={(e) => {
                        e.preventDefault()
                        signOut({
                            callbackUrl: `${window.location.origin}/sign-in`
                        })
                    }}
                    className="cursor-pointer"
                >
                    Sign out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

export default UserAccountNav
