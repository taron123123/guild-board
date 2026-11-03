import fs from "node:fs";
import path from "node:path";

export type Work = {
  slug: string;
  name: string;
  author: string;
  url: string | null;
  category: string;
  oneLiner: string;
  description: string[];
  mugiReview: string;
  registeredAt: string;
};

export type FeedEntry = {
  date: string;
  workSlug: string;
  type: "new" | "update";
  note: string;
};

export type Thumb = {
  src: string;
  fit: "cover" | "contain";
  w: number;
  h: number;
};

function readJson<T>(filename: string): T {
  const file = path.join(process.cwd(), "data", filename);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

export function getWorks(): Work[] {
  return readJson<Work[]>("works.json");
}

export function getWork(slug: string): Work | undefined {
  return getWorks().find((w) => w.slug === slug);
}

export function getFeed(): FeedEntry[] {
  const feed = readJson<FeedEntry[]>("feed.json");
  // newest first: by date desc, stable for same-date entries
  return [...feed].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function getWorkName(slug: string): string {
  return getWork(slug)?.name ?? slug;
}

export function getThumbs(): Record<string, Thumb> {
  try {
    return readJson<Record<string, Thumb>>("thumbs.json");
  } catch {
    return {};
  }
}

export function getThumb(slug: string): Thumb | undefined {
  return getThumbs()[slug];
}

// サムネイルが無い作品のタイポグラフィカード用グラデーション（slug から決定的に選ぶ）
const FALLBACK_GRADIENTS: Array<[string, string]> = [
  ["#12293f", "#2f7ea3"],
  ["#1d3a56", "#c9a24b"],
  ["#0e2a38", "#3d8fa8"],
  ["#2b2350", "#7a6fd0"],
  ["#402b12", "#c98f2b"],
  ["#123332", "#3d9e8f"],
  ["#3d1f35", "#a85d8f"],
  ["#26343d", "#7d99a6"],
];

export function fallbackGradient(slug: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < slug.length; i++) {
    hash = (hash * 31 + slug.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}
