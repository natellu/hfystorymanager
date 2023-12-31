import Navbar from "@/components/Navbar"
import Providers from "@/components/Providers"
import Toaster from "@/components/ui/Toaster"
import { cn } from "@/lib/utils"
import "@/styles/globals.css"
import type { Metadata } from "next"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
    title: "HFY Manager",
    description: ""
}

export default function RootLayout({
    children
}: {
    children: React.ReactNode
}) {
    return (
        <html
            lang="en"
            className={cn(
                "bg-white text-slate-900 antialised light",
                inter.className
            )}
        >
            <body className="min-h-screen pt-12 bg-slate-50 antialiased">
                <Providers>
                    <Navbar />

                    <div className="container max-w-8xl mx-auto h-full pt-12">
                        {children}
                    </div>

                    <Toaster />
                </Providers>
            </body>
        </html>
    )
}
