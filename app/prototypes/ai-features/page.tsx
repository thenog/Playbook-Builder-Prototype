"use client";

// Prototype: AI Features
// Type: mobile
// Status: in-progress
// Created: 2026-04-09
// This prototype renders inside a 375×812 phone frame.
// Design for mobile — full width, start content below the notch (~28px from top).
// Use Tailwind classes. Do not add any outer layout shell.

import { useState, useEffect, useRef } from "react";
import {
  CaretLeft,
  CaretRight,
  Star,
  CalendarBlank,
  ArrowSquareOut,
  Sparkle,
  DotsThree,
  CheckCircle,
  Buildings,
  Phone,
  List,
  Bell,
  MapPin,
  House,
  MagnifyingGlass,
  Note,
  CheckSquare,
  SlidersHorizontal,
  Stack,
  NavigationArrow,
  UserCircle,
  IdentificationCard,
  XCircle,
  CarProfile,
} from "@phosphor-icons/react";

// ── Design tokens ──────────────────────────────────────────────────────────────

const HOME_NAVY = "#1E293B";
const NAVY = "#1a2235";
const BLUE = "#2563eb";

const HL_YELLOW_BG = "#fef3c7";
const HL_YELLOW_FG = "#92400e";
const HL_RED_BG = "#fee2e2";
const HL_RED_FG = "#991b1b";
const HL_GREEN_BG = "#d1fae5";
const HL_GREEN_FG = "#065f46";

// ── Types ──────────────────────────────────────────────────────────────────────

type View = "home" | "company" | "map";
type Tab = "activity" | "notes" | "tasks" | "contacts" | "info";
type Segment =
  | { kind: "text"; text: string }
  | { kind: "highlight"; text: string; step: number; bg: string; fg: string };

// ── Saved accounts ─────────────────────────────────────────────────────────────

const COMPANIES = [
  "Mountain Line Logistics",
  "XPO Logistics",
  "Long Country Haulers",
  "Freight Forwarders",
  "Logistics Coordinators",
  "Freight Masters",
  "Haulage Experts",
  "Transport Solutions Inc.",
  "Cargo Connectors",
  "Delivery Dynamics",
];

// ── Brief content ──────────────────────────────────────────────────────────────

const SECTION1_TEXT =
  "Dave mentioned they're evaluating Bridgestone's regional contract. Wanted a quote on 22.5\" drive tires before end of month. Quote was sent — no response yet.";
const SECTION1_WORDS = SECTION1_TEXT.split(" ");
const SECTION1_SEGMENTS: Segment[] = [
  { kind: "text", text: "Dave mentioned they're evaluating " },
  { kind: "highlight", text: "Bridgestone's regional contract", step: 1, bg: HL_YELLOW_BG, fg: HL_YELLOW_FG },
  { kind: "text", text: ". Wanted a quote on 22.5\" drive tires before end of month. Quote was sent — no response yet." },
];

const SECTION2_TEXT =
  "Revenue down 14% vs. last quarter. 3 visits in the last 90 days vs. 7 same period last year. Flagged in manager's retention play.";
const SECTION2_WORDS = SECTION2_TEXT.split(" ");
const SECTION2_SEGMENTS: Segment[] = [
  { kind: "text", text: "Revenue " },
  { kind: "highlight", text: "down 14% vs. last quarter", step: 2, bg: HL_RED_BG, fg: HL_RED_FG },
  { kind: "text", text: ". 3 visits in the last 90 days vs. 7 same period last year. Flagged in manager's " },
  { kind: "highlight", text: "retention play", step: 3, bg: HL_YELLOW_BG, fg: HL_YELLOW_FG },
  { kind: "text", text: "." },
];

const SECTION3_TEXT =
  "Ask about the fleet expansion Dave mentioned in March — 2 new long-haul routes starting Q3. Good opening for a recap tire program.";
const SECTION3_WORDS = SECTION3_TEXT.split(" ");
const SECTION3_SEGMENTS: Segment[] = [
  { kind: "text", text: "Ask about the fleet expansion Dave mentioned in March — " },
  { kind: "highlight", text: "2 new long-haul routes", step: 4, bg: HL_GREEN_BG, fg: HL_GREEN_FG },
  { kind: "text", text: " starting Q3. Good opening for a recap tire program." },
];

// ── Mock data ──────────────────────────────────────────────────────────────────

const ACTIVITY_FEED = [
  { date: "Mar 12", title: "In-person visit", snippet: "Discussed fleet expansion and new long-haul routes for Q3.", type: "In-person" },
  { date: "Feb 28", title: "Phone call", snippet: "Dave flagged concerns about tire wear on long-haul trucks.", type: "Phone" },
  { date: "Feb 14", title: "In-person visit", snippet: "Delivered product catalog. Met with Sarah about shipping labels.", type: "In-person" },
];

const NOTES_DATA = [
  { date: "Mar 12", title: "In-person visit — All Star Trucking", snippet: "Discussed fleet expansion. Dave evaluating Bridgestone contract renewal.", type: "In-person" },
  { date: "Feb 28", title: "Phone call with Dave", snippet: "Revenue down, fleet visits reduced. Wants tire quote before month end.", type: "Phone" },
  { date: "Feb 14", title: "Drop-off visit", snippet: "Delivered updated catalog. Confirmed return address with Sarah.", type: "In-person" },
  { date: "Jan 30", title: "In-person visit", snippet: "Reviewed Q4 numbers. Mentioned 2 new long-haul routes starting Q3.", type: "In-person" },
];

const TASKS_OPEN = [
  { date: "Jun 14", time: "9:00am", description: "Deliver the new shipping labels and confirm return address with Sarah.", company: "All Star Trucking" },
  { date: "Jun 14", time: "9:00am", description: "Pick up the contract documents for the upcoming partnership meeting.", company: "All Star Trucking" },
];

const TASKS_DONE = [
  { description: "Drop off the updated product catalog and a small thank-you gift for Mike.", company: "Cross County Haulers" },
];

const CONTACTS_DATA = [
  { initials: "DM", name: "Dave Mitchell", role: "Fleet Manager", lastContact: "3 weeks ago", bg: "#dbeafe", fg: "#1d4ed8" },
  { initials: "SW", name: "Sarah Walsh", role: "Operations Coordinator", lastContact: "3 weeks ago", bg: "#fce7f3", fg: "#9d174d" },
  { initials: "MK", name: "Mike Kim", role: "Purchasing Lead", lastContact: "6 weeks ago", bg: "#d1fae5", fg: "#065f46" },
  { initials: "JR", name: "Janet Rivera", role: "CFO", lastContact: "3 months ago", bg: "#fef3c7", fg: "#92400e" },
];

// ── Helper components ──────────────────────────────────────────────────────────

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

// ── Company profile tab content ────────────────────────────────────────────────

