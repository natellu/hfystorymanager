import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, getServerSession } from "next-auth"
import { db } from "./db"
import RedditProvider from "next-auth/providers/reddit"
import { nanoid } from "nanoid"

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt"
    },
    pages: {
        signIn: "/sign-in"
    },
    providers: [
        RedditProvider({
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET
        })
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id
                session.user.username = token.username
                session.user.email = token.email
            }

            return session
        },
        async jwt({ token, user }) {
            const dbUser = await db.user.findFirst({
                where: { email: token.email }
            })

            if (!dbUser) {
                token.id = user.id
                return token
            }

            if (!dbUser.username) {
                console.log("generating username")
                await db.user.update({
                    where: {
                        id: dbUser.id
                    },
                    data: {
                        username: nanoid(10)
                    }
                })
            }

            return {
                id: dbUser.id,
                email: dbUser.email,
                username: dbUser.username
            }
        }
    }
}

export const getAuthSession = () => getServerSession(authOptions)
