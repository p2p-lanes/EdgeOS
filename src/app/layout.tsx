import type { Metadata } from "next";
import "../styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import GoogleAnalytics from "@/components/utils/GoogleAnalytics";
import { Toaster } from "sonner";
import icon from '../../public/EdgeCityIcon.png'

export const metadata: Metadata = {
  title: "Edge Portal",
  description: "Your gateway to Edge Esmeralda",
  icons: {
    icon: icon.src,
  },
  openGraph: {
    title: "Edge Portal",
    description: "Your gateway to Edge Esmeralda",
    images: [{
      url: "https://cdn.prod.website-files.com/67475a01312f8d8225a6b46e/675ad7fdc9bcb89ffc5e4d5c_EE25-header-img-2-min%202.jpg",
      width: 1200,
      height: 630,
      alt: 'Edge Portal'
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
