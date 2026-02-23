import type { Metadata, Viewport } from "next"
import "../styles/globals.css"
import { GeistSans } from "geist/font/sans"
import { Toaster } from "sonner"
import GoogleAnalytics from "@/components/utils/GoogleAnalytics"
import { config } from "@/constants/config"
import QueryProvider from "@/providers/queryProvider"
import { TenantProvider } from "@/providers/tenantProvider"

export const metadata: Metadata = {
  title: config.metadata.title,
  description: config.metadata.description,
  icons: {
    icon: config.metadata.icon,
  },
  openGraph: {
    title: config.metadata.openGraph.title,
    description: config.metadata.openGraph.description,
    images: [
      {
        url: config.metadata.openGraph.images[0].url,
        width: config.metadata.openGraph.images[0].width,
        height: config.metadata.openGraph.images[0].height,
        alt: config.metadata.openGraph.images[0].alt,
      },
    ],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <QueryProvider>
          <TenantProvider>
            <div
              className={`${GeistSans.className} antialiased w-full bg-neutral-100`}
            >
              {children}
            </div>
          </TenantProvider>
        </QueryProvider>
        <Toaster position="bottom-center" richColors />
      </body>
    </html>
  )
}
