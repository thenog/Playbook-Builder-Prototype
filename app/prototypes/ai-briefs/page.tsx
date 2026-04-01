"use client";

// Prototype: AI Briefs
// Type: mobile
// Status: in-progress
// Created: 2026-03-30
// This prototype renders inside a 375×812 phone frame.
// Design for mobile — full width, start content below the notch (~28px from top).
// Use Tailwind classes. Do not add any outer layout shell.

import { useState, useEffect } from "react";
import {
  CaretLeft,
  Star,
  CalendarBlank,
  ArrowSquareOut,
  Sparkle,
  DotsThree,
  CaretRight,
  CheckCircle,
  Buildings,
  Phone,
} from "@phosphor-icons/react";

// ── Design tokens ─────────────────────────────────────────────────────────────

const NAVY = "#1a2235";
const BLUE = "#2563eb";

const HL_YELLOW_BG = "#fef3c7";
const HL_YELLOW_FG = "#92400e";
const HL_RED_BG = "#fee2e2";
const HL_RED_FG = "#991b1b";
const HL_GREEN_BG = "#d1fae5";
const HL_GREEN_FG = "#065f46";

// ── Types ─────────────────────────────────────────────────────────────────────

type Tab = "activity" | "notes" | "tasks" | "contacts" | "info";

type Segment =
  | { kind: "text"; text: string }
  | { kind: "highlight"; text: string; step: number; bg: string; fg: string };

// ── Brief content ─────────────────────────────────────────────────────────────

const SECTION1_TEXT =
  "Dave mentioned they're evaluating Bridgestone's regional contract. Wanted a quote on 22.5\" drive tires before end of month. Quote was sent — no response yet.";
const SECTION1_WORDS = SECTION1_TEXT.split(" ");
const SECTION1_SEGMENTS: Segment[] = [
  { kind: "text", text: "Dave mentioned they're evaluating " },
  {
    kind: "highlight",
    text: "Bridgestone's regional contract",
    step: 1,
    bg: HL_YELLOW_BG,
    fg: HL_YELLOW_FG,
  },
  {
    kind: "text",
    text: ". Wanted a quote on 22.5\" drive tires before end of month. Quote was sent — no response yet.",
  },
];

const SECTION2_TEXT =
  "Revenue down 14% vs. last quarter. 3 visits in the last 90 days vs. 7 same period last year. Flagged in manager's retention play.";
const SECTION2_WORDS = SECTION2_TEXT.split(" ");
const SECTION2_SEGMENTS: Segment[] = [
  { kind: "text", text: "Revenue " },
  {
    kind: "highlight",
    text: "down 14% vs. last quarter",
    step: 2,
    bg: HL_RED_BG,
    fg: HL_RED_FG,
  },
  {
    kind: "text",
    text: ". 3 visits in the last 90 days vs. 7 same period last year. Flagged in manager's ",
  },
  {
    kind: "highlight",
    text: "retention play",
    step: 3,
    bg: HL_YELLOW_BG,
    fg: HL_YELLOW_FG,
  },
  { kind: "text", text: "." },
];

const SECTION3_TEXT =
  "Ask about the fleet expansion Dave mentioned in March — 2 new long-haul routes starting Q3. Good opening for a recap tire program.";
const SECTION3_WORDS = SECTION3_TEXT.split(" ");
const SECTION3_SEGMENTS: Segment[] = [
  {
    kind: "text",
    text: "Ask about the fleet expansion Dave mentioned in March — ",
  },
  {
    kind: "highlight",
    text: "2 new long-haul routes",
    step: 4,
    bg: HL_GREEN_BG,
    fg: HL_GREEN_FG,
  },
  { kind: "text", text: " starting Q3. Good opening for a recap tire program." },
];

// ── Mock data ─────────────────────────────────────────────────────────────────

