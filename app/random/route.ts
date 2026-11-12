import { NextResponse } from "next/server";
import { getWorks } from "@/lib/data";

export const dynamic = "force-dynamic";

// /random に来たら登録作品のうち1件をランダムに選んで作品ページへ。
// 決まった一覧の順番では出会いにくい作品にも足を運んでもらうための導線。
export async function GET(request: Request) {
  const works = getWorks();
  const pick = works[Math.floor(Math.random() * works.length)];
  return NextResponse.redirect(new URL(`/works/${pick.slug}`, request.url));
}
