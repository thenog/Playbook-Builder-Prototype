"use client";

import { useState, useRef, useEffect, useCallback, ElementType } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  MagnifyingGlass,
  CaretDown,
  CaretUp,
  CaretRight,
  CaretLeft,
  ArrowLeft,
  X,
  Microphone,
  SquaresFour,
  Buildings,
  Note,
  Play,
  CheckSquare,
  CurrencyDollar,
  ChartBar,
  Tag,
  MapPin,
  TrendDown,
  CalendarBlank,
  Package,
  RocketLaunch,
  ChatCircle,
  ShieldCheck,
  MapTrifold,
  ArrowCounterClockwise,
  Desktop,
  DeviceMobile,
  Lightning,
  Star,
  Gear,
  Globe,
  Users,
  Briefcase,
  Cube,
  PencilSimple,
  Trash,
  DotsThree,
  FloppyDisk,
  NotePencil,
  ClockCounterClockwise,
} from "@phosphor-icons/react";

// ─── Types ────────────────────────────────────────────────────────────────────

type PrototypeType = "desktop" | "mobile";

interface Prototype {
  id: string;
  name: string;
  type: PrototypeType;
  Icon: ElementType;
  iconName: string;
  slug: string;
  filePath: string;
}

type Stage = "goal" | "accounts" | "cadence" | "message" | "label" | "launch";
type ComponentType =
  | "accountMatching"
  | "nudgeCadence"
  | "messageComposer"
  | "labelConfigurator"
  | "launchSummary";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
  component?: ComponentType;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const ACCOUNTS = [
  { name: "Central States Trucking", rep: "J. Harmon", days: 47, trend: -22 },
  { name: "Midwest Fleet & Tire Co.", rep: "J. Harmon", days: 18, trend: -14 },
  { name: "Trans-Iowa Carriers", rep: "S. Briggs", days: 39, trend: -31 },
  { name: "Hawkeye Equipment Rental", rep: "S. Briggs", days: 31, trend: -8 },
  { name: "I-80 Fleet Services", rep: "T. Nguyen", days: 22, trend: 4 },
];

const CADENCE_STEPS = [
  { day: 1, title: "Rep notification", description: "Reps notified via in-app message and broadcaster" },
  { day: 7, title: "Manager check-in", description: "Digest of unvisited accounts sent to manager" },
  { day: 14, title: "Escalation", description: "Unvisited accounts flagged for manager review" },
  { day: 30, title: "Performance report", description: "Auto-generated play summary with revenue vs. baseline" },
];

const MESSAGES = {
  Direct: "18 accounts flagged for immediate attention. These are down in revenue and overdue for a visit. Check your map and prioritize these stops this week.",
  Motivational: "Big opportunity this month — 18 accounts are ready for re-engagement. Your visits this week could directly protect and grow this revenue. Let's go get it.",
  Informational: "A new retention play has been launched. 18 accounts in your territory have been identified as at-risk based on revenue trend and visit recency. Please review and schedule visits accordingly.",
};

const ALL_SUGGESTIONS = [
  { label: "Accounts down in revenue", sub: "Re-engage declining customers", bg: "bg-red-50", Icon: TrendDown, color: "text-red-500" },
  { label: "Rarely visited prospects", sub: "Target neglected opportunities", bg: "bg-orange-50", Icon: CalendarBlank, color: "text-orange-500" },
  { label: "Push a product line", sub: "Promote specific products", bg: "bg-green-50", Icon: Package, color: "text-green-600" },
  { label: "Re-engage quiet accounts", sub: "Accounts with no contact in 60+ days", bg: "bg-purple-50", Icon: ChatCircle, color: "text-purple-500" },
  { label: "Protect top revenue accounts", sub: "High-value accounts showing risk signals", bg: "bg-blue-50", Icon: ShieldCheck, color: "text-blue-500" },
  { label: "Grow a new territory", sub: "Prospect accounts with no prior visits", bg: "bg-teal-50", Icon: MapTrifold, color: "text-teal-600" },
  { label: "Drive seasonal promotions", sub: "Push time-sensitive product offers", bg: "bg-yellow-50", Icon: Tag, color: "text-yellow-600" },
  { label: "Recover churned accounts", sub: "Bring back lapsed customers", bg: "bg-rose-50", Icon: ArrowCounterClockwise, color: "text-rose-500" },
];

type AccountRow = { name: string; rep: string; days: number; trend: number };

