import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, readdir, mkdir, stat, rm } from "fs/promises";
import path from "path";

function validSlug(slug: unknown): slug is string {
  return typeof slug === "string" && slug.length > 0 && !slug.includes("..") && !slug.includes("/");
}

function parseVersionNum(name: string): number {
  const m = name.match(/^v(\d+)$/);
  return m ? parseInt(m[1], 10) : -1;
}

async function readLabels(dir: string): Promise<Record<string, string>> {
  try {
    const raw = await readFile(path.join(dir, "version-labels.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function writeLabels(dir: string, labels: Record<string, string>) {
  await writeFile(path.join(dir, "version-labels.json"), JSON.stringify(labels, null, 2));
}

// GET /api/prototypes/versions?slug=jobsites
// Returns: [{ label: "v1", name: "map view" }, ...]
export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  try {
    const entries = await readdir(dir);
    const labels = await readLabels(dir);
    const versions: { label: string; name: string }[] = [];
    for (const entry of entries) {
      if (!/^v\d+$/.test(entry)) continue;
      try {
        await stat(path.join(dir, entry, "page.tsx"));
        versions.push({ label: entry, name: labels[entry] ?? entry });
      } catch { /* no page.tsx inside, skip */ }
    }
    versions.sort((a, b) => parseVersionNum(a.label) - parseVersionNum(b.label));
    return NextResponse.json(versions);
  } catch {
    return NextResponse.json([]);
  }
}

// POST /api/prototypes/versions { slug }
// Saves current page.tsx as next vN/page.tsx
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

  const existingNums = entries
    .filter((e) => /^v\d+$/.test(e))
    .map(parseVersionNum)
    .filter((n) => n > 0);

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  const label = `v${nextNum}`;

  const content = await readFile(path.join(dir, "page.tsx"), "utf-8");
  const versionDir = path.join(dir, label);
  await mkdir(versionDir, { recursive: true });
  await writeFile(path.join(versionDir, "page.tsx"), content);

  return NextResponse.json({ label, name: label });
}

// PATCH /api/prototypes/versions { slug, version: "v1", name: "map view" }
// Renames a version's display label
export async function PATCH(req: NextRequest) {
  const { slug, version, name } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (typeof version !== "string" || !/^v\d+$/.test(version)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }
  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Invalid name" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  const labels = await readLabels(dir);
  labels[version] = name.trim();
  await writeLabels(dir, labels);

  return NextResponse.json({ ok: true });
}

// DELETE /api/prototypes/versions { slug, version: "v1" }
// Removes a version snapshot directory and cleans up its label
export async function DELETE(req: NextRequest) {
  const { slug, version } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (typeof version !== "string" || !/^v\d+$/.test(version)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  await rm(path.join(dir, version), { recursive: true, force: true });

  // Remove from labels if present
  const labels = await readLabels(dir);
  if (labels[version]) {
    delete labels[version];
    await writeLabels(dir, labels);
  }

  return NextResponse.json({ ok: true });
}

// PUT /api/prototypes/versions { slug, version: "v1" }
// Restores vN/page.tsx as the live page.tsx
export async function PUT(req: NextRequest) {
  const { slug, version } = await req.json();
  if (!validSlug(slug)) return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  if (typeof version !== "string" || !/^v\d+$/.test(version)) {
    return NextResponse.json({ error: "Invalid version" }, { status: 400 });
  }

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  const content = await readFile(path.join(dir, version, "page.tsx"), "utf-8");
  await writeFile(path.join(dir, "page.tsx"), content);

  return NextResponse.json({ ok: true });
}
