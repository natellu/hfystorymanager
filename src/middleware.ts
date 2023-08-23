import { UserRole } from "@prisma/client"
import { withAuth, NextRequestWithAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
    function middleware(req: NextRequestWithAuth) {
        if (
            req.nextUrl.pathname.startsWith("/admin/users") &&
            req.nextauth.token?.role !== UserRole.ADMIN
        )
            return NextResponse.rewrite(new URL("/denied", req.url))

        if (
            req.nextUrl.pathname.startsWith("/admin") &&
            req.nextauth.token?.role !== UserRole.ADMIN &&
            req.nextauth.token?.role !== UserRole.MOD
        )
            return NextResponse.rewrite(new URL("/denied", req.url))
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token
        }
    }
)

export const config = { matcher: ["/admin/:path*"] }
