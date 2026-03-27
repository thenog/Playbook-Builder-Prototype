import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir } from "fs/promises";
import path from "path";

function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && !slug.includes("..") && !slug.includes("/");
}

function parseVersionNum(filename: string): number {
  const m = filename.match(/^v(\d+)\.tsx$/);
  return m ? parseInt(m[1], 10) : -1;
}

// GET /api/prototypes/versions?slug=jobsites
// Returns: [{ label: "v1", file: "v1.tsx" }, ...]
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  try {
    const entries = await readdir(dir);
    const versions = entries
      .filter((e) => /^v\d+\.tsx$/.test(e))
      .map((e) => ({ label: e.replace(".tsx", ""), file: e, num: parseVersionNum(e) }))
      .sort((a, b) => a.num - b.num)
      .map(({ label, file }) => ({ label, file }));
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/prototypes/versions { slug }
// Saves current page.tsx as next vN.tsx
export async function POST(req: NextRequest) {
  const { slug } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return NextResponse.json({ error: "Prototype not found" }, { status: 404 });
  }

  const existing = entries.filter((e) => /^v\d+\.tsx$/.test(e));
  const nextNum =
    existing.length > 0
      ? Math.max(...existing.map(parseVersionNum)) + 1
      : 1;
  const label = `v${nextNum}`;

  const content = await readFile(path.join(dir, "page.tsx"), "utf-8");
  await writeFile(path.join(dir, `${label}.tsx`), content);

  return NextResponse.json({ label, file: `${label}.tsx` });
}

// PUT /api/prototypes/versions { slug, version: "v1" }
// Restores vN.tsx as page.tsx
export async function PUT(req: NextRequest) {
  const { slug, version } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (typeof version !== "string" || !/^v\d+$/.test(version)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  const content = await readFile(path.join(dir, `${version}.tsx`), "utf-8");
  await writeFile(path.join(dir, "page.tsx"), content);

  return NextResponse.json({ ok: true });
}
