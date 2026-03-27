@AGENTS.md

# Voze AI Prototype Playground

## Project structure

- `app/page.tsx` — The prototype manager shell: sidebar, top bar, canvas wrapper, FAB. **Never modify this file when building a prototype.**
- `app/prototypes/[slug]/page.tsx` — The prototype UI. This is the ONLY file to edit when building a prototype.
- `app/api/prototypes/route.ts` — API that creates prototype files on disk.
- `app/prototypes/layout.tsx` — Bare layout (no shell chrome) for all prototype pages.

## How prototypes work

Each prototype is a Next.js page rendered inside an `<iframe>` in the canvas:
- **Mobile prototype**: iframe inside a 375×812 phone frame bezel
- **Desktop prototype**: iframe fills the full content area

The shell (`app/page.tsx`) handles the sidebar, New button, FAB (rename/delete/icon), and localStorage persistence. It is never modified when building prototypes.

## When the user asks you to build a prototype

1. Identify the active prototype's slug from the sidebar or from the user's instruction
2. Edit **only** `app/prototypes/[slug]/page.tsx`
3. The iframe hot-reloads automatically — no manual refresh needed

### Mobile prototype constraints
- The component renders at **375px wide** inside the phone frame
- The top ~28px is covered by the phone notch — start real content below it (the template includes `pt-7` for this)
- Design for mobile screen density — use `text-sm`, compact spacing
- Do not add any sidebar, navigation shell, or layout chrome — only the screen content

### Desktop prototype constraints
- The component fills the full available width and height
- Do not add any sidebar, navigation shell, or layout chrome — only the screen content

### General rules
- Use Tailwind CSS for all styling
- Import only from `react`, `@phosphor-icons/react`, or other packages already in `package.json`
- Keep the component as a single default export
- The only files you may touch inside `app/prototypes/[slug]/` are `page.tsx` and `prototype.md`

## Before building or editing a prototype

1. Read `app/prototypes/[slug]/prototype.md` — it describes the goal, key decisions, and open questions
2. Read the comment header at the top of `page.tsx` for type and status
3. If the user asks for a significant redesign or new direction, offer to save a version first:
   - POST `/api/prototypes/versions` with `{ slug }` — snapshots current `page.tsx` as `v1.tsx`, `v2.tsx`, etc.

## Versioning

Each prototype directory may contain named version snapshots alongside `page.tsx`:
```
app/prototypes/[slug]/
  page.tsx        ← always the live/editable version
  v1.tsx          ← saved snapshots (read-only unless restoring)
  v2.tsx
  prototype.md    ← goal, decisions, notes for this prototype
```

- **Save a version**: POST `/api/prototypes/versions` `{ slug }` → creates next `vN.tsx`
- **Restore a version**: PUT `/api/prototypes/versions` `{ slug, version: "v1" }` → overwrites `page.tsx`
- **List versions**: GET `/api/prototypes/versions?slug=...`
- The shell's version strip shows saved snapshots; clicking one prompts to restore

## Notes (prototype.md)

Each prototype has a `prototype.md` file. Read it before making changes. You may update it when:
- The goal or status changes
- A key decision is made worth recording
- An open question gets resolved

- **Read notes**: GET `/api/prototypes/notes?slug=...`
- **Write notes**: POST `/api/prototypes/notes` `{ slug, content }`
