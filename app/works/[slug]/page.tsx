import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getWork, getWorks } from "@/lib/data";

export function generateStaticParams() {
  return getWorks().map((w) => ({ slug: w.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) return {};
  return {
    title: `${work.name} | Guild Board`,
    description: work.oneLiner,
    openGraph: {
      title: `${work.name} | Guild Board`,
      description: work.oneLiner,
      url: `/works/${slug}`,
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Guild Board（ギルドボード）— 個人開発の発掘ボード",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${work.name} | Guild Board`,
      description: work.oneLiner,
      images: ["/og.png"],
    },
  };
}

export default async function WorkPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const work = getWork(slug);
  if (!work) notFound();

  return (
    <article className="work-detail">
      <span className="chip">{work.category}</span>
      <h1>{work.name}</h1>
      <p className="work-meta">
        作者：{work.author} ／ 登録日：{work.registeredAt}
      </p>

      <p className="work-oneliner-large">{work.oneLiner}</p>

      <div className="work-body">
        {work.description.map((para, i) => (
          <p key={i}>{para}</p>
        ))}
      </div>

      <div className="mugi-review">
        <p className="mugi-review-title">🌾 むぎ（Muse）のレビュー</p>
        <p>{work.mugiReview}</p>
      </div>

      {work.url ? (
        <a
          className="visit-button"
          href={work.url}
          target="_blank"
          rel="noreferrer"
        >
          作品を見に行く →
        </a>
      ) : (
        <p className="work-meta">
          ※ この作品はブラウザで遊べる教材集です。配布先は作者さんにお問い合わせください。
        </p>
      )}

      <br />
      <Link href="/" className="back-link">
        ← 作品一覧に戻る
      </Link>

      <section className="share-section">
        <h2>📣 この作品を広める</h2>
        <p>
          気に入ったら、ぜひシェアして作者さんを応援してください。
        </p>
        <a
          className="share-button"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
            `${work.name} — ${work.oneLiner}`,
          )}&url=${encodeURIComponent(
            `https://board.solo-guild.xyz/works/${slug}`,
          )}`}
          target="_blank"
          rel="noreferrer"
        >
          𝕏でシェアする
        </a>
      </section>

      <section className="other-works">
        <h2>🌾 ほかの作品も見る</h2>
        <ul className="other-works-list">
          {[...getWorks()]
            .reverse()
            .filter((w) => w.slug !== work.slug)
            .slice(0, 3)
            .map((w) => (
              <li key={w.slug}>
                <Link href={`/works/${w.slug}`}>
                  <span className="other-works-name">{w.name}</span>
                  <span className="other-works-oneliner">{w.oneLiner}</span>
                </Link>
              </li>
            ))}
        </ul>
      </section>
    </article>
  );
}
