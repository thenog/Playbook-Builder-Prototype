import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  const { name, slug, type } = await req.json();

  const dir = path.join(process.cwd(), "app", "prototypes");
  await mkdir(dir, { recursive: true });

  const componentName = slug
    .split("-")
    .map((s: string) => s.charAt(0).toUpperCase() + s.slice(1))
    .join("");

  const content = `"use client";

// Prototype: ${name}
// Type: ${type}

export default function ${componentName}() {
  return (
    <div>
      {/* Build your ${type} prototype here */}
    </div>
  );
}
`;

  const filePath = `app/prototypes/${slug}.tsx`;
  await writeFile(path.join(process.cwd(), filePath), content);

  return NextResponse.json({ filePath });
}
