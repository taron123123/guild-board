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
  searchParams?: Promise<{ work?: string; type?: string }>;
}) {
  const feed = getFeed();
  const works = getWorks();
  const params = (await searchParams) ?? {};
  const selectedWork = works.find((w) => w.slug === params.work);
  const selectedType =
    params.type === "new" || params.type === "update"
      ? params.type
      : undefined;
  const visibleFeed = feed
    .filter((entry) => !selectedWork || entry.workSlug === selectedWork.slug)
    .filter((entry) => !selectedType || entry.type === selectedType);
  const newCount = feed.filter((entry) => entry.type === "new").length;
  const updateCount = feed.filter((entry) => entry.type === "update").length;
  // 絞り込みリンクは作品・種類のもう一方の指定を維持する
  const feedHref = (work?: string, type?: string) => {
    const q = new URLSearchParams();
    if (work) q.set("work", work);
    if (type) q.set("type", type);
    const s = q.toString();
    return s ? `/feed?${s}` : "/feed";
  };
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
          全{feed.length}件（新規登録{newCount}件・アップデート{updateCount}件）を新しい順に、日付ごとに区切って表示しています。
          最新30件は{" "}
          <a href="/feed.xml">RSSフィード</a>
          でも購読できます。
        </p>
        <nav className="category-filter" aria-label="作品で絞り込む">
          <Link
            href={feedHref(undefined, selectedType)}
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
                href={feedHref(work.slug, selectedType)}
                className={`filter-chip${
                  selectedWork?.slug === work.slug ? " active" : ""
                }`}
              >
                {work.name}（{count}）
              </Link>
            );
          })}
        </nav>
        <nav className="category-filter" aria-label="種類で絞り込む">
          <Link
            href={feedHref(selectedWork?.slug, undefined)}
            className={`filter-chip${selectedType ? "" : " active"}`}
          >
            すべて（{feed.length}）
          </Link>
          <Link
            href={feedHref(selectedWork?.slug, "new")}
            className={`filter-chip${selectedType === "new" ? " active" : ""}`}
          >
            新規登録のみ（{newCount}）
          </Link>
          <Link
            href={feedHref(selectedWork?.slug, "update")}
            className={`filter-chip${
              selectedType === "update" ? " active" : ""
            }`}
          >
            アップデートのみ（{updateCount}）
          </Link>
        </nav>
        {(selectedWork || selectedType) && (
          <p className="filter-result">
            {selectedWork ? `「${selectedWork.name}」の` : ""}
            {selectedType === "new"
              ? "新規登録"
              : selectedType === "update"
                ? "アップデート"
                : "動き"}
            を {visibleFeed.length} 件表示しています。
            <Link href="/feed"> 絞り込みをリセットする</Link>
          </p>
        )}
        {/* 日付ごとに区切って表示する（75件の履歴を眺めやすくするため） */}
        {(() => {
          const groups: { date: string; entries: typeof visibleFeed }[] = [];
          for (const entry of visibleFeed) {
            const last = groups[groups.length - 1];
            if (last && last.date === entry.date) {
              last.entries.push(entry);
            } else {
              groups.push({ date: entry.date, entries: [entry] });
            }
          }
          const weekday = ["日", "月", "火", "水", "木", "金", "土"];
          return groups.map((group) => {
            const [year, month, day] = group.date.split("-");
            const dow =
              weekday[
                new Date(`${group.date}T00:00:00+09:00`).getDay()
              ];
            return (
              <div key={group.date}>
                <h2 className="feed-date-heading">
                  {year}年{Number(month)}月{Number(day)}日（{dow}）
                  <span className="feed-date-count">
                    {group.entries.length}件
                  </span>
                </h2>
                <ul className="timeline">
                  {group.entries.map((entry, i) => (
                    <li
                      className="tl-item"
                      key={`${entry.workSlug}-${entry.date}-${i}`}
                    >
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
                  ))}
                </ul>
              </div>
            );
          });
        })()}
        <p className="feed-archive-link">
          <Link href="/">← 作品一覧に戻る</Link>
        </p>
      </div>
    </section>
  );
}
