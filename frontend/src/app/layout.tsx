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
  title: "Admin Platform",
  description: "Admin management platform based on PocketBase and Next.js",
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
