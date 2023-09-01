import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { UserRole } from "@prisma/client"
import { NextAuthOptions, getServerSession } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
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
        }),
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: {
                    label: "Username",
                    type: "text",
                    placeholder: "jsmith"
                },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials, req) {
                // Add logic here to look up the user from the credentials supplied
                console.log(credentials)
                const user = {
                    id: "1",
                    name: "J Smith",
                    email: "jsmith@example.com"
                }

                if (user) {
                    // Any object returned will be saved in `user` property of the JWT
                    return user
                } else {
                    // If you return null then an error will be displayed advising the user to check their details.
                    return null

                    // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
                }
            }
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
            if (token.sub === "1") {
                token.role = UserRole.MOD
                return token
            }

            const dbUser = await db.user.findFirst({
                where: { id: token.sub }
            })

            if (!dbUser) {
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
