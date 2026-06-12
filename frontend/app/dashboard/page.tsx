"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Shield, Activity, AlertTriangle, CheckCircle, Clock,
  TrendingUp, Lock, Users, LayoutDashboard, Settings,
  FileText, Layers, Bell, ChevronRight, Eye, Key,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

/* ── Design tokens ── */
const C = {
  bg:        "#0B0F1A",
  sidebar:   "#0D1120",
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
  greenLow:  "#10B98115",
  amber:     "#F59E0B",
  amberLow:  "#F59E0B15",
  red:       "#EF4444",
  redLow:    "#EF444415",
};

/* ── Types ── */
interface AgentAction {
  actionId: string; actionType: string; amount: number; asset: string;
  toAsset?: string; timestamp: string; aiRationale: string;
  limitChecks: { limitName: string; checked: number; allowed: number; passed: boolean }[];
}

/* ── Mock data ── */
const MOCK_SESSION = {
  sessionId: "AGT-2026-001",
  actionsUsedToday: 2,
  volumeUsedTodayUSD: 430_000,
  maxDailyVolumeUSD: 2_000_000,
  maxSingleActionUSD: 500_000,
  marginCallResponseLimitUSD: 300_000,
  validForHours: 8,
  permittedChoices: ["CanRebalance", "CanRespondToMarginCall", "CanPostCollateral"],
};

const MOCK_POOL = {
  poolId: "POOL-BANKA-001",
  totalValueUSD: 5_200_000,
  utilizationRatio: 0.724,
  lockedUSD: 1_664_000,
  holdings: [
    { asset: "Bond",      quantity: 1_976,   valueUSD: 1_976_000, pct: 38.0, color: "#4F6EF7" },
    { asset: "Treasury",  quantity: 1_456,   valueUSD: 1_456_000, pct: 28.0, color: "#818CF8" },
    { asset: "Cash",      quantity: 988_000, valueUSD: 988_000,   pct: 19.0, color: "#64748B" },
    { asset: "Equity",    quantity: 3_813,   valueUSD: 572_000,   pct: 11.0, color: "#8B5CF6" },
    { asset: "Commodity", quantity: 2_471,   valueUSD: 208_000,   pct: 4.0,  color: "#14B8A6" },
  ],
};

const INITIAL_ACTIONS: AgentAction[] = [
  {
    actionId: "ACT-001", actionType: "Rebalance",
    amount: 250_000, asset: "Bond", toAsset: "Treasury",
    timestamp: new Date(Date.now() - 8_100_000).toISOString(),
    aiRationale: "Portfolio drift detected. Bond at 42.1% exceeds target 38% by 4.1 pp. Rebalancing $250K Bond → Treasury restores target allocation. Daily volume remaining: $1.75M. Single action cap: $500K. All limits satisfied. Confidence: 94%.",
    limitChecks: [
      { limitName: "single_action_cap", checked: 250_000, allowed: 500_000, passed: true },
      { limitName: "daily_volume_cap",  checked: 250_000, allowed: 2_000_000, passed: true },
      { limitName: "asset_allowed",     checked: 1, allowed: 1, passed: true },
    ],
  },
  {
    actionId: "ACT-002", actionType: "MarginCallResponse",
    amount: 180_000, asset: "Cash",
    timestamp: new Date(Date.now() - 2_520_000).toISOString(),
    aiRationale: "Margin call MC-2026-0042 from Bank B requires $180K Cash by 16:00 UTC. Penalty $22K if defaulted. Pool holds $988K Cash (utilization 18.9%). Margin call limit: $300K — amount within. Responding immediately to avoid penalty.",
    limitChecks: [
      { limitName: "margin_call_limit", checked: 180_000, allowed: 300_000, passed: true },
      { limitName: "single_action_cap", checked: 180_000, allowed: 500_000, passed: true },
      { limitName: "daily_volume_cap",  checked: 430_000, allowed: 2_000_000, passed: true },
    ],
  },
];

const VOLUME_DATA = [
  { time: "09:00", volume: 0 },
  { time: "10:00", volume: 100_000 },
  { time: "11:00", volume: 250_000 },
  { time: "12:00", volume: 250_000 },
  { time: "13:00", volume: 430_000 },
  { time: "Now",   volume: 430_000 },
];

