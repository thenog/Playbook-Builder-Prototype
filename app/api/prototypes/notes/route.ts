import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import path from "path";

function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && !slug.includes("..") && !slug.includes("/");
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const filePath = path.join(process.cwd(), "app", "prototypes", slug, "prototype.md");
  try {
    const content = await readFile(filePath, "utf-8");
    return NextResponse.json({ content });
  } catch {
    return NextResponse.json({ content: "" });
  }
}

export async function POST(req: NextRequest) {
  const { slug, content } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (typeof content !== "string") return NextResponse.json({ error: "Invalid content" }, { status: 400 });

  const filePath = path.join(process.cwd(), "app", "prototypes", slug, "prototype.md");
  await writeFile(filePath, content, "utf-8");
  return NextResponse.json({ ok: true });
}
