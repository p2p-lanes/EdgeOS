
import type { Metadata } from "next";
import "./globals.css";
import { GeistSans } from 'geist/font/sans';
import Providers from "./Providers";

export const metadata: Metadata = {
  title: "Citizen Portal",
  description: "Citizen Portal",
};

export default function RootLayout({children }: Readonly<{ children: React.ReactNode }>) {

  return (
    <html lang="en">
      <body >
        <Providers>
          <div className={`${GeistSans.className} antialiased w-[100%]`}>
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