/* ── Sidebar ── */
const NAV_BY_ROLE: Record<string, { id: string; icon: React.ElementType; label: string; badge?: string }[]> = {
  treasury: [
    { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { id: "sessions",  icon: Key,             label: "Agent Sessions" },
    { id: "pool",      icon: Layers,          label: "Collateral Pool" },
    { id: "margin",    icon: Bell,            label: "Margin Calls", badge: "2" },
    { id: "log",       icon: FileText,        label: "Action Log" },
    { id: "settings",  icon: Settings,        label: "Settings" },
  ],
  compliance: [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
    { id: "log",       icon: FileText,        label: "Audit Log" },
    { id: "settings",  icon: Settings,        label: "Controls" },
  ],
  regulator: [
    { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
    { id: "log",       icon: FileText,        label: "Agent Actions" },
  ],
};

const SECTION_TITLES: Record<string, { title: string; sub: string }> = {
  dashboard: { title: "Dashboard",        sub: "Live agent activity and session limits" },
  sessions:  { title: "Agent Sessions",   sub: "Active session token, limits and usage" },
  pool:      { title: "Collateral Pool",  sub: "Holdings, allocation and volume" },
  margin:    { title: "Margin Calls",     sub: "Open calls and automated responses" },
  log:       { title: "Action Log",       sub: "Immutable on-chain record of every AI decision" },
  settings:  { title: "Settings",         sub: "Session configuration and agent controls" },
};

/* ── Sub-components ── */

function Badge({ text, color }: { text: string; color?: string }) {
  const bg = color === "green" ? C.greenLow : color === "amber" ? C.amberLow : color === "red" ? C.redLow : C.accentLow;
  const fg = color === "green" ? C.green : color === "amber" ? C.amber : color === "red" ? C.red : C.accent;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: bg, color: fg }}>
      {text}
    </span>
  );
}

function StatTile({ label, value, sub, subColor, icon: Icon }: {
  label: string; value: string; sub?: string; subColor?: string; icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted, letterSpacing: "0.08em" }}>{label}</span>
        <div className="p-1.5 rounded-lg" style={{ background: C.accentLow }}>
          <Icon size={13} color={C.accent} />
        </div>
      </div>
      <div className="text-2xl font-bold" style={{ color: C.textPri, fontVariantNumeric: "tabular-nums" }}>{value}</div>
      {sub && <div className="text-xs mt-1.5" style={{ color: subColor ?? C.textMuted }}>{sub}</div>}
    </div>
  );
}

function ProgressBar({ used, max, warnAt = 70 }: { used: number; max: number; warnAt?: number }) {
  const pct = Math.min((used / max) * 100, 100);
  const color = pct > 85 ? C.red : pct > warnAt ? C.amber : C.accent;
  return (
    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: C.elevated }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function LimitRow({ label, used, max }: { label: string; used: number; max: number }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex justify-between text-xs mb-1.5" style={{ color: C.textSec }}>
        <span>{label}</span>
        <span style={{ fontVariantNumeric: "tabular-nums" }}>
          ${used.toLocaleString()} <span style={{ color: C.textMuted }}>/ ${max.toLocaleString()}</span>
        </span>
      </div>
      <ProgressBar used={used} max={max} />
    </div>
  );
}

