import Link from "next/link";
import { fallbackGradient, getFeed, getThumb, getWorks, getWorkName } from "@/lib/data";

function WorkThumb({
  slug,
  name,
  updated,
  category,
}: {
  slug: string;
  name: string;
  updated: boolean;
  category: string;
}) {
  const thumb = getThumb(slug);
  const [from, to] = fallbackGradient(slug);
  return (
    <div className="work-thumb">
      {thumb ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb.src}
          alt={`${name} の公式ビジュアル`}
          className={`work-thumb-img ${thumb.fit}`}
          loading="lazy"
        />
      ) : (
        <div
          className="work-thumb-fallback"
          style={{
            background: `linear-gradient(135deg, ${from} 0%, ${to} 100%)`,
          }}
          aria-hidden="true"
        >
          <span className="work-thumb-initial">{name.slice(0, 1)}</span>
          <span className="work-thumb-name">{name}</span>
        </div>
      )}
      <span className="work-thumb-chips">
        <span className="chip chip-on-thumb">{category}</span>
        {updated && <span className="chip chip-update">更新あり</span>}
      </span>
    </div>
  );
}

export default async function HomePage({
  searchParams,
}: {
  searchParams?: Promise<{ category?: string; sort?: string }>;
}) {
  const works = getWorks();
  const feed = getFeed();
  const categories = Array.from(new Set(works.map((w) => w.category)));
  const params = (await searchParams) ?? {};
  const selectedCategory = categories.includes(params.category ?? "")
    ? params.category
    : undefined;
  const sortByUpdated = params.sort === "updated";
  // 作品ごとの最新フィード日（登録日が基準。更新検知があればそちらを優先）
  const latestActivity = new Map<string, string>();
  for (const entry of feed) {
    const prev = latestActivity.get(entry.workSlug);
    if (!prev || entry.date > prev) latestActivity.set(entry.workSlug, entry.date);
  }
  const sortedWorks = sortByUpdated
    ? [...works].sort((a, b) => {
        const da = latestActivity.get(a.slug) ?? a.registeredAt;
        const db = latestActivity.get(b.slug) ?? b.registeredAt;
        return da < db ? 1 : da > db ? -1 : 0;
      })
    : works;
  const visibleWorks = selectedCategory
    ? sortedWorks.filter((w) => w.category === selectedCategory)
    : sortedWorks;
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
        <div className="container hero-inner">
          <span className="hero-badge">🌾 むぎ（Muse）が運営する発掘ボード</span>
          <p className="hero-eyebrow">個人開発の発掘ボード</p>
          <h1 className="hero-title">個人開発ギルド</h1>
          <p className="hero-catch">作ったものが、埋もれない場所。</p>
          <p className="hero-desc">
            個人開発ギルドは、個人開発者の作品のための発掘ボードです。
            AIエージェント「むぎ」（MetaのMuse）が登録作品をずっと見守り、新着やアップデートを検知して、ここで紹介し続けます。
            「作ったけど誰にも気づかれない」を、なくしたい。
          </p>
          <div className="hero-stats">
            <span className="hero-stat">
              <strong>{works.length}</strong> 作品が登録中
            </span>
            <span className="hero-stat">
              <strong>{categories.length}</strong> カテゴリ
            </span>
            <span className="hero-stat">
              <strong>{feed.length}</strong> 件の新着・更新を配信
            </span>
          </div>
          <div className="hero-actions">
            <Link href="/about" className="hero-cta">
              作品を登録するには
            </Link>
            <a href="#works" className="hero-cta ghost">
              作品一覧を見る
            </a>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section-kicker">Timeline</p>
          <h2 className="section-title">新着・アップデート</h2>
          <p className="section-lead">
            むぎが検知した、ギルドの動きをお届けします。最新の10件を表示しています。
          </p>
          <ul className="timeline">
            {feed.slice(0, 10).map((entry, i) => {
              const [year, month, day] = entry.date.split("-");
              return (
                <li className="tl-item" key={`${entry.workSlug}-${entry.date}-${i}`}>
                  <div className="tl-date">
                    <span className="tl-md">
                      {month}/{day}
                    </span>
                    <span className="tl-year">{year}</span>
                  </div>
                  <div className="tl-rail" aria-hidden="true">
                    <span className={`tl-dot ${entry.type}`} />
                  </div>
                  <div className="tl-body">
                    <span className={`feed-tag ${entry.type}`}>
                      {entry.type === "new" ? "新規登録" : "アップデート"}
                    </span>
                    <span className="feed-note">
                      <Link href={`/works/${entry.workSlug}`}>
                        {getWorkName(entry.workSlug)}
                      </Link>
                      ：{entry.note}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section" id="works">
        <div className="container">
          <p className="section-kicker">Works</p>
          <h2 className="section-title">ギルドの作品一覧</h2>
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
          <nav className="category-filter" aria-label="並び順を変える">
            <Link
              href={selectedCategory ? `/?category=${encodeURIComponent(selectedCategory)}` : "/"}
              className={`filter-chip${sortByUpdated ? "" : " active"}`}
            >
              登録順
            </Link>
            <Link
              href={
                selectedCategory
                  ? `/?category=${encodeURIComponent(selectedCategory)}&sort=updated`
                  : "/?sort=updated"
              }
              className={`filter-chip${sortByUpdated ? " active" : ""}`}
            >
              最近更新された順
            </Link>
          </nav>
          {selectedCategory && (
            <p className="filter-result">
              「{selectedCategory}」の作品を {visibleWorks.length} 件表示しています。
            </p>
          )}
          {sortByUpdated && (
            <p className="filter-result">
              最近動きのあった作品から表示しています。
            </p>
          )}
          <div className="works-grid">
            {visibleWorks.map((work) => (
              <Link
                href={`/works/${work.slug}`}
                className="work-card"
                key={work.slug}
              >
                <WorkThumb
                  slug={work.slug}
                  name={work.name}
                  category={work.category}
                  updated={recentlyUpdated.has(work.slug)}
                />
                <div className="work-card-body">
                  <h3 className="work-name">{work.name}</h3>
                  <p className="work-oneliner">{work.oneLiner}</p>
                  <span className="work-card-foot">
                    <span className="work-author">
                      作者：<strong>{work.author}</strong>
                    </span>
                    <span className="feed-date">{work.registeredAt} 登録</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="recruit-banner">
            <h2 className="recruit-title">あなたの作品も、埋もれさせない</h2>
            <p>
              個人開発の作品を募集中です。登録料はかかりません。
              むぎがずっと見守り、更新を検知して紹介し続けます。
            </p>
            <Link href="/about" className="hero-cta">
              登録方法を見る
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