const ACTIVITY_FEED = [
  {
    date: "Mar 12",
    title: "In-person visit",
    snippet: "Discussed fleet expansion and new long-haul routes for Q3.",
    type: "In-person",
  },
  {
    date: "Feb 28",
    title: "Phone call",
    snippet: "Dave flagged concerns about tire wear on long-haul trucks.",
    type: "Phone",
  },
  {
    date: "Feb 14",
    title: "In-person visit",
    snippet: "Delivered product catalog. Met with Sarah about shipping labels.",
    type: "In-person",
  },
];

const NOTES_DATA = [
  {
    date: "Mar 12",
    title: "In-person visit — All Star Trucking",
    snippet:
      "Discussed fleet expansion. Dave evaluating Bridgestone contract renewal.",
    type: "In-person",
  },
  {
    date: "Feb 28",
    title: "Phone call with Dave",
    snippet:
      "Revenue down, fleet visits reduced. Wants tire quote before month end.",
    type: "Phone",
  },
  {
    date: "Feb 14",
    title: "Drop-off visit",
    snippet: "Delivered updated catalog. Confirmed return address with Sarah.",
    type: "In-person",
  },
  {
    date: "Jan 30",
    title: "In-person visit",
    snippet:
      "Reviewed Q4 numbers. Mentioned 2 new long-haul routes starting Q3.",
    type: "In-person",
  },
];

const TASKS_OPEN = [
  {
    date: "Jun 14",
    time: "9:00am",
    description:
      "Deliver the new shipping labels and confirm return address with Sarah.",
    company: "All Star Trucking",
  },
  {
    date: "Jun 14",
    time: "9:00am",
    description:
      "Pick up the contract documents for the upcoming partnership meeting.",
    company: "All Star Trucking",
  },
];

const TASKS_DONE = [
  {
    description:
      "Drop off the updated product catalog and a small thank-you gift for Mike.",
    company: "Cross County Haulers",
  },
];

const CONTACTS_DATA = [
  {
    initials: "DM",
    name: "Dave Mitchell",
    role: "Fleet Manager",
    lastContact: "3 weeks ago",
    bg: "#dbeafe",
    fg: "#1d4ed8",
  },
  {
    initials: "SW",
    name: "Sarah Walsh",
    role: "Operations Coordinator",
    lastContact: "3 weeks ago",
    bg: "#fce7f3",
    fg: "#9d174d",
  },
  {
    initials: "MK",
    name: "Mike Kim",
    role: "Purchasing Lead",
    lastContact: "6 weeks ago",
    bg: "#d1fae5",
    fg: "#065f46",
  },
  {
    initials: "JR",
    name: "Janet Rivera",
    role: "CFO",
    lastContact: "3 months ago",
    bg: "#fef3c7",
    fg: "#92400e",
  },
];

// ── Helper components ─────────────────────────────────────────────────────────

function BlinkingCursor() {
  return (
    <span
      className="inline-block w-[2px] h-[13px] bg-gray-400 ml-[2px] align-middle rounded-sm"
      style={{ animation: "blink 0.9s step-end infinite" }}
    />
  );
}

function renderSegments(segments: Segment[], highlightStep: number) {
  return segments.map((seg, i) => {
    if (seg.kind === "text") return <span key={i}>{seg.text}</span>;
    const active = highlightStep >= seg.step;
    return (
      <span
        key={i}
        className="rounded-[3px] px-[3px] py-[1px]"
        style={{
          backgroundColor: active ? seg.bg : "transparent",
          color: active ? seg.fg : "inherit",
          fontWeight: active ? 500 : "inherit",
          transition: "background-color 0.45s ease, color 0.4s ease",
          animation: active ? "highlightPop 0.35s ease both" : undefined,
        }}
      >
        {seg.text}
      </span>
    );
  });
}

// ── Tab content components ────────────────────────────────────────────────────

