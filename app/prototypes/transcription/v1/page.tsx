"use client";

// Prototype: Transcription
// Type: mobile
// Status: in-progress
// Created: 2026-03-30

import { useState, useEffect, useRef } from "react";
import {
  X,
  Check,
  Microphone,
  Pause,
  Play,
  UserCircle,
  Tag,
  CheckSquare,
  Paperclip,
  Buildings,
  Waveform,
} from "@phosphor-icons/react";

// ── Types ─────────────────────────────────────────────────────────────────────

type Stage = "idle" | "recording" | "transcribing" | "parsed";
type ParsingPhase = "reading" | "contact" | "tag" | "task" | "done" | null;

// ── Constants ─────────────────────────────────────────────────────────────────

const TRANSCRIPT =
  "Spoke with Maria at Mountain Line Logistics about their ongoing issues with tire wear. " +
  "I recommended our premium long-haul tires and she wants to order four of part number " +
  "295/75R22.5 for a trial on one of her trucks. Create a follow-up for a fleet inspection " +
  "next Tuesday.";

const WORDS = TRANSCRIPT.split(" ");

// Deterministic bar configs (avoid SSR/hydration mismatch)
const BARS: { min: number; max: number; dur: number; del: number }[] = [
  { min: 3, max: 14, dur: 0.55, del: 0.00 },
  { min: 2, max: 8,  dur: 0.42, del: 0.08 },
  { min: 4, max: 18, dur: 0.67, del: 0.15 },
  { min: 2, max: 10, dur: 0.48, del: 0.22 },
  { min: 5, max: 22, dur: 0.73, del: 0.05 },
  { min: 2, max: 7,  dur: 0.39, del: 0.18 },
  { min: 3, max: 16, dur: 0.61, del: 0.12 },
  { min: 4, max: 12, dur: 0.52, del: 0.25 },
  { min: 2, max: 9,  dur: 0.45, del: 0.03 },
  { min: 5, max: 24, dur: 0.68, del: 0.20 },
  { min: 3, max: 13, dur: 0.57, del: 0.10 },
  { min: 2, max: 8,  dur: 0.43, del: 0.17 },
  { min: 4, max: 20, dur: 0.71, del: 0.07 },
  { min: 2, max: 11, dur: 0.49, del: 0.23 },
  { min: 3, max: 15, dur: 0.64, del: 0.14 },
  { min: 5, max: 21, dur: 0.58, del: 0.02 },
  { min: 2, max: 9,  dur: 0.41, del: 0.19 },
  { min: 4, max: 18, dur: 0.69, del: 0.11 },
  { min: 3, max: 12, dur: 0.53, del: 0.16 },
  { min: 2, max: 8,  dur: 0.46, del: 0.24 },
  { min: 5, max: 19, dur: 0.75, del: 0.06 },
  { min: 3, max: 14, dur: 0.60, del: 0.13 },
  { min: 2, max: 7,  dur: 0.38, del: 0.21 },
  { min: 4, max: 13, dur: 0.66, del: 0.09 },
];

// ── Main component ────────────────────────────────────────────────────────────

