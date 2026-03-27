"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  CaretLeft,
  MagnifyingGlass,
  Sliders,
  Plus,
  Buildings,
  DotsThree,
  ArrowSquareOut,
  CheckCircle,
  CaretRight,
  X,
  Check,
  HardHat,
  Wrench,
} from "@phosphor-icons/react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const BLUE = "#0564FF";
const TEXT_PRIMARY = "#020617";
const TEXT_SECONDARY = "#64748B";
const TEXT_TERTIARY = "#94A3B8";
const SURFACE_0 = "#FFFFFF";
const SURFACE_1 = "#F8FAFC";
const SURFACE_2 = "#F1F5F9";
const BORDER = "#E2E8F0";
const ACTIVE_CHIP = "#CCF9E3";
const FONT = "Sora, sans-serif";
const SHADOW_HIGH = "0px 4px 12px rgba(0,0,0,0.15)";
const SPRING = "cubic-bezier(0.34, 1.56, 0.64, 1)";

type Screen = "map" | "form" | "pinpoint" | "empty-jobsite" | "role-select" | "add-company" | "filled-jobsite";
type Status = "Active" | "Pending" | "Completed";
type Role = "General Contractor" | "Subcontractor";

interface CompanyEntry { name: string; role: Role; }

const COMPANIES = [
  { name: "Turner Construction", role: "General Contractor" as Role, initial: "T" },
  { name: "Hensel Phelps", role: "General Contractor" as Role, initial: "H" },
  { name: "Skanska USA", role: "Subcontractor" as Role, initial: "S" },
  { name: "Mortenson", role: "Subcontractor" as Role, initial: "M" },
  { name: "McCarthy Building", role: "Subcontractor" as Role, initial: "M" },
  { name: "DPR Construction", role: "Subcontractor" as Role, initial: "D" },
  { name: "Balfour Beatty", role: "Subcontractor" as Role, initial: "B" },
  { name: "Gilbane Building", role: "Subcontractor" as Role, initial: "G" },
];

const MAP_PINS = [
  { top: "18%", left: "12%" },
  { top: "25%", left: "55%" },
  { top: "32%", left: "30%" },
  { top: "42%", left: "72%" },
  { top: "48%", left: "18%" },
  { top: "55%", left: "45%" },
  { top: "20%", left: "80%" },
  { top: "62%", left: "65%" },
  { top: "38%", left: "88%" },
];

const VALUE_RANGES = ["<$500,000", "$500,000 - $1M", "$1M - $5M", "$5M - $10M", "$10M - $50M", "Custom Amount"];
const AVATAR_COLORS = ["#EFF6FF", "#F0FDF4", "#FFF7ED", "#FDF4FF", "#FFF1F2", "#F0FDFA", "#FEFCE8", "#EFF6FF"];

// ─── Shared primitives ────────────────────────────────────────────────────────

function CircleBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 9999, background: SURFACE_0,
      boxShadow: SHADOW_HIGH, border: "none", display: "flex", alignItems: "center",
      justifyContent: "center", cursor: "pointer", flexShrink: 0,
    }}>{children}</button>
  );
}

function DragHandle() {
  return (
    <div style={{ display: "flex", justifyContent: "center", paddingTop: 10, paddingBottom: 6, flexShrink: 0 }}>
      <div style={{ width: 47, height: 4, borderRadius: 9999, background: "#CBD5E1" }} />
    </div>
  );
}

function BluePillBtn({ label, onClick, height = 48, fontSize = 15 }: { label: string; onClick?: () => void; height?: number; fontSize?: number }) {
  return (
    <button onClick={onClick} style={{
      width: "100%", height, borderRadius: 9999, background: BLUE, border: "none",
      color: SURFACE_0, fontSize, fontFamily: FONT, fontWeight: 600, cursor: "pointer", flexShrink: 0,
    }}>{label}</button>
  );
}

function MapPinMarker({ style }: { style?: React.CSSProperties }) {
  return (
    <div style={{ position: "absolute", display: "flex", flexDirection: "column", alignItems: "center", ...style }}>
      <div style={{ background: BLUE, borderRadius: 9999, padding: "4px 8px", display: "flex", alignItems: "center", gap: 4, boxShadow: "0px 2px 6px rgba(5,100,255,0.4)" }}>
        <Buildings size={12} color="#fff" weight="fill" />
      </div>
      <div style={{ width: 2, height: 6, background: BLUE, marginTop: -1 }} />
      <div style={{ width: 4, height: 4, borderRadius: 9999, background: BLUE, marginTop: -2 }} />
    </div>
  );
}

