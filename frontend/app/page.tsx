"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { Shield, Lock, Eye, Zap, ChevronRight, CheckCircle, ArrowRight } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Palette — mirrors Canton Network's navy-on-white / white-on-navy   */
/* ------------------------------------------------------------------ */
// Primary dark: #0B0F1A  Secondary: #111827  Accent: #4F6EF7 (indigo-blue)
// Text muted: #64748b    Border: #1e293b

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 0.7s ease ${delay}ms, transform 0.7s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Data                                                                */
/* ------------------------------------------------------------------ */

const PILLARS = [
  {
    icon: Lock,
    title: "Authority in the ledger.",
    body: "The AI agent's limits are not policies. They are cryptographic contracts. The Canton protocol rejects any action that exceeds them — at the transaction level.",
  },
  {
    icon: Eye,
    title: "Privacy fit for regulated institutions.",
    body: "Counterparties never see your full positions. Regulators see decisions and reasoning without seeing balances. Canton's sub-transaction privacy enforces both simultaneously.",
  },
  {
    icon: Zap,
    title: "Decisions recorded, forever.",
    body: "Every action the agent takes is stored immutably on-chain — what it did, why it did it, and which limits were checked. The ledger is the audit trail.",
  },
];

const LAYERS = [
  {
    num: "I",
    who: "CEO + CFO",
    label: "Institution Mandate",
    body: "The constitutional ceiling. Defines which assets, which counterparties, and the absolute maximum volumes. Cannot be exceeded — by anyone.",
    accent: "#4F6EF7",
  },
  {
    num: "II",
    who: "Compliance + Treasury",
    label: "Operational Mandate",
    body: "Day-to-day risk parameters: target allocations, rebalance thresholds, margin call limits. Can only tighten the Institution Mandate, never loosen it.",
    accent: "#06b6d4",
  },
  {
    num: "III",
    who: "Treasury Manager",
    label: "Agent Session",
    body: "A time-limited token specifying exactly which actions are permitted today. Expires automatically. The AI agent operates exclusively here.",
    accent: "#8b5cf6",
  },
];

const WHAT_IT_MANAGES = [
  {
    title: "Collateral Pools",
    desc: "Monitor holdings across asset classes. Rebalance automatically when allocation drifts beyond the configured threshold.",
  },
  {
    title: "Margin Calls",
    desc: "Respond to incoming calls in milliseconds — within session limits. Escalate to humans when limits would be exceeded.",
  },
  {
    title: "DVP Settlement",
    desc: "Confirm atomic cross-institution delivery-vs-payment. Both legs settle or neither does.",
  },
  {
    title: "Audit Trail",
    desc: "Every decision creates an immutable AgentAction with the AI's reasoning stored permanently on the Canton ledger.",
  },
];

/* ------------------------------------------------------------------ */
/*  Page                                                                */
/* ------------------------------------------------------------------ */

