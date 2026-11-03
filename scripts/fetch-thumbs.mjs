// 各作品サイトの og:image / twitter:image を取得し、public/thumbs/ に保存する。
// 取得結果は data/thumbs.json に記録する（slug -> { src, fit, w, h }）。
// 使い方: node scripts/fetch-thumbs.mjs
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = process.cwd();
const works = JSON.parse(
  fs.readFileSync(path.join(root, "data", "works.json"), "utf-8"),
);
const outDir = path.join(root, "public", "thumbs");
fs.mkdirSync(outDir, { recursive: true });

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";

function extractImage(html, baseUrl) {
  const patterns = [
    /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
    /<link[^>]+rel=["']apple-touch-icon["'][^>]+href=["']([^"']+)["']/i,
  ];
  for (const re of patterns) {
    const m = html.match(re);
    if (m) {
      try {
        return new URL(m[1], baseUrl).toString();
      } catch {
        /* ignore */
      }
    }
  }
  return null;
}

function imageSize(buf) {
  // PNG
  if (buf.length > 24 && buf[0] === 0x89 && buf[1] === 0x50) {
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20), ext: "png" };
  }
  // JPEG
  if (buf[0] === 0xff && buf[1] === 0xd8) {
    let i = 2;
    while (i < buf.length - 9) {
      if (buf[i] !== 0xff) break;
      const marker = buf[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5), ext: "jpg" };
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
    return { w: 0, h: 0, ext: "jpg" };
  }
  // WebP (VP8X)
  if (buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP") {
    if (buf.toString("ascii", 12, 16) === "VP8X") {
      const w = 1 + (buf[24] | (buf[25] << 8) | (buf[26] << 16));
      const h = 1 + (buf[27] | (buf[28] << 8) | (buf[29] << 16));
      return { w, h, ext: "webp" };
    }
    return { w: 0, h: 0, ext: "webp" };
  }
  return null;
}

const results = {};
for (const work of works) {
  if (!work.url) {
    console.log(`${work.slug}: URLなし → タイポグラフィ代替`);
    continue;
  }
  try {
    const res = await fetch(work.url, {
      headers: { "User-Agent": UA, Accept: "text/html" },
      redirect: "follow",
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    const imgUrl = extractImage(html, res.url);
    if (!imgUrl) throw new Error("og:image なし");
    const imgRes = await fetch(imgUrl, { headers: { "User-Agent": UA } });
    if (!imgRes.ok) throw new Error(`画像 HTTP ${imgRes.status}`);
    const buf = Buffer.from(await imgRes.arrayBuffer());
    const size = imageSize(buf);
    if (!size) throw new Error("画像形式不明");
    if (size.w && size.w < 200) throw new Error(`画像が小さい (${size.w}x${size.h})`);
    const ext = size.ext === "jpg" ? "jpg" : size.ext;
    const file = `${work.slug}.${ext}`;
    // 大きすぎる場合は ImageMagick があれば縮小（なければそのまま）
    fs.writeFileSync(path.join(outDir, file), buf);
    try {
      execFileSync("magick", [
        path.join(outDir, file),
        "-resize",
        "1200x>",
        path.join(outDir, file),
      ]);
    } catch {
      /* magick なし: そのまま使う */
    }
    const aspect = size.w && size.h ? size.w / size.h : 0;
    const fit = aspect >= 0.8 && aspect <= 1.3 ? "contain" : "cover";
    results[work.slug] = { src: `/thumbs/${file}`, fit, w: size.w, h: size.h, from: imgUrl };
    console.log(`${work.slug}: OK ${size.w}x${size.h} fit=${fit} <- ${imgUrl}`);
  } catch (e) {
    console.log(`${work.slug}: 取得失敗 (${e.message}) → タイポグラフィ代替`);
  }
}

fs.writeFileSync(
  path.join(root, "data", "thumbs.json"),
  JSON.stringify(results, null, 2) + "\n",
);
console.log(`\n取得成功: ${Object.keys(results).length} / ${works.length}`);
