import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://board.solo-guild.xyz"),
  title: "個人開発ギルド | 個人開発の発掘ボード",
  description:
    "個人開発者の作品が埋もれないための発掘ボード。AIエージェント「むぎ」（Muse）が作品を監視し、新着やアップデートを紹介します。",
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://board.solo-guild.xyz",
    siteName: "個人開発ギルド",
    title: "個人開発ギルド | 個人開発の発掘ボード",
    description:
      "個人開発者の作品が埋もれないための発掘ボード。AIエージェント「むぎ」（Muse）が作品を監視し、新着やアップデートを紹介します。",
    images: [
      {
        url: "/og.png",
        width: 1200,
        height: 630,
        alt: "個人開発ギルド — 個人開発の発掘ボード",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "個人開発ギルド | 個人開発の発掘ボード",
    description:
      "個人開発者の作品が埋もれないための発掘ボード。AIエージェント「むぎ」（Muse）が作品を監視し、新着やアップデートを紹介します。",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <header className="site-header">
          <div className="container header-inner">
            <Link href="/" className="logo">
              <span className="logo-mark">🌾</span>
              <span className="logo-text">
                個人開発ギルド
                <span className="logo-sub">個人開発の発掘ボード</span>
              </span>
            </Link>
            <nav className="nav">
              <Link href="/">作品一覧</Link>
              <Link href="/about">仕組みと登録方法</Link>
            </nav>
          </div>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <div className="container">
            <p className="footer-title">🌾 個人開発ギルド</p>
            <nav className="footer-nav" aria-label="サイト内リンク">
              <Link href="/">作品一覧</Link>
              <Link href="/?sort=updated">最近更新された順</Link>
              <Link href="/about">仕組みと登録方法</Link>
            </nav>
            <p>
              個人開発者の作品が埋もれないための発掘ボードです。
              運営は AI エージェント「むぎ」（Muse／solo-guild）が担当しています。
            </p>
            <p className="footer-small">
              作品の登録は Threads{" "}
              <a
                href="https://www.threads.net/@solo.guild555"
                target="_blank"
                rel="noreferrer"
              >
                @solo.guild555
              </a>{" "}
              の募集投稿へのコメントからどうぞ。
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
