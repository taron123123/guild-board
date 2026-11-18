import type { Metadata } from "next";
import Link from "next/link";
import { getFeed, getWorkName, getWorks } from "@/lib/data";

export const metadata: Metadata = {
  title: "新着・アップデート一覧 | 個人開発ギルド",
  description:
    "個人開発ギルドでむぎが検知した、登録作品の新着・アップデートの全履歴です。",
};

export default async function FeedPage({
  searchParams,
}: {
  searchParams?: Promise<{ work?: string }>;
}) {
  const feed = getFeed();
  const works = getWorks();
  const params = (await searchParams) ?? {};
  const selectedWork = works.find((w) => w.slug === params.work);
  const visibleFeed = selectedWork
    ? feed.filter((entry) => entry.workSlug === selectedWork.slug)
    : feed;
  const newCount = feed.filter((entry) => entry.type === "new").length;
  const updateCount = feed.filter((entry) => entry.type === "update").length;
  // 履歴が1件以上ある作品だけを絞り込みチップに並べる
  const worksWithFeed = works.filter((w) =>
    feed.some((entry) => entry.workSlug === w.slug),
  );

  return (
    <section className="section">
      <div className="container">
        <p className="section-kicker">Timeline</p>
        <h1 className="section-title">新着・アップデート一覧</h1>
        <p className="section-lead">
          むぎが検知した、ギルドの動きの全履歴です。
          全{feed.length}件（新規登録{newCount}件・アップデート{updateCount}件）を新しい順に表示しています。
          最新30件は{" "}
          <a href="/feed.xml">RSSフィード</a>
          でも購読できます。
        </p>
        <nav className="category-filter" aria-label="作品で絞り込む">
          <Link
            href="/feed"
            className={`filter-chip${selectedWork ? "" : " active"}`}
          >
            すべて（{feed.length}）
          </Link>
          {worksWithFeed.map((work) => {
            const count = feed.filter(
              (entry) => entry.workSlug === work.slug,
            ).length;
            return (
              <Link
                key={work.slug}
                href={`/feed?work=${encodeURIComponent(work.slug)}`}
                className={`filter-chip${
                  selectedWork?.slug === work.slug ? " active" : ""
                }`}
              >
                {work.name}（{count}）
              </Link>
            );
          })}
        </nav>
        {selectedWork && (
          <p className="filter-result">
            「{selectedWork.name}」の動きを {visibleFeed.length} 件表示しています。
            <Link href="/feed"> 絞り込みをリセットする</Link>
          </p>
        )}
        <ul className="timeline">
          {visibleFeed.map((entry, i) => {
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
        <p className="feed-archive-link">
          <Link href="/">← 作品一覧に戻る</Link>
        </p>
      </div>
    </section>
  );
}
