import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { SiteHeader } from "@/components/layout/SiteHeader"
import SessionProvider from "@/components/SessionProvider"
import { PWARegister } from "@/components/PWARegister"
import { ThemeProvider } from "@/components/ThemeProvider"
import { RealtimeProvider } from "@/lib/realtime/RealtimeContext"
import { ToastContainer } from "@/components/Toast"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "LikhaVerse — Every Writer Has a Universe",
  description: "A free online storytelling platform for readers and writers. Write your story. Build your world. Watch it come alive.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "LikhaVerse",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "msapplication-tile-color": "#09090b",
    "theme-color": "#09090b",
  },
}

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{
          __html: `(function(){try{var e=localStorage.getItem("theme");var t=e==="dark"||(!e&&matchMedia("(prefers-color-scheme:dark)").matches);if(t)document.documentElement.classList.add("dark");else document.documentElement.classList.remove("dark")}catch(e){}})()`
        }} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-tile-color" content="#09090b" />
        <meta name="theme-color" id="theme-color-meta" content="#09090b" />
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />
      </head>
      <body className="relative min-h-full bg-[#D4C5F0] dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 transition-colors duration-300">
        <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-violet-200/30 dark:from-violet-950/30 via-transparent to-transparent" />
        <ThemeProvider>
          <SessionProvider>
            <RealtimeProvider>
              <SiteHeader />
              <main className="relative flex-1">{children}</main>
              <PWARegister />
              <ToastContainer />
            </RealtimeProvider>
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
