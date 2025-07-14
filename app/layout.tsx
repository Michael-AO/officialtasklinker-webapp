import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "@/components/ui/toaster"
// import { DataComparisonDebug } from "@/components/data-comparison-debug"

// Add the missing ThemeProvider import
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  fallback: ['system-ui', 'arial', 'sans-serif'],
  preload: true,
  adjustFontFallback: true
})

export const metadata: Metadata = {
  title: "Tasklinkers - Connect with Freelancers",
  description: "The best platform to find and hire talented freelancers",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <AuthProvider>
            {children}
            <Toaster />
            {/* Add debug component - remove in production */}
            {/* <DataComparisonDebug /> */}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