function NotesTabContent() {
  return (
    <div className="px-4 py-4 flex flex-col gap-3">
      {NOTES_DATA.map((note, i) => (
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              {note.type === "In-person" ? <Buildings size={10} weight="bold" /> : <Phone size={10} weight="bold" />}
              {note.type}
            </span>
            <span className="text-xs text-gray-400">{note.date}</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 leading-snug">{note.title}</p>
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
        <button className="flex items-center gap-1 text-white text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: BLUE }}>
          <span className="text-base leading-none">+</span> Task
        </button>
      </div>
      <div className="flex flex-col gap-3">
        {TASKS_OPEN.map((task, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3">
            <div className="flex gap-2">
              <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>{task.date}</span>
              <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded">{task.time}</span>
            </div>
            <div className="bg-gray-100 rounded-lg p-3 flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                  <Buildings size={10} weight="bold" className="text-blue-700" />
                </div>
                <span className="text-xs font-semibold text-gray-800">{task.company}</span>
              </div>
              <p className="text-xs text-gray-700 leading-snug">{task.description}</p>
            </div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-gray-700">Completed</p>
        {TASKS_DONE.map((task, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col gap-3 opacity-50">
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
                <span className="text-xs font-semibold text-gray-800">{task.company}</span>
              </div>
              <p className="text-xs text-gray-700 leading-snug line-through">{task.description}</p>
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
        <div key={i} className="bg-white border border-gray-200 rounded-xl p-3.5 flex items-center gap-3">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0" style={{ backgroundColor: contact.bg, color: contact.fg }}>
            {contact.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
            <p className="text-xs text-gray-500">{contact.role}</p>
            <p className="text-xs text-gray-400 mt-0.5">Last contact: {contact.lastContact}</p>
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
    const t = (fn: () => void, ms: number) => { timers.push(setTimeout(fn, ms)); };

    t(() => setLoadingPhase(1), 600);
    t(() => setLoadingPhase(2), 1400);
    t(() => setSection1Visible(true), 2000);
    const s1WordStart = 2400;
    t(() => { SECTION1_WORDS.forEach((_, i) => { timers.push(setTimeout(() => setWordsSection1(i + 1), i * 50)); }); }, s1WordStart);
    const s2Start = s1WordStart + SECTION1_WORDS.length * 50 + 150;
    t(() => setSection2Visible(true), s2Start);
    const s2WordStart = s2Start + 400;
    t(() => { SECTION2_WORDS.forEach((_, i) => { timers.push(setTimeout(() => setWordsSection2(i + 1), i * 50)); }); }, s2WordStart);
    const s3Start = s2WordStart + SECTION2_WORDS.length * 50 + 150;
    t(() => setSection3Visible(true), s3Start);
    const s3WordStart = s3Start + 400;
    t(() => { SECTION3_WORDS.forEach((_, i) => { timers.push(setTimeout(() => setWordsSection3(i + 1), i * 50)); }); }, s3WordStart);
    const hlStart = s3WordStart + SECTION3_WORDS.length * 50 + 500;
    t(() => setHighlightStep(1), hlStart);
    t(() => setHighlightStep(2), hlStart + 280);
    t(() => setHighlightStep(3), hlStart + 560);
    t(() => setHighlightStep(4), hlStart + 840);
    t(() => { setBadgeVisible(true); setBriefDone(true); }, hlStart + 1100);

    return () => timers.forEach(clearTimeout);
  }, []);

  const LOADING_LABELS = ["Reviewing your notes...", "Analyzing 8 notes...", "Compiling brief..."];

  return (
    <div className="px-4 pt-3 pb-6 flex flex-col gap-4">
      <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white">
        <div className="bg-gray-50 border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkle size={14} weight="fill" className="text-gray-400" />
            <span className="text-[11px] font-semibold text-gray-500 tracking-widest uppercase">AI Visit Brief</span>
          </div>
          <div className="px-2.5 py-1 rounded-full text-[11px] font-semibold" style={{ backgroundColor: badgeVisible ? "#d1fae5" : "#f3f4f6", color: badgeVisible ? "#047857" : "#9ca3af", transition: "background-color 0.6s ease, color 0.5s ease" }}>
            {badgeVisible ? "Updated just now" : "Generating..."}
          </div>
        </div>
        {!section1Visible ? (
          <div className="px-4 py-5 flex items-center gap-3">
            <div className="flex gap-1 items-end">
              {[0, 1, 2].map((i) => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-gray-300" style={{ animation: "dotBounce 1.2s ease-in-out infinite", animationDelay: `${i * 0.2}s` }} />
              ))}
            </div>
            <span className="text-sm text-gray-400" style={{ animation: "fadeSlideIn 0.3s ease both" }} key={loadingPhase}>
              {LOADING_LABELS[loadingPhase]}
            </span>
          </div>
        ) : (
          <div>
            <div className="px-4 pt-4 pb-4 flex flex-col gap-2" style={{ animation: "fadeSlideIn 0.4s ease both" }}>
              <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Last Visit</p>
              <p className="text-sm text-gray-900 leading-relaxed">
                {highlightStep > 0 ? renderSegments(SECTION1_SEGMENTS, highlightStep) : (
                  <>{SECTION1_WORDS.slice(0, wordsSection1).join(" ")}{wordsSection1 > 0 && wordsSection1 < SECTION1_WORDS.length && <BlinkingCursor />}</>
                )}
              </p>
            </div>
            {section2Visible && (
              <div className="border-t border-gray-100 px-4 pt-4 pb-4 flex flex-col gap-2" style={{ animation: "fadeSlideIn 0.4s ease both" }}>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Account Signal</p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {highlightStep > 0 ? renderSegments(SECTION2_SEGMENTS, highlightStep) : (
                    <>{SECTION2_WORDS.slice(0, wordsSection2).join(" ")}{wordsSection2 > 0 && wordsSection2 < SECTION2_WORDS.length && <BlinkingCursor />}</>
                  )}
                </p>
              </div>
            )}
            {section3Visible && (
              <div className="border-t border-gray-100 px-4 pt-4 pb-4 flex flex-col gap-2" style={{ animation: "fadeSlideIn 0.4s ease both" }}>
                <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Suggested Talking Point</p>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {highlightStep > 0 ? renderSegments(SECTION3_SEGMENTS, highlightStep) : (
                    <>{SECTION3_WORDS.slice(0, wordsSection3).join(" ")}{wordsSection3 > 0 && wordsSection3 < SECTION3_WORDS.length && <BlinkingCursor />}</>
                  )}
                </p>
              </div>
            )}
            {briefDone && (
              <div className="border-t border-gray-100 px-4 py-3.5 flex justify-center" style={{ animation: "fadeSlideIn 0.4s ease both" }}>
                <button className="flex items-center gap-2 border border-gray-200 text-sm font-medium text-gray-800 px-7 py-2.5 rounded-xl bg-white shadow-sm">
                  Prep tips <ArrowSquareOut size={13} className="text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-gray-400 tracking-widest uppercase">Recent Activity</p>
        {ACTIVITY_FEED.map((item, i) => (
          <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex gap-3 items-start">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center shrink-0 mt-0.5">
              {item.type === "In-person" ? <Buildings size={13} className="text-gray-500" /> : <Phone size={13} className="text-gray-500" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <span className="text-xs text-gray-400 shrink-0">{item.date}</span>
              </div>
              <p className="text-xs text-gray-500 leading-snug mt-0.5">{item.snippet}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Company profile screen ─────────────────────────────────────────────────────

function CompanyProfileScreen({ company, address, onBack }: { company: string; address?: { street: string; city: string }; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<Tab>("activity");
  const [briefKey, setBriefKey] = useState(0);

  function handleTabSwitch(tab: Tab) {
    if (tab === "activity" && activeTab !== "activity") setBriefKey((k) => k + 1);
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
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif", backgroundColor: NAVY }}>
      {/* Header */}
      <div className="pt-7 pb-3 px-4 flex items-center justify-between shrink-0" style={{ backgroundColor: NAVY }}>
        <button className="w-8 h-8 flex items-center justify-center" onClick={onBack}>
          <CaretLeft size={20} color="white" />
        </button>
        <span className="text-white font-medium text-[15px]">Company details</span>
        <button className="w-8 h-8 flex items-center justify-center">
          <Star size={20} color="white" />
        </button>
      </div>

      {/* White content card */}
      <div className="flex-1 bg-white rounded-t-3xl flex flex-col overflow-hidden">
        {/* Company header */}
        <div className="px-4 pt-6 pb-4 shrink-0">
          <div className="flex items-start justify-between mb-2">
            <h1 className="text-[22px] font-bold text-gray-900 leading-tight">{company}</h1>
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
              <p className="text-sm font-medium text-gray-800">{address?.street ?? "133 N 17th Street"}</p>
              <p className="text-sm font-medium text-gray-800">{address?.city ?? "San Diego, CA 32716"}</p>
            </div>
            <button>
              <ArrowSquareOut size={17} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Tab bar */}
        <div className="border-b border-gray-200 shrink-0 overflow-x-auto [&::-webkit-scrollbar]:hidden">
          <div className="flex px-1" style={{ minWidth: "max-content" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabSwitch(tab.id)}
                className="shrink-0 pb-3 px-3 text-sm font-medium border-b-2 transition-colors duration-150"
                style={{ borderBottomColor: activeTab === tab.id ? BLUE : "transparent", color: activeTab === tab.id ? "#1f2937" : "#9ca3af" }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab content */}
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

// ── Home screen ────────────────────────────────────────────────────────────────

function HomeScreen({ onSelectCompany, onNavigateToMap, onOpenPlusMenu }: {
  onSelectCompany: (name: string) => void;
  onNavigateToMap: () => void;
  onOpenPlusMenu: () => void;
}) {
  // Scattered pin positions for the map card
  const MAP_PINS = [
    { top: "38%", left: "12%" }, { top: "58%", left: "22%" }, { top: "72%", left: "8%" },
    { top: "42%", left: "44%" }, { top: "30%", left: "60%" }, { top: "55%", left: "68%" },
    { top: "38%", left: "82%" }, { top: "65%", left: "48%" }, { top: "75%", left: "88%" },
    { top: "80%", left: "30%" },
  ];

  return (
    <div className="w-full h-full flex flex-col overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif", backgroundColor: HOME_NAVY }}>
      {/* Nav bar */}
      <div className="pt-7 pb-4 px-6 flex items-center justify-between shrink-0" style={{ backgroundColor: HOME_NAVY }}>
        <button className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: "#475569", borderColor: "#64748B" }}>
          <List size={18} color="white" />
        </button>
        <div className="flex flex-col items-center">
          <span className="text-[11px]" style={{ color: "#88CCFF" }}>Good morning</span>
          <span className="text-[17px] font-medium" style={{ color: "#F8FAFC" }}>Gregory Leeland</span>
        </div>
        <div className="relative">
          <button className="w-10 h-10 rounded-full flex items-center justify-center border" style={{ backgroundColor: "#475569", borderColor: "#64748B" }}>
            <Bell size={18} color="white" />
          </button>
          <div className="absolute top-0.5 right-0.5 w-[7px] h-[7px] rounded-full" style={{ backgroundColor: "#F87171" }} />
        </div>
      </div>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-6 pt-4 pb-28 flex flex-col gap-3" style={{ backgroundColor: "#F8FAFC" }}>

        {/* Card A: Home objects */}
        <div className="bg-white rounded-xl border p-4 flex flex-col shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          {/* My notes row */}
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#D7EBFF" }}>
              <Note size={14} weight="bold" style={{ color: "#2563eb" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-tight" style={{ fontWeight: 475, color: "#020617" }}>My notes</p>
              <p className="text-[11px]" style={{ color: "#64748B" }}>None created today</p>
            </div>
            <CaretRight size={15} style={{ color: "#CBD5E1" }} />
          </div>
          <div className="my-2 h-px" style={{ backgroundColor: "#E2E8F0" }} />
          {/* My tasks row */}
          <div className="flex items-center gap-3 py-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#D7EBFF" }}>
              <CheckSquare size={14} weight="bold" style={{ color: "#2563eb" }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] leading-tight" style={{ fontWeight: 475, color: "#020617" }}>My tasks</p>
              <p className="text-[11px]" style={{ color: "#64748B" }}>7 due today</p>
            </div>
            <CaretRight size={15} style={{ color: "#CBD5E1" }} />
          </div>
        </div>

        {/* Card B: Map */}
        <button className="text-left rounded-xl overflow-hidden relative w-full" onClick={onNavigateToMap} style={{ minHeight: 160 }}>
          {/* Map fills entire card */}
          <div className="absolute inset-0" style={{ backgroundColor: "#E8E0C8" }}>
            {/* Parks */}
            <div className="absolute" style={{ left: "2%", top: "5%", width: "18%", height: "28%", backgroundColor: "#BDD98A", borderRadius: 4 }} />
            <div className="absolute" style={{ left: "2%", top: "36%", width: "14%", height: "20%", backgroundColor: "#BDD98A", borderRadius: 4 }} />
            <div className="absolute" style={{ left: "55%", top: "60%", width: "22%", height: "32%", backgroundColor: "#BDD98A", borderRadius: 4 }} />
            <div className="absolute" style={{ left: "78%", top: "68%", width: "22%", height: "30%", backgroundColor: "#BDD98A", borderRadius: 4 }} />
            {/* Water */}
            <div className="absolute rounded-lg" style={{ left: "68%", top: "4%", width: "14%", height: "16%", backgroundColor: "#A8D4F0" }} />
            {/* Major vertical highway (amber) */}
            <div className="absolute" style={{ left: "36%", top: 0, width: 10, height: "100%", backgroundColor: "#E8A820" }} />
            <div className="absolute" style={{ left: "39%", top: 0, width: 2, height: "100%", backgroundColor: "rgba(255,255,220,0.6)" }} />
            {/* Major horizontal roads */}
            <div className="absolute" style={{ left: 0, top: "30%", width: "100%", height: 7, backgroundColor: "#F5F2E8" }} />
            <div className="absolute" style={{ left: 0, top: "62%", width: "100%", height: 7, backgroundColor: "#F5F2E8" }} />
            {/* Minor horizontal roads */}
            {[15, 46, 78, 92].map((pct) => (
              <div key={pct} className="absolute" style={{ left: 0, top: `${pct}%`, width: "100%", height: 3, backgroundColor: "#F5F2E8", opacity: 0.8 }} />
            ))}
            {/* Vertical roads */}
            <div className="absolute" style={{ left: "18%", top: 0, width: 6, height: "100%", backgroundColor: "#F5F2E8" }} />
            <div className="absolute" style={{ left: "56%", top: 0, width: 6, height: "100%", backgroundColor: "#F5F2E8" }} />
            <div className="absolute" style={{ left: "76%", top: 0, width: 6, height: "100%", backgroundColor: "#F5F2E8" }} />
            {[8, 28, 46, 65, 88].map((pct) => (
              <div key={pct} className="absolute" style={{ left: `${pct}%`, top: 0, width: 3, height: "100%", backgroundColor: "#F5F2E8", opacity: 0.7 }} />
            ))}
            {/* City label */}
            <div className="absolute" style={{ left: "42%", top: "44%", transform: "translateX(-50%)" }}>
              <p className="text-[11px] font-semibold whitespace-nowrap" style={{ color: "#555043", letterSpacing: "0.02em" }}>Salt Lake City</p>
            </div>
            {/* Street labels */}
            <div className="absolute" style={{ left: "59%", top: "12%", transform: "translateX(-50%)" }}>
              <p className="text-[8px] whitespace-nowrap" style={{ color: "#888070" }}>Temple Square</p>
            </div>
            <div className="absolute" style={{ left: "78%", top: "35%", transform: "translateX(-50%)" }}>
              <p className="text-[7px] whitespace-nowrap" style={{ color: "#888070" }}>Hogle Zoo</p>
            </div>
            {/* Freeway badge */}
            <div className="absolute flex items-center justify-center rounded-sm" style={{ left: "32%", top: "54%", width: 18, height: 14, backgroundColor: "#3A7BD5" }}>
              <p className="text-[7px] font-bold text-white leading-none">215</p>
            </div>
            <div className="absolute flex items-center justify-center rounded-sm" style={{ left: "48%", top: "80%", width: 16, height: 14, backgroundColor: "#3A7BD5" }}>
              <p className="text-[7px] font-bold text-white leading-none">89</p>
            </div>
            {/* Company pins */}
            {MAP_PINS.map((pin, i) => (
              <div key={i} className="absolute flex flex-col items-center" style={{ top: pin.top, left: pin.left, transform: "translate(-50%, -100%)" }}>
                <div className="rounded-full flex items-center justify-center" style={{ width: 20, height: 20, backgroundColor: "#0564FF", boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>
                  <Buildings size={10} color="white" weight="fill" />
                </div>
                <div className="w-0 h-0" style={{ borderLeft: "4px solid transparent", borderRight: "4px solid transparent", borderTop: "5px solid #0564FF" }} />
              </div>
            ))}
          </div>
          {/* Dark overlay header */}
          <div className="relative z-10 flex items-center justify-between px-4 pt-3 pb-2" style={{ backgroundColor: HOME_NAVY }}>
            <p className="text-[13px] font-semibold" style={{ color: "#F8FAFC" }}>10 companies nearby</p>
            <div className="flex items-center gap-1">
              <MapPin size={11} style={{ color: "#B8DFFF" }} />
              <p className="text-[11px]" style={{ color: "#B8DFFF" }}>Within 5 mi</p>
            </div>
          </div>
          {/* Spacer to push card to full height */}
          <div style={{ height: 120 }} />
        </button>

        {/* Card C: Saved accounts */}
        <div className="bg-white rounded-xl border p-4 flex flex-col shadow-sm" style={{ borderColor: "#E2E8F0" }}>
          <p className="text-[13px] mb-3" style={{ color: "#64748B" }}>Saved accounts</p>
          {COMPANIES.map((company, i) => (
            <div key={company}>
              <button className="w-full flex items-center gap-3 py-2.5" onClick={() => onSelectCompany(company)}>
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center" style={{ backgroundColor: "#D7EBFF" }}>
                  <Buildings size={15} weight="fill" style={{ color: "#0564FF" }} />
                </div>
                <p className="flex-1 text-left text-[13px]" style={{ fontWeight: 475, color: "#020617" }}>{company}</p>
                <CaretRight size={15} style={{ color: "#CBD5E1" }} />
              </button>
              {i < COMPANIES.length - 1 && <div className="h-px" style={{ backgroundColor: "#E2E8F0" }} />}
            </div>
          ))}
          <div className="h-px mb-1" style={{ backgroundColor: "#E2E8F0" }} />
          <button className="w-full flex items-center gap-3 py-2.5">
            <p className="flex-1 text-left text-[13px]" style={{ fontWeight: 475, color: "#020617" }}>See all (32 more)</p>
            <CaretRight size={15} style={{ color: "#CBD5E1" }} />
          </button>
        </div>

        {/* Bottom spacer for tab bar */}
        <div className="h-16" />
      </div>

      {/* Bottom pill tab bar */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center pointer-events-none">
        <div className="flex items-center gap-1 px-4 py-1 rounded-full pointer-events-auto" style={{ backgroundColor: HOME_NAVY }}>
          <button className="flex flex-col items-center gap-0.5 px-4 py-2">
            <House size={16} color="white" weight="fill" />
            <span className="text-[9px]" style={{ color: "#F8FAFC" }}>Home</span>
          </button>
          <button className="w-14 h-10 rounded-full flex items-center justify-center mx-1" onClick={onOpenPlusMenu} style={{ backgroundColor: "#EDF7FF" }}>
            <span className="text-[20px] leading-none" style={{ color: HOME_NAVY }}>+</span>
          </button>
          <button className="flex flex-col items-center gap-0.5 px-4 py-2">
            <MagnifyingGlass size={16} style={{ color: "#94A3B8" }} />
            <span className="text-[9px]" style={{ color: "#94A3B8" }}>Find</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Map screen ─────────────────────────────────────────────────────────────────

const MAP_CANVAS_PINS = [
  { x: 220, y: 320 }, { x: 390, y: 510 }, { x: 210, y: 530 },
  { x: 410, y: 400 }, { x: 460, y: 290 }, { x: 240, y: 460 },
  { x: 260, y: 390 }, { x: 130, y: 380 }, { x: 430, y: 610 },
  { x: 200, y: 440 },
];

function MapPin2({ x, y }: { x: number; y: number }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: x, top: y, transform: "translate(-50%, -100%)" }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: "#0564FF" }}>
        <Buildings size={13} color="white" weight="fill" />
      </div>
      <div className="w-0 h-0" style={{ borderLeft: "5px solid transparent", borderRight: "5px solid transparent", borderTop: "6px solid #0564FF" }} />
    </div>
  );
}

const AI_STOPS = [
  { name: "Northgate Industrial Supply", address: "1240 Commerce Dr", city: "Salt Lake City, UT 84116", tag: "High intent", tagColor: "#0564FF", score: "98% match" },
  { name: "Apex Mechanical Services", address: "877 Lakeview Blvd", city: "West Valley City, UT 84119", tag: "New in area", tagColor: "#16A34A", score: "91% match" },
  { name: "Summit Building Group", address: "3310 W Grand Ave", city: "Ogden, UT 84401", tag: "Past customer", tagColor: "#7C3AED", score: "88% match" },
  { name: "Redwood Contractors LLC", address: "502 Birch St", city: "Provo, UT 84601", tag: "High intent", tagColor: "#0564FF", score: "84% match" },
  { name: "Lakeside Property Mgmt", address: "19 Harbor Cir", city: "North Salt Lake, UT 84054", tag: "Competitor user", tagColor: "#D97706", score: "79% match" },
];

function AiStopsSheet({ open, onClose, onSelectStop }: { open: boolean; onClose: () => void; onSelectStop: (stop: typeof AI_STOPS[number]) => void }) {
  const [openKey, setOpenKey] = useState(0);
  const prevOpen = useRef(false);
  useEffect(() => {
    if (open && !prevOpen.current) setOpenKey(k => k + 1);
    prevOpen.current = open;
  }, [open]);

  return (
    <div className="absolute inset-0 z-40" style={{ pointerEvents: open ? "auto" : "none" }}>
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0,0,0,0.35)", opacity: open ? 1 : 0 }}
        onClick={onClose}
      />
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl transition-transform duration-300 flex flex-col"
        style={{ backgroundColor: "white", transform: open ? "translateY(0)" : "translateY(100%)", maxHeight: "72%" }}
      >
        {/* Handle */}
        <div className="pt-3 pb-2 flex justify-center shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ backgroundColor: "#E2E8F0" }} />
        </div>
        {/* Header */}
        <div className="px-5 pb-3 shrink-0 flex items-center gap-2">
          <Sparkle size={16} weight="fill" style={{ color: "#0564FF" }} />
          <p className="text-[15px] font-semibold text-gray-900">AI Recommended Stops</p>
        </div>
        <p className="px-5 text-[12px] text-gray-400 shrink-0 -mt-1 pb-3">Based on your location, route, and account history</p>
        {/* Cards */}
        <div key={openKey} className="overflow-y-auto px-4 pb-6 flex flex-col gap-3">
          {AI_STOPS.map((stop, i) => (
            <button
              key={i}
              className="rounded-xl border p-4 flex items-center gap-3 w-full text-left"
              style={{
                borderColor: "#E2E8F0",
                animation: open ? `stopCardIn 0.4s cubic-bezier(0.22, 1, 0.36, 1) both` : undefined,
                animationDelay: open ? `${0.08 + i * 0.07}s` : undefined,
                opacity: open ? undefined : 0,
              }}
              onClick={() => onSelectStop(stop)}
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#EEF4FF" }}>
                <Buildings size={18} style={{ color: "#0564FF" }} weight="fill" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold text-gray-900 truncate">{stop.name}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">{stop.address}</p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: stop.tagColor + "18", color: stop.tagColor }}>{stop.tag}</span>
                  <span className="text-[10px] text-gray-400">{stop.score}</span>
                </div>
              </div>
              <button className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: "#F1F5F9" }}>
                <MapPin size={14} className="text-gray-500" />
              </button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function MapScreen({ onBack }: { onBack: () => void }) {
  const [offset, setOffset] = useState({ x: -30, y: -60 });
  const [showAiSheet, setShowAiSheet] = useState(false);
  const [selectedStop, setSelectedStop] = useState<typeof AI_STOPS[number] | null>(null);
  const dragRef = useRef<{ startX: number; startY: number; originX: number; originY: number } | null>(null);

  function handlePointerDown(e: React.PointerEvent) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = { startX: e.clientX, startY: e.clientY, originX: offset.x, originY: offset.y };
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setOffset({
      x: Math.min(0, Math.max(-450, dragRef.current.originX + dx)),
      y: Math.min(0, Math.max(-400, dragRef.current.originY + dy)),
    });
  }

  function handlePointerUp() {
    dragRef.current = null;
  }

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Map canvas */}
      <div
        className="absolute inset-0 overflow-hidden select-none"
        style={{ cursor: "grab", touchAction: "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        {/* Large draggable canvas */}
        <div className="absolute" style={{ width: 850, height: 950, transform: `translate(${offset.x}px, ${offset.y}px)`, backgroundColor: "#EDE9D8" }}>
          {/* Park areas */}
          <div className="absolute rounded-lg" style={{ left: 60, top: 80, width: 120, height: 90, backgroundColor: "#C8DFA8" }} />
          <div className="absolute rounded-lg" style={{ left: 500, top: 500, width: 180, height: 140, backgroundColor: "#C8DFA8" }} />
          <div className="absolute rounded" style={{ left: 300, top: 700, width: 80, height: 60, backgroundColor: "#C8DFA8" }} />
          {/* Water */}
          <div className="absolute rounded-lg" style={{ left: 620, top: 100, width: 60, height: 40, backgroundColor: "#BDDDF4" }} />
          {/* Major road - vertical highway (amber) */}
          <div className="absolute" style={{ left: 340, top: 0, width: 18, height: 950, backgroundColor: "#F5A623", opacity: 0.85 }} />
          <div className="absolute" style={{ left: 341, top: 0, width: 2, height: 950, backgroundColor: "#FFF8E7", opacity: 0.5 }} />
          {/* Horizontal roads */}
          {[120, 220, 320, 430, 560, 680, 800].map((y) => (
            <div key={y} className="absolute" style={{ left: 0, top: y, width: 850, height: 6, backgroundColor: "#FAFAF7" }} />
          ))}
          {/* Vertical roads */}
          {[100, 200, 290, 420, 520, 640, 750].map((x) => (
            <div key={x} className="absolute" style={{ left: x, top: 0, width: 6, height: 950, backgroundColor: "#FAFAF7" }} />
          ))}
          {/* Minor roads */}
          {[160, 270, 380, 490, 620, 730].map((y) => (
            <div key={y} className="absolute" style={{ left: 0, top: y, width: 850, height: 3, backgroundColor: "#FAFAF7", opacity: 0.6 }} />
          ))}
          {/* Pins */}
          {MAP_CANVAS_PINS.map((pin, i) => (
            <MapPin2 key={i} x={pin.x} y={pin.y} />
          ))}
        </div>
      </div>

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 z-10 pt-8 pb-3 px-4 flex items-center gap-3" style={{ background: "linear-gradient(to bottom, rgba(255,255,255,1) 70%, rgba(255,255,255,0))" }}>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: "#F1F5F9" }}
          onClick={onBack}
        >
          <CaretLeft size={18} weight="bold" className="text-gray-700" />
        </button>
        <div className="flex-1 flex items-center gap-2 px-4 h-10 rounded-full shadow-sm" style={{ backgroundColor: "white", border: "1px solid #E2E8F0" }}>
          <MagnifyingGlass size={15} className="text-gray-400 shrink-0" />
          <span className="text-sm text-gray-400">Search places</span>
        </div>
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm"
          style={{ backgroundColor: "white", border: "1px solid #E2E8F0" }}
        >
          <SlidersHorizontal size={16} className="text-gray-600" />
        </button>
      </div>

      {/* Floating icon buttons - horizontal row above bottom sheet */}
      <div className="absolute z-10 flex flex-row gap-2" style={{ left: 12, bottom: 112 }}>
        {[
          { Icon: Stack, onClick: undefined },
          { Icon: CarProfile, onClick: undefined },
          { Icon: NavigationArrow, onClick: undefined },
        ].map(({ Icon, onClick }, i) => (
          <button key={i} onClick={onClick} className="w-10 h-10 rounded-full flex items-center justify-center shadow-md" style={{ backgroundColor: "white" }}>
            <Icon size={18} className="text-gray-600" />
          </button>
        ))}
        <button
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-md"
          style={{ backgroundColor: showAiSheet ? "#0564FF" : "white" }}
          onClick={() => setShowAiSheet(true)}
        >
          <Sparkle
            size={18}
            weight={showAiSheet ? "fill" : "fill"}
            style={{
              color: showAiSheet ? "white" : "#6366f1",
              animation: showAiSheet ? undefined : "aiShimmer 3s ease-in-out infinite",
            }}
          />
        </button>
      </div>

      {/* Bottom peek sheet */}
      <div className="absolute bottom-0 left-0 right-0 z-10 rounded-t-2xl px-6 pt-3 pb-5" style={{ backgroundColor: "white", boxShadow: "0 -2px 12px rgba(0,0,0,0.08)" }}>
        <div className="w-10 h-1 rounded-full mx-auto mb-3" style={{ backgroundColor: "#E2E8F0" }} />
        <p className="text-[15px] font-semibold text-center text-gray-900">10 locations</p>
        <div className="w-[109px] h-1 rounded-full mx-auto mt-4" style={{ backgroundColor: HOME_NAVY }} />
      </div>

      <AiStopsSheet
        open={showAiSheet}
        onClose={() => setShowAiSheet(false)}
        onSelectStop={(stop) => { setShowAiSheet(false); setSelectedStop(stop); }}
      />

      {selectedStop && (
        <div className="absolute inset-0 z-50">
          <CompanyProfileScreen
            company={selectedStop.name}
            address={{ street: selectedStop.address, city: selectedStop.city }}
            onBack={() => setSelectedStop(null)}
          />
        </div>
      )}
    </div>
  );
}

// ── Scan Business Card flow ────────────────────────────────────────────────────

type ScanStep = "camera" | "confirm" | "add-back" | "processing" | "review";

// Real business card photo
function BusinessCardMock({ small }: { small?: boolean }) {
  if (small) {
    return (
      <img
        src="/images/business-card.png"
        alt="Business card"
        className="rounded-lg shadow-md object-cover shrink-0"
        style={{ width: 126, height: 168 }}
      />
    );
  }
  return (
    <img
      src="/images/business-card.png"
      alt="Business card"
      className="object-cover w-full h-full"
    />
  );
}

function ProcessingStep({ onDone }: { onDone: () => void }) {
  const [msgIdx, setMsgIdx] = useState(0);
  const msgs = ["Scanning image...", "Detecting fields...", "Extracting data...", "Building profile..."];

  useEffect(() => {
    const done = setTimeout(onDone, 3600);
    return () => clearTimeout(done);
  }, [onDone]);

  useEffect(() => {
    const iv = setInterval(() => setMsgIdx(m => (m + 1) % msgs.length), 900);
    return () => clearInterval(iv);
  }, []);

  const detected = [
    { Icon: UserCircle, label: "Ben Meadows", sub: "Contact", color: "#4ade80", delay: 0.5 },
    { Icon: Buildings,  label: "Equipment Share", sub: "Company", color: "#60a5fa", delay: 1.1 },
    { Icon: MapPin,     label: "North Salt Lake, UT", sub: "Location", color: "#fb923c", delay: 1.7 },
    { Icon: Phone,      label: "(801) 893-6388", sub: "Phone", color: "#a78bfa", delay: 2.3 },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5">
      {/* Header */}
      <div className="flex flex-col items-center gap-1.5 text-center">
        <Sparkle size={28} color="#60a5fa" weight="fill" style={{ animation: "dotBounce 2s ease-in-out infinite" }} />
        <p className="text-[16px] font-semibold text-gray-900 mt-1">Reading your card</p>
        <p key={msgIdx} className="text-[12px] text-gray-500" style={{ animation: "fadeInUp 0.3s ease both" }}>
          {msgs[msgIdx]}
        </p>
      </div>

      {/* Card with animated glow + scan line */}
      <div
        className="relative rounded-xl overflow-hidden shrink-0"
        style={{ width: 160, height: 213, animation: "glowPulse 2s ease-in-out infinite" }}
      >
        <img src="/images/business-card.png" alt="Business card" className="absolute inset-0 w-full h-full object-cover" />
        {/* Scan line sweeping top → bottom */}
        <div
          className="absolute left-0 right-0 pointer-events-none"
          style={{
            height: 3,
            background: "linear-gradient(90deg, transparent 0%, rgba(96,165,250,0.9) 50%, transparent 100%)",
            animation: "scanLine 2s ease-in-out infinite",
          }}
        />
        {/* Subtle blue tint */}
        <div className="absolute inset-0" style={{ background: "rgba(5,100,255,0.07)" }} />
      </div>

      {/* Detected field chips */}
      <div className="flex flex-col gap-2 w-full">
        {detected.map((d) => (
          <div
            key={d.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl"
            style={{
              backgroundColor: "#F8FAFC",
              border: "1px solid #E2E8F0",
              animation: "fadeInScale 0.4s ease both",
              animationDelay: `${d.delay}s`,
              opacity: 0,
            }}
          >
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${d.color}28` }}
            >
              <d.Icon size={14} color={d.color} weight="fill" />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-[13px] font-medium text-gray-900">{d.label}</span>
              <span className="text-[10px] text-gray-500">{d.sub}</span>
            </div>
            <CheckCircle
              size={14}
              color="#4ade80"
              weight="fill"
              className="ml-auto shrink-0"
              style={{ animation: "fadeInScale 0.3s ease both", animationDelay: `${d.delay + 0.2}s`, opacity: 0 }}
            />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full overflow-hidden" style={{ backgroundColor: "#E2E8F0" }}>
        <div
          className="h-full rounded-full"
          style={{ background: "linear-gradient(90deg, #0564FF, #60a5fa)", animation: "progressFill 3.4s ease-out forwards" }}
        />
      </div>
    </div>
  );
}

function FieldRow({ label, value, highlight, chevron }: { label: string; value: string; highlight?: boolean; chevron?: boolean }) {
  return (
    <div className="flex items-center justify-between h-14 px-3 bg-white rounded-lg border border-gray-200">
      <div className="flex flex-col justify-center">
        <span className="text-[10px] text-gray-400">{label}</span>
        {highlight ? (
          <span className="text-[14px] text-gray-900 font-medium"><span className="bg-amber-100 px-0.5 rounded-sm">{value}</span></span>
        ) : (
          <span className="text-[14px] text-gray-500">{value}</span>
        )}
      </div>
      {chevron && <CaretRight size={16} className="text-gray-300" />}
    </div>
  );
}

function ScanCardFlow({ step, onNext, onFinish, onClose }: {
  step: ScanStep;
  onNext: (s: ScanStep) => void;
  onFinish: () => void;
  onClose: () => void;
}) {
  const isDark = step === "camera" || step === "confirm";
  const isProcessing = step === "processing";
  const sheetBg = "white";
  const handleBg = "#E2E8F0";

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col"
      style={{ backgroundColor: isDark ? "#020617" : "transparent", transition: "background-color 0.4s ease" }}
    >
      {isDark ? (
        // ── Camera / Confirm screens ──
        <>
          {/* Top bar */}
          <div className="flex items-center px-4 pt-8 pb-3 shrink-0">
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center shrink-0">
              <XCircle size={24} color="white" />
            </button>
            <p className="flex-1 text-center text-[13px] font-medium text-white">Scan business card</p>
            <div className="w-10" />
          </div>
          {/* Viewfinder — full bleed photo */}
          <div className="flex-1 overflow-hidden relative">
            <BusinessCardMock />
          </div>
          {/* Bottom bar — key triggers fade when toggling camera↔confirm */}
          <div className="shrink-0 px-6 pt-4 pb-8" style={{ backgroundColor: "#020617" }}>
            <div key={step} style={{ animation: "fadeInUp 0.25s ease both" }}>
              {step === "camera" ? (
                <div className="flex justify-center">
                  <button
                    onClick={() => onNext("confirm")}
                    className="w-16 h-16 rounded-full border-4 border-white flex items-center justify-center"
                    style={{ backgroundColor: "#0564FF" }}
                  >
                    <div className="w-10 h-10 rounded-full bg-white opacity-20" />
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => onNext("camera")}
                    className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                    style={{ backgroundColor: "#F1F5F9" }}
                  >
                    <CaretLeft size={18} className="text-gray-800" weight="bold" />
                  </button>
                  <button
                    onClick={() => onNext("add-back")}
                    className="flex-1 h-12 rounded-full flex items-center justify-center gap-2"
                    style={{ backgroundColor: "#0564FF" }}
                  >
                    <CheckCircle size={18} color="white" weight="fill" />
                    <span className="text-white text-[14px] font-medium">Confirm image</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        // ── Sheet steps: add-back, processing, review ──
        <div className="absolute inset-0 z-50 flex flex-col">
          {/* Dim backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={isProcessing ? undefined : onClose} />
          <div
            className="absolute bottom-0 left-0 right-0 rounded-t-2xl flex flex-col overflow-hidden"
            style={{
              maxHeight: "92%",
              minHeight: "72%",
              backgroundColor: sheetBg,
              transition: "background-color 0.5s ease",
              animation: "slideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) both",
            }}
          >
            {/* Handle */}
            <div
              className="w-10 h-1 rounded-full mx-auto mt-3 shrink-0"
              style={{ backgroundColor: handleBg, transition: "background-color 0.5s ease" }}
            />

            {/* Step content — key triggers fadeInUp on every step change */}
            <div
              key={step}
              className="flex-1 flex flex-col overflow-hidden"
              style={{ animation: "fadeInUp 0.35s ease both" }}
            >
              {step === "add-back" && (
                <>
                  {/* Header */}
                  <div className="flex items-center px-4 pt-4 pb-2 shrink-0">
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
                      <XCircle size={22} className="text-gray-400" />
                    </button>
                    <p className="flex-1 text-center text-[13px] font-medium text-gray-900 -ml-8">Scan business card</p>
                  </div>
                  {/* Body */}
                  <div className="flex-1 overflow-y-auto px-6 pb-4 flex flex-col gap-5">
                    <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height: 196 }}>
                      <div className="relative">
                        <BusinessCardMock small />
                        <button className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center">
                          <XCircle size={14} className="text-gray-500" />
                        </button>
                      </div>
                    </div>
                    <div className="rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center" style={{ height: 196 }}>
                      <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-gray-100">
                        <MagnifyingGlass size={16} className="text-gray-600" />
                        <span className="text-[14px] font-medium text-gray-800">Add back</span>
                      </button>
                    </div>
                  </div>
                  {/* CTA */}
                  <div className="shrink-0 px-6 py-4 border-t border-gray-100">
                    <button
                      onClick={() => onNext("processing")}
                      className="w-full h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#0564FF" }}
                    >
                      <span className="text-white text-[15px] font-medium">Next</span>
                    </button>
                  </div>
                </>
              )}

              {step === "processing" && <ProcessingStep onDone={() => onNext("review")} />}

              {step === "review" && (
                <>
                  {/* Header */}
                  <div className="flex items-center px-4 pt-4 pb-2 shrink-0">
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center shrink-0">
                      <XCircle size={22} className="text-gray-400" />
                    </button>
                    <p className="flex-1 text-center text-[13px] font-medium text-gray-900">New company</p>
                    <button className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: "#0564FF" }}>
                      <CheckCircle size={16} color="white" weight="fill" />
                    </button>
                  </div>
                  {/* Form */}
                  <div className="flex-1 overflow-y-auto px-4 pb-4 flex flex-col gap-3">
                    {/* Territories chip field */}
                    <div className="rounded-lg border border-gray-200 px-3 py-2 bg-white flex items-start justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-gray-400">
                          <Buildings size={14} />
                          <span className="text-[11px]">Territories*</span>
                        </div>
                        <div className="flex items-center gap-1 bg-gray-100 rounded-full px-2 py-0.5">
                          <span className="text-[10px] text-gray-700">South Central, LA</span>
                          <XCircle size={11} className="text-gray-400" />
                        </div>
                      </div>
                      <button className="w-7 h-7 flex items-center justify-center rounded-full border border-gray-200">
                        <span className="text-gray-400 text-lg leading-none">+</span>
                      </button>
                    </div>

                    <FieldRow label="Company name*" value="Equipment Share" highlight />
                    <FieldRow label="Phone number" value="801-893-6388" highlight />

                    <button className="flex items-center gap-1.5 py-1">
                      <span className="text-[13px] font-medium text-blue-600">+ Add alt phone</span>
                    </button>

                    {/* Address section */}
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin size={13} className="text-gray-700" />
                      <span className="text-[10px] font-semibold text-gray-700">Address</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <FieldRow label="Country" value="United States" chevron />
                    <FieldRow label="Address line 1" value="295 S Redwood Rd" highlight />
                    <FieldRow label="Address line 2" value="Address line 2" />
                    <FieldRow label="City" value="North Salt Lake" highlight />
                    <FieldRow label="State" value="UT" chevron />
                    <FieldRow label="Zip/postal code" value="84054" highlight />

                    <button className="flex items-center gap-1 self-start px-3 py-1.5 rounded-full bg-gray-100">
                      <span className="text-[11px] text-gray-700">More</span>
                      <CaretRight size={10} className="text-gray-500" />
                    </button>

                    {/* Contacts section */}
                    <div className="flex items-center gap-2 mt-1">
                      <UserCircle size={13} className="text-gray-700" />
                      <span className="text-[10px] font-semibold text-gray-700">Contacts</span>
                      <div className="flex-1 h-px bg-gray-200" />
                    </div>

                    <button className="flex items-center gap-1.5 py-1">
                      <span className="text-[13px] font-medium text-blue-600">+ Contact</span>
                    </button>

                    {[
                      { name: "Ben Meadows", role: "District Sales Manager" },
                      { name: "Dale Doback", role: "Co-Owner/Head of Marketing" },
                    ].map((c) => (
                      <div key={c.name} className="flex items-center gap-3 py-2 border-b border-gray-100">
                        <div className="flex-1">
                          <p className="text-[14px] font-medium text-gray-900">{c.name}</p>
                          <p className="text-[11px] text-gray-400">{c.role}</p>
                        </div>
                        <button><XCircle size={22} className="text-gray-300" /></button>
                      </div>
                    ))}
                  </div>

                  {/* Save CTA */}
                  <div className="shrink-0 px-6 py-4 border-t border-gray-100">
                    <button
                      onClick={onFinish}
                      className="w-full h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: "#0564FF" }}
                    >
                      <span className="text-white text-[15px] font-medium">Save company</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Plus menu sheet ─────────────────────────────────────────────────────────────

const PLUS_MENU_ITEMS = [
  { label: "Create a note", Icon: Note },
  { label: "Create a company", Icon: Buildings },
  { label: "Create a task", Icon: CheckSquare },
  { label: "Create a contact", Icon: UserCircle },
  { label: "Scan Business Card", Icon: IdentificationCard },
];

function PlusMenuSheet({ open, onClose, onScanCard }: { open: boolean; onClose: () => void; onScanCard: () => void }) {
  return (
    <div
      className="absolute inset-0 z-40"
      style={{ pointerEvents: open ? "auto" : "none" }}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{ backgroundColor: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0 }}
        onClick={onClose}
      />
      {/* Sheet */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-t-2xl transition-transform duration-300"
        style={{ backgroundColor: "white", transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        {/* Grab bar */}
        <div className="w-10 h-1 rounded-full mx-auto mt-3" style={{ backgroundColor: "#E2E8F0" }} />
        {/* Header */}
        <div className="flex items-center px-6 pt-5 pb-2">
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center">
            <XCircle size={22} className="text-gray-400" />
          </button>
          <span className="flex-1 text-center text-[13px] font-medium text-gray-900 -ml-8">Main actions</span>
        </div>
        {/* Items */}
        <div className="px-6 pt-6 pb-24 flex flex-col gap-8">
          {PLUS_MENU_ITEMS.map(({ label, Icon }) => (
            <button key={label} className="flex items-center gap-3" onClick={label === "Scan Business Card" ? onScanCard : undefined}>
              <Icon size={26} className="text-gray-900 shrink-0" />
              <span className="text-[15px] text-gray-900">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function Future() {
  const [view, setView] = useState<View>("home");
  const [selectedCompany, setSelectedCompany] = useState<string>("");
  const [showPlusMenu, setShowPlusMenu] = useState(false);
  const [scanStep, setScanStep] = useState<ScanStep | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  function handleSelectCompany(name: string) {
    setSelectedCompany(name);
    setView("company");
  }

  function handleScanFinish() {
    setScanStep(null);
    setView("home");
    setShowSuccessToast(true);
    setTimeout(() => setShowSuccessToast(false), 3000);
  }

  return (
    <div className="w-full h-full relative overflow-hidden" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
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
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes scanLine {
          0%   { top: 0%; opacity: 0; }
          5%   { opacity: 1; }
          90%  { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 2px #0564FF, 0 0 18px 5px rgba(5,100,255,0.35); }
          50%       { box-shadow: 0 0 0 2px #60a5fa, 0 0 30px 10px rgba(96,165,250,0.5); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.88) translateY(5px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes progressFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes aiShimmer {
          0%   { filter: hue-rotate(0deg) brightness(1); }
          25%  { filter: hue-rotate(60deg) brightness(1.2); }
          50%  { filter: hue-rotate(200deg) brightness(1.15); }
          75%  { filter: hue-rotate(300deg) brightness(1.1); }
          100% { filter: hue-rotate(360deg) brightness(1); }
        }
        @keyframes stopCardIn {
          from { opacity: 0; transform: translateY(14px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      {view === "home" && (
        <HomeScreen
          onSelectCompany={handleSelectCompany}
          onNavigateToMap={() => setView("map")}
          onOpenPlusMenu={() => setShowPlusMenu(true)}
        />
      )}
      {view === "company" && (
        <CompanyProfileScreen
          company={selectedCompany}
          onBack={() => setView("home")}
        />
      )}
      {view === "map" && <MapScreen onBack={() => setView("home")} />}

      <PlusMenuSheet
        open={showPlusMenu}
        onClose={() => setShowPlusMenu(false)}
        onScanCard={() => { setShowPlusMenu(false); setScanStep("camera"); }}
      />

      {scanStep && (
        <ScanCardFlow
          step={scanStep}
          onNext={setScanStep}
          onFinish={handleScanFinish}
          onClose={() => setScanStep(null)}
        />
      )}

      {showSuccessToast && (
        <div
          className="absolute left-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg"
          style={{ bottom: "6rem", backgroundColor: "#1e293b" }}
        >
          <CheckCircle size={18} color="#4ade80" weight="fill" />
          <p className="text-[13px] text-white flex-1">Equipment Share saved successfully</p>
        </div>
      )}
    </div>
  );
}
