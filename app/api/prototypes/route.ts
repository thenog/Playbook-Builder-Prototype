import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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
