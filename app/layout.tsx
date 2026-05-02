import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "物理题目解析系统 - 高中物理题目解析王牌教师",
  description: "上传物理题目图片或输入文字，获得详细的解题分析、同类题练习与交互式引导学习",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <header className="border-b border-border bg-surface/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
            <a href="/" className="flex items-center gap-2 font-semibold text-lg text-foreground no-underline">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="6" y1="12" x2="2" y2="12" stroke="var(--color-gravity)" />
                <line x1="18" y1="12" x2="22" y2="12" stroke="var(--color-tension)" />
              </svg>
              <span className="hidden sm:inline">物理题目解析系统</span>
            </a>
          </div>
        </header>
        <main className="flex-1 flex flex-col">{children}</main>
        <footer className="border-t border-border py-4 text-center text-xs text-muted">
          Powered by DashScope Qwen · 物理题目解析系统
        </footer>
      </body>
    </html>
  );
}