const SUGGESTION_ACCOUNTS: Record<string, AccountRow[]> = {
  "Accounts down in revenue": [
    { name: "Central States Trucking", rep: "J. Harmon", days: 47, trend: -22 },
    { name: "Midwest Fleet & Tire Co.", rep: "J. Harmon", days: 18, trend: -14 },
    { name: "Trans-Iowa Carriers", rep: "S. Briggs", days: 39, trend: -31 },
    { name: "Hawkeye Equipment Rental", rep: "S. Briggs", days: 31, trend: -8 },
    { name: "I-80 Fleet Services", rep: "T. Nguyen", days: 22, trend: -11 },
    { name: "Great Plains Logistics", rep: "J. Harmon", days: 55, trend: -19 },
    { name: "Cornbelt Carriers", rep: "T. Nguyen", days: 28, trend: -6 },
    { name: "Heartland Freight", rep: "S. Briggs", days: 44, trend: -27 },
    { name: "River Road Transport", rep: "J. Harmon", days: 33, trend: -13 },
    { name: "Prairie State Hauling", rep: "T. Nguyen", days: 61, trend: -34 },
    { name: "Quad Cities Fleet", rep: "S. Briggs", days: 19, trend: -9 },
    { name: "Metro Tire & Auto", rep: "J. Harmon", days: 41, trend: -16 },
  ],
  "Rarely visited prospects": [
    { name: "Bluegrass Equipment Co.", rep: "S. Briggs", days: 91, trend: 3 },
    { name: "Sunset Valley Logistics", rep: "T. Nguyen", days: 84, trend: -2 },
    { name: "North Plains Trucking", rep: "J. Harmon", days: 77, trend: 1 },
    { name: "Lakeshore Fleet Mgmt", rep: "S. Briggs", days: 112, trend: -5 },
    { name: "Ridgeline Transport", rep: "T. Nguyen", days: 68, trend: 0 },
    { name: "Eastern Gateway Freight", rep: "J. Harmon", days: 95, trend: -1 },
    { name: "Silver Creek Carriers", rep: "S. Briggs", days: 103, trend: 4 },
    { name: "Ozark Hauling Co.", rep: "T. Nguyen", days: 88, trend: -3 },
    { name: "Timberline Fleet", rep: "J. Harmon", days: 72, trend: 2 },
    { name: "Flatlands Transport", rep: "S. Briggs", days: 119, trend: -7 },
    { name: "Highbridge Logistics", rep: "T. Nguyen", days: 66, trend: 6 },
    { name: "Crestview Auto & Tire", rep: "J. Harmon", days: 81, trend: -4 },
  ],
  "Push a product line": [
    { name: "Central States Trucking", rep: "J. Harmon", days: 12, trend: 8 },
    { name: "Midwest Fleet & Tire Co.", rep: "J. Harmon", days: 5, trend: 14 },
    { name: "Hawkeye Equipment Rental", rep: "S. Briggs", days: 9, trend: 5 },
    { name: "I-80 Fleet Services", rep: "T. Nguyen", days: 3, trend: 11 },
    { name: "Great Plains Logistics", rep: "J. Harmon", days: 21, trend: 7 },
    { name: "Cornbelt Carriers", rep: "T. Nguyen", days: 14, trend: 3 },
    { name: "River Road Transport", rep: "J. Harmon", days: 7, trend: 19 },
    { name: "Quad Cities Fleet", rep: "S. Briggs", days: 18, trend: 9 },
    { name: "Metro Tire & Auto", rep: "J. Harmon", days: 6, trend: 12 },
    { name: "North Plains Trucking", rep: "S. Briggs", days: 25, trend: 4 },
    { name: "Lakeshore Fleet Mgmt", rep: "T. Nguyen", days: 11, trend: 16 },
  ],
  "Re-engage quiet accounts": [
    { name: "Blue Ridge Freight", rep: "J. Harmon", days: 68, trend: -3 },
    { name: "Pinecrest Carriers", rep: "S. Briggs", days: 74, trend: -8 },
    { name: "Dune Coast Logistics", rep: "T. Nguyen", days: 61, trend: -1 },
    { name: "Valley View Transport", rep: "J. Harmon", days: 82, trend: -12 },
    { name: "Iron Range Hauling", rep: "S. Briggs", days: 71, trend: -5 },
    { name: "Lakewood Fleet Co.", rep: "T. Nguyen", days: 65, trend: -9 },
    { name: "Maple Leaf Carriers", rep: "J. Harmon", days: 78, trend: -2 },
    { name: "Riverbend Logistics", rep: "S. Briggs", days: 90, trend: -15 },
    { name: "Summit Freight Inc.", rep: "T. Nguyen", days: 63, trend: -6 },
    { name: "Westgate Auto Parts", rep: "J. Harmon", days: 86, trend: -18 },
    { name: "Prairie Wind Carriers", rep: "S. Briggs", days: 69, trend: -4 },
    { name: "Crossroads Tire & Fleet", rep: "T. Nguyen", days: 77, trend: -10 },
    { name: "Hillside Equipment", rep: "J. Harmon", days: 73, trend: -7 },
  ],
  "Protect top revenue accounts": [
    { name: "Midwest Fleet & Tire Co.", rep: "J. Harmon", days: 8, trend: -4 },
    { name: "Central States Trucking", rep: "J. Harmon", days: 15, trend: -7 },
    { name: "Great Plains Logistics", rep: "S. Briggs", days: 11, trend: -11 },
    { name: "Trans-Iowa Carriers", rep: "T. Nguyen", days: 22, trend: -6 },
    { name: "I-80 Fleet Services", rep: "J. Harmon", days: 6, trend: -3 },
    { name: "Heartland Freight", rep: "S. Briggs", days: 19, trend: -14 },
    { name: "Cornbelt Carriers", rep: "T. Nguyen", days: 13, trend: -9 },
    { name: "River Road Transport", rep: "J. Harmon", days: 25, trend: -5 },
    { name: "Quad Cities Fleet", rep: "S. Briggs", days: 9, trend: -8 },
    { name: "Prairie State Hauling", rep: "T. Nguyen", days: 17, trend: -12 },
  ],
  "Grow a new territory": [
    { name: "Clearwater Freight", rep: "T. Nguyen", days: 0, trend: 0 },
    { name: "Cascade Logistics", rep: "S. Briggs", days: 0, trend: 0 },
    { name: "Bluebell Carriers", rep: "J. Harmon", days: 0, trend: 0 },
    { name: "Northern Star Transport", rep: "T. Nguyen", days: 0, trend: 0 },
    { name: "Redwood Fleet Co.", rep: "S. Briggs", days: 0, trend: 0 },
    { name: "Sunrise Hauling", rep: "J. Harmon", days: 0, trend: 0 },
    { name: "Granite Peak Logistics", rep: "T. Nguyen", days: 0, trend: 0 },
    { name: "Lakefront Carriers", rep: "S. Briggs", days: 0, trend: 0 },
    { name: "Mesa Verde Transport", rep: "J. Harmon", days: 0, trend: 0 },
    { name: "Tundra Freight Inc.", rep: "T. Nguyen", days: 0, trend: 0 },
    { name: "Bayside Fleet Mgmt", rep: "S. Briggs", days: 0, trend: 0 },
    { name: "Frontier Tire & Auto", rep: "J. Harmon", days: 0, trend: 0 },
  ],
  "Drive seasonal promotions": [
    { name: "Central States Trucking", rep: "J. Harmon", days: 10, trend: 5 },
    { name: "Hawkeye Equipment Rental", rep: "S. Briggs", days: 7, trend: 8 },
    { name: "I-80 Fleet Services", rep: "T. Nguyen", days: 14, trend: 3 },
    { name: "Metro Tire & Auto", rep: "J. Harmon", days: 4, trend: 11 },
    { name: "Cornbelt Carriers", rep: "T. Nguyen", days: 21, trend: 6 },
    { name: "River Road Transport", rep: "J. Harmon", days: 9, trend: 4 },
    { name: "Quad Cities Fleet", rep: "S. Briggs", days: 16, trend: 9 },
    { name: "Midwest Fleet & Tire Co.", rep: "J. Harmon", days: 5, trend: 13 },
    { name: "Great Plains Logistics", rep: "S. Briggs", days: 18, trend: 7 },
    { name: "Prairie State Hauling", rep: "T. Nguyen", days: 12, trend: 5 },
    { name: "North Plains Trucking", rep: "J. Harmon", days: 23, trend: 2 },
  ],
  "Recover churned accounts": [
    { name: "Stonegate Carriers", rep: "S. Briggs", days: 180, trend: -38 },
    { name: "Vanguard Freight", rep: "T. Nguyen", days: 155, trend: -42 },
    { name: "Keystone Logistics", rep: "J. Harmon", days: 210, trend: -29 },
    { name: "Ironwood Transport", rep: "S. Briggs", days: 165, trend: -51 },
    { name: "Copperhead Carriers", rep: "T. Nguyen", days: 190, trend: -35 },
    { name: "Goldfield Fleet Co.", rep: "J. Harmon", days: 175, trend: -44 },
    { name: "Silverton Hauling", rep: "S. Briggs", days: 145, trend: -27 },
    { name: "Bronzewick Logistics", rep: "T. Nguyen", days: 220, trend: -58 },
    { name: "Ashwood Freight", rep: "J. Harmon", days: 160, trend: -33 },
    { name: "Elmwood Carriers", rep: "S. Briggs", days: 195, trend: -46 },
    { name: "Maplewood Transport", rep: "T. Nguyen", days: 170, trend: -39 },
    { name: "Cedarbrook Fleet", rep: "J. Harmon", days: 185, trend: -52 },
  ],
};

const STAGE_ORDER: Stage[] = ["goal", "accounts", "cadence", "message", "label", "launch"];

const STAGE_TO_API: Record<Stage, string> = {
  goal: "goal",
  accounts: "accounts",
  cadence: "cadence",
  message: "message",
  label: "label",
  launch: "label",
};

const FALLBACKS: Record<string, { message: string; nextComponent: ComponentType }> = {
  goal: { message: "Got it — here are the accounts that match your criteria.", nextComponent: "accountMatching" },
  accounts: { message: "Here's the nudge cadence I'd suggest for this play.", nextComponent: "nudgeCadence" },
  cadence: { message: "I've drafted an opening message for your reps.", nextComponent: "messageComposer" },
  message: { message: "Almost there — set a label for this play.", nextComponent: "labelConfigurator" },
  label: { message: "Everything looks good. Here's your play summary.", nextComponent: "launchSummary" },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      role="switch"
      aria-checked={enabled}
      className={`shrink-0 w-9 h-5 rounded-full relative transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 ${
        enabled ? "bg-blue-600" : "bg-gray-200"
      }`}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200"
        style={{ left: enabled ? "18px" : "2px" }}
      />
    </button>
  );
}

// ─── Side Panel ───────────────────────────────────────────────────────────────

