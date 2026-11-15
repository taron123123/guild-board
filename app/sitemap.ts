import type { MetadataRoute } from "next";
import { getFeed, getWorks } from "@/lib/data";

const BASE_URL = "https://board.solo-guild.xyz";

// 検索エンジンに全ページを伝えるサイトマップ。作品ページの lastModified は
// その作品の最新のフィード日（なければ登録日）にし、動いている作品ほど
// 新しいと分かるようにする。
export default function sitemap(): MetadataRoute.Sitemap {
  const works = getWorks();
  const feed = getFeed();
  const latestByWork = new Map<string, string>();
  for (const entry of feed) {
    if (!latestByWork.has(entry.workSlug)) {
      latestByWork.set(entry.workSlug, entry.date);
    }
  }

  const latestFeedDate = feed[0]?.date;

  return [
    {
      url: BASE_URL,
      lastModified: latestFeedDate ? new Date(latestFeedDate) : undefined,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${BASE_URL}/feed`,
      lastModified: latestFeedDate ? new Date(latestFeedDate) : undefined,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...works.map((work) => {
      const last = latestByWork.get(work.slug) ?? work.registeredAt;
      return {
        url: `${BASE_URL}/works/${work.slug}`,
        lastModified: new Date(last),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    }),
  ];
}
