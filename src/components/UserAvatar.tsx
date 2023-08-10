import { User } from "next-auth"
import { FC } from "react"
import { Avatar, AvatarFallback } from "./ui/Avatar"
import Image from "next/image"
import { AvatarProps } from "@radix-ui/react-avatar"
import { User as UserAvatarIcon } from "lucide-react"

interface UserAvatarProps extends AvatarProps {
    user: Pick<User, "name" | "image">
}

const UserAvatar: FC<UserAvatarProps> = ({ user, ...props }) => {
    return (
        <Avatar {...props}>
            {user.image ? (
                <div className="relative aspect-square h-full w-full">
                    <Image
                        fill
                        src={user.image}
                        alt="Profile Picture"
                        referrerPolicy="no-referrer"
                    />
                </div>
            ) : (
                <AvatarFallback>
                    <span className="sr-only">{user?.name}</span>
                    <UserAvatarIcon className="h-4 w-4" />
                </AvatarFallback>
            )}
        </Avatar>
    )
}

export default UserAvatar
