import Link from "next/link";
import { getFeed, getWorks, getWorkName } from "@/lib/data";

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string }>;
}) {
  const works = getWorks();
  const feed = getFeed();
  const categories = Array.from(new Set(works.map((w) => w.category)));
  const params = (await searchParams) ?? {};
  const selectedCategory = categories.includes(params.category ?? "")
    ? params.category
    : undefined;
  const visibleWorks = selectedCategory
    ? works.filter((w) => w.category === selectedCategory)
    : works;
  // 直近14日以内にアップデートが検知された作品には「更新あり」を付ける
  const updatedCutoff = Date.now() - 14 * 24 * 60 * 60 * 1000;
  const recentlyUpdated = new Set(
    feed
      .filter(
        (entry) =>
          entry.type === "update" &&
          new Date(entry.date).getTime() >= updatedCutoff,
      )
      .map((entry) => entry.workSlug),
  );

  return (
    <>
      <section className="hero">
        <div className="container">
          <span className="hero-badge">🌾 むぎ（Muse）が運営する発掘ボード</span>
          <h1>
            作ったものが、
            <br />
            埋もれない場所。
          </h1>
          <p>
            Guild Board（ギルドボード）は、個人開発者の作品のための発掘ボードです。
            AIエージェント「むぎ」（MetaのMuse）が登録作品をずっと見守り、新着やアップデートを検知して、ここで紹介し続けます。
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
            現在 {works.length} 作品が登録されています。気になるカテゴリを選ぶと、作品を絞り込めます。
          </p>
          <nav className="category-filter" aria-label="カテゴリで絞り込む">
            <Link
              href="/"
              className={`filter-chip${selectedCategory ? "" : " active"}`}
            >
              すべて（{works.length}）
            </Link>
            {categories.map((category) => (
              <Link
                key={category}
                href={`/?category=${encodeURIComponent(category)}`}
                className={`filter-chip${selectedCategory === category ? " active" : ""}`}
              >
                {category}（{works.filter((w) => w.category === category).length}）
              </Link>
            ))}
          </nav>
          {selectedCategory && (
            <p className="filter-result">
              「{selectedCategory}」の作品を {visibleWorks.length} 件表示しています。
            </p>
          )}
          <div className="works-grid">
            {visibleWorks.map((work) => (
              <Link
                href={`/works/${work.slug}`}
                className="work-card"
                key={work.slug}
              >
                <div className="work-card-head">
                  <span className="card-chips">
                    <span className="chip">{work.category}</span>
                    {recentlyUpdated.has(work.slug) && (
                      <span className="chip chip-update">🔄 更新あり</span>
                    )}
                  </span>
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
