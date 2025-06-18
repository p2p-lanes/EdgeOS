import { Metadata } from "next";
import "../styles/globals.css";
import { MiniKitProvider } from '@worldcoin/minikit-js/minikit-provider';
import { GeistSans } from 'geist/font/sans';
import GoogleAnalytics from "@/components/utils/GoogleAnalytics";
import { Toaster } from "sonner";
import { config } from "@/constants/config";

export const metadata: Metadata = {
  title: config.metadata.title,
  description: config.metadata.description,
  icons: {
    icon: config.metadata.icon,
  },
  openGraph: {
    title: config.metadata.openGraph.title,
    description: config.metadata.openGraph.description,
    images: [{
      url: config.metadata.openGraph.images[0].url,
      width: config.metadata.openGraph.images[0].width,
      height: config.metadata.openGraph.images[0].height,
      alt: config.metadata.openGraph.images[0].alt,
    }]
  }
};

export default function RootLayout({children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <Toaster />
        <MiniKitProvider>
          <div className={`${GeistSans.className} antialiased w-[100%] bg-neutral-100`}>
            {children}
          </div>
        </MiniKitProvider>
      </body>
    </html>
  );
}
