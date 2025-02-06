import type { Metadata } from "next";
import "../styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import GoogleAnalytics from "@/components/utils/GoogleAnalytics";
import { Toaster } from "sonner";
import icon from '../../public/icon.png'

export const metadata: Metadata = {
  title: "Citizen Portal",
  description: "Your gateway to Citizen Portal",
  icons: {
    icon: icon.src,
  },
  openGraph: {
    title: "Citizen Portal",
    description: "Your gateway to Citizen Portal",
    images: [{
      url: "https://simplefi.s3.us-east-2.amazonaws.com/edgecity.png",
      width: 1200,
      height: 630,
      alt: 'Citizen Portal'
    }]
  }
};

export default function RootLayout({children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <Toaster />
        <div className={`${GeistSans.className} antialiased w-[100%]`}>
          {children}
        </div>
      </body>
    </html>
  );
}
