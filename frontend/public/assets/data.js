/* ============================================================
   MANDATE PROTOCOL — Treasury data model (global: window.MANDATE)
   Institution: Bank A — Global Treasury · Canton Sandbox
   ============================================================ */
window.MANDATE = (function () {

  // ---- Institution ----
  const institution = {
    name: 'Bank A — Global Treasury',
    party: 'BankA',
    network: 'Canton Sandbox',
    counterparties: ['Bank B — Fixed Income', 'Clearinghouse Gamma'],
  };

  // ---- Collateral Pool ----
  const pool = {
    poolId: 'POOL-BANKA-001',
    totalValue: 5200000,
    utilization: 32,
    locked: 1664000,
  };

  // ---- Session ----
  const session = {
    sessionId: 'AGT-2026-001',
    status: 'live',
    expiresIn: '8h 12m',
    role: 'Treasury Manager',
    permittedChoices: ['CanRebalance', 'CanRespondToMarginCall', 'CanPostCollateral'],
    dailyVolumeCap: 2000000,
    dailyVolumeUsed: 430000,
    marginCallCap: 300000,
    marginCallUsed: 180000,
    singleActionCap: 500000,
    actionsToday: 2,
  };

  // ---- Holdings (for donut chart) ----
  const holdings = [
    { label: 'Bond',      value: 1976000, pct: 38, target: 38, color: '#0D5A43' },
    { label: 'Treasury',  value: 1456000, pct: 28, target: 30, color: '#11C988' },
    { label: 'Cash',      value: 988000,  pct: 19, target: 10, color: '#2F6E8F' },
    { label: 'Equity',    value: 572000,  pct: 11, target: 12, color: '#6A4A7A' },
    { label: 'Commodity', value: 208000,  pct: 4,  target: 10, color: '#9A7A3C' },
  ];

  // ---- Pool value series (quarterly, for NAV-style chart) ----
  const poolSeries = [
    { t:'Q1 2025', nav:4100000, volume:180000, actions:1 },
    { t:'Q2 2025', nav:4350000, volume:210000, actions:2 },
    { t:'Q3 2025', nav:4580000, volume:195000, actions:1 },
    { t:'Q4 2025', nav:4820000, volume:340000, actions:3 },
    { t:'Q1 2026', nav:5050000, volume:380000, actions:2 },
    { t:'Q2 2026', nav:5200000, volume:430000, actions:2 },
  ];

  // ---- Volume chart (intraday) ----
  const volumeSeries = [
    { time:'09:00', volume:0 },
    { time:'10:00', volume:100000 },
    { time:'11:00', volume:250000 },
    { time:'12:00', volume:250000 },
    { time:'13:00', volume:430000 },
    { time:'Now',   volume:430000 },
  ];

  // ---- Agent Actions (on-chain audit log) ----
  const agentActions = [
    {
      actionId: 'ACT-001',
      actionType: 'Rebalance',
      amount: 250000,
      asset: 'Bond',
      toAsset: 'Treasury',
      timestamp: '2026-06-12T10:32:00Z',
      aiRationale: 'Portfolio drift detected. Bond at 42.1% exceeds target 38% by 4.1 pp. Rebalancing $250K Bond → Treasury restores target allocation. Daily volume remaining: $1.75M. Single action cap: $500K. All limits satisfied. Confidence: 94%.',
      limitChecks: [
        { name: 'single_action_cap', checked: 250000, allowed: 500000, passed: true },
        { name: 'daily_volume_cap',  checked: 250000, allowed: 2000000, passed: true },
        { name: 'asset_allowed',     passed: true },
      ],
      humanApproved: false,
      damlTx: 'TX-0xA3F2…8C4E',
    },
    {
      actionId: 'ACT-002',
      actionType: 'MarginCallResponse',
      amount: 180000,
      asset: 'Cash',
      counterparty: 'Bank B',
      callId: 'MC-2026-0042',
      timestamp: '2026-06-12T12:47:00Z',
      aiRationale: 'Margin call MC-2026-0042 from Bank B requires $180K Cash by 16:00 UTC. Penalty $22K if defaulted. Pool holds $988K Cash (utilization 18.9%). Margin call limit: $300K — amount within. Responding immediately to avoid penalty.',
      limitChecks: [
        { name: 'margin_call_limit', checked: 180000, allowed: 300000, passed: true },
        { name: 'single_action_cap', checked: 180000, allowed: 500000, passed: true },
        { name: 'daily_volume_cap',  checked: 430000, allowed: 2000000, passed: true },
      ],
      humanApproved: false,
      damlTx: 'TX-0xB7D1…2A9F',
    },
  ];

  // ---- Mandate layers (for Fund/Mandate page) ----
  const mandateLayers = [
    {
      num: 'I',
      who: 'CEO + CFO',
      title: 'Institution Mandate',
      desc: 'The constitutional ceiling. Defines which assets, which counterparties, and the absolute maximum volumes. Requires two signatures. Cannot be exceeded by anyone — not even the CEO.',
      assets: ['Bond', 'Treasury', 'Cash', 'Equity', 'Commodity'],
      counterparties: ['BankB', 'Clearinghouse Gamma'],
      maxSingleAction: 500000,
      maxDailyVolume: 2000000,
      expiry: '2026-12-31',
    },
    {
      num: 'II',
      who: 'Compliance + Treasury',
      title: 'Operational Mandate',
      desc: 'Day-to-day risk parameters: target allocations, rebalance thresholds, margin call limits. Can only tighten the Institution Mandate, never loosen it.',
      allocationTargets: { Bond: 38, Treasury: 30, Cash: 10, Equity: 12, Commodity: 10 },
      rebalanceThreshold: 5,
      marginCallLimit: 300000,
    },
    {
      num: 'III',
      who: 'Treasury Manager',
      title: 'Agent Session',
      desc: 'A time-limited token specifying exactly which actions are permitted today. Expires automatically. The AI agent operates exclusively within this layer.',
      sessionId: 'AGT-2026-001',
      expiresIn: '8h 12m',
      permittedChoices: ['CanRebalance', 'CanRespondToMarginCall', 'CanPostCollateral'],
    },
  ];

  // ---- Daml test results ----
  const damlTests = [
    { step: 1,  label: 'Institution Mandate created with multi-sig', pass: true },
    { step: 2,  label: 'Operational Mandate issued (compliance + treasury)', pass: true },
    { step: 3,  label: 'Agent Session issued with permitted choices', pass: true },
    { step: 4,  label: 'Agent executes rebalance within limits', pass: true },
    { step: 5,  label: 'AgentAction audit log verified on-chain', pass: true },
    { step: 6,  label: 'Counterparty sends margin call', pass: true },
    { step: 7,  label: 'Agent responds to margin call automatically', pass: true },
    { step: 8,  label: 'Margin call closed successfully', pass: true },
    { step: 9,  label: 'Session volume usage tracked correctly', pass: true },
    { step: 10, label: 'Over-limit action rejected by ledger ✓', pass: true, highlight: true },
    { step: 11, label: 'Disallowed asset rejected by ledger ✓', pass: true, highlight: true },
    { step: 12, label: 'Cross-institution DVP settled atomically', pass: true },
  ];

  // ---- Counterparties / Institutions ----
  const counterparties = [
    { name: 'Bank B — Fixed Income',   party: 'BankB',          type: 'Institution', status: 'active', openCalls: 1, totalSettled: 3 },
    { name: 'Clearinghouse Gamma',     party: 'Clearinghouse',  type: 'Clearinghouse', status: 'active', openCalls: 0, totalSettled: 7 },
    { name: 'Bank C — Asset Mgmt',     party: 'BankC',          type: 'Institution', status: 'pending', openCalls: 0, totalSettled: 0 },
  ];

  // ---- Activity feed ----
  const activity = [
    { kind: 'action', label: 'ACT-002 · MarginCallResponse executed', sub: '$180K Cash posted to Bank B · on-chain', date: '12:47 UTC', icon: '◆' },
    { kind: 'action', label: 'ACT-001 · Rebalance executed', sub: '$250K Bond → Treasury · limits checked', date: '10:32 UTC', icon: '⟳' },
    { kind: 'session', label: 'Agent Session AGT-2026-001 issued', sub: 'Treasury Manager · 8h duration · 3 permissions', date: '09:01 UTC', icon: '⊙' },
    { kind: 'call', label: 'Margin call MC-2026-0042 received', sub: 'Bank B · $180K Cash · deadline 16:00 UTC', date: '12:44 UTC', icon: '↓' },
    { kind: 'audit', label: 'Operational Mandate updated', sub: 'Compliance Officer · rebalance threshold 5% → 4%', date: 'Yesterday', icon: '✎' },
  ];

  // ---- LP / Regulator view roles ----
  const roles = [
    { id: 'treasury',   label: 'Treasury Manager',   desc: 'Issue agent sessions, set operational limits',    institution: 'Bank A' },
    { id: 'compliance', label: 'Compliance Officer',  desc: 'Monitor actions, approve limit changes',          institution: 'Bank A' },
    { id: 'regulator',  label: 'Regulator',           desc: 'Read-only audit view across all institutions',    institution: 'All' },
  ];

  // ---- J-curve reused for Volume-over-time (cumulative) ----
  const jcurve = [
    { t:'Jan 2025', v:-80000 }, { t:'Feb 2025', v:-150000 }, { t:'Mar 2025', v:-100000 },
    { t:'Apr 2025', v: 20000 }, { t:'May 2025', v: 80000  }, { t:'Jun 2025', v:120000  },
    { t:'Jul 2025', v:200000 }, { t:'Aug 2025', v:260000  }, { t:'Sep 2025', v:310000  },
    { t:'Oct 2025', v:380000 }, { t:'Nov 2025', v:410000  }, { t:'Dec 2025', v:430000  },
  ];

  // navSeries alias for chart compatibility
  const navSeries = poolSeries.map(d => ({
    t: d.t,
    nav: d.nav,
    called: d.volume,
    dist: Math.round(d.actions * 50000),
  }));

  // allocation alias (sector donut → holdings donut)
  const allocation = holdings.map(h => ({ label: h.label, value: h.value, color: h.color }));

  return {
    institution, pool, session, holdings, poolSeries, volumeSeries,
    agentActions, mandateLayers, damlTests, counterparties, activity, roles,
    jcurve, navSeries, allocation,
    // fund-level for landing chart compatibility
    fund: {
      name: 'Mandate Protocol', nav: 5200000, tvpi: 0, dpi: 0,
      committed: 5200000, deployed: 1664000, companies: 3,
    },
    lps: counterparties.map((c, i) => ({
      name: c.name, type: c.type,
      committed: [200, 150, 80][i], called: [180, 130, 0][i],
      distributed: [20, 15, 0][i], dpi: [0.11, 0.12, 0][i],
    })),
    capital: [
      { label: 'Bond',     value: 1976000, color: '#0D5A43' },
      { label: 'Treasury', value: 1456000, color: '#11C988' },
      { label: 'Cash',     value: 988000,  color: '#2F6E8F' },
    ],
    waterfall: [
      { label:'Pool Value',  value:5200, base:0, color:'#0D5A43', type:'total'  },
      { label:'Bond',        value:1976, base:0, color:'#0D5A43', type:'up'     },
      { label:'Treasury',    value:1456, base:1976, color:'#11C988', type:'up'  },
      { label:'Cash',        value:988,  base:3432, color:'#2F6E8F', type:'up'  },
      { label:'Equity',      value:572,  base:4420, color:'#6A4A7A', type:'up'  },
      { label:'Commodity',   value:208,  base:4992, color:'#9A7A3C', type:'up'  },
      { label:'Locked',      value:-1664,base:5200, color:'#EF4444', type:'down'},
      { label:'Free',        value:3536, base:0, color:'#11C988', type:'total'  },
    ],
    cohort: [
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0],
      [0.0, 0.0, 0.0, 0.0],
    ],
    pipeline: agentActions.map(a => ({
      id: a.actionId, name: a.actionType, stage: 'Executed',
      amount: a.amount, score: 95, lead: 'Agent',
    })),
    companies: agentActions,
  };
})();