function NotesTabContent() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {NOTES_DATA.map((note, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {note.type === "In-person" ? (
                <Buildings size={10} weight="bold" />
              ) : (
                <Phone size={10} weight="bold" />
              )}
              {note.type}
            </span>
            <span className="text-xs text-gray-400">{note.date}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">
            {note.title}
          </p>
          <p className="text-sm text-gray-500 leading-snug">{note.snippet}</p>
        </div>
      ))}
    </div>
  );
}

function TasksTabContent() {
  return (
    <div className="px-4 py-4 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-700">Open (2)</p>
        <button
          className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full"
          style={{ backgroundColor: BLUE }}
        >
          <span className="text-base leading-none">+</span> Task
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {TASKS_OPEN.map((task, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex gap-2">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded"
                style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}
              >
                {task.date}
              </span>
              <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">
                {task.time}
              </span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Buildings size={10} weight="bold" className="text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  {task.company}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-snug">
                {task.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Completed</p>
        {TASKS_DONE.map((task, i) => (
          <div
            key={i}
            className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 opacity-50"
          >
            <div className="flex gap-2">
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                <CheckCircle size={10} weight="bold" /> Completed
              </span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Buildings size={10} weight="bold" className="text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-gray-800">
                  {task.company}
                </span>
              </div>
              <p className="text-xs text-gray-700 leading-snug line-through">
                {task.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ContactsTabContent() {
  return (
    <div className="px-4 py-4 flex flex-col gap-2">
      <p className="text-xs text-gray-400 mb-1">9 contacts at this company</p>
      {CONTACTS_DATA.map((contact, i) => (
        <div
          key={i}
          className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3"
        >
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
            style={{ backgroundColor: contact.bg, color: contact.fg }}
          >
            {contact.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">
              Last contact: {contact.lastContact}
            </p>
          </div>
          <CaretRight size={16} className="text-gray-300 shrink-0" />
        </div>
      ))}
    </div>
  );
}

function InfoTabContent() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-2">
      <Buildings size={30} className="text-gray-200" />
      <p className="text-sm text-gray-400">Company info coming soon</p>
    </div>
  );
}

// ── Activity tab (all animation state lives here; remounts via key prop) ──────

function ActivityTabContent() {
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [section1Visible, setSection1Visible] = useState(false);
  const [section2Visible, setSection2Visible] = useState(false);
  const [section3Visible, setSection3Visible] = useState(false);
  const [wordsSection1, setWordsSection1] = useState(0);
  const [wordsSection2, setWordsSection2] = useState(0);
  const [wordsSection3, setWordsSection3] = useState(0);
  const [highlightStep, setHighlightStep] = useState(0);
  const [badgeVisible, setBadgeVisible] = useState(false);
  const [briefDone, setBriefDone] = useState(false);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const t = (fn: () => void, ms: number) => {
      timers.push(setTimeout(fn, ms));
    };

    // Loading phase labels cycle
    t(() => setLoadingPhase(1), 600);
    t(() => setLoadingPhase(2), 1400);

    // Section 1 header + word streaming
    t(() => setSection1Visible(true), 2000);
    const s1WordStart = 2400;
    t(() => {
      SECTION1_WORDS.forEach((_, i) => {
        timers.push(setTimeout(() => setWordsSection1(i + 1), i * 50));
      });
    }, s1WordStart);

    // Section 2 header + word streaming
    const s2Start = s1WordStart + SECTION1_WORDS.length * 50 + 150;
    t(() => setSection2Visible(true), s2Start);
    const s2WordStart = s2Start + 400;
    t(() => {
      SECTION2_WORDS.forEach((_, i) => {
        timers.push(setTimeout(() => setWordsSection2(i + 1), i * 50));
      });
    }, s2WordStart);

    // Section 3 header + word streaming
    const s3Start = s2WordStart + SECTION2_WORDS.length * 50 + 150;
    t(() => setSection3Visible(true), s3Start);
    const s3WordStart = s3Start + 400;
    t(() => {
      SECTION3_WORDS.forEach((_, i) => {
        timers.push(setTimeout(() => setWordsSection3(i + 1), i * 50));
      });
    }, s3WordStart);

    // Inline highlight annotations (staggered 280ms apart)
    const hlStart = s3WordStart + SECTION3_WORDS.length * 50 + 500;
    t(() => setHighlightStep(1), hlStart);
    t(() => setHighlightStep(2), hlStart + 280);
    t(() => setHighlightStep(3), hlStart + 560);
    t(() => setHighlightStep(4), hlStart + 840);

    // Done — show green badge and Prep tips button
    t(() => {
      setBadgeVisible(true);
      setBriefDone(true);
    }, hlStart + 1100);

    return () => timers.forEach(clearTimeout);
  }, []);

  const LOADING_LABELS = [
    "Reviewing your notes...",
    "Analyzing 8 notes...",
    "Compiling brief...",
  ];

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
      {/* ── AI Visit Brief Card ── */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        {/* Card header */}
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle size={14} weight="fill" className="text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">
              AI Visit Brief
            </span>
          </div>
          <div
            className="px-2.5 py-1 rounded-full text-[11px] font-semibold"
            style={{
              backgroundColor: badgeVisible ? "#d1fae5" : "#f3f4f6",
              color: badgeVisible ? "#047857" : "#9ca3af",
              transition: "background-color 0.6s ease, color 0.5s ease",
            }}
          >
            {badgeVisible ? "Updated just now" : "Generating..."}
          </div>
        </div>

        {/* Card body */}
        {!section1Visible ? (
          /* Loading state — bouncing dots */
          <div className="px-4 py-5 flex items-center gap-3">
            <div className="flex gap-1 items-end">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-gray-300"
                  style={{
                    animation: "dotBounce 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
            <span
              className="text-sm text-gray-400"
              style={{ animation: "fadeSlideIn 0.3s ease both" }}
              key={loadingPhase}
            >
              {LOADING_LABELS[loadingPhase]}
            </span>
          </div>
        ) : (
          /* Brief content sections */
          <div>
            {/* Section 1: Last Visit */}
            <div
              className="px-4 pt-4 pb-4 flex flex-col gap-2"
              style={{ animation: "fadeSlideIn 0.4s ease both" }}
            >
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                Last Visit
              </p>
              <p className="text-sm text-gray-900 leading-relaxed">
                {highlightStep > 0 ? (
                  renderSegments(SECTION1_SEGMENTS, highlightStep)
                ) : (
                  <>
                    {SECTION1_WORDS.slice(0, wordsSection1).join(" ")}
                    {wordsSection1 > 0 &&
                      wordsSection1 < SECTION1_WORDS.length && (
                        <BlinkingCursor />
                      )}
                  </>
                )}
              </p>
            </div>

            {/* Section 2: Account Signal */}
            {section2Visible && (
              <div
                className="border-t border-gray-100 px-4 pt-4 pb-4 flex flex-col gap-2"
                style={{ animation: "fadeSlideIn 0.4s ease both" }}
              >
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                  Account Signal
                </p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {highlightStep > 0 ? (
                    renderSegments(SECTION2_SEGMENTS, highlightStep)
                  ) : (
                    <>
                      {SECTION2_WORDS.slice(0, wordsSection2).join(" ")}
                      {wordsSection2 > 0 &&
                        wordsSection2 < SECTION2_WORDS.length && (
                          <BlinkingCursor />
                        )}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Section 3: Suggested Talking Point */}
            {section3Visible && (
              <div
                className="border-t border-gray-100 px-4 pt-4 pb-4 flex flex-col gap-2"
                style={{ animation: "fadeSlideIn 0.4s ease both" }}
              >
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
                  Suggested Talking Point
                </p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {highlightStep > 0 ? (
                    renderSegments(SECTION3_SEGMENTS, highlightStep)
                  ) : (
                    <>
                      {SECTION3_WORDS.slice(0, wordsSection3).join(" ")}
                      {wordsSection3 > 0 &&
                        wordsSection3 < SECTION3_WORDS.length && (
                          <BlinkingCursor />
                        )}
                    </>
                  )}
                </p>
              </div>
            )}

            {/* Prep tips button — appears when complete */}
            {briefDone && (
              <div
                className="border-t border-gray-100 px-4 py-3.5 flex justify-center"
                style={{ animation: "fadeSlideIn 0.4s ease both" }}
              >
                <button className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-800 px-7 py-2.5 rounded-xl bg-white shadow-sm">
                  Prep tips{" "}
                  <ArrowSquareOut size={13} className="text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Recent activity feed ── */}
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">
          Recent Activity
        </p>
        {ACTIVITY_FEED.map((item, i) => (
          <div
            key={i}
            className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-start"
          >
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
              {item.type === "In-person" ? (
                <Buildings size={13} className="text-gray-500" />
              ) : (
                <Phone size={13} className="text-gray-500" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{item.date}</span>
              </div>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">
                {item.snippet}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function AiBriefs() {
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  // Incrementing this key remounts ActivityTabContent, replaying the animation
  const [briefKey, setBriefKey] = useState(0);

  function handleTabSwitch(tab: Tab) {
    if (tab === "activity" && activeTab !== "activity") {
      setBriefKey((k) => k + 1);
    }
    setActiveTab(tab);
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "activity", label: "Activity" },
    { id: "notes", label: "Notes" },
    { id: "tasks", label: "Tasks" },
    { id: "contacts", label: "Contacts (9)" },
    { id: "info", label: "Info" },
  ];

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden"
      style={{ fontFamily: "Inter, system-ui, sans-serif", backgroundColor: NAVY }}
    >
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(7px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes highlightPop {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.035); }
          100% { transform: scale(1); }
        }
      `}</style>

      {/* ── Header ── */}
      <div
        className="pt-7 pb-3 px-4 flex items-center justify-between shrink-0"
        style={{ backgroundColor: NAVY }}
      >
        <button className="w-8 h-8 flex items-center justify-center">
          <CaretLeft size={20} color="white" />
        </button>
        <span className="text-white font-medium text-[15px]">Company details</span>
        <button className="w-8 h-8 flex items-center justify-center">
          <Star size={20} color="white" />
        </button>
      </div>

      {/* ── White content card ── */}
      <div className="flex-1 bg-white rounded-t-3xl flex flex-col overflow-hidden">
        {/* Company header */}
        <div className="px-4 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">
              All Star Trucking
            </h1>
            <button className="mt-1 p-1">
              <DotsThree size={20} className="text-gray-400" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 mb-3">
            <CalendarBlank size={13} className="text-gray-400" />
            <span className="text-sm text-gray-400">Last note: 3 weeks ago</span>
          </div>
          <div className="bg-gray-50 rounded-xl p-3.5 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800">133 N 17th Street</p>
              <p className="text-sm font-medium text-gray-800">San Diego, CA 32716</p>
            </div>
            <button>
              <ArrowSquareOut size={17} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="border-b border-gray-200 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="flex px-1" style={{ minWidth: "max-content" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className="shrink-0 pb-3 px-3 text-sm font-medium border-b-2 transition-colors duration-150"
                style={{
                  borderBottomColor:
                    activeTab === tab.id ? BLUE : "transparent",
                  color: activeTab === tab.id ? "#1f2937" : "#9ca3af",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "activity" && <ActivityTabContent key={briefKey} />}
          {activeTab === "notes" && <NotesTabContent />}
          {activeTab === "tasks" && <TasksTabContent />}
          {activeTab === "contacts" && <ContactsTabContent />}
          {activeTab === "info" && <InfoTabContent />}
        </div>
      </div>
    </div>
  );
}
