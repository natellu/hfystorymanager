import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { NextAuthOptions, getServerSession } from "next-auth"
import RedditProvider from "next-auth/providers/reddit"
import { db } from "./db"

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
        /*         {
            id: "reddit",
            name: "Reddit",
            type: "oauth",
            authorization:
                "https://www.reddit.com/api/v1/authorize?scope=identity",
            token: " https://www.reddit.com/api/v1/access_token",
            userinfo: "https://oauth.reddit.com/api/v1/me",
            profile(profile) {
                console.log(profile.id)
                return {
                    id: profile.id, 
                    name: profile.name,
                    email: null,
                    image: null
                }
            },
            clientId: process.env.REDDIT_CLIENT_ID,
            clientSecret: process.env.REDDIT_CLIENT_SECRET
        } */
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
                where: { id: token.sub }
            })

            if (!dbUser) {
                //user sometimes undefined???
                token.id = user.id
                return token
            }

            return {
                sub: dbUser.id,
                id: dbUser.id,
                email: dbUser.email,
                role: dbUser.role,
                name: dbUser.name
            }
        }
    }
}

export const getAuthSession = () => getServerSession(authOptions)
