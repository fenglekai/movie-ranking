import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "热榜追踪器 - 影视排行榜实时追踪",
  description: "实时追踪爱奇艺、腾讯视频、豆瓣等主流平台的热门影视作品排行榜，发现最新最热的电影、电视剧、综艺节目。",
  keywords: ["影视排行榜", "电影排行", "电视剧排行", "综艺排行", "爱奇艺", "腾讯视频", "豆瓣", "热榜追踪"],
  authors: [{ name: "热榜追踪器" }],
  openGraph: {
    title: "热榜追踪器 - 影视排行榜实时追踪",
    description: "实时追踪各大视频平台热门影视作品排行榜",
    type: "website",
    locale: "zh_CN",
  },
  twitter: {
    card: "summary_large_image",
    title: "热榜追踪器 - 影视排行榜实时追踪",
    description: "实时追踪各大视频平台热门影视作品排行榜",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
