"use client";

import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

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
  {
    day: 1,
    title: "Rep notification",
    description: "Reps notified via in-app message and broadcaster",
  },
  {
    day: 7,
    title: "Manager check-in",
    description: "Digest of unvisited accounts sent to manager",
  },
  {
    day: 14,
    title: "Escalation",
    description: "Unvisited accounts flagged for manager review",
  },
  {
    day: 30,
    title: "Performance report",
    description: "Auto-generated play summary with revenue vs. baseline",
  },
];

const MESSAGES = {
  Direct:
    "18 accounts flagged for immediate attention. These are down in revenue and overdue for a visit. Check your map and prioritize these stops this week.",
  Motivational:
    "Big opportunity this month — 18 accounts are ready for re-engagement. Your visits this week could directly protect and grow this revenue. Let's go get it.",
  Informational:
    "A new retention play has been launched. 18 accounts in your territory have been identified as at-risk based on revenue trend and visit recency. Please review and schedule visits accordingly.",
};

const SUGGESTIONS = [
  {
    label: "Accounts down in revenue",
    sub: "Re-engage declining customers",
    bg: "bg-red-50",
    icon: "📉",
  },
  {
    label: "Rarely visited prospects",
    sub: "Target neglected opportunities",
    bg: "bg-orange-50",
    icon: "🗓",
  },
  {
    label: "Push a product line",
    sub: "Promote specific products",
    bg: "bg-green-50",
    icon: "📦",
  },
];

const STAGE_ORDER: Stage[] = [
  "goal",
  "accounts",
  "cadence",
  "message",
  "label",
  "launch",
];

const STAGE_TO_API: Record<Stage, string> = {
  goal: "goal",
  accounts: "accounts",
  cadence: "cadence",
  message: "message",
  label: "label",
  launch: "label",
};

const FALLBACKS: Record<string, { message: string; nextComponent: ComponentType }> = {
  goal: {
    message: "Got it — here are the accounts that match your criteria.",
    nextComponent: "accountMatching",
  },
  accounts: {
    message: "Here's the nudge cadence I'd suggest for this play.",
    nextComponent: "nudgeCadence",
  },
  cadence: {
    message: "I've drafted an opening message for your reps.",
    nextComponent: "messageComposer",
  },
  message: {
    message: "Almost there — set a label for this play.",
    nextComponent: "labelConfigurator",
  },
  label: {
    message: "Everything looks good. Here's your play summary.",
    nextComponent: "launchSummary",
  },
};

// ─── Embedded Components ──────────────────────────────────────────────────────

function AccountMatching({
  accounts,
  onRemove,
}: {
  accounts: typeof ACCOUNTS;
  onRemove: (i: number) => void;
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
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  a.trend < 0
                    ? "bg-red-100 text-red-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {a.trend > 0 ? "+" : ""}
                {a.trend}%
              </span>
              <button
                onClick={() => onRemove(i)}
                className="text-gray-300 hover:text-red-500 text-sm leading-none ml-1 transition-colors"
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="px-4 py-2.5 border-t border-gray-100">
        <button className="text-blue-600 text-xs hover:underline">
          Adjust criteria
        </button>
      </div>
    </div>
  );
}