export default function Landing() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen text-white" style={{ background: "#0B0F1A" }}>

      {/* ── Nav ── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 border-b"
        style={{ background: "rgba(11,15,26,0.85)", backdropFilter: "blur(12px)", borderColor: "#1e293b" }}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg" style={{ background: "#4F6EF7" }}>
              <Shield size={17} />
            </div>
            <span className="font-semibold tracking-tight text-sm">Mandate Protocol</span>
            <span
              className="hidden sm:inline text-xs px-2 py-0.5 rounded-full font-medium ml-1"
              style={{ background: "#4F6EF710", color: "#818cf8", border: "1px solid #4F6EF730" }}
            >
              Built on Canton
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="text-xs hidden sm:block" style={{ color: "#64748b" }}>
              How it works
            </a>
            <button
              onClick={() => router.push("/login")}
              className="text-xs px-4 py-2 rounded-lg font-medium transition-opacity hover:opacity-80"
              style={{ background: "#4F6EF7" }}
            >
              Sign In
            </button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="pt-36 pb-28 px-6 relative overflow-hidden">
        {/* Glow blob */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
          style={{
            width: 700, height: 500,
            background: "radial-gradient(ellipse at center, #4F6EF718 0%, transparent 70%)",
          }}
        />
        {/* Grid lines */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(#1e293b22 1px, transparent 1px), linear-gradient(90deg, #1e293b22 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            maskImage: "radial-gradient(ellipse 80% 60% at 50% 0%, black, transparent)",
          }}
        />

        <div className="max-w-4xl mx-auto text-center relative">
          <div
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8 transition-all duration-500 ${ready ? "opacity-100" : "opacity-0"}`}
            style={{ background: "#4F6EF710", border: "1px solid #4F6EF730", color: "#a5b4fc" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#4F6EF7" }} />
            Agentic Commerce · Canton Hackathon 2026
          </div>

          <h1
            className={`text-5xl sm:text-6xl font-bold leading-tight mb-6 transition-all duration-700 delay-100 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            style={{ letterSpacing: "-0.02em" }}
          >
            Where treasury{" "}
            <em style={{ fontStyle: "italic", color: "#818cf8" }}>flows.</em>
            <br />
            Within limits you{" "}
            <em style={{ fontStyle: "italic", color: "#67e8f9" }}>define.</em>
          </h1>

          <p
            className={`text-base max-w-xl mx-auto mb-10 leading-relaxed transition-all duration-700 delay-200 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
            style={{ color: "#94a3b8" }}
          >
            An AI agent that manages institutional collateral and responds to margin calls —
            with authority limits enforced by the Canton Network ledger,{" "}
            <span style={{ color: "#cbd5e1" }}>not by trust.</span>
          </p>

          <div
            className={`flex flex-col sm:flex-row gap-3 justify-center transition-all duration-700 delay-300 ${ready ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          >
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-85"
              style={{ background: "#4F6EF7" }}
            >
              Access Dashboard <ChevronRight size={15} />
            </button>
            <a
              href="#how"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-colors hover:border-opacity-60"
              style={{ border: "1px solid #1e293b", color: "#94a3b8" }}
            >
              See how it works
            </a>
          </div>

          {/* Stat bar */}
          <div
            className={`mt-20 grid grid-cols-3 divide-x transition-all duration-700 delay-500 ${ready ? "opacity-100" : "opacity-0"}`}
            style={{ border: "1px solid #1e293b", borderRadius: 16, background: "#111827" }}
          >
            {[
              { v: "On-chain", label: "Limit enforcement", sub: "Protocol-level rejection" },
              { v: "100%",     label: "AI decisions logged", sub: "Immutable audit trail" },
              { v: "Sub-tx",   label: "Privacy model",       sub: "Canton native" },
            ].map(s => (
              <div key={s.label} className="py-5 px-4 text-center" style={{ borderColor: "#1e293b" }}>
                <div className="text-xl font-bold" style={{ color: "#e2e8f0" }}>{s.v}</div>
                <div className="text-xs mt-0.5" style={{ color: "#4F6EF7" }}>{s.sub}</div>
                <div className="text-xs mt-1" style={{ color: "#475569" }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Three pillars ── */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid #1e293b" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#4F6EF7" }}>
              Core Properties
            </p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>
              Connections without the trade-offs.
            </h2>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: "#64748b" }}>
              Privacy and auditability. Autonomy and control. Mandate Protocol delivers both — simultaneously.
            </p>
          </FadeIn>
          <div className="grid sm:grid-cols-3 gap-5">
            {PILLARS.map((p, i) => (
              <FadeIn key={p.title} delay={i * 80}>
                <div
                  className="rounded-2xl p-6 h-full"
                  style={{ background: "#111827", border: "1px solid #1e293b" }}
                >
                  <div className="p-2.5 rounded-xl w-fit mb-5" style={{ background: "#4F6EF710" }}>
                    <p.icon size={20} style={{ color: "#818cf8" }} />
                  </div>
                  <h3 className="font-semibold text-sm mb-3" style={{ color: "#e2e8f0" }}>{p.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{p.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="py-20 px-6" style={{ borderTop: "1px solid #1e293b", background: "#0d1220" }}>
        <div className="max-w-5xl mx-auto">
          <FadeIn className="text-center mb-14">
            <p className="text-xs font-semibold tracking-widest uppercase mb-3" style={{ color: "#06b6d4" }}>
              Authority Model
            </p>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: "-0.02em" }}>
              Decentralization with <em style={{ fontStyle: "italic", color: "#67e8f9" }}>control.</em>
            </h2>
            <p className="text-sm mt-3 max-w-lg mx-auto" style={{ color: "#64748b" }}>
              Three layers of authority. Each layer can only tighten the one above.
              The AI agent operates exclusively at the bottom.
            </p>
          </FadeIn>

          <div className="space-y-3">
            {LAYERS.map((l, i) => (
              <FadeIn key={l.num} delay={i * 100}>
                <div
                  className="flex gap-6 rounded-2xl p-6"
                  style={{
                    background: "#111827",
                    border: `1px solid ${l.accent}25`,
                    boxShadow: `0 0 0 1px ${l.accent}10`,
                  }}
                >
                  <div className="shrink-0 text-center w-10">
                    <div className="text-xs font-mono font-bold" style={{ color: l.accent }}>
                      {l.num}
                    </div>
                    <div className="text-xs mt-1" style={{ color: "#475569" }}>{l.who}</div>
                  </div>
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: "#e2e8f0" }}>{l.label}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{l.body}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
            <FadeIn delay={300}>
              <div
                className="flex gap-6 rounded-2xl p-6"
                style={{ background: "#111827", border: "1px solid #16a34a25" }}
              >
                <div className="shrink-0 w-10 text-center">
                  <div className="text-xs font-mono font-bold" style={{ color: "#4ade80" }}>AI</div>
                  <div className="text-xs mt-1" style={{ color: "#475569" }}>Agent</div>
                </div>
                <div>
                  <div className="text-sm font-semibold mb-1" style={{ color: "#e2e8f0" }}>Operates within the mandate</div>
                  <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>
                    Monitors the ledger, reasons with Claude, and submits actions —{" "}
                    <span style={{ color: "#4ade80" }}>only within its session limits.</span>{" "}
                    If any assertion fails, the Canton ledger rejects the transaction.
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ── What it manages ── */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid #1e293b" }}>
        <div className="max-w-5xl mx-auto grid sm:grid-cols-2 gap-12 items-center">
          <FadeIn>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#4F6EF7" }}>
              Operations
            </p>
            <h2 className="text-3xl font-bold mb-5" style={{ letterSpacing: "-0.02em" }}>
              Everything the{" "}
              <em style={{ fontStyle: "italic", color: "#818cf8" }}>treasury needs.</em>
            </h2>
            <p className="text-sm leading-relaxed" style={{ color: "#64748b" }}>
              From daily rebalancing to emergency margin call responses — the agent handles
              routine operations autonomously while escalating decisions that require human judgment.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="mt-8 flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: "#818cf8" }}
            >
              View the dashboard <ArrowRight size={14} />
            </button>
          </FadeIn>

          <div className="space-y-4">
            {WHAT_IT_MANAGES.map((item, i) => (
              <FadeIn key={item.title} delay={i * 80}>
                <div
                  className="flex gap-4 rounded-xl p-5"
                  style={{ background: "#111827", border: "1px solid #1e293b" }}
                >
                  <CheckCircle size={16} style={{ color: "#4F6EF7", flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div className="text-sm font-semibold mb-1" style={{ color: "#e2e8f0" }}>{item.title}</div>
                    <div className="text-xs leading-relaxed" style={{ color: "#64748b" }}>{item.desc}</div>
                  </div>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Privacy section ── */}
      <section className="py-20 px-6" style={{ borderTop: "1px solid #1e293b", background: "#0d1220" }}>
        <div className="max-w-4xl mx-auto">
          <FadeIn>
            <div
              className="rounded-2xl p-12 text-center relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #1a1f3a 0%, #0f172a 100%)",
                border: "1px solid #4F6EF730",
              }}
            >
              {/* Decorative glow */}
              <div
                className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none"
                style={{ width: 400, height: 200, background: "radial-gradient(ellipse, #4F6EF714, transparent 70%)" }}
              />
              <div className="relative">
                <div
                  className="p-3 rounded-2xl w-fit mx-auto mb-6"
                  style={{ background: "#4F6EF715", border: "1px solid #4F6EF730" }}
                >
                  <Lock size={24} style={{ color: "#818cf8" }} />
                </div>
                <h2 className="text-2xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>
                  Privacy fit for regulated institutions.
                </h2>
                <p className="text-sm max-w-xl mx-auto leading-relaxed" style={{ color: "#94a3b8" }}>
                  The regulator sees every AI decision and its full reasoning.{" "}
                  <span style={{ color: "#e2e8f0" }}>Not your positions.</span>{" "}
                  Canton's sub-transaction privacy enforces this at the protocol level —
                  not a permission flag, not a policy. The protocol.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-6 justify-center">
                  {[
                    "AI rationale stored on-chain",
                    "Positions private by protocol",
                    "Immutable audit log",
                  ].map(f => (
                    <div key={f} className="flex items-center gap-2 text-xs" style={{ color: "#818cf8" }}>
                      <CheckCircle size={13} />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ borderTop: "1px solid #1e293b" }}>
        <FadeIn>
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: "#4F6EF7" }}>
            Get Started
          </p>
          <h2 className="text-3xl font-bold mb-4" style={{ letterSpacing: "-0.02em" }}>
            Delegate with <em style={{ fontStyle: "italic", color: "#818cf8" }}>confidence.</em>
          </h2>
          <p className="text-sm mb-10 max-w-sm mx-auto" style={{ color: "#64748b" }}>
            Set your mandate. Issue a session. Let the agent work —
            within exactly the limits you defined.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => router.push("/login")}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-opacity hover:opacity-85"
              style={{ background: "#4F6EF7" }}
            >
              Access Dashboard <ChevronRight size={15} />
            </button>
            <a
              href="https://github.com"
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-medium text-sm"
              style={{ border: "1px solid #1e293b", color: "#64748b" }}
            >
              View on GitHub
            </a>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-8" style={{ borderTop: "1px solid #1e293b" }}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1 rounded" style={{ background: "#4F6EF7" }}>
              <Shield size={13} />
            </div>
            <span className="text-xs font-medium" style={{ color: "#94a3b8" }}>Mandate Protocol</span>
          </div>
          <div className="text-xs" style={{ color: "#334155" }}>
            Built on Canton Network · Build on Canton Hackathon 2026 · Powered by Daml + Claude AI
          </div>
          <div className="flex gap-5 text-xs" style={{ color: "#475569" }}>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <button onClick={() => router.push("/login")} className="hover:text-white transition-colors">Dashboard</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