export default function Transcription() {
  const [stage, setStage] = useState<Stage>("idle");
  const [sheetVisible, setSheetVisible] = useState(false);
  const [dots, setDots] = useState(".");
  const [wordCount, setWordCount] = useState(0);
  const [parsingPhase, setParsingPhase] = useState<ParsingPhase>(null);
  const [showContacts, setShowContacts] = useState(false);
  const [contactsVisible, setContactsVisible] = useState(false);
  const [showTags, setShowTags] = useState(false);
  const [tagsVisible, setTagsVisible] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [tasksVisible, setTasksVisible] = useState(false);

  const contactsRef = useRef<HTMLDivElement>(null);
  const tagsRef = useRef<HTMLDivElement>(null);
  const tasksRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showContacts) return;
    const t = setTimeout(() => contactsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    return () => clearTimeout(t);
  }, [showContacts]);
  useEffect(() => {
    if (!showTags) return;
    const t = setTimeout(() => tagsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    return () => clearTimeout(t);
  }, [showTags]);
  useEffect(() => {
    if (!showTasks) return;
    const t = setTimeout(() => tasksRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    return () => clearTimeout(t);
  }, [showTasks]);

  // Slide the recording sheet in after paint
  useEffect(() => {
    if (stage === "recording") {
      const t = setTimeout(() => setSheetVisible(true), 20);
      return () => clearTimeout(t);
    } else {
      setSheetVisible(false);
    }
  }, [stage]);

  // Animate the "Transcribing…" dots
  useEffect(() => {
    if (stage !== "transcribing") return;
    const id = setInterval(() => {
      setDots(d => (d.length >= 3 ? "." : d + "."));
    }, 400);
    return () => clearInterval(id);
  }, [stage]);

  // Main transcription sequence: 2 s pause → word stream → parsing phase → cascade sections
  useEffect(() => {
    if (stage !== "transcribing") return;
    const timers: ReturnType<typeof setTimeout>[] = [];

    timers.push(
      setTimeout(() => {
        WORDS.forEach((_, i) => {
          timers.push(
            setTimeout(() => {
              setWordCount(i + 1);
              if (i === WORDS.length - 1) {
                // Parsing text appears
                timers.push(setTimeout(() => setParsingPhase("reading"),  300));
                // Contacts row materialises, then chip resolves
                timers.push(setTimeout(() => setShowContacts(true),      1100));
                timers.push(setTimeout(() => { setContactsVisible(true); setParsingPhase("contact"); }, 1800));
                // Tags row
                timers.push(setTimeout(() => setShowTags(true),          2600));
                timers.push(setTimeout(() => { setTagsVisible(true); setParsingPhase("tag"); },        3300));
                // Tasks row
                timers.push(setTimeout(() => setShowTasks(true),         4100));
                timers.push(setTimeout(() => { setTasksVisible(true); setParsingPhase("task"); },      4800));
                // Done — parsing text fades out
                timers.push(setTimeout(() => { setParsingPhase("done"); setStage("parsed"); }, 5600));
              }
            }, i * 55),
          );
        });
      }, 2000),
    );

    return () => timers.forEach(clearTimeout);
  }, [stage]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  function resetState() {
    setWordCount(0);
    setParsingPhase(null);
    setShowContacts(false);
    setContactsVisible(false);
    setShowTags(false);
    setTagsVisible(false);
    setShowTasks(false);
    setTasksVisible(false);
    setDots(".");
  }

  const handleClose = () => { resetState(); setStage("idle"); };
  const cancelRecording = () => setStage("idle");
  const saveRecording = () => { resetState(); setStage("transcribing"); };

  const isPost = stage === "transcribing" || stage === "parsed";

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="w-full h-full bg-[#f1f5f9] overflow-hidden relative flex flex-col">
      {/* Custom keyframes */}
      <style>{`
        @keyframes audioBar {
          from { height: var(--bar-min); }
          to   { height: var(--bar-max); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0);   opacity: 0.35; }
          30%            { transform: translateY(-6px); opacity: 1;   }
        }
        @keyframes shimmer {
          from { background-position: -200% 0; }
          to   { background-position:  200% 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0);   }
        }
        .shimmer-pill {
          background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
        .shimmer-block {
          background: linear-gradient(90deg, #f1f5f9 25%, #e8eef4 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.6s ease-in-out infinite;
        }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between px-6 pt-8 pb-2 shrink-0">
        <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center">
          <X size={22} weight="bold" color="#020617" />
        </button>
        <span className="text-[13px] font-medium text-[#020617]">New note</span>
        <button
          className="h-8 px-3 bg-[#0564ff] rounded-full flex items-center justify-center"
          style={{ opacity: isPost ? 1 : 0.35, transition: "opacity 0.4s" }}
        >
          <Check size={16} weight="bold" color="white" />
        </button>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-y-auto px-6 pt-2 pb-10 flex flex-col gap-3">

        {/* Card 1 · Interaction type + Company */}
        <div className="bg-white rounded-2xl px-4 pt-4 pb-2">
          <p className="text-[11px] text-[#94a3b8] leading-tight mb-1">Interaction type*</p>
          <div className="flex items-center gap-2 h-11">
            <span className="bg-[#d7ebff] text-[#0955ea] text-[11px] px-2 h-6 rounded-full flex items-center gap-1">
              <Check size={10} weight="bold" color="#0955ea" />
              In-person
            </span>
            {["Email", "Text", "Call"].map(label => (
              <span
                key={label}
                className="bg-[#f1f5f9] text-[#020617] text-[11px] px-2 h-6 rounded-full flex items-center"
              >
                {label}
              </span>
            ))}
          </div>
          <div className="h-px bg-[#e2e8f0] -mx-4 my-1" />
          <p className="text-[11px] text-[#94a3b8] leading-tight">Company*</p>
          <div className="flex items-center justify-between h-11">
            <div className="flex items-center gap-2">
              <Buildings size={20} color="#64748b" />
              <span className="text-[15px] text-[#020617]">Mountain Line Logistics</span>
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>

        {/* Card 2 · Note */}
        <div className="bg-white rounded-2xl px-4 pt-1 pb-4">
          <div className="h-11 flex items-center">
            <span className="flex-1 text-[11px] text-[#94a3b8]" style={{ fontWeight: 475 }}>
              Note*
            </span>
          </div>

          {!isPost ? (
            /* Idle: placeholder + record button */
            <div className="flex flex-col gap-4">
              <p className="text-[15px] text-[#64748b] leading-relaxed -mt-1">
                Tap to type your note. Use @ to mention someone.
              </p>
              <div className="bg-[#f1f5f9] rounded-lg px-8 py-6 flex flex-col items-center gap-2">
                <button
                  onClick={() => setStage("recording")}
                  className="bg-[#0564ff] w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                >
                  <Microphone size={16} weight="fill" color="white" />
                </button>
                <span className="text-[13px] text-[#64748b]">Record your note</span>
              </div>
            </div>
          ) : (
            /* Post-recording: transcribing animation → streamed text */
            <div className="flex flex-col gap-3">
              {/* Transcribing indicator — centered, 5 dots, label below */}
              {wordCount === 0 && (
                <div className="flex flex-col items-center gap-3 py-5">
                  <div className="flex items-center gap-[10px]">
                    {[0, 1, 2, 3, 4].map(i => (
                      <div
                        key={i}
                        className="w-2 h-2 bg-[#0564ff] rounded-full"
                        style={{
                          animation: "dotBounce 1.3s ease-in-out infinite",
                          animationDelay: `${i * 0.13}s`,
                        }}
                      />
                    ))}
                  </div>
                  <span className="text-[13px] text-[#94a3b8] tracking-wide">
                    Transcribing{dots}
                  </span>
                </div>
              )}

              {/* Streaming text */}
              {wordCount > 0 && (
                <p className="text-[15px] text-[#020617] leading-relaxed -mt-1">
                  {WORDS.slice(0, wordCount).join(" ")}
                  {wordCount < WORDS.length && (
                    <span
                      className="inline-block w-0.5 h-[15px] bg-[#0564ff] ml-0.5 align-middle rounded-full"
                      style={{ animation: "blink 0.9s ease-in-out infinite" }}
                    />
                  )}
                </p>
              )}

              {/* Audio playback bar — always present in post state */}
              <div className="bg-[#e2e8f0] rounded-lg px-2 h-11 flex items-center gap-2">
                <Waveform size={20} color="#64748b" />
                <div className="flex-1 h-1 bg-[#cbd5e1] rounded-full overflow-hidden">
                  <div className="h-full bg-[#0564ff] rounded-full" style={{ width: "30%" }} />
                </div>
                <span className="text-[12px] text-[#020617]">0:19</span>
                <div className="bg-[#0564ff] w-8 h-8 rounded-lg flex items-center justify-center shrink-0">
                  <Play size={13} weight="fill" color="white" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Contacts row ── */}
        {!isPost ? (
          <div className="bg-white rounded-xl px-4 h-11 flex items-center gap-2 opacity-45">
            <UserCircle size={20} color="#64748b" />
            <span className="text-[15px] text-[#64748b]">Contacts</span>
          </div>
        ) : showContacts && (
          <div
            ref={contactsRef}
            className="bg-white rounded-xl px-4"
            style={{
              opacity: showContacts ? 1 : 0,
              transform: showContacts ? "translateY(0)" : "translateY(8px)",
              transition: "opacity 0.4s, transform 0.4s",
            }}
          >
            <div className="flex items-center justify-between h-11">
              <div className="flex items-center gap-2">
                <UserCircle size={20} color="#64748b" />
                <span className="text-[15px] text-[#64748b]">Contacts</span>
              </div>
              <AddBtn />
            </div>
            <div className="pb-2 relative" style={{ minHeight: "28px" }}>
              <div
                className="absolute inset-0 flex items-center"
                style={{ opacity: contactsVisible ? 0 : 1, transition: "opacity 0.3s" }}
              >
                <div className="shimmer-pill h-6 w-24 rounded-full" />
              </div>
              <div
                className="flex flex-wrap gap-1"
                style={{
                  opacity: contactsVisible ? 1 : 0,
                  transform: contactsVisible ? "translateY(0)" : "translateY(5px)",
                  transition: "opacity 0.4s, transform 0.4s",
                }}
              >
                <Chip label="Maria Rojas" />
              </div>
            </div>
          </div>
        )}

        {/* ── Bottom rows (dimmed in idle, populated in post) ── */}
        {!isPost ? (
          <>
            {[
              { icon: <Paperclip size={20} color="#64748b" />, label: "Images or files" },
              { icon: <Tag size={20} color="#64748b" />, label: "Tags" },
              { icon: <CheckSquare size={20} color="#64748b" />, label: "Tasks" },
            ].map(({ icon, label }) => (
              <div key={label} className="bg-white rounded-xl px-4 h-11 flex items-center gap-2 opacity-45">
                {icon}
                <span className="text-[15px] text-[#64748b]">{label}</span>
              </div>
            ))}
          </>
        ) : (
          <>
            {/* Tags */}
            {showTags && (
              <div
                ref={tagsRef}
                className="bg-white rounded-xl px-4"
                style={{
                  opacity: showTags ? 1 : 0,
                  transform: showTags ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s, transform 0.4s",
                }}
              >
                <div className="flex items-center justify-between h-11">
                  <div className="flex items-center gap-2">
                    <Tag size={20} color="#64748b" />
                    <span className="text-[15px] text-[#64748b]">Tags</span>
                  </div>
                  <AddBtn />
                </div>
                <div className="pb-2 relative" style={{ minHeight: "28px" }}>
                  <div
                    className="absolute inset-0 flex items-center"
                    style={{ opacity: tagsVisible ? 0 : 1, transition: "opacity 0.3s" }}
                  >
                    <div className="shimmer-pill h-6 w-32 rounded-full" />
                  </div>
                  <div
                    className="flex flex-wrap gap-1"
                    style={{
                      opacity: tagsVisible ? 1 : 0,
                      transform: tagsVisible ? "translateY(0)" : "translateY(5px)",
                      transition: "opacity 0.4s, transform 0.4s",
                    }}
                  >
                    <Chip label="Parts - Request" />
                  </div>
                </div>
              </div>
            )}

            {/* Tasks */}
            {showTasks && (
              <div
                ref={tasksRef}
                className="bg-white rounded-xl px-4"
                style={{
                  opacity: showTasks ? 1 : 0,
                  transform: showTasks ? "translateY(0)" : "translateY(8px)",
                  transition: "opacity 0.4s, transform 0.4s",
                }}
              >
                <div className="flex items-center justify-between h-11">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={20} color="#64748b" />
                    <span className="text-[15px] text-[#64748b]">Tasks</span>
                  </div>
                  <AddBtn />
                </div>
                <div className="pb-4 pt-1 relative" style={{ minHeight: "100px" }}>
                  <div
                    className="absolute inset-x-0 top-1"
                    style={{ opacity: tasksVisible ? 0 : 1, transition: "opacity 0.3s" }}
                  >
                    <div className="shimmer-block rounded-lg h-[90px] w-full" />
                  </div>
                  <div
                    style={{
                      opacity: tasksVisible ? 1 : 0,
                      transform: tasksVisible ? "translateY(0)" : "translateY(5px)",
                      transition: "opacity 0.4s, transform 0.4s",
                    }}
                  >
                    <TaskCard />
                  </div>
                </div>
              </div>
            )}

            {/* ── Parsing status text ── */}
            <ParsingStatus phase={parsingPhase} />
          </>
        )}
      </div>

      {/* ── Recording bottom sheet ── */}
      {stage === "recording" && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={cancelRecording}
            style={{ opacity: sheetVisible ? 1 : 0, transition: "opacity 0.3s" }}
          />

          {/* Sheet panel */}
          <div
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl overflow-hidden"
            style={{
              height: "87%",
              transform: sheetVisible ? "translateY(0)" : "translateY(100%)",
              transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
            }}
          >
            {/* Sheet header */}
            <div className="relative flex items-center px-6 py-4">
              <button onClick={cancelRecording} className="w-8 h-8 flex items-center justify-center">
                <X size={20} weight="bold" color="#020617" />
              </button>
              <span className="absolute left-1/2 -translate-x-1/2 text-[13px] font-medium text-[#020617]">
                Record note
              </span>
            </div>

            {/* Recording content */}
            <div
              className="mx-6 bg-[#f1f5f9] rounded-lg p-8 flex flex-col items-center justify-between"
              style={{ height: "calc(100% - 76px)" }}
            >
              <p className="text-[17px] text-[#020617]">Listening...</p>

              {/* Animated audiometer */}
              <div className="flex items-end gap-[3px]" style={{ height: "36px" }}>
                {BARS.map((bar, i) => (
                  <div
                    key={i}
                    className="w-[2.5px] bg-[#0564ff] rounded-full"
                    style={
                      {
                        "--bar-min": `${bar.min}px`,
                        "--bar-max": `${bar.max}px`,
                        height: `${bar.min}px`,
                        animationName: "audioBar",
                        animationDuration: `${bar.dur}s`,
                        animationDelay: `${bar.del}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                        animationDirection: "alternate",
                      } as React.CSSProperties
                    }
                  />
                ))}
              </div>

              {/* Controls */}
              <div className="flex flex-col items-center gap-1.5">
                <div className="flex items-center gap-5">
                  <button onClick={cancelRecording} className="w-11 h-11 flex items-center justify-center">
                    <X size={22} color="#020617" />
                  </button>
                  <button
                    onClick={saveRecording}
                    className="h-8 px-5 bg-[#0564ff] rounded-full flex items-center justify-center active:scale-95 transition-transform"
                  >
                    <Check size={20} weight="bold" color="white" />
                  </button>
                  <button className="w-11 h-11 flex items-center justify-center opacity-50">
                    <Pause size={22} color="#020617" />
                  </button>
                </div>
                <span className="text-[13px] text-[#020617]">0:19</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Chip({ label }: { label: string }) {
  return (
    <span className="bg-[#f1f5f9] text-[#020617] text-[11px] px-2 h-6 rounded-full flex items-center gap-1">
      {label}
      <X size={9} weight="bold" color="#94a3b8" />
    </span>
  );
}

