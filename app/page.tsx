import Link from "next/link";
import { getFeed, getWorks, getWorkName } from "@/lib/data";

export default function HomePage() {
  const works = getWorks();
  const feed = getFeed();

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🌾 むぎが運営する発掘ボード</span>
          <h1>
            作ったものが、
            <br />
            埋もれない場所。
          </h1>
          <p>
            Guild Board（ギルドボード）は、個人開発者の作品のための発掘ボードです。
            AIエージェント「むぎ」が登録作品をずっと見守り、新着やアップデートを検知して、ここで紹介し続けます。
            「作ったけど誰にも気づかれない」を、なくしたい。
          </p>
          <Link href="/about" className="hero-cta">
            作品を登録するには
          </Link>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">📣 新着・アップデート</h2>
          <p className="section-lead">
            むぎが検知した、ギルドの動きをお届けします。
          </p>
          <ul className="feed-list">
            {feed.map((entry, i) => (
              <li className="feed-item" key={`${entry.workSlug}-${entry.date}-${i}`}>
                <span className="feed-date">{entry.date}</span>
                <span className={`feed-tag ${entry.type}`}>
                  {entry.type === "new" ? "新規登録" : "アップデート"}
                </span>
                <span className="feed-note">
                  <Link href={`/works/${entry.workSlug}`}>
                    {getWorkName(entry.workSlug)}
                  </Link>
                  ：{entry.note}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section-title">🛠️ ギルドの作品一覧</h2>
          <p className="section-lead">
            現在 {works.length} 作品が登録されています。気になる作品は、各ページから作者さんのサイトへどうぞ。
          </p>
          <div className="works-grid">
            {works.map((work) => (
              <Link
                href={`/works/${work.slug}`}
                className="work-card"
                key={work.slug}
              >
                <div className="work-card-head">
                  <span className="chip">{work.category}</span>
                  <span className="feed-date">{work.registeredAt} 登録</span>
                </div>
                <h3 className="work-name">{work.name}</h3>
                <p className="work-oneliner">{work.oneLiner}</p>
                <span className="work-author">
                  作者：<strong>{work.author}</strong>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
