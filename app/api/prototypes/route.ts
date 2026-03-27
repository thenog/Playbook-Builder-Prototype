import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir, readdir, stat, readFile, unlink, rm } from "fs/promises";
import path from "path";

function inferType(content: string): "mobile" | "desktop" {
  return /^\/\/ Type:\s*mobile/m.test(content) ? "mobile" : "desktop";
}

function inferName(content: string, slug: string): string {
  const m = content.match(/^\/\/ Prototype:\s*(.+)/m);
  if (m?.[1]?.trim()) return m[1].trim();
  return slug.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

export async function GET() {
  const prototypesDir = path.join(process.cwd(), "app", "prototypes");

  let entries: string[];
  try {
    entries = await readdir(prototypesDir);
  } catch {
    return NextResponse.json([]);
  }

  const results: { slug: string; filePath: string; type: "mobile" | "desktop"; name: string }[] = [];

  for (const entry of entries) {
    if (entry === "layout.tsx") continue;

    const entryPath = path.join(prototypesDir, entry);
    let info;
    try {
      info = await stat(entryPath);
    } catch {
      continue;
    }

    if (info.isDirectory()) {
      const pagePath = path.join(entryPath, "page.tsx");
      try {
        await stat(pagePath);
      } catch {
        continue;
      }
      const slug = entry;
      const content = await readFile(pagePath, "utf-8");
      results.push({
        slug,
        filePath: `app/prototypes/${slug}/page.tsx`,
        type: inferType(content),
        name: inferName(content, slug),
      });
    } else if (entry.endsWith(".tsx")) {
      const slug = entry.replace(/\.tsx$/, "");
      const content = await readFile(entryPath, "utf-8");

      const destDir = path.join(prototypesDir, slug);
      const destFile = path.join(destDir, "page.tsx");

      // Migrate flat file to subdirectory structure
      let pageExists = false;
      try {
        await stat(destFile);
        pageExists = true;
      } catch { /* doesn't exist */ }

      try {
        if (!pageExists) {
          await mkdir(destDir, { recursive: true });
          await writeFile(destFile, content);
        }
        await unlink(entryPath);
      } catch (err) {
        console.error(`[prototypes] Migration failed for ${entry}:`, err);
      }

      results.push({
        slug,
        filePath: `app/prototypes/${slug}/page.tsx`,
        type: inferType(content),
        name: inferName(content, slug),
      });
    }
  }

  return NextResponse.json(results);
}

export async function POST(req: NextRequest) {
  const { name, slug, type } = await req.json();

  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  await mkdir(dir, { recursive: true });

  const componentName = slug
    .split("-")
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const mobileNote = type === "mobile"
    ? `// This prototype renders inside a 375×812 phone frame.
// Design for mobile — full width, start content below the notch (~28px from top).
// Use Tailwind classes. Do not add any outer layout shell.\n`
    : `// This prototype renders inside a full-width desktop canvas.
// Use Tailwind classes. Do not add any outer layout shell.\n`;

  const content = `"use client";

// Prototype: ${name}
// Type: ${type}
${mobileNote}
export default function ${componentName}() {
  return (
    <div className="${type === "mobile" ? "w-full h-full pt-7" : "w-full h-full"}">
      {/* Build your ${type} prototype here */}
    </div>
  );
}
`;

  const filePath = `app/prototypes/${slug}/page.tsx`;
  await writeFile(path.join(process.cwd(), filePath), content);

  return NextResponse.json({ filePath });
}

export async function DELETE(req: NextRequest) {
  const { slug } = await req.json();
  if (!slug || typeof slug !== "string" || slug.includes("..") || slug.includes("/")) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }
  const dir = path.join(process.cwd(), "app", "prototypes", slug);
  try {
    await rm(dir, { recursive: true, force: true });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[prototypes] Delete failed:", err);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