function AddBtn() {
  return (
    <button className="w-11 h-11 flex items-center justify-end shrink-0">
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7.5" stroke="#94a3b8" strokeWidth="1.2" />
        <path d="M10 6.5v7M6.5 10h7" stroke="#94a3b8" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </button>
  );
}

const PARSING_MESSAGES: Record<NonNullable<ParsingPhase>, string> = {
  reading:  "Parsing your note\u2026",
  contact:  "Found a contact \u00b7 Maria Rojas",
  tag:      "Suggested a tag \u00b7 Parts \u2013 Request",
  task:     "Scheduled a follow-up \u00b7 Fleet inspection",
  done:     "",
};

function ParsingStatus({ phase }: { phase: ParsingPhase }) {
  if (!phase || phase === "done") return null;
  const text = PARSING_MESSAGES[phase];
  const isDone = phase === "task";
  return (
    <div
      key={phase}
      className="flex items-center gap-2 px-1"
      style={{ animation: "fadeSlideIn 0.35s ease both" }}
    >
      {isDone ? (
        <span className="w-4 h-4 rounded-full bg-[#dcfce7] flex items-center justify-center shrink-0">
          <Check size={9} weight="bold" color="#16a34a" />
        </span>
      ) : (
        <span className="flex gap-[3px] items-center shrink-0">
          {[0, 1, 2].map(i => (
            <span
              key={i}
              className="w-1 h-1 rounded-full bg-[#94a3b8]"
              style={{
                animation: "dotBounce 1.3s ease-in-out infinite",
                animationDelay: `${i * 0.18}s`,
              }}
            />
          ))}
        </span>
      )}
      <span className="text-[13px] text-[#64748b]">{text}</span>
    </div>
  );
}

