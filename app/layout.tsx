import type { Metadata } from "next"
import "./globals.css"
import { Providers } from "@/components/providers"

export const metadata: Metadata = {
  title: "TaskLinker - Connect, Complete, Earn",
  description: "A platform connecting freelancers with clients for task completion and secure payments",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
