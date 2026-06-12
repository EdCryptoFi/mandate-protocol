/* ============================================================
   MANDATE — Chart library (core). React + SVG, refined.
   Exposes to window: fmt, useMeasure, NavChart, DonutChart,
   DeployedGauge, Sparkline, MiniArea, StatTrend.
   Requires React (global). Loaded as text/babel.
   ============================================================ */
const { useState, useRef, useEffect, useMemo, useCallback } = React;

/* ---------- formatters ---------- */
const fmt = {
  usd(n, dp = 1) {
    const a = Math.abs(n);
    if (a >= 1e9) return `$${(n/1e9).toFixed(dp)}B`;
    if (a >= 1e6) return `$${(n/1e6).toFixed(dp)}M`;
    if (a >= 1e3) return `$${(n/1e3).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  },
  usdFull(n) { return n.toLocaleString('en-US', { style:'currency', currency:'USD', maximumFractionDigits:0 }); },
  pct(n, dp = 1) { return `${n>0?'':''}${n.toFixed(dp)}%`; },
  mult(n, dp = 2) { return `${n.toFixed(dp)}×`; },
  compact(n) { return Intl.NumberFormat('en', { notation:'compact', maximumFractionDigits:1 }).format(n); },
};
window.fmt = fmt;

/* ---------- responsive measure ---------- */
function useMeasure() {
  const ref = useRef(null);
  const [rect, setRect] = useState({ width: 0, height: 0 });
  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;
    const read = () => {
      const w = el.clientWidth || el.offsetWidth || (el.parentElement && el.parentElement.clientWidth) || 0;
      const h = el.clientHeight || el.offsetHeight || 0;
      setRect((p) => (p.width === w && p.height === h ? p : { width: w, height: h }));
    };
    read();
    // retry a couple frames in case layout settles late
    const r1 = requestAnimationFrame(read);
    const t1 = setTimeout(read, 120);
    let ro;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(read);
      ro.observe(el);
    }
    window.addEventListener('resize', read);
    return () => { cancelAnimationFrame(r1); clearTimeout(t1); ro && ro.disconnect(); window.removeEventListener('resize', read); };
  }, []);
  return [ref, rect];
}
window.useMeasure = useMeasure;

/* ---------- mount animation progress 0..1 ---------- */
function useProgress(dur = 1100, deps = []) {
  const [p, setP] = useState(0);
  useEffect(() => {
    let raf, t0;
    const ease = (x) => 1 - Math.pow(1 - x, 3);
    const step = (t) => {
      if (!t0) t0 = t;
      const k = Math.min(1, (t - t0) / dur);
      setP(ease(k));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, deps);
  return p;
}
window.useProgress = useProgress;

/* ---------- monotone cubic path (smooth, no overshoot) ---------- */
function smoothPath(pts) {
  if (pts.length < 2) return '';
  const n = pts.length;
  const dx = [], dy = [], m = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i+1][0]-pts[i][0]; dy[i] = pts[i+1][1]-pts[i][1]; m[i] = dy[i]/dx[i]; }
  const t = [m[0]];
  for (let i = 1; i < n - 1; i++) t[i] = (m[i-1]*m[i] <= 0) ? 0 : (m[i-1]+m[i])/2;
  t[n-1] = m[n-2];
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < n - 1; i++) {
    const x1 = pts[i][0] + dx[i]/3, y1 = pts[i][1] + t[i]*dx[i]/3;
    const x2 = pts[i+1][0] - dx[i]/3, y2 = pts[i+1][1] - t[i+1]*dx[i]/3;
    d += `C${x1},${y1} ${x2},${y2} ${pts[i+1][0]},${pts[i+1][1]}`;
  }
  return d;
}
function linePath(pts){ return pts.map((p,i)=>`${i?'L':'M'}${p[0]},${p[1]}`).join(''); }

/* ---------- scales ---------- */
const sLin = (d0,d1,r0,r1) => (v) => r0 + (r1-r0) * ((v-d0)/((d1-d0)||1));
function niceTicks(min, max, count = 5) {
  const span = max - min || 1;
  const step0 = span / count;
  const mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const norm = step0 / mag;
  const step = (norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10) * mag;
  const t = []; let v = Math.ceil(min/step)*step;
  for (; v <= max + 1e-6; v += step) t.push(+v.toFixed(6));
  return t;
}

/* ============================================================
   NAV CHART — area + line, optional second series, gridlines,
   crosshair + tooltip. data: [{t:'2021', nav, called?, dist?}]
   ============================================================ */
function NavChart({ data, height = 300, valueKey = 'nav', series = [], yFormat = (v)=>fmt.usd(v), tipLabel = 'NAV' }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(1200, [width]);
  const [hover, setHover] = useState(null);
  const W = width || 600, H = height;
  const pad = { t: 16, r: 16, b: 28, l: 48 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

  const allVals = useMemo(() => {
    let vs = data.map(d => d[valueKey]);
    series.forEach(s => vs = vs.concat(data.map(d => d[s.key] || 0)));
    return vs;
  }, [data, valueKey, series]);
  const ymax = Math.max(...allVals) * 1.08;
  const ymin = Math.min(0, ...allVals);
  const x = sLin(0, data.length - 1, pad.l, pad.l + iw);
  const y = sLin(ymin, ymax, pad.t + ih, pad.t);
  const ticks = niceTicks(ymin, ymax, 5);

  const mainPts = data.map((d,i) => [x(i), y(d[valueKey])]);
  const dMain = smoothPath(mainPts);
  const dArea = dMain + `L${x(data.length-1)},${y(ymin)}L${x(0)},${y(ymin)}Z`;

  const onMove = useCallback((e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const i = Math.round((mx - pad.l) / (iw / (data.length - 1)));
    if (i >= 0 && i < data.length) setHover(i);
  }, [iw, data.length]);

  return (
    <div ref={ref} style={{ position:'relative', width:'100%' }}>
      {width > 0 && (
      <svg width={W} height={H} onMouseMove={onMove} onMouseLeave={()=>setHover(null)} style={{ display:'block' }}>
        <defs>
          <linearGradient id="navFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#11C988" stopOpacity="0.22"/>
            <stop offset="100%" stopColor="#11C988" stopOpacity="0.01"/>
          </linearGradient>
          <clipPath id="navClip"><rect x={pad.l} y={pad.t} width={iw*p} height={ih}/></clipPath>
        </defs>
        {/* gridlines */}
        {ticks.map((tk,i)=>(
          <g key={i}>
            <line x1={pad.l} x2={pad.l+iw} y1={y(tk)} y2={y(tk)} stroke="#E6E1D5" strokeWidth="1" strokeDasharray={tk===0?'0':'0'}/>
            <text x={pad.l-10} y={y(tk)+3.5} textAnchor="end" fontSize="10.5" fontFamily="var(--mono)" fill="#9AA0A7">{yFormat(tk)}</text>
          </g>
        ))}
        {/* x labels */}
        {data.map((d,i)=> (i % Math.ceil(data.length/8 || 1) === 0 || i===data.length-1) && (
          <text key={i} x={x(i)} y={H-9} textAnchor="middle" fontSize="10.5" fontFamily="var(--mono)" fill="#9AA0A7">{d.t}</text>
        ))}
        {/* secondary series (dashed lines) */}
        {series.map((s,si)=>(
          <path key={si} d={smoothPath(data.map((d,i)=>[x(i), y(d[s.key]||0)]))} fill="none"
            stroke={s.color} strokeWidth="1.6" strokeDasharray={s.dash||'4 4'} opacity="0.85" clipPath="url(#navClip)"/>
        ))}
        {/* area + main */}
        <path d={dArea} fill="url(#navFill)" clipPath="url(#navClip)"/>
        <path d={dMain} fill="none" stroke="#0D5A43" strokeWidth="2.4" strokeLinecap="round" clipPath="url(#navClip)"/>
        {/* hover */}
        {hover!=null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t+ih} stroke="#0D5A43" strokeWidth="1" strokeDasharray="3 3" opacity="0.4"/>
            <circle cx={x(hover)} cy={y(data[hover][valueKey])} r="4.5" fill="#0D5A43" stroke="#fff" strokeWidth="2"/>
          </g>
        )}
      </svg>)}
      {hover!=null && width>0 && (
        <div className="chart-tip" style={{ left: x(hover), top: y(data[hover][valueKey]) }}>
          <div className="tt-k">{data[hover].t} · {tipLabel}</div>
          <div className="tt-v">{yFormat(data[hover][valueKey])}</div>
          {series.map((s,i)=>(
            <div key={i} className="tt-row" style={{marginTop:3}}>
              <span className="tt-sw" style={{background:s.color}}></span>
              <span style={{fontSize:11,color:'#B8C0C6'}}>{s.label}: {yFormat(data[hover][s.key]||0)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
window.NavChart = NavChart;

/* ============================================================
   DONUT — allocation with hover, center total, legend optional
   data: [{label, value, color}]
   ============================================================ */
function DonutChart({ data, size = 240, thickness = 30, centerLabel = 'AUM', centerValue, onHover }) {
  const p = useProgress(1100, []);
  const [hi, setHi] = useState(null);
  const total = data.reduce((s,d)=>s+d.value,0);
  const R = size/2, r = R - thickness/2 - 4;
  const C = 2*Math.PI*r;
  let acc = 0;
  const arcs = data.map((d,i) => {
    const frac = d.value/total;
    const seg = { ...d, frac, offset: acc, i };
    acc += frac; return seg;
  });
  return (
    <div style={{ position:'relative', width:size, height:size }}
      onMouseLeave={()=>{ setHi(null); onHover && onHover(null); }}>
      <svg width={size} height={size} style={{ transform:'rotate(-90deg)' }}>
        {arcs.map((a,i)=>{
          const len = C * a.frac * p;
          const gap = C - len;
          const dash = `${Math.max(0,len-2)} ${gap+2}`;
          const off = -C * a.offset * p;
          const lift = hi===i ? 1.5 : 0;
          return (
            <circle key={i} cx={R} cy={R} r={r} fill="none"
              stroke={a.color} strokeWidth={thickness + lift*2}
              strokeDasharray={dash} strokeDashoffset={off}
              style={{ transition:'stroke-width .2s', cursor:'pointer', opacity: hi==null||hi===i?1:0.4 }}
              onMouseEnter={()=>{ setHi(i); onHover && onHover(a); }} />
          );
        })}
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', pointerEvents:'none' }}>
        <div style={{ fontFamily:'var(--mono)', fontSize:10.5, letterSpacing:'.14em', textTransform:'uppercase', color:'#9AA0A7' }}>
          {hi!=null ? data[hi].label : centerLabel}
        </div>
        <div style={{ fontFamily:'var(--serif)', fontSize: size*0.16, fontWeight:380, color:'#14181C', lineHeight:1.05, marginTop:2 }}>
          {hi!=null ? `${(data[hi].value/total*100).toFixed(0)}%` : (centerValue || fmt.usd(total*1e6))}
        </div>
        {hi!=null && <div style={{fontFamily:'var(--mono)', fontSize:11, color:'#6A717A', marginTop:2}}>{fmt.usd(data[hi].value*1e6)}</div>}
      </div>
    </div>
  );
}
window.DonutChart = DonutChart;

/* ============================================================
   DEPLOYED GAUGE — radial dry-powder gauge (deployed/reserved/avail)
   segments: [{label,value,color}]
   ============================================================ */
function DeployedGauge({ segments, size = 220, label = 'Committed' }) {
  const p = useProgress(1200, []);
  const total = segments.reduce((s,d)=>s+d.value,0);
  const R = size/2, r = R - 16, thick = 16;
  const start = Math.PI * 0.75, end = Math.PI * 2.25; // 270deg arc
  const span = end - start;
  const pol = (ang, rr) => [R + rr*Math.cos(ang), R + rr*Math.sin(ang)];
  const arc = (a0, a1, rr) => {
    const [x0,y0]=pol(a0,rr), [x1,y1]=pol(a1,rr);
    const large = (a1-a0) > Math.PI ? 1 : 0;
    return `M${x0},${y0}A${rr},${rr} 0 ${large} 1 ${x1},${y1}`;
  };
  let acc = 0;
  return (
    <div style={{ position:'relative', width:size, height:size }}>
      <svg width={size} height={size}>
        <path d={arc(start,end,r)} fill="none" stroke="#ECE8DD" strokeWidth={thick} strokeLinecap="round"/>
        {segments.map((s,i)=>{
          const a0 = start + span*(acc/total);
          const a1 = start + span*((acc+s.value)/total)*p + span*(acc/total)*(1-p);
          acc += s.value;
          return <path key={i} d={arc(a0, Math.max(a0+0.001,a1), r)} fill="none" stroke={s.color} strokeWidth={thick} strokeLinecap="round"/>;
        })}
      </svg>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
        <div className="num" style={{ fontFamily:'var(--serif)', fontSize:size*0.2, fontWeight:380, color:'#14181C' }}>
          {((segments[0].value/total)*100).toFixed(0)}%
        </div>
        <div style={{ fontFamily:'var(--mono)', fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', color:'#9AA0A7' }}>{label}</div>
      </div>
    </div>
  );
}
window.DeployedGauge = DeployedGauge;

/* ============================================================
   SPARKLINE — tiny inline trend
   ============================================================ */
function Sparkline({ values, width = 90, height = 28, color = '#0D5A43', fill = true }) {
  const min = Math.min(...values), max = Math.max(...values);
  const x = sLin(0, values.length-1, 1, width-1);
  const y = sLin(min, max, height-3, 3);
  const pts = values.map((v,i)=>[x(i), y(v)]);
  const d = smoothPath(pts);
  const up = values[values.length-1] >= values[0];
  const c = color || (up ? '#0D5A43' : '#B4472E');
  return (
    <svg width={width} height={height} style={{ display:'block', overflow:'visible' }}>
      {fill && <path d={`${d}L${x(values.length-1)},${height}L${x(0)},${height}Z`} fill={c} opacity="0.08"/>}
      <path d={d} fill="none" stroke={c} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx={x(values.length-1)} cy={y(values[values.length-1])} r="2.2" fill={c}/>
    </svg>
  );
}
window.Sparkline = Sparkline;

/* ============================================================
   MINI AREA — small area card chart
   ============================================================ */
function MiniArea({ values, height = 64, color = '#0D5A43', id = 'ma' }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(900, [width]);
  const W = width||200, H = height;
  const min = Math.min(...values), max = Math.max(...values);
  const x = sLin(0, values.length-1, 0, W);
  const y = sLin(min, max*1.05, H-2, 6);
  const pts = values.map((v,i)=>[x(i),y(v)]);
  const d = smoothPath(pts);
  return (
    <div ref={ref} style={{ width:'100%' }}>
      {width>0 && (
        <svg width={W} height={H} style={{display:'block'}}>
          <defs><linearGradient id={`mg-${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18"/><stop offset="100%" stopColor={color} stopOpacity="0"/>
          </linearGradient>
          <clipPath id={`mc-${id}`}><rect x="0" y="0" width={W*p} height={H}/></clipPath></defs>
          <path d={`${d}L${W},${H}L0,${H}Z`} fill={`url(#mg-${id})`} clipPath={`url(#mc-${id})`}/>
          <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" clipPath={`url(#mc-${id})`}/>
        </svg>
      )}
    </div>
  );
}
window.MiniArea = MiniArea;