function NudgeCadence({
  steps,
  days,
  enabled,
  onDayChange,
  onToggle,
}: {
  steps: typeof CADENCE_STEPS;
  days: number[];
  enabled: boolean[];
  onDayChange: (i: number, v: number) => void;
  onToggle: (i: number) => void;
}) {
  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 w-full max-w-2xl overflow-hidden">
      <div className="divide-y divide-gray-100">
        {steps.map((s, i) => (
          <div
            key={s.title}
            className={`flex items-start gap-4 px-4 py-3 transition-opacity ${!enabled[i] ? "opacity-40" : ""}`}
          >
            <div className="flex flex-col items-center pt-1 shrink-0">
              <div
                className={`w-2.5 h-2.5 rounded-full border-2 transition-colors ${
                  enabled[i] ? "border-blue-500 bg-blue-500" : "border-gray-300 bg-white"
                }`}
              />
              {i < steps.length - 1 && <div className="w-px h-8 bg-gray-200 mt-1" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Day</span>
                <input
                  type="number"
                  value={days[i]}
                  onChange={(e) => onDayChange(i, Number(e.target.value))}
                  className="w-12 text-xs border border-gray-200 rounded px-1.5 py-0.5 text-center focus:outline-none focus:ring-1 focus:ring-blue-400"
                  min={1}
                />
              </div>
              <div className="font-medium text-sm text-gray-900 mt-1">{s.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
            </div>
            <button
              onClick={() => onToggle(i)}
              className={`mt-1 shrink-0 w-9 h-5 rounded-full relative transition-colors ${
                enabled[i] ? "bg-blue-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                  enabled[i] ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function MessageComposer({
  tone,
  text,
  onTone,
  onText,
}: {
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
                tone === t
                  ? "border-blue-600 bg-blue-50 text-blue-700 font-medium"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
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

function LabelConfigurator({
  label,
  onChange,
}: {
  label: string;
  onChange: (v: string) => void;
}) {
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
  playName,
  label,
  accountCount,
  repCount,
  cadenceSteps,
  repMessage,
  onNameChange,
  onLaunch,
  launched,
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
        <div className="text-2xl mb-2">🚀</div>
        <h3 className="font-semibold text-green-800 text-base">
          Play launched. 4 reps have been notified.
        </h3>
        <button className="mt-3 text-blue-600 text-sm hover:underline">
          View live play dashboard →
        </button>
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
          <span className="inline-block bg-blue-50 border border-blue-200 text-blue-700 text-xs font-medium px-2.5 py-0.5 rounded-full">
            {label}
          </span>
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
            {cadenceSteps
              .filter((s) => s.enabled)
              .map((s) => (
                <span key={s.title} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                  Day {s.day} · {s.title}
                </span>
              ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">Rep message</div>
          <p className="text-xs text-gray-700 italic">
            &ldquo;{repMessage.split(".")[0]}.&rdquo;
          </p>
        </div>
      </div>
      <div className="px-4 pb-4">
        <button
          onClick={onLaunch}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm py-2.5 rounded-lg transition-colors"
        >
          Launch play
        </button>
      </div>
    </div>
  );
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { label: "Dashboard", icon: "⊞" },
  { label: "Companies", icon: "🏢" },
  { label: "Notes", icon: "📝" },
  { label: "Plays", icon: "▶", active: true },
  { label: "Tasks", icon: "☑" },
  { label: "Opportunities", icon: "💰" },
  { label: "Reports", icon: "📊" },
  { label: "Promotions", icon: "🏷" },
  { label: "Maps", icon: "📍" },
];

function Sidebar() {
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
        {NAV_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded cursor-pointer text-xs transition-colors ${
              item.active
                ? "bg-[#334155] text-white font-medium"
                : "text-slate-400 hover:text-white hover:bg-[#1E293B]"
            }`}
          >
            <span className="w-4 text-center text-sm">{item.icon}</span>
            <span>{item.label}</span>
            {item.active && (
              <span className="ml-auto w-1 h-4 bg-blue-500 rounded-full" />
            )}
          </div>
        ))}
      </nav>
      <div className="p-2 border-t border-slate-700">
        <div className="flex items-center justify-center py-1.5 text-slate-400 hover:text-white cursor-pointer text-xs rounded hover:bg-[#1E293B] transition-colors">
          ◀ Collapse
        </div>
      </div>
    </aside>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function PlaybookBuilder() {
  const [stage, setStage] = useState<Stage>("goal");
  const [goalInput, setGoalInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [launched, setLaunched] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Component state
  const [accounts, setAccounts] = useState([...ACCOUNTS]);
  const [cadenceDays, setCadenceDays] = useState(CADENCE_STEPS.map((s) => s.day));
  const [cadenceEnabled, setCadenceEnabled] = useState(CADENCE_STEPS.map(() => true));
  const [tone, setTone] = useState<keyof typeof MESSAGES>("Direct");
  const [repMessage, setRepMessage] = useState(MESSAGES["Direct"]);
  const [playLabel, setPlayLabel] = useState("Retention — Q3 2026");
  const [playName, setPlayName] = useState("Revenue Protection Play");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const callAPI = async (
    userMessage: string,
    currentStage: Stage
  ): Promise<{ message: string; nextComponent: ComponentType }> => {
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

  const handleSubmitGoal = async () => {
    if (!goalInput.trim() || loading) return;
    const userText = goalInput.trim();
    setMessages([{ role: "user", text: userText }]);
    setLoading(true);

    setTimeout(async () => {
      const result = await callAPI(userText, "goal");
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.message, component: result.nextComponent },
      ]);
      setStage("accounts");
      setLoading(false);
    }, 800);
  };

  const handleContinue = async () => {
    const currentIdx = STAGE_ORDER.indexOf(stage);
    if (currentIdx >= STAGE_ORDER.length - 1 || loading) return;
    const nextStage = STAGE_ORDER[currentIdx + 1] as Stage;

    setLoading(true);
    setTimeout(async () => {
      const result = await callAPI(`Confirmed: ${stage}`, stage);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: result.message, component: result.nextComponent },
      ]);
      setStage(nextStage);
      setLoading(false);
    }, 800);
  };

  const handleToneChange = (t: keyof typeof MESSAGES) => {
    setTone(t);
    setRepMessage(MESSAGES[t]);
  };

  const cadenceStepsWithEnabled = CADENCE_STEPS.map((s, i) => ({
    ...s,
    day: cadenceDays[i],
    enabled: cadenceEnabled[i],
  }));

  const isInChat = messages.length > 0;
  const isLastStage = stage === "launch";

  return (
    <div className="flex h-screen overflow-hidden bg-white" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Top bar */}
        <header className="flex items-center justify-between px-8 py-3.5 border-b border-gray-200 shrink-0 bg-white">
          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-80">
            <svg className="w-4 h-4 text-gray-400 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-gray-400 text-sm">Search</span>
          </div>
          <div className="flex items-center gap-3">
            <button className="border border-blue-600 text-blue-600 text-sm px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-1.5">
              New
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button className="text-gray-500 text-sm flex items-center gap-1.5 px-2 py-1.5 rounded hover:bg-gray-50 transition-colors">
              Scott Miller
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {!isInChat ? (
            /* Starting state */
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
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-600 mb-3">Or start with a suggestion:</p>
                  <div className="grid grid-cols-3 gap-3">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        onClick={() => setGoalInput(s.label)}
                        className="bg-white border border-gray-200 rounded-lg p-4 text-left hover:border-blue-300 hover:bg-blue-50/30 transition-colors"
                      >
                        <div className={`${s.bg} w-10 h-10 rounded-lg flex items-center justify-center text-lg mb-3`}>
                          {s.icon}
                        </div>
                        <div className="font-semibold text-gray-900 text-sm">{s.label}</div>
                        <div className="text-gray-500 text-xs mt-1">{s.sub}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Chat view */
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
                            onRemove={(idx) =>
                              setAccounts((prev) => prev.filter((_, j) => j !== idx))
                            }
                          />
                        </div>
                      )}
                      {msg.component === "nudgeCadence" && (
                        <div className="ml-8 w-full">
                          <NudgeCadence
                            steps={CADENCE_STEPS}
                            days={cadenceDays}
                            enabled={cadenceEnabled}
                            onDayChange={(idx, val) =>
                              setCadenceDays((prev) => prev.map((d, j) => (j === idx ? val : d)))
                            }
                            onToggle={(idx) =>
                              setCadenceEnabled((prev) => prev.map((e, j) => (j === idx ? !e : e)))
                            }
                          />
                        </div>
                      )}
                      {msg.component === "messageComposer" && (
                        <div className="ml-8 w-full">
                          <MessageComposer
                            tone={tone}
                            text={repMessage}
                            onTone={handleToneChange}
                            onText={setRepMessage}
                          />
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
            <button className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </button>
            <div className="flex items-center gap-3">
              <button className="text-gray-500 hover:text-gray-700 text-sm px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                Save as Draft
              </button>
              <button
                onClick={isInChat ? handleContinue : handleSubmitGoal}
                disabled={
                  loading ||
                  (!isInChat && !goalInput.trim()) ||
                  (isInChat && isLastStage) ||
                  launched
                }
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm px-6 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
              >
                Continue
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
