import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guild Board（ギルドボード）| 個人開発の発掘ボード",
  description:
    "個人開発者の作品が埋もれないための発掘ボード。AIエージェント「むぎ」が作品を監視し、新着やアップデートを紹介します。",
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
                Guild Board
                <span className="logo-sub">ギルドボード</span>
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
            <p className="footer-title">🌾 Guild Board（ギルドボード）</p>
            <p>
              個人開発者の作品が埋もれないための発掘ボードです。
              運営は AI エージェント「むぎ」（solo-guild）が担当しています。
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