function TaskCard() {
  return (
    <div className="relative border border-[#e2e8f0] rounded-lg p-3 bg-white">
      <div className="flex flex-col gap-2">
        <div className="flex gap-1">
          <span className="bg-[#d7ebff] text-[#020617] text-[11px] px-2 h-6 rounded flex items-center">
            June 14
          </span>
          <span className="border border-[#cbd5e1] text-[#020617] text-[11px] px-2 h-6 rounded flex items-center">
            9:00am
          </span>
        </div>
        <div className="bg-[#f1f5f9] rounded-lg p-3 flex flex-col gap-1.5">
          <div className="flex items-center gap-1.5">
            <div className="bg-[#d7ebff] w-6 h-6 rounded-full flex items-center justify-center shrink-0">
              <Buildings size={12} color="#0564ff" />
            </div>
            <span className="text-[11px] font-semibold text-[#020617] leading-tight">
              Mountain Line Logistics
            </span>
          </div>
          <span className="text-[13px] text-[#020617]">Fleet inspection for Maria's fleet</span>
        </div>
      </div>
      <button className="absolute -top-3 -right-3 bg-[#e2e8f0] w-6 h-6 rounded-full flex items-center justify-center">
        <X size={10} weight="bold" color="#64748b" />
      </button>
    </div>
  );
}
