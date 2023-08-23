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
                session.user.name = token.name
                session.user.role = token.role
                session.user.email = token.email
            }

            return session
        },
        async jwt({ token, user }) {
            const dbUser = await db.user.findFirst({
                where: { id: token.id }
            })

            if (!dbUser) {
                //user sometimes undefined???
                token.id = user.id
                return token
            }

            if (!dbUser.name) {
                console.log("generating username")
                await db.user.update({
                    where: {
                        id: dbUser.id
                    },
                    data: {
                        name: nanoid(10)
                    }
                })
            }

            return {
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                name: dbUser.name
            }
        }
    }
}

export const getAuthSession = () => getServerSession(authOptions)