function ActionRow({ action }: { action: AgentAction }) {
  const [open, setOpen] = useState(false);
  const isMargin = action.actionType === "MarginCallResponse";
  const typeColor = isMargin ? C.amber : C.accent;
  const typeBg = isMargin ? C.amberLow : C.accentLow;
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
      <button
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors"
        style={{ background: open ? C.elevated : "transparent" }}
        onClick={() => setOpen(o => !o)}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = C.surface; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
      >
        <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: typeBg, color: typeColor }}>
          {action.actionType === "Rebalance" ? "REBALANCE" : "MARGIN CALL"}
        </span>
        <span className="text-sm font-medium" style={{ color: C.textPri }}>
          ${action.amount.toLocaleString()} {action.asset}
          {action.toAsset && <span style={{ color: C.textSec }}> → {action.toAsset}</span>}
        </span>
        <span className="ml-auto text-xs" style={{ color: C.textMuted }}>
          {new Date(action.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} UTC
        </span>
        <CheckCircle size={13} color={C.green} />
        <ChevronRight
          size={13}
          color={C.textMuted}
          style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform 150ms" }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ background: C.elevated, borderTop: `1px solid ${C.border}` }}>
          <p className="text-xs font-semibold uppercase tracking-wider mt-3 mb-1.5 flex items-center gap-1.5" style={{ color: C.textMuted }}>
            <Lock size={10} /> AI Rationale — stored on-chain
          </p>
          <p className="text-sm p-3 rounded-lg leading-relaxed" style={{ background: C.surface, color: C.textSec }}>
            {action.aiRationale}
          </p>
          <div className="flex gap-2 flex-wrap mt-3">
            {action.limitChecks.map(lc => (
              <span key={lc.limitName} className="text-xs px-2 py-0.5 rounded font-mono"
                style={{ background: C.greenLow, color: C.green }}>
                ✓ {lc.limitName.replace(/_/g, " ")} ${lc.checked.toLocaleString()} ≤ ${lc.allowed.toLocaleString()}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Sidebar component ── */
function Sidebar({ role, institution, activeTab, onTabChange }: {
  role: string; institution: string; activeTab: string; onTabChange: (t: string) => void;
}) {
  const router = useRouter();
  const roleIcon = role === "compliance" ? Shield : role === "regulator" ? Eye : Key;
  const RoleIcon = roleIcon;
  const roleLabel = role === "treasury" ? "Treasury Manager" : role === "compliance" ? "Compliance Officer" : "Regulator";
  const instLabel = institution === "BankA" ? "Bank A" : institution === "BankB" ? "Bank B" : "Clearinghouse";

  return (
    <aside
      className="fixed left-0 top-0 bottom-0 flex flex-col"
      style={{ width: 220, background: C.sidebar, borderRight: `1px solid ${C.border}` }}
    >
      {/* Logo */}
      <div className="px-5 py-5" style={{ borderBottom: `1px solid ${C.border}` }}>
        <button onClick={() => router.push("/")} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="p-1.5 rounded-lg" style={{ background: C.accent }}>
            <Shield size={15} color="white" />
          </div>
          <span className="font-semibold text-sm" style={{ color: C.textPri }}>Mandate Protocol</span>
        </button>
        <div className="mt-3 px-2 py-1.5 rounded-lg" style={{ background: C.accentLow }}>
          <span className="text-xs font-medium" style={{ color: C.accent }}>{instLabel}</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {(NAV_BY_ROLE[role] ?? NAV_BY_ROLE.treasury).map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-100"
              style={{
                background: active ? C.accentLow : "transparent",
                color: active ? C.accent : C.textSec,
                borderLeft: active ? `2px solid ${C.accent}` : "2px solid transparent",
              }}
            >
              <item.icon size={15} />
              <span className="flex-1 text-left">{item.label}</span>
              {item.badge && (
                <span className="text-xs px-1.5 py-0.5 rounded-full font-medium"
                  style={{ background: C.amberLow, color: C.amber }}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: C.accentLow, color: C.accent }}>
            <RoleIcon size={13} />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: C.textPri }}>{roleLabel}</p>
            <p className="text-xs truncate" style={{ color: C.textMuted }}>{instLabel}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

/* ── Simulation banner ── */
function SimBanner({ state, dots }: { state: string; dots: string }) {
  if (state === "idle") return null;

  const configs = {
    incoming: {
      bg: C.amberLow, border: "#F59E0B40", icon: AlertTriangle, iconColor: C.amber,
      title: "Margin Call Incoming — MC-2026-0055",
      sub: "Bank C · $80,000 Treasury · Deadline 1h · Penalty $8,000",
      tag: "RECEIVED", tagColor: C.amber,
    },
    reasoning: {
      bg: C.accentLow, border: "#4F6EF740", icon: Activity, iconColor: C.accent,
      title: "Agent Reasoning",
      sub: "Claude analyzing margin call against session limits and pool state",
      tag: "PROCESSING", tagColor: C.accent,
    },
    responded: {
      bg: C.greenLow, border: "#10B98140", icon: CheckCircle, iconColor: C.green,
      title: "Margin Call Responded — $80K Treasury posted",
      sub: "AgentAction contract created · AI rationale stored on-chain · Bank C confirmed",
      tag: "SETTLED", tagColor: C.green,
    },
  }[state];

  if (!configs) return null;
  const Icon = configs.icon;
  const isReasoning = state === "reasoning";

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: configs.bg, border: `1px solid ${configs.border}` }}>
      {isReasoning
        ? <span className="w-4 h-4 border-2 rounded-full animate-spin shrink-0"
            style={{ borderColor: `${C.accent}40`, borderTopColor: C.accent }} />
        : <Icon size={16} color={configs.iconColor} className="shrink-0" />
      }
      <div>
        <p className="text-sm font-semibold" style={{ color: configs.iconColor }}>
          {configs.title}{isReasoning ? dots : ""}
        </p>
        <p className="text-xs mt-0.5" style={{ color: configs.iconColor, opacity: 0.7 }}>{configs.sub}</p>
      </div>
      <span className="ml-auto text-xs font-mono font-semibold" style={{ color: configs.tagColor }}>{configs.tag}</span>
    </div>
  );
}

/* ── Tab content ── */

/* Open margin calls (mock — mirrors badge count in sidebar) */
const OPEN_MARGIN_CALLS = [
  { callId: "MC-2026-0048", from: "Bank B",             amount: 120_000, asset: "Cash",     deadline: "16:00 UTC", penalty: 14_000 },
  { callId: "MC-2026-0051", from: "Clearinghouse Gamma", amount: 95_000,  asset: "Treasury", deadline: "18:30 UTC", penalty: 9_500 },
];

function TreasuryTab({
  section, actions, simState, reasoningDots, paused, onSimulate, onPause,
}: {
  section: string;
  actions: AgentAction[];
  simState: string;
  reasoningDots: string;
  paused: boolean;
  onSimulate: () => void;
  onPause: () => void;
}) {
  const volPct = ((MOCK_SESSION.volumeUsedTodayUSD / MOCK_SESSION.maxDailyVolumeUSD) * 100);
  const show = (ids: string[]) => ids.includes(section);
  const feedActions = section === "margin" ? actions.filter(a => a.actionType === "MarginCallResponse") : actions;

  return (
    <div className="space-y-5">
      {/* Stat tiles */}
      {show(["dashboard", "pool"]) && (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile
          label="Pool Value"
          value={`$${(MOCK_POOL.totalValueUSD / 1_000_000).toFixed(2)}M`}
          sub="↑ +2.3% today"
          subColor={C.green}
          icon={TrendingUp}
        />
        <StatTile
          label="Utilization"
          value={`${(MOCK_POOL.utilizationRatio * 100).toFixed(1)}%`}
          sub="Approaching 75% target"
          subColor={C.amber}
          icon={Activity}
        />
        <StatTile
          label="Daily Volume"
          value={`${volPct.toFixed(0)}%`}
          sub={`$${(MOCK_SESSION.volumeUsedTodayUSD / 1000).toFixed(0)}K of $${(MOCK_SESSION.maxDailyVolumeUSD / 1_000_000).toFixed(1)}M`}
          icon={TrendingUp}
        />
        <StatTile
          label="Open Margin Calls"
          value="2"
          sub="Response required"
          subColor={C.amber}
          icon={Bell}
        />
      </div>
      )}

      {/* Session card */}
      {show(["dashboard", "sessions"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Active Session</span>
              <span className="flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-full"
                style={{ background: C.greenLow, color: C.green }}>
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: C.green }} />
                LIVE
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-1.5 text-sm">
              {[
                ["Session", MOCK_SESSION.sessionId],
                ["Issued", "09:00 UTC"],
                ["Valid until", "17:00 UTC"],
                ["Actions today", String(MOCK_SESSION.actionsUsedToday)],
              ].map(([k, v]) => (
                <div key={k} className="flex gap-2">
                  <span style={{ color: C.textMuted }}>{k}</span>
                  <span className="font-medium font-mono" style={{ color: C.textSec }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="text-sm space-y-1.5">
            <div><span style={{ color: C.textMuted }}>Permitted · </span>
              <span style={{ color: C.textSec }}>Rebalance, Margin Call Response</span></div>
            <div><span style={{ color: C.textMuted }}>Single action cap · </span>
              <span style={{ color: C.textSec }}>$500,000</span></div>
            <div><span style={{ color: C.textMuted }}>Daily cap · </span>
              <span style={{ color: C.textSec }}>$2,000,000</span></div>
          </div>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={onSimulate}
              disabled={simState !== "idle" || paused}
              className="text-xs px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ borderColor: `${C.amber}60`, color: C.amber }}
            >
              ⚡ Simulate Margin Call
            </button>
            <button
              onClick={onPause}
              className="text-xs px-3 py-2 rounded-lg border transition-colors"
              style={{
                borderColor: paused ? `${C.green}60` : `${C.amber}60`,
                color: paused ? C.green : C.amber,
              }}
            >
              {paused ? "Resume" : "Pause"}
            </button>
          </div>
        </div>
      </div>
      )}

      {/* Open margin calls panel */}
      {show(["margin"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>Open Margin Calls</h3>
          <button
            onClick={onSimulate}
            disabled={simState !== "idle" || paused}
            className="text-xs px-3 py-2 rounded-lg border transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ borderColor: `${C.amber}60`, color: C.amber }}
          >
            ⚡ Simulate Margin Call
          </button>
        </div>
        <div className="space-y-3">
          {OPEN_MARGIN_CALLS.map(mc => (
            <div key={mc.callId} className="flex items-center gap-4 p-4 rounded-lg flex-wrap" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <span className="font-mono text-xs" style={{ color: C.amber }}>{mc.callId}</span>
              <span className="text-sm font-medium" style={{ color: C.textPri }}>{mc.from}</span>
              <span className="text-sm font-mono" style={{ color: C.textPri }}>${mc.amount.toLocaleString()} {mc.asset}</span>
              <span className="text-xs" style={{ color: C.textSec }}>Deadline {mc.deadline}</span>
              <span className="text-xs" style={{ color: C.red }}>Penalty ${mc.penalty.toLocaleString()}</span>
              <span className="ml-auto"><Badge text="AWAITING AGENT" color="amber" /></span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Charts row */}
      {show(["dashboard", "pool"]) && (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Allocation */}
        <div className="lg:col-span-2 rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Collateral Allocation</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={MOCK_POOL.holdings} dataKey="valueUSD" nameKey="asset" cx="50%" cy="50%" innerRadius={45} outerRadius={68}>
                {MOCK_POOL.holdings.map(h => <Cell key={h.asset} fill={h.color} />)}
              </Pie>
              <Tooltip
                formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]}
                contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {MOCK_POOL.holdings.map(h => (
              <div key={h.asset} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: h.color }} />
                  <span style={{ color: C.textSec }}>{h.asset}</span>
                </div>
                <span style={{ color: C.textMuted }}>{h.pct.toFixed(0)}% · ${(h.valueUSD / 1000).toFixed(0)}K</span>
              </div>
            ))}
          </div>
        </div>

        {/* Volume chart */}
        <div className="lg:col-span-3 rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Daily Volume Usage</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={VOLUME_DATA} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="time" stroke={C.textMuted} tick={{ fontSize: 10, fill: C.textMuted }} />
              <YAxis stroke={C.textMuted} tick={{ fontSize: 10, fill: C.textMuted }} tickFormatter={(v) => `$${Number(v) / 1000}K`} />
              <Tooltip
                formatter={(v) => [`$${Number(v).toLocaleString()}`, "Volume"]}
                contentStyle={{ background: C.elevated, border: `1px solid ${C.border}`, borderRadius: 8, fontSize: 12 }}
              />
              <Area type="monotone" dataKey="volume" stroke={C.accent} fill="url(#volGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      )}

      {/* Limits */}
      {show(["dashboard", "sessions"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Session Limit Usage</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <LimitRow label="Daily Volume" used={MOCK_SESSION.volumeUsedTodayUSD} max={MOCK_SESSION.maxDailyVolumeUSD} />
          <LimitRow label="Margin Call Limit" used={0} max={MOCK_SESSION.marginCallResponseLimitUSD} />
          <LimitRow label="Single Action Cap" used={0} max={MOCK_SESSION.maxSingleActionUSD} />
        </div>
      </div>
      )}

      {/* Settings */}
      {show(["settings"]) && (
      <>
        <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Session Configuration</h3>
          <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
            {[
              ["Session ID", MOCK_SESSION.sessionId],
              ["Valid for", `${MOCK_SESSION.validForHours} hours`],
              ["Max single action", `$${MOCK_SESSION.maxSingleActionUSD.toLocaleString()}`],
              ["Max daily volume", `$${MOCK_SESSION.maxDailyVolumeUSD.toLocaleString()}`],
              ["Margin call limit", `$${MOCK_SESSION.marginCallResponseLimitUSD.toLocaleString()}`],
              ["Permitted choices", MOCK_SESSION.permittedChoices.join(", ")],
            ].map(([k, v]) => (
              <div key={k} className="flex justify-between items-center py-3 gap-4" style={{ borderBottom: `1px solid ${C.border}` }}>
                <span className="text-sm shrink-0" style={{ color: C.textSec }}>{k}</span>
                <span className="text-sm font-mono font-medium text-right" style={{ color: C.textPri }}>{v}</span>
              </div>
            ))}
          </div>
          <p className="text-xs mt-4" style={{ color: C.textMuted }}>
            Limits are enforced by the AgentSession Daml contract. Changing them requires the Treasury Manager
            to revoke this session and issue a new one — values here are read-only by design.
          </p>
        </div>
        <div className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: C.amberLow, border: `1px solid ${C.amber}30` }}>
          <div>
            <p className="text-sm font-semibold" style={{ color: C.amber }}>Agent Execution</p>
            <p className="text-xs mt-0.5" style={{ color: C.textSec }}>
              {paused ? "Agent is paused — no new actions will be submitted." : "Agent is active and polling the ledger."}
            </p>
          </div>
          <button
            onClick={onPause}
            className="text-xs px-4 py-2 rounded-lg font-medium shrink-0 border transition-opacity hover:opacity-80"
            style={{ borderColor: paused ? `${C.green}60` : `${C.amber}60`, color: paused ? C.green : C.amber }}
          >
            {paused ? "Resume Agent" : "Pause Agent"}
          </button>
        </div>
      </>
      )}

      {/* Sim banner */}
      {show(["dashboard", "margin"]) && <SimBanner state={simState} dots={reasoningDots} />}

      {/* Action feed */}
      {show(["dashboard", "margin", "log"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider" style={{ color: C.textMuted }}>
            {section === "margin" ? "Margin Call Responses" : "Agent Activity Feed"}
          </h3>
          <span className="text-xs" style={{ color: C.textMuted }}>Click row to expand AI rationale</span>
        </div>
        <div className="space-y-2">
          {feedActions.map(a => <ActionRow key={a.actionId} action={a} />)}
        </div>
      </div>
      )}
    </div>
  );
}

function ComplianceTab({ section, halted, onHalt }: { section: string; halted: boolean; onHalt: () => void }) {
  const show = (ids: string[]) => ids.includes(section);
  return (
    <div className="space-y-5">
      {halted && (
        <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.redLow, border: `1px solid ${C.red}40` }}>
          <AlertTriangle size={16} color={C.red} />
          <div>
            <p className="text-sm font-semibold" style={{ color: C.red }}>Agent Halted — AgentSession invalidated</p>
            <p className="text-xs mt-0.5" style={{ color: C.textSec }}>EmergencyPause record created on-chain. CEO + CFO co-signature required to issue a new session.</p>
          </div>
        </div>
      )}

      {/* Stats */}
      {show(["dashboard"]) && (
      <div className="grid grid-cols-2 xl:grid-cols-3 gap-4">
        <StatTile label="Daily Cap Usage"    value="21.5%"  sub="$430K of $2M"        subColor={C.green}  icon={Activity} />
        <StatTile label="Limit Violations"   value="0"      sub="All checks passed"    subColor={C.green}  icon={CheckCircle} />
        <StatTile label="Human Escalations"  value="0"      sub="Today"                                    icon={Users} />
      </div>
      )}

      {/* Limit usage detail */}
      {show(["dashboard"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-5" style={{ color: C.textMuted }}>Limit Utilization</h3>
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            { label: "Daily Volume Cap",    used: 430_000,  max: 2_000_000,  status: "WITHIN LIMITS",     statusColor: C.green },
            { label: "Single Action Cap",   used: 250_000,  max: 500_000,    status: "WITHIN LIMITS",     statusColor: C.green },
            { label: "Margin Call Limit",   used: 180_000,  max: 300_000,    status: "APPROACHING LIMIT", statusColor: C.amber },
          ].map(item => (
            <div key={item.label}>
              <div className="flex justify-between text-xs mb-1" style={{ color: C.textSec }}>
                <span>{item.label}</span>
                <span style={{ color: item.statusColor }}>{item.status}</span>
              </div>
              <div className="text-lg font-bold mb-2" style={{ color: C.textPri }}>
                ${(item.used / 1000).toFixed(0)}K <span className="text-sm font-normal" style={{ color: C.textMuted }}>/ ${(item.max / 1_000_000).toFixed(1)}M</span>
              </div>
              <ProgressBar used={item.used} max={item.max} />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Mandate parameters */}
      {show(["dashboard"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Operational Mandate Parameters</h3>
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-0">
          {[
            ["Target Bond Allocation", "38%"],
            ["Target Treasury Allocation", "28%"],
            ["Target Cash Allocation", "19%"],
            ["Rebalance Threshold", "5% drift"],
            ["Margin Call Limit (per call)", "$300,000"],
            ["Max Single Action", "$500,000"],
            ["Max Daily Volume", "$2,000,000"],
            ["Allowed Assets", "Bond, Treasury, Cash, Equity, Commodity"],
          ].map(([k, v]) => (
            <div key={k} className="flex justify-between items-center py-3" style={{ borderBottom: `1px solid ${C.border}` }}>
              <span className="text-sm" style={{ color: C.textSec }}>{k}</span>
              <span className="text-sm font-mono font-medium" style={{ color: C.textPri }}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Audit log excerpt */}
      {show(["dashboard", "log"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Agent Action Log — Immutable On-Chain Record</h3>
        <div className="space-y-3">
          {INITIAL_ACTIONS.map(a => (
            <div key={a.actionId} className="rounded-lg p-4" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-3 mb-2">
                <span className="font-mono text-xs" style={{ color: C.accent }}>{a.actionId}</span>
                <Badge text={a.actionType} color="accent" />
                <span className="ml-auto text-xs" style={{ color: C.textMuted }}>
                  {new Date(a.timestamp).toLocaleString()}
                </span>
              </div>
              <p className="text-xs leading-relaxed mb-3" style={{ color: C.textSec }}>{a.aiRationale}</p>
              <div className="flex gap-2 flex-wrap">
                {a.limitChecks.map(lc => (
                  <span key={lc.limitName} className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: C.greenLow, color: C.green }}>
                    ✓ {lc.limitName.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Emergency */}
      {show(["dashboard", "settings"]) && (
      <div className="rounded-xl p-4 flex items-center justify-between gap-4" style={{ background: C.redLow, border: `1px solid ${C.red}30` }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: C.red }}>Emergency Pause</p>
          <p className="text-xs mt-0.5" style={{ color: C.textSec }}>Immediately invalidates the active AgentSession. Requires CEO + CFO co-signature to resume.</p>
        </div>
        <button
          onClick={onHalt}
          disabled={halted}
          className="text-xs px-4 py-2 rounded-lg font-medium shrink-0 transition-opacity hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ border: `1px solid ${C.red}60`, color: C.red }}>
          {halted ? "Agent Halted" : "Halt Agent"}
        </button>
      </div>
      )}
    </div>
  );
}

function RegulatorTab({ section }: { section: string }) {
  const show = (ids: string[]) => ids.includes(section);
  return (
    <div className="space-y-5">
      {/* Banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl" style={{ background: C.amberLow, border: `1px solid ${C.amber}30` }}>
        <Eye size={16} color={C.amber} />
        <div>
          <p className="text-sm font-semibold" style={{ color: C.amber }}>Regulatory Audit View — Read Only</p>
          <p className="text-xs mt-0.5" style={{ color: C.textSec }}>Observer access to all AgentAction contracts. Collateral positions remain private per Canton sub-transaction privacy.</p>
        </div>
      </div>

      {/* Cross-institution stats */}
      {show(["dashboard"]) && (
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatTile label="Total Actions"    value="847"    sub="Last 30 days"           icon={Activity} />
        <StatTile label="Total Volume"     value="$124.6M" sub="Across institutions"   icon={TrendingUp} />
        <StatTile label="Escalations"      value="3"      sub="Required human approval" subColor={C.amber} icon={AlertTriangle} />
        <StatTile label="Limit Breaches"   value="0"      sub="Zero violations"         subColor={C.green} icon={CheckCircle} />
      </div>
      )}

      {/* Settlement activity */}
      {show(["dashboard"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>Cross-Institution Settlements</h3>
        <div className="space-y-3">
          {[
            { a: "Bank A", b: "Bank B",             type: "DVP Settlement",    amount: "$2.4M Treasury",    status: "SETTLED",  statusColor: C.green },
            { a: "Bank B", b: "Clearinghouse Gamma", type: "Cash Collateral",  amount: "$800K Cash",        status: "PENDING",  statusColor: C.amber },
            { a: "Bank A", b: "Clearinghouse Gamma", type: "Bond Exchange",    amount: "$1.1M Bond",        status: "SETTLED",  statusColor: C.green },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-lg" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium" style={{ color: C.textPri }}>{s.a}</span>
                <ChevronRight size={12} color={C.textMuted} />
                <span className="font-medium" style={{ color: C.textPri }}>{s.b}</span>
              </div>
              <span className="text-sm" style={{ color: C.textSec }}>{s.type}</span>
              <span className="text-sm font-mono" style={{ color: C.textPri }}>{s.amount}</span>
              <Badge text={s.status} color={s.status === "SETTLED" ? "green" : "amber"} />
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Full audit log */}
      {show(["dashboard", "log"]) && (
      <div className="rounded-xl p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-4" style={{ color: C.textMuted }}>All Agent Actions — Cross-Institution</h3>
        <div className="space-y-3">
          {INITIAL_ACTIONS.map(a => (
            <div key={a.actionId} className="rounded-lg p-4" style={{ background: C.elevated, border: `1px solid ${C.border}` }}>
              <div className="flex items-start gap-3 mb-3 flex-wrap">
                <span className="font-mono text-xs" style={{ color: C.accent }}>{a.actionId}</span>
                <span className="text-xs px-2 py-0.5 rounded font-medium" style={{ background: C.accentLow, color: C.accent }}>Bank A</span>
                <Badge text={a.actionType} />
                <span className="ml-auto font-mono text-xs" style={{ color: C.textMuted }}>
                  ${a.amount.toLocaleString()} {a.asset}
                </span>
                <span className="text-xs" style={{ color: C.textMuted }}>{new Date(a.timestamp).toLocaleString()}</span>
              </div>
              <div className="flex items-start gap-1.5 mb-2">
                <Lock size={10} color={C.textMuted} style={{ marginTop: 2 }} />
                <p className="text-xs" style={{ color: C.textMuted, fontWeight: 600 }}>AI Rationale (on-chain)</p>
              </div>
              <p className="text-sm leading-relaxed p-3 rounded-lg" style={{ background: C.surface, color: C.textSec }}>
                {a.aiRationale}
              </p>
              <div className="flex gap-2 flex-wrap mt-3">
                {a.limitChecks.map(lc => (
                  <span key={lc.limitName} className="text-xs px-2 py-0.5 rounded font-mono"
                    style={{ background: C.greenLow, color: C.green }}>
                    ✓ {lc.limitName.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      )}

      {/* Privacy note */}
      <div className="rounded-xl p-4" style={{ background: C.surface, borderLeft: `3px solid ${C.accent}`, border: `1px solid ${C.border}` }}>
        <p className="text-xs italic" style={{ color: C.textSec }}>
          Sub-transaction privacy active. Each institution sees only their own transaction legs.
          This regulator view is granted explicit observer access via the AgentAction Daml contract.
          Collateral pool balances remain private to each institution.
        </p>
      </div>
    </div>
  );
}

const VALID_ROLES = new Set(["treasury", "compliance", "regulator"]);
const VALID_INSTITUTIONS = new Set(["BankA", "BankB", "Clearinghouse"]);

/* ── Main page ── */
function DashboardInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const rawRole = searchParams.get("role") ?? "";
  const rawInstitution = searchParams.get("institution") ?? "";

  // Rejeitar valores não reconhecidos — nunca fallback silencioso para role privilegiado
  const role = VALID_ROLES.has(rawRole) ? rawRole : null;
  const institution = VALID_INSTITUTIONS.has(rawInstitution) ? rawInstitution : null;

  // Hooks declarados antes de qualquer early return (Rules of Hooks)
  const [activeNav, setActiveNav] = useState("dashboard");
  const [actions, setActions] = useState<AgentAction[]>(INITIAL_ACTIONS);
  const [paused, setPaused] = useState(false);
  const [halted, setHalted] = useState(false);
  const [simState, setSimState] = useState<"idle" | "incoming" | "reasoning" | "responded">("idle");
  const [reasoningDots, setReasoningDots] = useState("");

  useEffect(() => {
    if (!role || !institution) {
      router.replace("/login");
    }
  }, [role, institution, router]);

  // Nenhum conteúdo renderizado se role/institution inválidos — redirect já disparado
  if (!role || !institution) return null;

  const activeTab = role === "compliance" ? "compliance" : role === "regulator" ? "regulator" : "treasury";
  const roleTitle = activeTab === "treasury" ? "Treasury" : activeTab === "compliance" ? "Compliance" : "Regulatory Audit";
  const sectionMeta = SECTION_TITLES[activeNav] ?? SECTION_TITLES.dashboard;

  const haltAgent = () => {
    if (halted) return;
    if (window.confirm("Halt the agent? This invalidates the active AgentSession immediately and requires CEO + CFO co-signature to issue a new one.")) {
      setHalted(true);
      setPaused(true);
    }
  };

  const simulateMarginCall = async () => {
    if (simState !== "idle" || paused) return;
    setSimState("incoming");
    await new Promise(r => setTimeout(r, 1800));
    setSimState("reasoning");
    let dots = 0;
    const id = setInterval(() => { dots = (dots + 1) % 4; setReasoningDots(".".repeat(dots)); }, 350);
    await new Promise(r => setTimeout(r, 3200));
    clearInterval(id);
    setSimState("responded");
    setActions(prev => [{
      actionId: "ACT-003",
      actionType: "MarginCallResponse",
      amount: 80_000,
      asset: "Treasury",
      timestamp: new Date().toISOString(),
      aiRationale: "Margin call MC-2026-0055 from Bank C requires $80K Treasury within 1h. Penalty $8K if default. Pool holds $1.46M Treasury (28% utilization). Amount within margin call limit ($300K) and daily volume remaining ($1.57M). Responding immediately to avoid penalty. Confidence: 97%.",
      limitChecks: [
        { limitName: "margin_call_limit", checked: 80_000,  allowed: 300_000,   passed: true },
        { limitName: "single_action_cap", checked: 80_000,  allowed: 500_000,   passed: true },
        { limitName: "daily_volume_cap",  checked: 510_000, allowed: 2_000_000, passed: true },
      ],
    }, ...prev]);
    await new Promise(r => setTimeout(r, 2500));
    setSimState("idle");
  };

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.textPri, fontFamily: "var(--font-geist-sans), sans-serif" }}>
      <Sidebar role={role} institution={institution} activeTab={activeNav} onTabChange={setActiveNav} />

      {/* Main content */}
      <div style={{ marginLeft: 220, minHeight: "100vh" }}>
        {/* Top bar */}
        <header className="sticky top-0 z-10 flex items-center justify-between px-8 py-4"
          style={{ background: `${C.bg}E0`, backdropFilter: "blur(12px)", borderBottom: `1px solid ${C.border}` }}>
          <div>
            <h1 className="text-base font-semibold" style={{ color: C.textPri }}>
              {roleTitle} — {sectionMeta.title}
            </h1>
            <p className="text-xs mt-0.5" style={{ color: C.textMuted }}>
              {sectionMeta.sub}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className={`w-1.5 h-1.5 rounded-full ${halted ? "" : "animate-pulse"}`} style={{ background: halted ? C.red : paused ? C.amber : C.green }} />
              <span style={{ color: C.textSec }}>Agent {halted ? "Halted" : paused ? "Paused" : "Active"}</span>
            </div>
          </div>
        </header>

        <main className="px-8 py-6">
          {activeTab === "treasury" && (
            <TreasuryTab
              section={activeNav}
              actions={actions}
              simState={simState}
              reasoningDots={reasoningDots}
              paused={paused}
              onSimulate={simulateMarginCall}
              onPause={() => setPaused(p => !p)}
            />
          )}
          {activeTab === "compliance" && <ComplianceTab section={activeNav} halted={halted} onHalt={haltAgent} />}
          {activeTab === "regulator" && <RegulatorTab section={activeNav} />}
        </main>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardInner />
    </Suspense>
  );
}
