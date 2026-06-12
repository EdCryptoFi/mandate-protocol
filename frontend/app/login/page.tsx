"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Key, Eye, Lock } from "lucide-react";

const C = {
  bg:        "#0B0F1A",
  surface:   "#131929",
  elevated:  "#1A2235",
  border:    "#1F2D45",
  accent:    "#4F6EF7",
  accentLow: "#4F6EF715",
  accentMid: "#4F6EF730",
  textPri:   "#F1F5FF",
  textSec:   "#8899BB",
  textMuted: "#4A5878",
  green:     "#10B981",
  amber:     "#F59E0B",
};

const ROLES = [
  {
    id: "treasury",
    label: "Treasury Manager",
    desc: "Issue agent sessions, set operational limits",
    icon: Key,
    accentColor: C.accent,
    accentBg: "#4F6EF715",
  },
  {
    id: "compliance",
    label: "Compliance Officer",
    desc: "Monitor actions, approve limit changes",
    icon: Shield,
    accentColor: C.green,
    accentBg: "#10B98115",
  },
  {
    id: "regulator",
    label: "Regulator",
    desc: "Read-only audit view across all institutions",
    icon: Eye,
    accentColor: "#8B5CF6",
    accentBg: "#8B5CF615",
  },
];

const FEATURES = [
  { icon: Lock,   text: "Daml-enforced limits — cryptographically guaranteed" },
  { icon: Shield, text: "Full AI audit trail — every decision on-chain" },
  { icon: Eye,    text: "Sub-transaction privacy — Canton Network" },
];

export default function LoginPage() {
  const router = useRouter();
  const [selected, setSelected] = useState("treasury");
  const [institution, setInstitution] = useState("BankA");
  const [loading, setLoading] = useState(false);

  const handleEnter = () => {
    setLoading(true);
    setTimeout(() => {
      router.push(`/dashboard?role=${selected}&institution=${institution}`);
    }, 900);
  };

  return (
    <div className="min-h-screen flex" style={{ background: C.bg, color: C.textPri, fontFamily: "var(--font-geist-sans), sans-serif" }}>

      {/* ── Left Brand Panel ── */}
      <div
        className="hidden lg:flex flex-col justify-between w-1/2 p-12 relative overflow-hidden"
        style={{ background: C.bg, borderRight: `1px solid ${C.border}` }}
      >
        {/* Grid background */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${C.border}55 1px, transparent 1px), linear-gradient(90deg, ${C.border}55 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
            maskImage: "radial-gradient(ellipse 90% 80% at 30% 30%, black, transparent)",
          }}
        />
        {/* Glow */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{ width: 500, height: 400, background: `radial-gradient(ellipse at 20% 20%, ${C.accentLow}, transparent 70%)` }}
        />

        <div className="relative">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div className="p-2 rounded-lg" style={{ background: C.accent }}>
              <Shield size={20} color="white" />
            </div>
            <span className="font-semibold text-base" style={{ color: C.textPri }}>Mandate Protocol</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: C.accentLow, color: "#818cf8", border: `1px solid ${C.accentMid}` }}>
              BETA
            </span>
          </div>

          {/* Quote */}
          <div className="mb-12">
            <p className="text-3xl font-bold leading-tight mb-3" style={{ color: C.textPri, letterSpacing: "-0.02em" }}>
              Authority.{" "}
              <em style={{ fontStyle: "italic", color: "#818cf8" }}>Delegated precisely.</em>
            </p>
            <p className="text-sm leading-relaxed" style={{ color: C.textSec }}>
              An AI agent that manages institutional collateral within limits you define — enforced cryptographically by the Canton ledger.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {FEATURES.map(f => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg mt-0.5 shrink-0" style={{ background: C.accentLow }}>
                  <f.icon size={13} color={C.accent} />
                </div>
                <span className="text-sm" style={{ color: C.textSec }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Canton badge */}
        <div className="relative">
          <div
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ background: C.accentLow, border: `1px solid ${C.accentMid}`, color: C.textMuted }}
          >
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: C.green }} />
            Secured by Canton Network · Daml SDK 2.10
          </div>
        </div>
      </div>

      {/* ── Right Form Panel ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12" style={{ background: C.surface }}>
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-10 lg:hidden">
            <button onClick={() => router.push("/")} className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg" style={{ background: C.accent }}>
                <Shield size={16} color="white" />
              </div>
              <span className="font-semibold text-sm">Mandate Protocol</span>
            </button>
          </div>

          <div className="mb-8">
            <h1 className="text-xl font-bold mb-1" style={{ color: C.textPri }}>Sign in to Protocol</h1>
            <p className="text-sm" style={{ color: C.textSec }}>Select your institution and role to continue</p>
          </div>

          {/* Institution Select */}
          <div className="mb-6">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: C.textSec, letterSpacing: "0.08em" }}>
              Institution
            </label>
            <select
              value={institution}
              onChange={e => setInstitution(e.target.value)}
              className="w-full rounded-xl px-4 py-3 text-sm appearance-none focus:outline-none transition-colors"
              style={{
                background: C.elevated,
                border: `1px solid ${C.border}`,
                color: C.textPri,
              }}
            >
              <option value="BankA">Bank A — Global Treasury</option>
              <option value="BankB">Bank B — Fixed Income</option>
              <option value="Clearinghouse">Clearinghouse Gamma</option>
            </select>
          </div>

          {/* Role Cards */}
          <div className="mb-8">
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: C.textSec, letterSpacing: "0.08em" }}>
              Your Role
            </label>
            <div className="space-y-2.5">
              {ROLES.map(r => {
                const active = selected === r.id;
                return (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r.id)}
                    className="w-full text-left rounded-xl p-4 transition-all duration-150"
                    style={{
                      background: active ? C.elevated : C.bg,
                      border: `1px solid ${active ? r.accentColor : C.border}`,
                      boxShadow: active ? `0 0 0 1px ${r.accentColor}20` : "none",
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="p-1.5 rounded-lg shrink-0"
                        style={{ background: active ? r.accentBg : C.surface }}
                      >
                        <r.icon size={14} color={active ? r.accentColor : C.textMuted} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium" style={{ color: C.textPri }}>{r.label}</div>
                        <div className="text-xs mt-0.5" style={{ color: C.textSec }}>{r.desc}</div>
                      </div>
                      <div
                        className="w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center"
                        style={{ borderColor: active ? r.accentColor : C.border }}
                      >
                        {active && <div className="w-1.5 h-1.5 rounded-full" style={{ background: r.accentColor }} />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connect Button */}
          <button
            onClick={handleEnter}
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
            style={{
              background: loading ? "#3a52c0" : C.accent,
              color: "white",
              opacity: loading ? 0.8 : 1,
            }}
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                Connecting to ledger...
              </>
            ) : (
              "Connect to Ledger →"
            )}
          </button>

          <p className="text-center text-xs mt-5" style={{ color: C.textMuted }}>
            Canton Sandbox · localhost:7575 · No real assets
          </p>
        </div>
      </div>
    </div>
  );
}
