"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  MagnifyingGlass,
  CaretDown,
  CaretLeft,
  SquaresFour,
  Buildings,
  Note,
  Play,
  CheckSquare,
  CurrencyDollar,
  ChartBar,
  Tag,
  MapPin,
  DotsThree,
  Plus,
} from "@phosphor-icons/react";

// ─── Data ─────────────────────────────────────────────────────────────────────

const IN_PROGRESS_PLAYS = [
  { id: 1, name: "Revenue Protection Play", label: "Retention — Q3 2026", accounts: 5, reps: 3, status: "Active", progress: 40, daysLeft: 22, launched: "Mar 1" },
  { id: 2, name: "New Territory Push", label: "Growth — Midwest", accounts: 12, reps: 2, status: "Active", progress: 65, daysLeft: 14, launched: "Feb 20" },
  { id: 3, name: "Tire Season Promo", label: "Q2 Promotion", accounts: 8, reps: 4, status: "Paused", progress: 20, daysLeft: 45, launched: "Mar 10" },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", Icon: SquaresFour, href: "/dashboard" },
  { label: "Companies", Icon: Buildings, href: "#" },
  { label: "Notes", Icon: Note, href: "#" },
  { label: "Plays", Icon: Play, href: "/" },
  { label: "Tasks", Icon: CheckSquare, href: "#" },
  { label: "Opportunities", Icon: CurrencyDollar, href: "#" },
  { label: "Reports", Icon: ChartBar, href: "#" },
  { label: "Promotions", Icon: Tag, href: "#" },
  { label: "Maps", Icon: MapPin, href: "#" },
];

function Sidebar() {
  const pathname = usePathname();

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
        {NAV_ITEMS.map(({ label, Icon, href }) => {
          const active = pathname === href;
          return (
            <Link
              key={label}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded text-xs transition-colors ${
                active ? "bg-[#334155] text-white font-medium" : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
              }`}
            >
              <Icon size={15} weight={active ? "fill" : "regular"} className="shrink-0" />
              <span>{label}</span>
              {active && <span className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />}
            </Link>
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

// ─── Dashboard Page ────────────────────────────────────────────────────────────

export default function Dashboard() {
  const activePlays = IN_PROGRESS_PLAYS.filter((p) => p.status === "Active").length;
  const totalAccounts = IN_PROGRESS_PLAYS.reduce((sum, p) => sum + p.accounts, 0);
  const totalReps = IN_PROGRESS_PLAYS.reduce((sum, p) => sum + p.reps, 0);

  const summaryTiles = [
    { label: "Active Plays", value: activePlays },
    { label: "Accounts Enrolled", value: totalAccounts },
    { label: "Reps Engaged", value: totalReps },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-3.5 border-b border-gray-200 shrink-0 bg-white">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-80">
            <MagnifyingGlass size={15} className="text-gray-400 mr-2 shrink-0" />
            <span className="text-gray-400 text-sm">Search</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-blue-600 text-blue-600 text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              New <CaretDown size={11} />
            </button>
            <button className="text-gray-500 text-sm flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors">
              Scott Miller <CaretDown size={11} />
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {/* Page header */}
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-semibold text-gray-900">Plays</h1>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} weight="bold" />
              New Play
            </Link>
          </div>

          {/* Summary tiles */}
          <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl">
            {summaryTiles.map((tile) => (
              <div key={tile.label} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                <div className="text-xl font-semibold text-gray-900">{tile.value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{tile.label}</div>
              </div>
            ))}
          </div>

          {/* Play cards */}
          <div className="space-y-3 max-w-2xl">
            {IN_PROGRESS_PLAYS.map((play) => (
              <div
                key={play.id}
                className="border border-gray-200 rounded-lg bg-white p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">{play.name}</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{play.label}</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {play.accounts} accounts · {play.reps} reps
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        play.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {play.status}
                    </span>
                    <button className="text-gray-400 hover:text-gray-600 transition-colors p-0.5">
                      <DotsThree size={18} weight="bold" />
                    </button>
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                    <span>Day {Math.round((play.progress / 100) * 30)} of 30</span>
                    <span>{play.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div
                      className="bg-blue-600 h-1.5 rounded-full transition-all"
                      style={{ width: `${play.progress}%` }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-400">Launched {play.launched}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
