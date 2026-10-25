#!/usr/bin/env node
/**
 * むぎの監視スクリプト（Guild Board）
 *
 * data/works.json の各作品URLを取得し、HTTPステータスとコンテンツのハッシュを
 * data/site-status.json に保存する。前回とハッシュが変わっていたら、
 * data/feed.json の先頭に { type: "update" } エントリを追加する。
 * 初回実行時はベースラインを記録するだけで、フィードには追加しない。
 *
 * 使い方: node scripts/check-updates.mjs
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const worksPath = path.join(root, "data", "works.json");
const feedPath = path.join(root, "data", "feed.json");
const statusPath = path.join(root, "data", "site-status.json");

const works = JSON.parse(fs.readFileSync(worksPath, "utf-8"));
const feed = JSON.parse(fs.readFileSync(feedPath, "utf-8"));
const prevStatus = fs.existsSync(statusPath)
  ? JSON.parse(fs.readFileSync(statusPath, "utf-8"))
  : {};
const isFirstRun = Object.keys(prevStatus).length === 0;

const today = new Date().toISOString().slice(0, 10);
const nextStatus = { ...prevStatus };
let newFeedEntries = 0;

for (const work of works) {
  if (!work.url) {
    console.log(`- ${work.slug}: URLなし（スキップ）`);
    continue;
  }
  try {
    const res = await fetch(work.url, {
      headers: { "user-agent": "GuildBoard-MugiMonitor/0.1" },
      redirect: "follow",
    });
    const body = await res.text();
    const hash = createHash("sha256").update(body).digest("hex").slice(0, 16);
    const prev = prevStatus[work.slug];
    nextStatus[work.slug] = {
      status: res.status,
      hash,
      contentLength: body.length,
      checkedAt: new Date().toISOString(),
    };
    if (!isFirstRun && prev && prev.hash && prev.hash !== hash) {
      feed.unshift({
        date: today,
        workSlug: work.slug,
        type: "update",
        note: `「${work.name}」のサイト更新を検知しました。`,
      });
      newFeedEntries += 1;
      console.log(`! ${work.slug}: 更新を検知 (HTTP ${res.status}, hash ${prev.hash} -> ${hash})`);
    } else {
      console.log(`✓ ${work.slug}: HTTP ${res.status}, ${body.length} bytes, hash ${hash}`);
    }
  } catch (err) {
    console.log(`✗ ${work.slug}: 取得失敗 (${err.message})`);
    nextStatus[work.slug] = {
      status: 0,
      hash: prevStatus[work.slug]?.hash ?? null,
      contentLength: prevStatus[work.slug]?.contentLength ?? null,
      checkedAt: new Date().toISOString(),
      error: String(err.message ?? err),
    };
  }
}

fs.writeFileSync(statusPath, JSON.stringify(nextStatus, null, 2) + "\n");
if (newFeedEntries > 0) {
  fs.writeFileSync(feedPath, JSON.stringify(feed, null, 2) + "\n");
}
console.log(
  isFirstRun
    ? "初回実行：ベースラインを data/site-status.json に記録しました（フィードへの追加なし）"
    : `完了：新規フィード ${newFeedEntries} 件`
);
