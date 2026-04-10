# Future

**Goal**: First section of the "future" vision — Home screen (saved accounts list) + Company Profile detail view, state-driven navigation (no routing).

**Key decisions**
- Single `page.tsx` with `View = "home" | "company"` state; no Next.js routing
- Company profile is a full copy of AI Briefs with back button wired to `setView("home")` and company name driven by `selectedCompany` state
- Home screen matches Figma node 8516-152500: HOME_NAVY nav bar, map placeholder card, saved accounts list, pill tab bar

**Status**: complete

**Open questions**
- Should the map card eventually use a real map (Mapbox/Google)?
- Should "See all" and "My notes / My tasks" rows be interactive in a future version?
