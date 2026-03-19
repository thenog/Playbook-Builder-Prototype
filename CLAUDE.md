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
- Do not create new files inside `app/prototypes/[slug]/` — only edit `page.tsx`
