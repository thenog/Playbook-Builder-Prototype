# AI Briefs

**Goal**: Demonstrate the AI Visit Brief feature in Voze Pro's Company Profile screen. Shows how the AI fetches and compiles a visit brief from historical notes, with inline highlighted annotations (yellow/red/green), before a sales rep visits a customer.

**Key decisions**
- Visual style matches Figma node 117:25 (dark navy header, white rounded content, blue tab underline)
- Animation auto-plays on Activity tab mount and replays each time the user returns to Activity tab (via `key` prop remount)
- Inline highlights use CSS color transitions (not instant) to mimic Claude's annotation behavior
- All animation state lives in `ActivityTabContent` — parent holds a `briefKey` counter that triggers remount
- Tabs: Activity (default), Notes, Tasks, Contacts (9), Info — all have realistic mock content

**Animation sequence** (~10s total)
1. Bouncing dots + cycling loading label ("Reviewing notes..." → "Analyzing 8 notes..." → "Compiling brief...")
2. "Last Visit" section streams in word-by-word
3. "Account Signal" section streams in word-by-word
4. "Suggested Talking Point" streams in word-by-word
5. Highlights fade in one at a time: yellow (contract), red (revenue), yellow (retention), green (routes)
6. Green "Updated just now" badge + "Prep tips" button appear

**Status**: in-progress

**Open questions**
- Should "Prep tips" button trigger a second animation (e.g., a modal or expanded tips list)?
- Should the activity feed items below the brief be tappable to view note detail?
