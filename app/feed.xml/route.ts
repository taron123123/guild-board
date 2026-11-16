import { getFeed, getWork } from "@/lib/data";

const BASE_URL = "https://board.solo-guild.xyz";
const MAX_ITEMS = 30;

// 新着・アップデートの RSS 2.0 フィード。RSS リーダーで購読できるようにし、
// ボードを開かなくても更新が届くようにする（新着の届き方）。
export function GET() {
  const feed = getFeed().slice(0, MAX_ITEMS);

  const items = feed
    .map((entry) => {
      const work = getWork(entry.workSlug);
      const title = `${work?.name ?? entry.workSlug}：${
        entry.type === "new" ? "新規登録" : "アップデート"
      }`;
      const link = `${BASE_URL}/works/${entry.workSlug}`;
      const pubDate = new Date(`${entry.date}T00:00:00+09:00`).toUTCString();
      return `    <item>
      <title>${escapeXml(title)}</title>
      <link>${escapeXml(link)}</link>
      <guid isPermaLink="true">${escapeXml(link)}#${entry.date}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(entry.note)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>個人開発ギルド — 新着・アップデート</title>
    <link>${BASE_URL}/feed</link>
    <description>個人開発ギルドでむぎが検知した、登録作品の新着・アップデートです。</description>
    <language>ja</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