function SidePanel({
  open,
  onClose,
  title,
  onSave,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  onSave: () => void;
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/20 z-40 transition-opacity duration-200 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={onClose}
      />
      {/* Panel */}
      <div
        className={`fixed inset-y-0 right-0 w-[480px] bg-white shadow-xl z-50 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-[26px] flex items-center justify-between shrink-0">
          <span className="font-semibold text-gray-900" style={{ fontSize: "17px" }}>{title}</span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              Save
            </button>
          </div>
        </div>
        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>
      </div>
    </>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center py-2.5 border-b border-gray-100">
      <div className="w-44 text-xs text-gray-500 shrink-0">{label}</div>
      <div className="flex-1 text-sm text-gray-900">{children}</div>
    </div>
  );
}

// ─── Account Preview Modal ────────────────────────────────────────────────────

const PAGE_SIZE = 8;

function AccountPreviewModal({
  open,
  onClose,
  suggestion,
  search,
  onSearch,
  sortCol,
  sortDir,
  onSort,
  page,
  onPage,
  onUse,
}: {
  open: boolean;
  onClose: () => void;
  suggestion: typeof ALL_SUGGESTIONS[0] | null;
  search: string;
  onSearch: (v: string) => void;
  sortCol: "name" | "rep" | "days" | "trend";
  sortDir: "asc" | "desc";
  onSort: (col: "name" | "rep" | "days" | "trend") => void;
  page: number;
  onPage: (p: number) => void;
  onUse: (label: string) => void;
}) {
  if (!open || !suggestion) return null;

  const allRows = SUGGESTION_ACCOUNTS[suggestion.label] ?? [];
  const filtered = allRows.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.rep.toLowerCase().includes(search.toLowerCase())
  );
  const sorted = [...filtered].sort((a, b) => {
    const mult = sortDir === "asc" ? 1 : -1;
    const av = a[sortCol];
    const bv = b[sortCol];
    return typeof av === "string"
      ? av.localeCompare(bv as string) * mult
      : ((av as number) - (bv as number)) * mult;
  });
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const pageRows = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const startIdx = sorted.length === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endIdx = Math.min(page * PAGE_SIZE, sorted.length);

  const SortIcon = ({ col }: { col: "name" | "rep" | "days" | "trend" }) => {
    if (col !== sortCol) return <span className="ml-1 text-gray-300">↕</span>;
    return sortDir === "asc"
      ? <CaretUp size={11} className="ml-1 inline text-blue-600" weight="bold" />
      : <CaretDown size={11} className="ml-1 inline text-blue-600" weight="bold" />;
  };

  const thClass = "px-4 py-2.5 text-left text-xs font-medium text-gray-500 cursor-pointer select-none hover:text-gray-700";

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/30 z-50" onClick={onClose} />
      {/* Panel */}
      <div className="fixed top-[4%] left-[8%] right-[8%] bottom-[4%] bg-white rounded-xl shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className={`${suggestion.bg} w-9 h-9 rounded-lg flex items-center justify-center shrink-0`}>
              <suggestion.Icon size={18} className={suggestion.color} weight="fill" />
            </div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{suggestion.label}</div>
              <div className="text-xs text-gray-500">{allRows.length} accounts</div>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Controls bar */}
        <div className="px-6 py-3 border-b border-gray-100 flex items-center gap-3 shrink-0">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 w-64">
            <MagnifyingGlass size={14} className="text-gray-400 mr-2 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => onSearch(e.target.value)}
              placeholder="Search accounts or reps..."
              className="bg-transparent text-sm text-gray-800 placeholder-gray-400 focus:outline-none w-full"
            />
          </div>
          <div className="flex-1" />
          <button
            onClick={() => onUse(suggestion.label)}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
          >
            Use this suggestion →
          </button>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-white border-b border-gray-200">
              <tr>
                <th className={thClass} onClick={() => onSort("name")}>
                  Account Name <SortIcon col="name" />
                </th>
                <th className={thClass} onClick={() => onSort("rep")}>
                  Rep <SortIcon col="rep" />
                </th>
                <th className={thClass} onClick={() => onSort("days")}>
                  Days Since Visit <SortIcon col="days" />
                </th>
                <th className={thClass} onClick={() => onSort("trend")}>
                  Revenue Trend <SortIcon col="trend" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row.name} className={i % 2 === 1 ? "bg-gray-50" : ""}>
                  <td className="px-4 py-2.5 font-medium text-gray-900">{row.name}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.rep}</td>
                  <td className="px-4 py-2.5 text-gray-600">{row.days}d</td>
                  <td className="px-4 py-2.5">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        row.trend < 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      }`}
                    >
                      {row.trend > 0 ? "+" : ""}{row.trend}%
                    </span>
                  </td>
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-400">
                    No accounts match your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        <div className="border-t border-gray-100 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-xs text-gray-500">
            {sorted.length === 0
              ? "No accounts"
              : `Showing ${startIdx}–${endIdx} of ${sorted.length} accounts`}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPage(page - 1)}
              disabled={page <= 1}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => onPage(page + 1)}
              disabled={page >= totalPages}
              className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Embedded Components ──────────────────────────────────────────────────────

