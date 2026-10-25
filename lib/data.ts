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