// ─── Project Value Sheet ──────────────────────────────────────────────────────

function ValueSheet({ value, onChange, onClose }: {
  value: string; onChange: (v: string) => void; onClose: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [customAmt, setCustomAmt] = useState("");
  const [customVisible, setCustomVisible] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const select = (range: string) => {
    onChange(range);
    if (range === "Custom Amount") {
      setCustomVisible(true);
      setTimeout(() => customInputRef.current?.focus(), 200);
    } else {
      setCustomVisible(false);
      setCustomAmt("");
    }
  };

  const confirm = () => {
    if (value === "Custom Amount" && customAmt) onChange(`$${customAmt}`);
    onClose();
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 20 }}>
      <div style={{
        position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)",
        opacity: visible ? 1 : 0, transition: "opacity 200ms ease",
      }} onClick={onClose} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: SURFACE_0, borderRadius: "16px 16px 0 0",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform 350ms ${SPRING}`,
        display: "flex", flexDirection: "column",
      }}>
        <DragHandle />
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 20px 16px" }}>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color={TEXT_PRIMARY} weight="bold" />
          </button>
          <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 700, color: TEXT_PRIMARY }}>Estimated Cost</span>
          <button onClick={confirm} style={{
            width: 44, height: 44, borderRadius: 9999, background: BLUE, border: "none",
            display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>
            <Check size={20} color="#fff" weight="bold" />
          </button>
        </div>

        {/* Radio list */}
        <div style={{ padding: "0 20px 8px" }}>
          {VALUE_RANGES.map(range => (
            <div key={range}>
              <button onClick={() => select(range)} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 0", background: "none", border: "none", cursor: "pointer",
                borderBottom: `1px solid ${BORDER}`,
              }}>
                <span style={{ fontFamily: FONT, fontSize: 16, fontWeight: 500, color: TEXT_PRIMARY }}>{range}</span>
                <div style={{
                  width: 24, height: 24, borderRadius: 9999,
                  border: `2px solid ${value === range ? BLUE : "#CBD5E1"}`,
                  background: value === range ? BLUE : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 150ms ease",
                }}>
                  {value === range && <div style={{ width: 8, height: 8, borderRadius: 9999, background: SURFACE_0 }} />}
                </div>
              </button>

              {/* Custom amount input — animates in when selected */}
              {range === "Custom Amount" && (
                <div style={{
                  overflow: "hidden",
                  maxHeight: customVisible ? 80 : 0,
                  opacity: customVisible ? 1 : 0,
                  transition: "max-height 280ms ease, opacity 220ms ease",
                }}>
                  <div style={{ padding: "10px 0 16px" }}>
                    <div style={{
                      border: `2px solid ${BLUE}`, borderRadius: 10,
                      padding: "8px 14px",
                    }}>
                      <div style={{ fontFamily: FONT, fontSize: 11, color: TEXT_TERTIARY, marginBottom: 2 }}>Custom amount</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <span style={{ fontFamily: FONT, fontSize: 16, color: TEXT_PRIMARY }}>$</span>
                        <input
                          ref={customInputRef}
                          value={customAmt}
                          onChange={e => setCustomAmt(e.target.value)}
                          placeholder="0"
                          inputMode="numeric"
                          style={{
                            flex: 1, border: "none", outline: "none", background: "transparent",
                            fontFamily: FONT, fontSize: 16, color: TEXT_PRIMARY,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}

// ─── Screen 1: Map ────────────────────────────────────────────────────────────

function MapScreen({ onAddLocation }: { onAddLocation: () => void }) {
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <img src="/jobsites-map.png" alt="Map" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />

      {/* Top bar */}
      <div style={{ position: "absolute", top: 66, left: 0, right: 0, display: "flex", alignItems: "center", gap: 8, padding: "0 12px" }}>
        <CircleBtn><CaretLeft size={20} color={TEXT_PRIMARY} weight="bold" /></CircleBtn>
        <div style={{
          flex: 1, height: 44, borderRadius: 9999, background: SURFACE_0, boxShadow: SHADOW_HIGH,
          display: "flex", alignItems: "center", gap: 8, padding: "0 14px",
        }}>
          <MagnifyingGlass size={16} color={TEXT_TERTIARY} />
          <span style={{ fontFamily: FONT, fontSize: 14, color: TEXT_TERTIARY }}>Search places</span>
        </div>
        <CircleBtn><Sliders size={20} color={TEXT_PRIMARY} /></CircleBtn>
      </div>

      {/* Map pins */}
      {MAP_PINS.map((pos, i) => <MapPinMarker key={i} style={{ top: pos.top, left: pos.left }} />)}

      {/* FAB — anchored near bottom */}
      <button onClick={onAddLocation} style={{
        position: "absolute", bottom: 28, right: 16, height: 48, borderRadius: 9999,
        background: BLUE, border: "none", display: "flex", alignItems: "center",
        gap: 8, padding: "0 20px", boxShadow: SHADOW_HIGH, cursor: "pointer",
      }}>
        <Plus size={18} color="#fff" weight="bold" />
        <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 600, color: "#fff" }}>Add location</span>
      </button>

      {/* Home indicator */}
      <div style={{ position: "absolute", bottom: 8, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
        <div style={{ width: 134, height: 5, borderRadius: 9999, background: "rgba(0,0,0,0.18)" }} />
      </div>
    </div>
  );
}

// ─── Screen 2: Form sheet ─────────────────────────────────────────────────────

function FormSheet({ onSetLocation, jobsiteName, setJobsiteName, formData, setFormData, onBack }: {
  onSetLocation: () => void;
  jobsiteName: string; setJobsiteName: (v: string) => void;
  formData: { value: string; startDate: string; endDate: string; status: Status };
  setFormData: (f: any) => void;
  onBack: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [valueSheetOpen, setValueSheetOpen] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const inputStyle: React.CSSProperties = {
    width: "100%", height: 48, borderRadius: 8, border: `1px solid ${BORDER}`,
    padding: "0 14px", fontFamily: FONT, fontSize: 14, color: TEXT_PRIMARY,
    background: SURFACE_0, outline: "none", boxSizing: "border-box",
  };

  const displayValue = formData.value || "Project value";

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <img src="/jobsites-map.png" alt="Map" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }} />
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }} onClick={onBack} />

      {/* Main sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: SURFACE_0, borderRadius: "16px 16px 0 0",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform 350ms ${SPRING}`,
        display: "flex", flexDirection: "column", maxHeight: "88%",
      }}>
        <DragHandle />
        <div style={{ textAlign: "center", paddingBottom: 16, flexShrink: 0 }}>
          <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: TEXT_PRIMARY }}>New Jobsite</span>
        </div>

        <div style={{ overflowY: "auto", flex: 1, padding: "0 24px 24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <label style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY, display: "block", marginBottom: 6 }}>Jobsite Name</label>
              <input style={inputStyle} placeholder="e.g. Downtown Office Complex" value={jobsiteName} onChange={e => setJobsiteName(e.target.value)} />
            </div>

            {/* Project Value — tappable, opens sheet */}
            <div>
              <label style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY, display: "block", marginBottom: 6 }}>Project Value</label>
              <button onClick={() => setValueSheetOpen(true)} style={{
                ...inputStyle, display: "flex", alignItems: "center", gap: 6,
                cursor: "pointer", textAlign: "left", justifyContent: "flex-start",
                color: formData.value ? TEXT_PRIMARY : TEXT_TERTIARY,
                border: `1px solid ${BORDER}`,
              }}>
                <span style={{ fontFamily: FONT, fontSize: 14 }}>
                  {formData.value ? formData.value : "$ 2,500,000"}
                </span>
              </button>
            </div>

            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY, display: "block", marginBottom: 6 }}>Start Date</label>
                <input style={inputStyle} placeholder="Jan 2026" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY, display: "block", marginBottom: 6 }}>End Date</label>
                <input style={inputStyle} placeholder="Oct 2026" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
              </div>
            </div>

            <div>
              <label style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY, display: "block", marginBottom: 6 }}>Status</label>
              <div style={{ display: "flex", gap: 8 }}>
                {(["Active", "Pending", "Completed"] as Status[]).map(s => (
                  <button key={s} onClick={() => setFormData({ ...formData, status: s })} style={{
                    flex: 1, height: 36, borderRadius: 9999,
                    border: `1.5px solid ${formData.status === s ? BLUE : BORDER}`,
                    background: formData.status === s ? BLUE : SURFACE_0,
                    color: formData.status === s ? "#fff" : TEXT_SECONDARY,
                    fontFamily: FONT, fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}>{s}</button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 24px 32px", flexShrink: 0 }}>
          <BluePillBtn label="Set Location" onClick={onSetLocation} />
        </div>
      </div>

      {/* Value picker sheet — floats above main sheet */}
      {valueSheetOpen && (
        <ValueSheet
          value={formData.value}
          onChange={v => setFormData({ ...formData, value: v })}
          onClose={() => setValueSheetOpen(false)}
        />
      )}
    </div>
  );
}

// ─── Screen 3: Pinpoint (drag map, pin stays center) ─────────────────────────

function PinpointScreen({ onConfirm, onBack }: { onConfirm: (offset: { x: number; y: number }) => void; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: mapOffset.x, oy: mapOffset.y };
    setDragging(true);
  }, [mapOffset]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    const dx = e.clientX - dragStart.current.mx;
    const dy = e.clientY - dragStart.current.my;
    // Clamp so map doesn't reveal edges too aggressively
    const clamp = (v: number, limit: number) => Math.max(-limit, Math.min(limit, v));
    setMapOffset({ x: clamp(dragStart.current.ox + dx, 60), y: clamp(dragStart.current.oy + dy, 80) });
  }, []);

  const onPointerUp = useCallback(() => { dragStart.current = null; setDragging(false); }, []);

  // Lat/lng: dragging map left = pin moves east (+lng), dragging map up = pin moves north (-lat via positive offset)
  const lat = (35.6762 - mapOffset.y * 0.0008).toFixed(4);
  const lng = (139.6503 - mapOffset.x * 0.0008).toFixed(4);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
      <style>{`
        @keyframes pulse-ring {
          0% { transform: translate(-50%,-50%) scale(1); opacity: 0.6; }
          100% { transform: translate(-50%,-50%) scale(2.6); opacity: 0; }
        }
      `}</style>

      {/* Draggable map area */}
      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        style={{
          position: "absolute", top: 0, left: 0, right: 0, bottom: 226,
          cursor: dragging ? "grabbing" : "grab", overflow: "hidden", touchAction: "none",
        }}
      >
        <img
          src="/jobsites-map.png"
          alt="Map"
          style={{
            position: "absolute", inset: 0, width: "130%", height: "130%",
            objectFit: "cover", objectPosition: "center 40%",
            transform: `translate(calc(-15% + ${mapOffset.x}px), calc(-10% + ${mapOffset.y}px))`,
            transition: dragging ? "none" : "transform 200ms ease-out",
            pointerEvents: "none",
          }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)", pointerEvents: "none" }} />

        {/* Fixed center pin — does NOT move with map */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -80%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* Pulse ring */}
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            width: 28, height: 28, borderRadius: 9999,
            background: `${BLUE}66`,
            animation: "pulse-ring 2s ease-out infinite",
          }} />
          {/* Pin badge */}
          <div style={{
            background: BLUE, borderRadius: 9999, padding: "7px 14px",
            display: "flex", alignItems: "center", gap: 5,
            boxShadow: "0px 4px 16px rgba(5,100,255,0.5)",
            position: "relative", zIndex: 1,
          }}>
            <Plus size={15} color="#fff" weight="bold" />
          </div>
          <div style={{ width: 2, height: 12, background: BLUE }} />
          <div style={{ width: 5, height: 5, borderRadius: 9999, background: BLUE }} />
        </div>
      </div>

      {/* Back button */}
      <div style={{ position: "absolute", top: 66, left: 12 }}>
        <CircleBtn onClick={onBack}><CaretLeft size={20} color={TEXT_PRIMARY} weight="bold" /></CircleBtn>
      </div>

      {/* Bottom sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: SURFACE_0, borderRadius: "16px 16px 0 0",
        height: visible ? 226 : 0,
        transition: "height 300ms ease-out",
        overflow: "hidden", display: "flex", flexDirection: "column",
      }}>
        <DragHandle />
        <div style={{ flex: 1, padding: "8px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: TEXT_PRIMARY, textAlign: "center" }}>Confirm the jobsite location</span>
          <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_TERTIARY }}>{lat}° N, {lng}° E</span>
        </div>
        <div style={{ padding: "12px 24px 32px", flexShrink: 0 }}>
          <BluePillBtn label="Confirm location" onClick={() => onConfirm({ x: mapOffset.x, y: mapOffset.y })} />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 4: Empty Jobsite ──────────────────────────────────────────────────

function EmptyJobsiteScreen({ onAddCompany, jobsiteName, formData, mapOffset }: {
  onAddCompany: () => void;
  jobsiteName: string;
  formData: { value: string; startDate: string; endDate: string; status: Status };
  mapOffset: { x: number; y: number };
}) {
  const [sheetHeight, setSheetHeight] = useState(226);
  const [pinBuilding, setPinBuilding] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setSheetHeight(470), 50);
    const t2 = setTimeout(() => setPinBuilding(true), 420);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const lat = (35.6762 - mapOffset.y * 0.0008).toFixed(4);
  const lng = (139.6503 - mapOffset.x * 0.0008).toFixed(4);
  const displayName = jobsiteName || "Jobsite Name";
  const displayValue = formData.value || "$2.5m";
  const displayDates = formData.startDate && formData.endDate ? `${formData.startDate} - ${formData.endDate}` : "Jan - Oct, 2026";

  const chipStyle = (bg: string, text: string): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", height: 20, borderRadius: 9999,
    padding: "0 8px", background: bg, fontFamily: FONT, fontSize: 11, fontWeight: 500, color: text,
  });

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: SURFACE_0 }}>
      <style>{`@keyframes pin-bounce { 0%,100%{transform:scale(1)} 40%{transform:scale(1.35)} 70%{transform:scale(0.9)} }`}</style>

      {/* Map area */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: `calc(100% - ${sheetHeight}px)`, transition: `height 350ms ${SPRING}`, overflow: "hidden" }}>
        <img src="/jobsites-map.png" alt="Map" style={{
          width: "130%", height: "130%", objectFit: "cover", objectPosition: "center 40%",
          transform: `translate(calc(-15% + ${mapOffset.x}px), calc(-10% + ${mapOffset.y}px))`,
        }} />
        {MAP_PINS.slice(0, 5).map((pos, i) => <MapPinMarker key={i} style={{ top: pos.top, left: pos.left }} />)}
        {/* Confirmed pin */}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-80%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{
            background: BLUE, borderRadius: 9999, padding: "5px 10px",
            display: "flex", alignItems: "center", gap: 4,
            boxShadow: "0px 4px 12px rgba(5,100,255,0.4)",
            animation: !pinBuilding ? `pin-bounce 420ms ease-out` : "none",
          }}>
            {pinBuilding ? <Buildings size={13} color="#fff" weight="fill" /> : <Plus size={13} color="#fff" weight="bold" />}
          </div>
          <div style={{ width: 2, height: 8, background: BLUE }} />
          <div style={{ width: 4, height: 4, borderRadius: 9999, background: BLUE }} />
        </div>
      </div>

      {/* Bottom panel */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        height: sheetHeight, transition: `height 350ms ${SPRING}`,
        background: SURFACE_1, borderRadius: "24px 24px 0 0",
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <DragHandle />
        <div style={{ margin: "0 16px 12px", background: SURFACE_0, borderRadius: 12, padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 600, color: TEXT_PRIMARY, flex: 1, marginRight: 8 }}>{displayName}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
              <DotsThree size={22} color={TEXT_SECONDARY} weight="bold" />
            </button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span style={chipStyle(ACTIVE_CHIP, "#104435")}>{formData.status}</span>
            <span style={chipStyle(SURFACE_2, TEXT_SECONDARY)}>{displayValue}</span>
            <span style={chipStyle(SURFACE_2, TEXT_SECONDARY)}>{displayDates}</span>
          </div>
          <div style={{ background: SURFACE_2, borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY }}>{lat}° N, {lng}° E</span>
            <ArrowSquareOut size={14} color={TEXT_TERTIARY} />
          </div>
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "0 24px", gap: 8 }}>
          <div style={{ width: 48, height: 48, borderRadius: 9999, background: "#D7EBFF", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
            <Buildings size={22} color={BLUE} weight="fill" />
          </div>
          <span style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>No companies yet</span>
          <span style={{ fontFamily: FONT, fontSize: 13, color: TEXT_SECONDARY, textAlign: "center" }}>
            Add the general contractor or any subcontractors on site.
          </span>
          <button onClick={onAddCompany} style={{
            marginTop: 4, height: 32, borderRadius: 8, background: BLUE,
            border: "none", padding: "0 16px", color: "#fff",
            fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ Add company</button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Select Sheet ────────────────────────────────────────────────────────

function RoleSelectSheet({ onSelect, onBack }: { onSelect: (role: Role) => void; onBack: () => void }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const RoleOption = ({ role, icon, desc }: { role: Role; icon: React.ReactNode; desc: string }) => (
    <button onClick={() => onSelect(role)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 14,
      padding: "16px 20px", background: SURFACE_1, borderRadius: 12,
      border: `1.5px solid ${BORDER}`, cursor: "pointer", textAlign: "left",
      marginBottom: 10,
    }}>
      <div style={{ width: 44, height: 44, borderRadius: 9999, background: "#D7EBFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY, marginBottom: 2 }}>{role}</div>
        <div style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY }}>{desc}</div>
      </div>
      <CaretRight size={16} color={TEXT_TERTIARY} style={{ marginLeft: "auto", flexShrink: 0 }} />
    </button>
  );

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }} onClick={onBack} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: SURFACE_0, borderRadius: "16px 16px 0 0",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform 350ms ${SPRING}`,
        padding: "0 20px 40px",
      }}>
        <DragHandle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, paddingTop: 4 }}>
          <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: TEXT_PRIMARY }}>What type of company?</span>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
            <X size={20} color={TEXT_SECONDARY} />
          </button>
        </div>
        <RoleOption
          role="General Contractor"
          icon={<HardHat size={22} color={BLUE} weight="fill" />}
          desc="Primary contractor managing the site"
        />
        <RoleOption
          role="Subcontractor"
          icon={<Wrench size={22} color={BLUE} weight="fill" />}
          desc="Specialty trade or support contractor"
        />
      </div>
    </div>
  );
}

// ─── Screen 5: Add Company sheet ──────────────────────────────────────────────

function AddCompanySheet({ onDone, onBack, selected, setSelected, addingRole }: {
  onDone: () => void; onBack: () => void;
  selected: CompanyEntry[]; setSelected: (v: CompanyEntry[]) => void;
  addingRole: Role;
}) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  useEffect(() => { const t = setTimeout(() => setVisible(true), 10); return () => clearTimeout(t); }, []);

  const filtered = COMPANIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));
  const sessionSelected = selected.filter(s => s.role === addingRole).map(s => s.name);

  const toggle = (name: string) => {
    const already = selected.find(s => s.name === name && s.role === addingRole);
    if (already) {
      setSelected(selected.filter(s => !(s.name === name && s.role === addingRole)));
    } else {
      setSelected([...selected.filter(s => s.name !== name), { name, role: addingRole }]);
    }
  };

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.4)", opacity: visible ? 1 : 0, transition: "opacity 200ms ease" }} onClick={onBack} />
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        background: SURFACE_0, borderRadius: "16px 16px 0 0",
        transform: visible ? "translateY(0)" : "translateY(100%)",
        transition: `transform 350ms ${SPRING}`,
        display: "flex", flexDirection: "column", maxHeight: "80%",
      }}>
        <DragHandle />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 24px 12px", flexShrink: 0 }}>
          <div>
            <div style={{ fontFamily: FONT, fontSize: 17, fontWeight: 600, color: TEXT_PRIMARY }}>Add Company</div>
            <div style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY }}>{addingRole}</div>
          </div>
          <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
            <X size={20} color={TEXT_SECONDARY} />
          </button>
        </div>

        <div style={{ padding: "0 24px 12px", flexShrink: 0 }}>
          <div style={{ height: 44, borderRadius: 10, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8, padding: "0 12px", background: SURFACE_1 }}>
            <MagnifyingGlass size={16} color={TEXT_TERTIARY} />
            <input placeholder="Search companies..." value={query} onChange={e => setQuery(e.target.value)} style={{ flex: 1, border: "none", background: "transparent", fontFamily: FONT, fontSize: 14, color: TEXT_PRIMARY, outline: "none" }} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto" }}>
          {filtered.map((co, i) => {
            const isSelected = sessionSelected.includes(co.name);
            return (
              <button key={co.name} onClick={() => toggle(co.name)} style={{
                width: "100%", height: 56, display: "flex", alignItems: "center", gap: 12,
                padding: "0 24px", background: isSelected ? "#F0F7FF" : "transparent",
                border: "none", borderBottom: `1px solid ${BORDER}`, cursor: "pointer", textAlign: "left",
              }}>
                <div style={{ width: 36, height: 36, borderRadius: 9999, flexShrink: 0, background: AVATAR_COLORS[i % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BLUE }}>
                  {co.initial}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>{co.name}</div>
                  <div style={{ fontFamily: FONT, fontSize: 13, color: TEXT_SECONDARY }}>{co.role}</div>
                </div>
                {isSelected ? <CheckCircle size={22} color={BLUE} weight="fill" /> : <Plus size={20} color={TEXT_TERTIARY} />}
              </button>
            );
          })}
        </div>

        <div style={{
          padding: "12px 24px 32px", flexShrink: 0,
          opacity: sessionSelected.length > 0 ? 1 : 0,
          transform: sessionSelected.length > 0 ? "translateY(0)" : "translateY(8px)",
          transition: "opacity 200ms ease, transform 200ms ease",
          pointerEvents: sessionSelected.length > 0 ? "auto" : "none",
        }}>
          <BluePillBtn label={`Done · ${sessionSelected.length} selected`} onClick={onDone} />
        </div>
      </div>
    </div>
  );
}

// ─── Screen 6: Filled Jobsite ─────────────────────────────────────────────────

function FilledJobsiteScreen({ jobsiteName, formData, companies, mapOffset, onAddMore }: {
  jobsiteName: string;
  formData: { value: string; startDate: string; endDate: string; status: Status };
  companies: CompanyEntry[];
  mapOffset: { x: number; y: number };
  onAddMore: () => void;
}) {
  const [listVisible, setListVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setListVisible(true), 50); return () => clearTimeout(t); }, []);

  const lat = (35.6762 - mapOffset.y * 0.0008).toFixed(4);
  const lng = (139.6503 - mapOffset.x * 0.0008).toFixed(4);
  const displayName = jobsiteName || "Jobsite Name";
  const displayValue = formData.value || "$2.5m";
  const displayDates = formData.startDate && formData.endDate ? `${formData.startDate} - ${formData.endDate}` : "Jan - Oct, 2026";
  const chipStyle = (bg: string, text: string): React.CSSProperties => ({ display: "inline-flex", alignItems: "center", height: 20, borderRadius: 9999, padding: "0 8px", background: bg, fontFamily: FONT, fontSize: 11, fontWeight: 500, color: text });

  const gcs = companies.filter(c => c.role === "General Contractor");
  const subs = companies.filter(c => c.role === "Subcontractor");

  const CompanyRow = ({ entry, idx }: { entry: CompanyEntry; idx: number }) => (
    <div style={{ height: 56, display: "flex", alignItems: "center", gap: 12, padding: "0 24px", borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 9999, flexShrink: 0, background: AVATAR_COLORS[idx % AVATAR_COLORS.length], display: "flex", alignItems: "center", justifyContent: "center", fontFamily: FONT, fontSize: 14, fontWeight: 700, color: BLUE }}>
        {entry.name[0]}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, color: TEXT_PRIMARY }}>{entry.name}</div>
        <div style={{ fontFamily: FONT, fontSize: 13, color: TEXT_SECONDARY }}>{entry.role}</div>
      </div>
      <CaretRight size={16} color={TEXT_TERTIARY} />
    </div>
  );

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", background: SURFACE_0 }}>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "calc(100% - 470px)", overflow: "hidden" }}>
        <img src="/jobsites-map.png" alt="Map" style={{ width: "130%", height: "130%", objectFit: "cover", objectPosition: "center 40%", transform: `translate(calc(-15% + ${mapOffset.x}px), calc(-10% + ${mapOffset.y}px))` }} />
        {MAP_PINS.slice(0, 5).map((pos, i) => <MapPinMarker key={i} style={{ top: pos.top, left: pos.left }} />)}
        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-80%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div style={{ background: BLUE, borderRadius: 9999, padding: "5px 10px", display: "flex", alignItems: "center", gap: 4, boxShadow: "0px 4px 12px rgba(5,100,255,0.4)" }}>
            <Buildings size={13} color="#fff" weight="fill" />
          </div>
          <div style={{ width: 2, height: 8, background: BLUE }} />
          <div style={{ width: 4, height: 4, borderRadius: 9999, background: BLUE }} />
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 470, background: SURFACE_1, borderRadius: "24px 24px 0 0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <DragHandle />
        <div style={{ margin: "0 16px 12px", background: SURFACE_0, borderRadius: 12, padding: "14px 16px", flexShrink: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
            <span style={{ fontFamily: FONT, fontSize: 19, fontWeight: 600, color: TEXT_PRIMARY, flex: 1, marginRight: 8 }}>{displayName}</span>
            <button style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}><DotsThree size={22} color={TEXT_SECONDARY} weight="bold" /></button>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
            <span style={chipStyle(ACTIVE_CHIP, "#104435")}>{formData.status}</span>
            <span style={chipStyle(SURFACE_2, TEXT_SECONDARY)}>{displayValue}</span>
            <span style={chipStyle(SURFACE_2, TEXT_SECONDARY)}>{displayDates}</span>
          </div>
          <div style={{ background: SURFACE_2, borderRadius: 8, padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontFamily: FONT, fontSize: 12, color: TEXT_SECONDARY }}>{lat}° N, {lng}° E</span>
            <ArrowSquareOut size={14} color={TEXT_TERTIARY} />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", background: SURFACE_0, opacity: listVisible ? 1 : 0, transform: listVisible ? "translateY(0)" : "translateY(12px)", transition: "opacity 300ms ease, transform 300ms ease" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 10px" }}>
            <span style={{ fontFamily: FONT, fontSize: 17, fontWeight: 700, color: TEXT_PRIMARY }}>Linked Companies</span>
            <button onClick={onAddMore} style={{ height: 32, borderRadius: 9999, background: BLUE, border: "none", padding: "0 14px", color: "#fff", fontFamily: FONT, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>+ Add company</button>
          </div>
          {gcs.length > 0 && (
            <>
              <div style={{ padding: "4px 24px" }}><span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_TERTIARY, textTransform: "uppercase", letterSpacing: "0.05em" }}>General Contractor</span></div>
              {gcs.map((e, i) => <CompanyRow key={e.name} entry={e} idx={i} />)}
            </>
          )}
          {subs.length > 0 && (
            <>
              <div style={{ padding: "10px 24px 4px" }}><span style={{ fontFamily: FONT, fontSize: 11, color: TEXT_TERTIARY, textTransform: "uppercase", letterSpacing: "0.05em" }}>Subcontractors</span></div>
              {subs.map((e, i) => <CompanyRow key={e.name} entry={e} idx={i + gcs.length} />)}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Root ─────────────────────────────────────────────────────────────────────

export default function Jobsites() {
  const [screen, setScreen] = useState<Screen>("map");
  const [jobsiteName, setJobsiteName] = useState("");
  const [formData, setFormData] = useState({ value: "", startDate: "", endDate: "", status: "Active" as Status });
  const [companies, setCompanies] = useState<CompanyEntry[]>([]);
  const [mapOffset, setMapOffset] = useState({ x: 0, y: 0 });
  const [addingRole, setAddingRole] = useState<Role>("General Contractor");

  // Screens that layer over the empty/filled jobsite base
  const isJobsiteBase = screen === "empty-jobsite" || screen === "filled-jobsite" || screen === "role-select" || screen === "add-company";

  return (
    <div className="w-full h-full pt-7 relative overflow-hidden bg-white">
      {screen === "map" && <MapScreen onAddLocation={() => setScreen("form")} />}

      {screen === "form" && (
        <FormSheet
          onSetLocation={() => setScreen("pinpoint")}
          onBack={() => setScreen("map")}
          jobsiteName={jobsiteName} setJobsiteName={setJobsiteName}
          formData={formData} setFormData={setFormData}
        />
      )}

      {screen === "pinpoint" && (
        <PinpointScreen
          onConfirm={(offset) => { setMapOffset(offset); setScreen("empty-jobsite"); }}
          onBack={() => setScreen("form")}
        />
      )}

      {/* Empty jobsite base — stays mounted under role-select and add-company sheets */}
      {isJobsiteBase && screen !== "filled-jobsite" && (
        <EmptyJobsiteScreen
          onAddCompany={() => setScreen("role-select")}
          jobsiteName={jobsiteName} formData={formData} mapOffset={mapOffset}
        />
      )}

      {screen === "filled-jobsite" && (
        <FilledJobsiteScreen
          jobsiteName={jobsiteName} formData={formData}
          companies={companies} mapOffset={mapOffset}
          onAddMore={() => setScreen("role-select")}
        />
      )}

      {/* Role select sheet — floats over jobsite base */}
      {screen === "role-select" && (
        <RoleSelectSheet
          onSelect={(role) => { setAddingRole(role); setScreen("add-company"); }}
          onBack={() => setScreen(companies.length > 0 ? "filled-jobsite" : "empty-jobsite")}
        />
      )}

      {/* Company picker sheet — floats over jobsite base */}
      {screen === "add-company" && (
        <AddCompanySheet
          onDone={() => setScreen("filled-jobsite")}
          onBack={() => setScreen("role-select")}
          selected={companies} setSelected={setCompanies}
          addingRole={addingRole}
        />
      )}
    </div>
  );
}
