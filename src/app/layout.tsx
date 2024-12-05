import type { Metadata } from "next";
import "../styles/globals.css";
import { GeistSans } from 'geist/font/sans';
import GoogleAnalytics from "@/components/utils/GoogleAnalytics";

export const metadata: Metadata = {
  title: "Resident Portal",
  description: "Your gateway to EdgeCity",
  icons: {
    icon: '/favicon.ico',
  }
};

export default function RootLayout({children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <GoogleAnalytics />
        <div className={`${GeistSans.className} antialiased w-[100%]`}>
          {children}
        </div>
      </body>
    </html>
  );
}
