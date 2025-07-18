import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeScript } from "@/components/ThemeScript";
import { I18nProvider } from "@/components/I18nProvider";
import { GraphQLProvider } from "@/components/providers/GraphQLProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "管理平台 - 全栈管理系统",
  description: "基于PocketBase + GraphQL + Next.js的现代化管理平台",
  keywords: ["管理平台", "PocketBase", "GraphQL", "Next.js", "全栈开发"],
  authors: [{ name: "Admin Platform Team" }],
  viewport: "width=device-width, initial-scale=1",
  robots: "index, follow",
  openGraph: {
    title: "管理平台 - 全栈管理系统",
    description: "基于PocketBase + GraphQL + Next.js的现代化管理平台",
    type: "website",
    locale: "zh_CN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <ThemeScript />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <GraphQLProvider>
          <ThemeProvider>
            <I18nProvider>
              <AuthProvider>
                {children}
              </AuthProvider>
            </I18nProvider>
          </ThemeProvider>
        </GraphQLProvider>
      </body>
    </html>
  );
}
