/* ============================================================
   MANDATE — Shared fund data model (global: window.MANDATE)
   A fictional VC platform fund. Numbers are internally consistent.
   ============================================================ */
window.MANDATE = (function () {
  const sectorColors = {
    'Fintech':'#0D5A43','AI/ML':'#11C988','Infra':'#2F6E8F','Crypto':'#6A4A7A',
    'Bio':'#B5764A','Consumer':'#9A7A3C','Climate':'#5C7A3C',
  };

  // ---- Fund-level (Mandate Fund III) ----
  const fund = {
    name: 'Mandate Fund III',
    vintage: 2021,
    strategy: 'Early-growth · Series A–B',
    committed: 640,      // $M
    called: 486,         // $M
    deployed: 452,       // $M
    reserved: 88,        // $M follow-on reserves
    nav: 1184,           // $M current portfolio value
    distributed: 214,    // $M returned to LPs
    tvpi: 2.88,
    dpi: 0.44,
    rvpi: 2.44,
    moic: 2.62,          // gross
    netIrr: 31.4,        // %
    grossIrr: 38.2,
    companies: 34,
    realized: 6,
  };

  // ---- NAV / value over time (quarterly) ----
  const navSeries = [
    { t:'Q1 21', nav:42, called:64, dist:0 },
    { t:'Q3 21', nav:118, called:150, dist:0 },
    { t:'Q1 22', nav:236, called:228, dist:0 },
    { t:'Q3 22', nav:318, called:286, dist:8 },
    { t:'Q1 23', nav:402, called:336, dist:22 },
    { t:'Q3 23', nav:548, called:372, dist:46 },
    { t:'Q1 24', nav:712, called:410, dist:88 },
    { t:'Q3 24', nav:884, called:442, dist:132 },
    { t:'Q1 25', nav:1024, called:468, dist:176 },
    { t:'Q3 25', nav:1184, called:486, dist:214 },
  ];

  // ---- J-curve (cumulative net cashflow to LPs, $M) ----
  const jcurve = [
    { t:'21', value:-64 }, { t:'', value:-150 }, { t:'22', value:-220 },
    { t:'', value:-278 }, { t:'23', value:-314 }, { t:'', value:-326 },
    { t:'24', value:-290 }, { t:'', value:-180 }, { t:'25', value:-40 },
    { t:'26E', value:120 }, { t:'27E', value:380 }, { t:'28E', value:640 },
  ];

  // ---- Allocation by sector ($M deployed) ----
  const allocation = [
    { label:'AI/ML',    value:128, color:sectorColors['AI/ML'] },
    { label:'Fintech',  value:104, color:sectorColors['Fintech'] },
    { label:'Infra',    value:78,  color:sectorColors['Infra'] },
    { label:'Crypto',   value:58,  color:sectorColors['Crypto'] },
    { label:'Bio',      value:42,  color:sectorColors['Bio'] },
    { label:'Climate',  value:26,  color:sectorColors['Climate'] },
    { label:'Consumer', value:16,  color:sectorColors['Consumer'] },
  ];

  // ---- Capital deployed gauge ----
  const capital = [
    { label:'Deployed', value:452, color:'#0D5A43' },
    { label:'Reserved', value:88,  color:'#11C988' },
    { label:'Dry powder', value:100, color:'#D6F2E6' },
  ];

  // ---- Value-creation waterfall ($M, gross) ----
  const waterfall = [
    { label:'Cost', value:452, type:'base' },
    { label:'Helix', value:186, type:'pos' },
    { label:'Ledgerline', value:142, type:'pos' },
    { label:'Quanta', value:98, type:'pos' },
    { label:'Northwind', value:64, type:'pos' },
    { label:'Markdowns', value:-58, type:'neg' },
    { label:'Others', value:300, type:'pos' },
    { label:'NAV', value:1184, type:'total' },
  ];

  // ---- Cohort / vintage heatmap (MOIC by stage) ----
  const cohort = {
    cols:['Seed','Series A','Series B','Growth'],
    rows:[
      { vintage:'2021', cells:[{label:'4.1×',value:4.1},{label:'3.2×',value:3.2},{label:'2.4×',value:2.4},{label:'1.8×',value:1.8}] },
      { vintage:'2022', cells:[{label:'3.4×',value:3.4},{label:'2.8×',value:2.8},{label:'2.1×',value:2.1},{label:'1.6×',value:1.6}] },
      { vintage:'2023', cells:[{label:'2.6×',value:2.6},{label:'2.2×',value:2.2},{label:'1.7×',value:1.7},{label:'1.3×',value:1.3}] },
      { vintage:'2024', cells:[{label:'1.9×',value:1.9},{label:'1.5×',value:1.5},{label:'1.2×',value:1.2},{label:'1.1×',value:1.1}] },
    ],
  };

  // ---- Portfolio companies ----
  const companies = [
    { id:'helix', name:'Helix Labs', sector:'AI/ML', stage:'Series B', geo:'San Francisco', invested:24, round:'2021', ownership:14.2, value:118, moic:4.9, irr:62, status:'live', desc:'Inference infrastructure for regulated enterprises.' },
    { id:'ledgerline', name:'Ledgerline', sector:'Fintech', stage:'Series B', geo:'New York', invested:22, round:'2021', ownership:11.8, value:96, moic:4.4, irr:54, status:'live', desc:'Real-time settlement rails on Canton.' },
    { id:'quanta', name:'Quanta', sector:'Infra', stage:'Series A', geo:'London', invested:16, round:'2022', ownership:13.4, value:62, moic:3.9, irr:48, status:'live', desc:'Confidential compute for financial data.' },
    { id:'northwind', name:'Northwind', sector:'Climate', stage:'Series B', geo:'Berlin', invested:18, round:'2022', ownership:9.6, value:58, moic:3.2, irr:41, status:'live', desc:'Grid-scale storage orchestration.' },
    { id:'aperture', name:'Aperture', sector:'AI/ML', stage:'Series A', geo:'Toronto', invested:14, round:'2022', ownership:12.1, value:44, moic:3.1, irr:39, status:'live', desc:'Synthetic data for model evaluation.' },
    { id:'meridian', name:'Meridian Bio', sector:'Bio', stage:'Series B', geo:'Boston', invested:20, round:'2021', ownership:8.3, value:52, moic:2.6, irr:33, status:'live', desc:'Protein design platform.' },
    { id:'cobalt', name:'Cobalt', sector:'Crypto', stage:'Series A', geo:'Singapore', invested:12, round:'2023', ownership:10.7, value:34, moic:2.8, irr:44, status:'live', desc:'Institutional custody on privacy ledgers.' },
    { id:'fathom', name:'Fathom', sector:'Fintech', stage:'Series A', geo:'New York', invested:13, round:'2023', ownership:11.2, value:31, moic:2.4, irr:36, status:'live', desc:'Underwriting copilots for private credit.' },
    { id:'tessel', name:'Tessel', sector:'Infra', stage:'Seed', geo:'Austin', invested:6, round:'2023', ownership:9.0, value:18, moic:3.0, irr:51, status:'live', desc:'Edge orchestration for fleets.' },
    { id:'voyager', name:'Voyager', sector:'Consumer', stage:'Series A', geo:'Los Angeles', invested:11, round:'2022', ownership:7.4, value:9, moic:0.8, irr:-9, status:'watch', desc:'Creator commerce network.' },
    { id:'solene', name:'Solène', sector:'Climate', stage:'Seed', geo:'Paris', invested:5, round:'2024', ownership:8.8, value:8, moic:1.6, irr:28, status:'live', desc:'Carbon accounting for supply chains.' },
    { id:'argon', name:'Argon', sector:'Crypto', stage:'Seed', geo:'Zurich', invested:7, round:'2024', ownership:10.0, value:12, moic:1.7, irr:31, status:'live', desc:'Zero-knowledge compliance tooling.' },
  ];

  // ---- Deal pipeline ----
  const pipeline = [
    { name:'Cipher', sector:'Crypto', stage:'Series A', ask:18, geo:'Singapore', status:'IC review', lead:'A. Mensah', score:88, date:'Jun 09' },
    { name:'Brightwell', sector:'Bio', stage:'Series B', ask:25, geo:'Boston', status:'Diligence', lead:'R. Okafor', score:82, date:'Jun 07' },
    { name:'Latch', sector:'Fintech', stage:'Seed', ask:6, geo:'New York', status:'Partner mtg', lead:'S. Vance', score:79, date:'Jun 05' },
    { name:'Orbital', sector:'Infra', stage:'Series A', ask:15, geo:'London', status:'Term sheet', lead:'A. Mensah', score:91, date:'Jun 03' },
    { name:'Pallas', sector:'AI/ML', stage:'Series A', ask:20, geo:'Berlin', status:'Sourced', lead:'D. Reyes', score:74, date:'Jun 02' },
  ];

  // ---- LPs ----
  const lps = [
    { name:'Calderon Endowment', type:'Endowment', committed:120, called:91, distributed:40, dpi:0.44 },
    { name:'Sequoia Pension Trust', type:'Pension', committed:100, called:76, distributed:33, dpi:0.43 },
    { name:'Hanover Family Office', type:'Family office', committed:80, called:61, distributed:27, dpi:0.44 },
    { name:'Meridian Sovereign', type:'Sovereign', committed:140, called:106, distributed:47, dpi:0.44 },
    { name:'Brandt Foundation', type:'Foundation', committed:60, called:46, distributed:20, dpi:0.43 },
    { name:'Westgate Insurance', type:'Insurance', committed:90, called:68, distributed:30, dpi:0.44 },
    { name:'Aria Fund of Funds', type:'FoF', committed:50, called:38, distributed:17, dpi:0.45 },
  ];

  // ---- Capital activity feed ----
  const activity = [
    { kind:'call', label:'Capital Call #11 issued', sub:'$28.0M · all LPs · 8.9% of commitments', amt:28, date:'Jun 10', state:'pending' },
    { kind:'invest', label:'Follow-on · Helix Labs Series B', sub:'$8.0M from reserves · ownership 14.2%', amt:8, date:'Jun 08', state:'settled' },
    { kind:'dist', label:'Distribution · Ledgerline secondary', sub:'$22.0M returned · DPI +0.03', amt:22, date:'Jun 02', state:'settled' },
    { kind:'invest', label:'New position · Cobalt Series A', sub:'$12.0M · 10.7% ownership', amt:12, date:'May 28', state:'settled' },
    { kind:'call', label:'Capital Call #10 settled', sub:'$24.0M · 96 LPs · fully funded', amt:24, date:'May 14', state:'settled' },
  ];

  return { fund, navSeries, jcurve, allocation, capital, waterfall, cohort, companies, pipeline, lps, activity, sectorColors };
})();
