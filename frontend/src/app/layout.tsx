import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Project S10 | Infra DSS",
  description: "AI Infrastructure Damage Assessment Tool",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}>
        {/* We moved the global flex wrapper and Sidebar here! */}
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex-1 ml-64 relative">
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
