import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container not-found">
        <p className="section-kicker">404 — Not Found</p>
        <h1 className="section-title">このページは見つかりませんでした</h1>
        <p className="section-lead">
          お探しのページは移動したか、削除されたか、URLが間違っているかもしれません。
          ギルドの作品たちはそのままここにあります。気になる作品を探しに行きましょう。
        </p>
        <div className="hero-actions not-found-actions">
          <Link href="/" className="hero-cta">
            作品一覧を見る
          </Link>
          <Link href="/about" className="not-found-link">
            仕組みと登録方法を見る
          </Link>
        </div>
      </div>
    </section>
  );
}