function AccountMatching({
  accounts,
  onRemove,
  onAdjust,
}: {
  accounts: typeof ACCOUNTS;
  onRemove: (i: number) => void;
  onAdjust: () => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden bg-white mt-3 w-full max-w-2xl">
      <div className="grid grid-cols-3 divide-x divide-gray-200 border-b border-gray-200">
        {[
          { label: "Accounts matched", value: "18" },
          { label: "Revenue at risk", value: "$340K" },
          { label: "Reps affected", value: "4" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-50 px-4 py-3 text-center">
            <div className="text-xl font-semibold text-gray-900">{m.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{m.label}</div>
          </div>
        ))}
      </div>
      <div className="divide-y divide-gray-100">
        {accounts.map((a, i) => (
          <div key={a.name} className="flex items-center justify-between px-4 py-2.5 text-sm">
            <div className="flex-1 min-w-0">
              <span className="font-medium text-gray-900 truncate block">{a.name}</span>
              <span className="text-gray-500 text-xs">Rep: {a.rep}</span>
            </div>
            <div className="flex items-center gap-3 ml-4 shrink-0">
              <span className="text-xs text-gray-500">{a.days}d since visit</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.trend < 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"}`}>
                {a.trend > 0 ? "+" : ""}{a.trend}%
              </span>
              <button onClick={() => onRemove(i)} className="text-gray-300 hover:text-red-500 transition-colors ml-1" title="Remove">
                <X size={14} weight="bold" />
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100">
        <button onClick={onAdjust} className="text-blue-600 text-xs hover:underline">Adjust criteria</button>
      </div>
    </div>
  );
}

function NudgeCadence({
  steps,
  days,
  enabled,
  titles,
  descriptions,
  onDayChange,
  onToggle,
  onEdit,
}: {
  steps: typeof CADENCE_STEPS;
  days: number[];
  enabled: boolean[];
  titles: string[];
  descriptions: string[];
  onDayChange: (i: number, v: number) => void;
  onToggle: (i: number) => void;
  onEdit: (i: number) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 w-full max-w-2xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {steps.map((s, i) => (
          <div
            key={s.title}
            role="button"
            tabIndex={0}
            onClick={() => onEdit(i)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onEdit(i); } }}
            className={`w-full flex items-start gap-4 px-4 py-3 text-left transition-all hover:bg-gray-50 cursor-pointer ${!enabled[i] ? "opacity-40" : ""}`}
          >
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${enabled[i] ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"}`} />
              {i < steps.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Day</span>
                <span className="w-12 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-center bg-white">
                  {days[i]}
                </span>
              </div>
              <div className="font-medium text-sm text-gray-900 mt-1">{titles[i]}</div>
              <div className="text-xs text-gray-500 mt-0.5">{descriptions[i]}</div>
            </div>
            <span onClick={(e) => { e.stopPropagation(); onToggle(i); }}>
              <Toggle enabled={enabled[i]} onToggle={() => onToggle(i)} />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageComposer({ tone, text, onTone, onText }: {
  tone: keyof typeof MESSAGES;
  text: string;
  onTone: (t: keyof typeof MESSAGES) => void;
  onText: (t: string) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 w-full max-w-2xl overflow-hidden">
      <div className="px-4 pt-4">
        <div className="flex gap-2 mb-3">
          {(["Direct", "Motivational", "Informational"] as const).map((t) => (
            <button
              key={t}
              onClick={() => onTone(t)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tone === t ? "border-blue-600 bg-blue-50 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <textarea
          value={text}
          onChange={(e) => onText(e.target.value)}
          rows={4}
          className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
        />
      </div>
      <div className="px-4 pb-4 mt-2">
        <div className="text-xs text-gray-400 mb-2">Rep notification preview</div>
        <div className="bg-gray-50 rounded-xl border border-gray-200 px-4 py-3 max-w-xs">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">V</span>
            </div>
            <span className="text-xs font-medium text-gray-700">Voze</span>
            <span className="text-xs text-gray-400 ml-auto">now</span>
          </div>
          <p className="text-xs text-gray-700 leading-relaxed">{text}</p>
        </div>
      </div>
    </div>
  );
}

function LabelConfigurator({ label, onChange }: { label: string; onChange: (v: string) => void }) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 w-full max-w-2xl p-4">
      <label className="text-xs text-gray-500 block mb-1.5">Play label</label>
      <input
        type="text"
        value={label}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-400"
      />
      {label && (
        <div className="mt-3">
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-3 py-1 rounded-full">
            {label}
          </span>
        </div>
      )}
      <p className="text-xs text-gray-400 mt-3 leading-relaxed">
        This label will be applied to all matched accounts and will appear in map filters, list views, and reports.
      </p>
    </div>
  );
}

function LaunchSummary({
  playName, label, accountCount, repCount, cadenceSteps, repMessage, onNameChange, onLaunch, launched,
}: {
  playName: string;
  label: string;
  accountCount: number;
  repCount: number;
  cadenceSteps: { day: number; title: string; enabled: boolean }[];
  repMessage: string;
  onNameChange: (v: string) => void;
  onLaunch: () => void;
  launched: boolean;
}) {
  if (launched) {
    return (
      <div className="border border-green-200 rounded-lg bg-green-50 mt-3 w-full max-w-2xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <RocketLaunch size={32} weight="fill" className="text-green-600" />
        </div>
        <h3 className="font-semibold text-green-800 text-base">Play launched. 4 reps have been notified.</h3>
        <Link href="/dashboard" className="mt-3 text-blue-600 text-sm hover:underline block">View live play dashboard →</Link>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 w-full max-w-2xl overflow-hidden">
      <div className="p-4 space-y-4">
        <div>
          <label className="text-xs text-gray-500 block mb-1">Play name</label>
          <input
            type="text"
            value={playName}
            onChange={(e) => onNameChange(e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 font-medium focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Label:</span>
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">{label}</span>
        </div>
        <div className="flex gap-6">
          <div>
            <div className="text-lg font-semibold text-gray-900">{accountCount}</div>
            <div className="text-xs text-gray-500">accounts</div>
          </div>
          <div>
            <div className="text-lg font-semibold text-gray-900">{repCount}</div>
            <div className="text-xs text-gray-500">reps</div>
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1.5">Cadence</div>
          <div className="flex flex-wrap gap-1.5">
            {cadenceSteps.filter((s) => s.enabled).map((s) => (
              <span key={s.title} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                Day {s.day} · {s.title}
              </span>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Rep message</div>
          <p className="text-xs text-gray-700 italic">&ldquo;{repMessage.split(".")[0]}.&rdquo;</p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button onClick={onLaunch} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors">
          Launch play
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: "plays", label: "Plays", Icon: Play },
];

function Sidebar({
  prototypes,
  activeId,
  onSelect,
}: {
  prototypes: Prototype[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <aside className="w-44 bg-[#0F172A] flex flex-col shrink-0 h-screen sticky top-0">
      <div className="px-4 py-5">
        <div className="flex items-center gap-2">
          <div className="flex items-end gap-0.5 h-4">
            {[5, 7, 9, 11].map((h, i) => (
              <div key={i} className="w-1.5 rounded-sm bg-white" style={{ height: `${h}px` }} />
            ))}
          </div>
          <span className="text-white font-bold text-sm tracking-wider">VOZE</span>
        </div>
      </div>
      <nav className="flex-1 px-2 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = activeId === id;
          return (
            <button
              key={label}
              onClick={() => onSelect(id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-colors ${
                active ? "bg-[#334155] text-white font-medium" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              <Icon size={15} weight={active ? "fill" : "regular"} className="shrink-0" />
              <span>{label}</span>
              {active && <span className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />}
            </button>
          );
        })}
        {prototypes.map((p) => {
          const active = activeId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-colors ${
                active ? "bg-[#334155] text-white font-medium" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              <p.Icon size={15} weight={active ? "fill" : "regular"} className="shrink-0" />
              <span className="truncate">{p.name}</span>
              {active && <span className="ml-auto w-1 h-4 bg-blue-500 rounded-full shrink-0" />}
            </button>
          );
        })}
      </nav>
      <div className="p-2 border-t border-slate-700">
        <div className="flex items-center justify-center gap-1.5 py-1.5 text-slate-400 hover:text-white cursor-pointer text-xs rounded hover:bg-[#1E293B] transition-colors">
          <CaretLeft size={12} />
          Collapse
        </div>
      </div>
    </aside>
  );
}

function pickSuggestions(exclude: typeof ALL_SUGGESTIONS = []): typeof ALL_SUGGESTIONS {
  const excludeLabels = new Set(exclude.map((s) => s.label));
  const pool = ALL_SUGGESTIONS.filter((s) => !excludeLabels.has(s.label));
  const source = pool.length >= 3 ? pool : ALL_SUGGESTIONS;
  return [...source].sort(() => Math.random() - 0.5).slice(0, 3);
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────

function TopBar({ onCreatePrototype }: { onCreatePrototype: (type: PrototypeType) => void }) {
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);
  return (
    <header className="flex items-center justify-between px-8 py-3.5 border-b border-gray-200 shrink-0 bg-white">
      <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-80">
        <MagnifyingGlass size={15} className="text-gray-400 mr-2 shrink-0" />
        <span className="text-gray-400 text-sm">Search</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setNewDropdownOpen((v) => !v)}
            className="border border-blue-600 text-blue-600 text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5"
          >
            New <CaretDown size={11} />
          </button>
          {newDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden">
              <button
                onClick={() => { setNewDropdownOpen(false); onCreatePrototype("desktop"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <Desktop size={15} className="shrink-0" /> Desktop Prototype
              </button>
              <button
                onClick={() => { setNewDropdownOpen(false); onCreatePrototype("mobile"); }}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <DeviceMobile size={15} className="shrink-0" /> Mobile Prototype
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function PlayBuilderView() {
  const [stage, setStage] = useState<Stage>("goal");
  const [goalInput, setGoalInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [accounts, setAccounts] = useState([...ACCOUNTS]);
  const [cadenceDays, setCadenceDays] = useState(CADENCE_STEPS.map((s) => s.day));
  const [cadenceEnabled, setCadenceEnabled] = useState(CADENCE_STEPS.map(() => true));
  const [cadenceTitles, setCadenceTitles] = useState(CADENCE_STEPS.map((s) => s.title));
  const [cadenceDescriptions, setCadenceDescriptions] = useState(CADENCE_STEPS.map((s) => s.description));
  const [tone, setTone] = useState<keyof typeof MESSAGES>("Direct");
  const [repMessage, setRepMessage] = useState(MESSAGES["Direct"]);
  const [playLabel, setPlayLabel] = useState("Retention — Q3 2026");
  const [playName, setPlayName] = useState("Revenue Protection Play");

  // Preview modal state
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSuggestion, setPreviewSuggestion] = useState<typeof ALL_SUGGESTIONS[0] | null>(null);
  const [previewSearch, setPreviewSearch] = useState("");
  const [previewSortCol, setPreviewSortCol] = useState<"name" | "rep" | "days" | "trend">("days");
  const [previewSortDir, setPreviewSortDir] = useState<"asc" | "desc">("desc");
  const [previewPage, setPreviewPage] = useState(1);

  const openPreview = (s: typeof ALL_SUGGESTIONS[0]) => {
    setPreviewSuggestion(s);
    setPreviewSearch("");
    setPreviewSortCol("days");
    setPreviewSortDir("desc");
    setPreviewPage(1);
    setPreviewOpen(true);
  };

  const handlePreviewSort = (col: "name" | "rep" | "days" | "trend") => {
    if (col === previewSortCol) setPreviewSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setPreviewSortCol(col); setPreviewSortDir("asc"); }
    setPreviewPage(1);
  };

  // Dynamic suggestions — mounted flag ensures server/client render identical
  // empty output during hydration; suggestions only appear after mount
  const [mounted, setMounted] = useState(false);
  const [visibleSuggestions, setVisibleSuggestions] = useState<typeof ALL_SUGGESTIONS>([]);
  const [refreshCount, setRefreshCount] = useState(0);

  useEffect(() => {
    setVisibleSuggestions(pickSuggestions());
    setMounted(true);
  }, []);

  const refreshSuggestions = () => {
    setRefreshCount((c) => c + 1);
    setVisibleSuggestions((prev) => pickSuggestions(prev));
  };

  // Criteria panel state
  const [criteriaOpen, setCriteriaOpen] = useState(false);
  const [criteriaRevenue, setCriteriaRevenue] = useState(-10);
  const [criteriaDays, setCriteriaDays] = useState(14);
  const [criteriaReps, setCriteriaReps] = useState<string[]>([]);
  const [criteriaActiveOnly, setCriteriaActiveOnly] = useState(true);

  // Nudge edit panel state
  const [nudgeEditOpen, setNudgeEditOpen] = useState(false);
  const [editingNudgeIdx, setEditingNudgeIdx] = useState<number | null>(null);
  const [editDay, setEditDay] = useState(1);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editEnabled, setEditEnabled] = useState(true);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const openNudgeEdit = (i: number) => {
    setEditingNudgeIdx(i);
    setEditDay(cadenceDays[i]);
    setEditTitle(cadenceTitles[i]);
    setEditDescription(cadenceDescriptions[i]);
    setEditEnabled(cadenceEnabled[i]);
    setNudgeEditOpen(true);
  };

  const saveNudgeEdit = () => {
    if (editingNudgeIdx === null) return;
    const i = editingNudgeIdx;
    setCadenceDays((prev) => prev.map((d, j) => (j === i ? editDay : d)));
    setCadenceTitles((prev) => prev.map((t, j) => (j === i ? editTitle : t)));
    setCadenceDescriptions((prev) => prev.map((d, j) => (j === i ? editDescription : d)));
    setCadenceEnabled((prev) => prev.map((e, j) => (j === i ? editEnabled : e)));
    setNudgeEditOpen(false);
  };

  const callAPI = async (userMessage: string, currentStage: Stage): Promise<{ message: string; nextComponent: ComponentType }> => {
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userMessage, stage: STAGE_TO_API[currentStage] }),
      });
      if (!res.ok) throw new Error("API error");
      return await res.json();
    } catch {
      return FALLBACKS[STAGE_TO_API[currentStage]] ?? FALLBACKS["goal"];
    }
  };

  const submitGoal = (text: string) => {
    if (!text.trim() || loading) return;
    const userText = text.trim();
    setGoalInput(userText);
    setMessages([{ role: "user", text: userText }]);
    setLoading(true);

    setTimeout(async () => {
      const result = await callAPI(userText, "goal");
      setMessages((prev) => [...prev, { role: "assistant", text: result.message, component: result.nextComponent }]);
      setStage("accounts");
      setLoading(false);
    }, 800);
  };

  const handleSubmitGoal = () => submitGoal(goalInput);

  const handleContinue = async () => {
    const currentIdx = STAGE_ORDER.indexOf(stage);
    if (currentIdx >= STAGE_ORDER.length - 1 || loading) return;
    const nextStage = STAGE_ORDER[currentIdx + 1] as Stage;

    setLoading(true);
    setTimeout(async () => {
      const result = await callAPI(`Confirmed: ${stage}`, stage);
      setMessages((prev) => [...prev, { role: "assistant", text: result.message, component: result.nextComponent }]);
      setStage(nextStage);
      setLoading(false);
    }, 800);
  };

  const handleBack = () => {
    if (loading || launched) return;
    const currentIdx = STAGE_ORDER.indexOf(stage);
    if (currentIdx === 0) return;

    if (currentIdx === 1) {
      setMessages([]);
      setStage("goal");
    } else {
      setMessages((prev) => {
        for (let i = prev.length - 1; i >= 0; i--) {
          if (prev[i].role === "assistant") return prev.slice(0, i);
        }
        return prev;
      });
      setStage(STAGE_ORDER[currentIdx - 1] as Stage);
    }
  };

  const handleToneChange = (t: keyof typeof MESSAGES) => {
    setTone(t);
    setRepMessage(MESSAGES[t]);
  };

  const cadenceStepsWithEnabled = CADENCE_STEPS.map((s, i) => ({
    ...s,
    day: cadenceDays[i],
    title: cadenceTitles[i],
    description: cadenceDescriptions[i],
    enabled: cadenceEnabled[i],
  }));

  const isInChat = messages.length > 0;
  const isLastStage = stage === "launch";
  const currentIdx = STAGE_ORDER.indexOf(stage);

  const revenueOptions = [
    { value: 0, label: "Any decline" },
    { value: -5, label: "< -5%" },
    { value: -10, label: "< -10%" },
    { value: -20, label: "< -20%" },
  ];

  return (
    <>
      {/* Criteria Side Panel */}
      <SidePanel
        open={criteriaOpen}
        onClose={() => setCriteriaOpen(false)}
        title="Adjust criteria"
        onSave={() => setCriteriaOpen(false)}
      >
        <FieldRow label="Revenue trend">
          <select
            value={criteriaRevenue}
            onChange={(e) => setCriteriaRevenue(Number(e.target.value))}
            className="border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          >
            {revenueOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </FieldRow>
        <FieldRow label="Days since visit">
          <input
            type="number"
            value={criteriaDays}
            onChange={(e) => setCriteriaDays(Number(e.target.value))}
            min={1}
            className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </FieldRow>
        <FieldRow label="Rep filter">
          <div className="flex flex-col gap-1.5">
            {["J. Harmon", "S. Briggs", "T. Nguyen"].map((rep) => (
              <label key={rep} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={criteriaReps.includes(rep)}
                  onChange={(e) => {
                    setCriteriaReps((prev) =>
                      e.target.checked ? [...prev, rep] : prev.filter((r) => r !== rep)
                    );
                  }}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-400"
                />
                <span className="text-sm text-gray-700">{rep}</span>
              </label>
            ))}
          </div>
        </FieldRow>
        <FieldRow label="Account status">
          <div className="flex items-center gap-2">
            <Toggle enabled={criteriaActiveOnly} onToggle={() => setCriteriaActiveOnly((v) => !v)} />
            <span className="text-sm text-gray-600">Active only</span>
          </div>
        </FieldRow>
      </SidePanel>

      <AccountPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        suggestion={previewSuggestion}
        search={previewSearch}
        onSearch={(v) => { setPreviewSearch(v); setPreviewPage(1); }}
        sortCol={previewSortCol}
        sortDir={previewSortDir}
        onSort={handlePreviewSort}
        page={previewPage}
        onPage={setPreviewPage}
        onUse={(label) => { setPreviewOpen(false); submitGoal(label); }}
      />

      {/* Nudge Edit Side Panel */}
      <SidePanel
        open={nudgeEditOpen}
        onClose={() => setNudgeEditOpen(false)}
        title="Edit step"
        onSave={saveNudgeEdit}
      >
        <FieldRow label="Day">
          <input
            type="number"
            value={editDay}
            onChange={(e) => setEditDay(Number(e.target.value))}
            min={1}
            className="w-20 border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </FieldRow>
        <FieldRow label="Step title">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </FieldRow>
        <FieldRow label="Description">
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            rows={3}
            className="w-full border border-gray-200 rounded px-2 py-1 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-400"
          />
        </FieldRow>
        <FieldRow label="Enabled">
          <Toggle enabled={editEnabled} onToggle={() => setEditEnabled((v) => !v)} />
        </FieldRow>
      </SidePanel>

      <div className="flex flex-col flex-1 min-w-0">
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isInChat ? (
            <div className="flex flex-col items-center justify-center min-h-full px-8 py-16">
              <div className="w-full max-w-2xl">
                <div className="text-center mb-8">
                  <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                    What do you want your team to accomplish?
                  </h1>
                  <p className="text-gray-500 text-base">
                    Describe your sales goal in plain language. Voze AI will help identify the right accounts.
                  </p>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 mb-6">
                  <div className="relative">
                    <textarea
                      ref={textareaRef}
                      value={goalInput}
                      onChange={(e) => setGoalInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSubmitGoal();
                        }
                      }}
                      rows={5}
                      placeholder="E.g., Protect our top tire accounts that are down in revenue and haven't been visited in 30 days"
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm text-gray-800 resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                    />
                    <button
                      onClick={handleSubmitGoal}
                      className="absolute bottom-3 right-3 text-gray-400 hover:text-blue-500 transition-colors p-0.5"
                      title="Submit"
                    >
                      <Microphone size={20} />
                    </button>
                  </div>
                </div>

                {mounted && <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-600">Or start with a suggestion:</p>
                    <button
                      onClick={refreshSuggestions}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <ArrowCounterClockwise size={13} />
                      Refresh suggestions
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {visibleSuggestions.map((s, idx) => (
                      <div
                        key={`${refreshCount}-${s.label}`}
                        onClick={() => setGoalInput(s.label)}
                        className="animate-fade-slide-in bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:bg-blue-50/30 transition-colors flex flex-col cursor-pointer"
                        style={{ animationDelay: `${idx * 100}ms` }}
                      >
                        <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                          <s.Icon size={20} className={s.color} weight="fill" />
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
                        <div className="text-gray-500 text-xs mt-1">{s.sub}</div>
                        <button
                          onClick={(e) => { e.stopPropagation(); openPreview(s); }}
                          className="mt-3 text-blue-600 text-xs hover:underline self-start"
                        >
                          See accounts →
                        </button>
                      </div>
                    ))}
                  </div>
                </div>}
              </div>
            </div>
          ) : (
            <div className="px-8 py-6 max-w-3xl mx-auto w-full pb-8 space-y-4">
              <p className="text-xs text-gray-400 text-center mb-2">AI Play Builder</p>

              {messages.map((msg, i) => (
                <div key={i}>
                  {msg.role === "user" ? (
                    <div className="flex justify-end">
                      <div className="bg-blue-100 text-blue-900 text-sm px-4 py-2.5 rounded-2xl rounded-tr-sm max-w-lg">
                        {msg.text}
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-start">
                      <div className="flex items-start gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-white text-[9px] font-bold">V</span>
                        </div>
                        <p className="text-sm text-gray-700 pt-0.5">{msg.text}</p>
                      </div>

                      {msg.component === "accountMatching" && (
                        <div className="ml-8 w-full">
                          <AccountMatching
                            accounts={accounts}
                            onRemove={(idx) => setAccounts((prev) => prev.filter((_, j) => j !== idx))}
                            onAdjust={() => setCriteriaOpen(true)}
                          />
                        </div>
                      )}
                      {msg.component === "nudgeCadence" && (
                        <div className="ml-8 w-full">
                          <NudgeCadence
                            steps={CADENCE_STEPS}
                            days={cadenceDays}
                            enabled={cadenceEnabled}
                            titles={cadenceTitles}
                            descriptions={cadenceDescriptions}
                            onDayChange={(idx, val) => setCadenceDays((prev) => prev.map((d, j) => (j === idx ? val : d)))}
                            onToggle={(idx) => setCadenceEnabled((prev) => prev.map((e, j) => (j === idx ? !e : e)))}
                            onEdit={openNudgeEdit}
                          />
                        </div>
                      )}
                      {msg.component === "messageComposer" && (
                        <div className="ml-8 w-full">
                          <MessageComposer tone={tone} text={repMessage} onTone={handleToneChange} onText={setRepMessage} />
                        </div>
                      )}
                      {msg.component === "labelConfigurator" && (
                        <div className="ml-8 w-full">
                          <LabelConfigurator label={playLabel} onChange={setPlayLabel} />
                        </div>
                      )}
                      {msg.component === "launchSummary" && (
                        <div className="ml-8 w-full">
                          <LaunchSummary
                            playName={playName}
                            label={playLabel}
                            accountCount={accounts.length}
                            repCount={4}
                            cadenceSteps={cadenceStepsWithEnabled}
                            repMessage={repMessage}
                            onNameChange={setPlayName}
                            onLaunch={() => setLaunched(true)}
                            launched={launched}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {loading && (
                <div className="flex items-center gap-2 ml-8">
                  <div className="w-6 h-6 rounded-full bg-[#0F172A] flex items-center justify-center shrink-0">
                    <span className="text-white text-[9px] font-bold">V</span>
                  </div>
                  <div className="flex gap-1 px-3 py-2.5 bg-gray-100 rounded-2xl">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-200 bg-white px-6 py-3 shrink-0">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={currentIdx === 0 || loading || launched}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-3">
              <button className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Save as Draft
              </button>
              <button
                onClick={isInChat ? handleContinue : handleSubmitGoal}
                disabled={loading || (!isInChat && !goalInput.trim()) || (isInChat && isLastStage) || launched}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                Continue
                <CaretRight size={13} weight="bold" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Prototype Canvas ─────────────────────────────────────────────────────────

function PrototypeCanvas({
  prototype,
  onRename,
  onChangeIcon,
  onDelete,
}: {
  prototype: Prototype;
  onRename: (id: string, name: string) => void;
  onChangeIcon: (id: string, Icon: ElementType) => void;
  onDelete: (id: string) => void;
}) {
  const [fabOpen, setFabOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [iconOpen, setIconOpen] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(prototype.name);
  const [selectedIcon, setSelectedIcon] = useState<ElementType>(() => prototype.Icon);
  const [openingInCursor, setOpeningInCursor] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Notes
  const [notesOpen, setNotesOpen] = useState(false);
  const [notesContent, setNotesContent] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Versions
  const [versions, setVersions] = useState<{ label: string; file: string }[]>([]);
  const [restoreTarget, setRestoreTarget] = useState<string | null>(null);

  const handleOpenInCursor = async () => {
    setOpeningInCursor(true);
    try {
      const res = await fetch("/api/open-in-editor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filePath: prototype.filePath }),
      });
      if (!res.ok) {
        const data = await res.json();
        console.error("[Open in Cursor]", data.error);
      }
    } catch (err) {
      console.error("[Open in Cursor] fetch failed:", err);
    } finally {
      setOpeningInCursor(false);
    }
  };

  // Keep local state in sync if prototype changes externally
  useEffect(() => { setRenameValue(prototype.name); }, [prototype.name]);
  useEffect(() => { setSelectedIcon(() => prototype.Icon); }, [prototype.Icon]);

  // Load notes on prototype change
  useEffect(() => {
    setNotesContent("");
    fetch(`/api/prototypes/notes?slug=${prototype.slug}`)
      .then((r) => r.json())
      .then((d) => setNotesContent(d.content ?? ""))
      .catch(() => {});
  }, [prototype.slug]);

  // Load versions on prototype change
  useEffect(() => {
    setVersions([]);
    fetch(`/api/prototypes/versions?slug=${prototype.slug}`)
      .then((r) => r.json())
      .then((v) => Array.isArray(v) ? setVersions(v) : setVersions([]))
      .catch(() => {});
  }, [prototype.slug]);

  const handleNotesChange = useCallback((value: string) => {
    setNotesContent(value);
    setNotesSaved(false);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/prototypes/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: prototype.slug, content: value }),
        });
        setNotesSaved(true);
        setTimeout(() => setNotesSaved(false), 2000);
      } catch {}
    }, 600);
  }, [prototype.slug]);

  const handleSaveVersion = useCallback(async () => {
    try {
      const res = await fetch("/api/prototypes/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: prototype.slug }),
      });
      const data = await res.json();
      if (data.label) setVersions((prev) => [...prev, { label: data.label, file: data.file }]);
    } catch {}
  }, [prototype.slug]);

  const handleRestoreVersion = useCallback(async (version: string) => {
    try {
      await fetch("/api/prototypes/versions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: prototype.slug, version }),
      });
      setRestoreTarget(null);
      setIframeKey((k) => k + 1);
    } catch {}
  }, [prototype.slug]);

  const fileChip = (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-md px-2.5 py-1.5">
      <span className="text-xs text-white/60 shrink-0">File:</span>
      <code className="text-xs text-white font-mono whitespace-nowrap">{prototype.filePath}</code>
      <button
        onClick={handleOpenInCursor}
        disabled={openingInCursor}
        className="ml-1 text-xs text-white/60 hover:text-white border border-white/20 hover:border-white/40 rounded px-2 py-0.5 transition-colors disabled:opacity-50"
      >
        {openingInCursor ? "Opening…" : "Open in Cursor"}
      </button>
    </div>
  );

  const fab = (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2 z-20">
      {fabOpen && (
        <div className="flex flex-col items-end gap-1.5 mb-1">
          <button
            onClick={() => { setFabOpen(false); setRenameValue(prototype.name); setRenameOpen(true); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <PencilSimple size={13} /> Rename
          </button>
          <button
            onClick={() => { setFabOpen(false); setNotesOpen(true); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <NotePencil size={13} /> Notes
          </button>
          <button
            onClick={() => { setFabOpen(false); handleSaveVersion(); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <FloppyDisk size={13} /> Save Version
          </button>
          <button
            onClick={() => { setFabOpen(false); setSelectedIcon(() => prototype.Icon); setIconOpen(true); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <Star size={13} /> Change Icon
          </button>
          <button
            onClick={() => { setFabOpen(false); setIframeKey((k) => k + 1); }}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          >
            <ArrowCounterClockwise size={13} /> Restart
          </button>
          <button
            onClick={() => { setFabOpen(false); setDeleteConfirmOpen(true); }}
            className="flex items-center gap-2 bg-white border border-red-200 text-red-600 text-xs font-medium px-3 py-2 rounded-lg shadow-md hover:bg-red-50 transition-colors"
          >
            <Trash size={13} /> Delete
          </button>
        </div>
      )}
      <button
        onClick={() => setFabOpen((v) => !v)}
        className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center transition-colors ${
          fabOpen ? "bg-gray-800 text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
        }`}
      >
        <DotsThree size={20} weight="bold" />
      </button>
    </div>
  );

  const renameModal = renameOpen && (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setRenameOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Rename Prototype</span>
            <button onClick={() => setRenameOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={15} /></button>
          </div>
          <div className="px-5 py-4">
            <input
              autoFocus
              type="text"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && renameValue.trim()) {
                  onRename(prototype.id, renameValue.trim());
                  setRenameOpen(false);
                }
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <div className="px-5 pb-4 flex justify-end gap-2">
            <button onClick={() => setRenameOpen(false)} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
            <button
              onClick={() => { if (renameValue.trim()) { onRename(prototype.id, renameValue.trim()); setRenameOpen(false); } }}
              disabled={!renameValue.trim()}
              className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >Save</button>
          </div>
        </div>
      </div>
    </>
  );

  const iconModal = iconOpen && (
    <>
      <div className="fixed inset-0 bg-black/20 z-40" onClick={() => setIconOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">Change Icon</span>
            <button onClick={() => setIconOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors"><X size={15} /></button>
          </div>
          <div className="px-5 py-4">
            <div className="grid grid-cols-4 gap-2">
              {PICKER_ICONS.map(({ Icon, label }) => {
                const active = selectedIcon === Icon;
                return (
                  <button
                    key={label}
                    onClick={() => setSelectedIcon(() => Icon)}
                    className={`flex items-center justify-center h-10 rounded-lg border transition-colors ${
                      active ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                    title={label}
                  >
                    <Icon size={18} weight={active ? "fill" : "regular"} />
                  </button>
                );
              })}
            </div>
          </div>
          <div className="px-5 pb-4 flex justify-end gap-2">
            <button onClick={() => setIconOpen(false)} className="text-sm px-3 py-1.5 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors">Cancel</button>
            <button
              onClick={() => { onChangeIcon(prototype.id, selectedIcon); setIconOpen(false); }}
              className="text-sm px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >Save</button>
          </div>
        </div>
      </div>
    </>
  );

  const deleteModal = deleteConfirmOpen && (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setDeleteConfirmOpen(false)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-50 mb-3">
              <Trash size={18} className="text-red-500" />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">Delete "{prototype.name}"?</p>
            <p className="text-xs text-gray-500">This will permanently delete the prototype file from disk. This cannot be undone.</p>
          </div>
          <div className="px-5 pb-5 pt-2 flex gap-2">
            <button
              onClick={() => setDeleteConfirmOpen(false)}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => { setDeleteConfirmOpen(false); onDelete(prototype.id); }}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const notesPanel = notesOpen && (
    <>
      <div className="fixed inset-0 z-30" onClick={() => setNotesOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-80 bg-[#0F172A] z-40 flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-slate-700">
          <div className="flex items-center gap-2 text-white text-sm font-medium">
            <NotePencil size={14} />
            <span>{prototype.name} — Notes</span>
          </div>
          <div className="flex items-center gap-2">
            {notesSaved && <span className="text-xs text-emerald-400">Saved</span>}
            <button onClick={() => setNotesOpen(false)} className="text-slate-400 hover:text-white transition-colors">
              <X size={15} />
            </button>
          </div>
        </div>
        <textarea
          value={notesContent}
          onChange={(e) => handleNotesChange(e.target.value)}
          placeholder={`# ${prototype.name}\n\n**Goal**: What is this prototype for?\n\n**Key decisions**\n- \n\n**Open questions**\n- `}
          className="flex-1 bg-transparent text-slate-300 text-xs font-mono leading-relaxed p-4 resize-none focus:outline-none placeholder-slate-600"
          spellCheck={false}
        />
        <div className="px-4 py-2 border-t border-slate-700">
          <p className="text-xs text-slate-500">Auto-saved · visible to Claude as <code className="text-slate-400">prototype.md</code></p>
        </div>
      </div>
    </>
  );

  const restoreModal = restoreTarget && (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setRestoreTarget(null)} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-xs overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 mb-3">
              <ClockCounterClockwise size={18} className="text-blue-500" />
            </div>
            <p className="font-semibold text-gray-900 text-sm mb-1">Restore {restoreTarget}?</p>
            <p className="text-xs text-gray-500">This replaces the live version with {restoreTarget}. Consider saving a version first to preserve current work.</p>
          </div>
          <div className="px-5 pb-5 pt-2 flex gap-2">
            <button
              onClick={() => setRestoreTarget(null)}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRestoreVersion(restoreTarget)}
              className="flex-1 text-sm px-3 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium"
            >
              Restore
            </button>
          </div>
        </div>
      </div>
    </>
  );

  const versionStrip = versions.length > 0 && (
    <div className="flex items-center gap-1.5 px-4 py-2 border-b border-gray-100 bg-white shrink-0">
      <ClockCounterClockwise size={12} className="text-gray-400 shrink-0" />
      <span className="text-xs text-gray-400 mr-0.5">Versions:</span>
      {versions.map((v) => (
        <button
          key={v.label}
          onClick={() => setRestoreTarget(v.label)}
          className="text-xs px-2 py-0.5 rounded border border-gray-200 text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors font-mono"
        >
          {v.label}
        </button>
      ))}
      <span className="text-xs text-gray-300 ml-0.5">· live</span>
    </div>
  );

  if (prototype.type === "mobile") {
    return (
      <div className="flex flex-col flex-1 min-w-0 relative">
        {versionStrip}
        <div
          className="flex-1 overflow-y-auto flex items-center justify-center px-8 py-10"
          style={{
            backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          <div
            className="relative rounded-[3rem] shadow-2xl overflow-hidden shrink-0"
            style={{
              width: 375,
              height: 812,
              border: "10px solid #111827",
              boxShadow: "0 0 0 2px #374151, 0 30px 80px rgba(0,0,0,0.35)",
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#111827] rounded-b-2xl z-10" />
            <iframe
              key={iframeKey}
              src={`/prototypes/${prototype.slug}`}
              className="w-full h-full border-0 bg-white"
              title={prototype.name}
            />
          </div>
        </div>
        {fileChip}
        {fab}
        {renameModal}
        {iconModal}
        {deleteModal}
        {notesPanel}
        {restoreModal}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-w-0 relative">
      {versionStrip}
      <div
        className="flex-1 relative"
        style={{
          backgroundImage: "radial-gradient(circle, #d1d5db 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      >
        <iframe
          key={iframeKey}
          src={`/prototypes/${prototype.slug}`}
          className="w-full h-full border-0 bg-white"
          title={prototype.name}
        />
      </div>
      {fileChip}
      {fab}
      {renameModal}
      {iconModal}
      {deleteModal}
      {notesPanel}
      {restoreModal}
    </div>
  );
}

// ─── Create Prototype Modal ───────────────────────────────────────────────────

const PICKER_ICONS: { Icon: ElementType; label: string }[] = [
  { Icon: RocketLaunch, label: "Rocket" },
  { Icon: Lightning, label: "Lightning" },
  { Icon: Star, label: "Star" },
  { Icon: Gear, label: "Gear" },
  { Icon: Globe, label: "Globe" },
  { Icon: Users, label: "Users" },
  { Icon: Briefcase, label: "Briefcase" },
  { Icon: Cube, label: "Cube" },
];

const ICON_MAP: Record<string, ElementType> = Object.fromEntries(
  PICKER_ICONS.map(({ Icon, label }) => [label, Icon])
);

function getIconName(Icon: ElementType): string {
  return PICKER_ICONS.find((p) => p.Icon === Icon)?.label ?? "Cube";
}

type StoredPrototype = Omit<Prototype, "Icon">;

function loadPrototypes(): Prototype[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("voze-prototypes");
    if (!raw) return [];
    const stored: StoredPrototype[] = JSON.parse(raw);
    return stored.map((p) => ({ ...p, Icon: ICON_MAP[p.iconName] ?? Cube }));
  } catch {
    return [];
  }
}

function savePrototypes(prototypes: Prototype[]) {
  const stored: StoredPrototype[] = prototypes.map(({ Icon: _icon, ...rest }) => rest);
  localStorage.setItem("voze-prototypes", JSON.stringify(stored));
}

function CreatePrototypeModal({
  type,
  onConfirm,
  onClose,
}: {
  type: PrototypeType;
  onConfirm: (name: string, Icon: ElementType) => void;
  onClose: () => void;
}) {
  const [name, setName] = useState("");
  const [selectedIcon, setSelectedIcon] = useState<ElementType>(() => RocketLaunch);

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <span className="font-semibold text-gray-900 text-sm">
              New {type === "desktop" ? "Desktop" : "Mobile"} Prototype
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={16} />
            </button>
          </div>
          <div className="px-6 py-5 space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">Name</label>
              <input
                autoFocus
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && name.trim()) onConfirm(name.trim(), selectedIcon); }}
                placeholder="Prototype name"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Icon</label>
              <div className="grid grid-cols-4 gap-2">
                {PICKER_ICONS.map(({ Icon, label }) => {
                  const active = selectedIcon === Icon;
                  return (
                    <button
                      key={label}
                      onClick={() => setSelectedIcon(() => Icon)}
                      className={`flex items-center justify-center h-10 rounded-lg border transition-colors ${
                        active
                          ? "border-blue-500 bg-blue-50 text-blue-600"
                          : "border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                      }`}
                      title={label}
                    >
                      <Icon size={18} weight={active ? "fill" : "regular"} />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="px-6 pb-5 flex items-center justify-end gap-2">
            <button
              onClick={onClose}
              className="text-sm px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => { if (name.trim()) onConfirm(name.trim(), selectedIcon); }}
              disabled={!name.trim()}
              className="text-sm px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function PlaybookBuilder() {
  const router = useRouter();
  const pathname = usePathname();
  const [prototypes, setPrototypes] = useState<Prototype[]>([]);
  const [activeId, setActiveId] = useState("plays");
  const [createModalType, setCreateModalType] = useState<PrototypeType | null>(null);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage and sync with filesystem on mount
  useEffect(() => {
    async function syncPrototypes() {
      const local = loadPrototypes();

      let diskEntries: { slug: string; filePath: string; type: "mobile" | "desktop"; name: string }[] = [];
      try {
        const res = await fetch("/api/prototypes");
        if (res.ok) diskEntries = await res.json();
      } catch (err) {
        console.error("[Prototypes] Disk sync failed:", err);
      }

      const localBySlug = new Map(local.map((p) => [p.slug, p]));

      const merged: Prototype[] = diskEntries.map((diskEntry) => {
        const existing = localBySlug.get(diskEntry.slug);
        if (existing) {
          return { ...existing, type: diskEntry.type, filePath: diskEntry.filePath };
        }
        return {
          id: `prototype-disk-${diskEntry.slug}`,
          name: diskEntry.name,
          type: diskEntry.type,
          Icon: Cube,
          iconName: "Cube",
          slug: diskEntry.slug,
          filePath: diskEntry.filePath,
        };
      });

      setPrototypes(merged);
      const slugFromPath = pathname === "/" ? null : pathname.slice(1);
      if (slugFromPath) {
        const match = merged.find((p) => p.slug === slugFromPath);
        if (match) setActiveId(match.id);
      }
      setHydrated(true);
    }

    syncPrototypes();
  }, []);

  // Persist to localStorage whenever prototypes change (after hydration)
  useEffect(() => {
    if (hydrated) savePrototypes(prototypes);
  }, [prototypes, hydrated]);

  const handleSelect = (id: string) => {
    setActiveId(id);
    if (id === "plays") {
      router.replace("/");
    } else {
      const proto = prototypes.find((p) => p.id === id);
      if (proto) router.replace("/" + proto.slug);
    }
  };

  const handleConfirmCreate = async (name: string, Icon: ElementType) => {
    const id = `prototype-${Date.now()}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const iconName = getIconName(Icon);
    let filePath = `app/prototypes/${slug}/page.tsx`;
    try {
      const res = await fetch("/api/prototypes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, type: createModalType }),
      });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = await res.json();
      filePath = data.filePath;
    } catch (err) {
      console.error("[Prototypes] File creation failed:", err);
    }
    const newPrototype: Prototype = { id, name, type: createModalType!, Icon, iconName, slug, filePath };
    setPrototypes((prev) => [...prev, newPrototype]);
    setActiveId(id);
    router.replace("/" + slug);
    setCreateModalType(null);
  };

  const handleRename = (id: string, name: string) => {
    setPrototypes((prev) => prev.map((p) => p.id === id ? { ...p, name } : p));
  };

  const handleChangeIcon = (id: string, Icon: ElementType) => {
    const iconName = getIconName(Icon);
    setPrototypes((prev) => prev.map((p) => p.id === id ? { ...p, Icon, iconName } : p));
  };

  const handleDelete = async (id: string) => {
    const proto = prototypes.find((p) => p.id === id);
    if (proto) {
      try {
        await fetch("/api/prototypes", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: proto.slug }),
        });
      } catch (err) {
        console.error("[Prototypes] Delete API failed:", err);
      }
    }
    setPrototypes((prev) => prev.filter((p) => p.id !== id));
    setActiveId("plays");
    router.replace("/");
  };

  const activePrototype = prototypes.find((p) => p.id === activeId);

  return (
    <div className="flex h-screen overflow-hidden bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar prototypes={prototypes} activeId={activeId} onSelect={handleSelect} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <TopBar onCreatePrototype={(type) => setCreateModalType(type)} />
        {activeId === "plays" ? (
          <PlayBuilderView />
        ) : activePrototype ? (
          <PrototypeCanvas
            prototype={activePrototype}
            onRename={handleRename}
            onChangeIcon={handleChangeIcon}
            onDelete={handleDelete}
          />
        ) : null}
      </div>
      {createModalType && (
        <CreatePrototypeModal
          type={createModalType}
          onConfirm={handleConfirmCreate}
          onClose={() => setCreateModalType(null)}
        />
      )}
    </div>
  );
}
