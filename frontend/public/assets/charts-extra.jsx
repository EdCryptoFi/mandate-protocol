/* ============================================================
   MANDATE — Chart library (extra). Uses globals from charts-core:
   fmt, useMeasure, useProgress, smoothPath, sLin, niceTicks.
   Exposes: Waterfall, JCurve, CohortHeatmap, RankBars, GroupBars.
   ============================================================ */

/* ============================================================
   WATERFALL — contribution to gross value.
   data: [{label, value, type:'base'|'pos'|'neg'|'total'}]
   ============================================================ */
function Waterfall({ data, height = 300, yFormat = (v)=>fmt.usd(v) }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(1100, [width]);
  const [hi, setHi] = useState(null);
  const W = width || 640, H = height;
  const pad = { t: 20, r: 16, b: 46, l: 50 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;

  // running totals
  let run = 0; const bars = [];
  let maxV = 0;
  data.forEach(d => {
    if (d.type === 'total' || d.type === 'base') {
      bars.push({ ...d, from: 0, to: d.value });
      run = d.value; maxV = Math.max(maxV, d.value);
    } else {
      const from = run, to = run + d.value;
      bars.push({ ...d, from, to });
      run = to; maxV = Math.max(maxV, from, to);
    }
  });
  const ymax = maxV * 1.12;
  const y = sLin(0, ymax, pad.t+ih, pad.t);
  const bw = iw / bars.length;
  const barW = Math.min(46, bw * 0.6);
  const ticks = niceTicks(0, ymax, 5);
  const colorFor = (b) => b.type==='total'||b.type==='base' ? '#0D5A43' : b.value>=0 ? '#11C988' : '#B4472E';

  return (
    <div ref={ref} style={{ position:'relative', width:'100%' }}>
      {width>0 && (
      <svg width={W} height={H} style={{display:'block'}}>
        {ticks.map((tk,i)=>(
          <g key={i}>
            <line x1={pad.l} x2={pad.l+iw} y1={y(tk)} y2={y(tk)} stroke="#EFEADF" strokeWidth="1"/>
            <text x={pad.l-10} y={y(tk)+3.5} textAnchor="end" fontSize="10.5" fontFamily="var(--mono)" fill="#9AA0A7">{yFormat(tk)}</text>
          </g>
        ))}
        {bars.map((b,i)=>{
          const cx = pad.l + bw*i + bw/2;
          const yTop = y(Math.max(b.from,b.to)), yBot = y(Math.min(b.from,b.to));
          const h = Math.max(2, (yBot - yTop) * p);
          const yy = b.to>=b.from ? yBot - h : yTop + ( (yBot-yTop) - h );
          const drawY = b.to>=b.from ? (yBot - h) : yTop;
          return (
            <g key={i} onMouseEnter={()=>setHi(i)} onMouseLeave={()=>setHi(null)} style={{cursor:'pointer'}}>
              {i < bars.length-1 && (
                <line x1={cx} x2={cx+bw} y1={y(b.to)} y2={y(b.to)} stroke="#C3C6C0" strokeWidth="1" strokeDasharray="2 2" opacity={p}/>
              )}
              <rect x={cx-barW/2} y={drawY} width={barW} height={h} rx="2.5"
                fill={colorFor(b)} opacity={hi==null||hi===i?1:0.45}/>
              <text x={cx} y={H-26} textAnchor="middle" fontSize="11" fontFamily="var(--sans)" fontWeight="500" fill="#353B42">{b.label}</text>
              <text x={cx} y={H-12} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill={b.type==='base'||b.type==='total'?'#0D5A43':b.value>=0?'#0D5A43':'#B4472E'}>
                {b.type==='base'||b.type==='total'?yFormat(b.value):(b.value>=0?'+':'−')+yFormat(Math.abs(b.value))}
              </text>
            </g>
          );
        })}
      </svg>)}
    </div>
  );
}
window.Waterfall = Waterfall;

/* ============================================================
   J-CURVE — cumulative net cashflow; negative trough then climb.
   data: [{t, value}]  (value can be negative)
   ============================================================ */
function JCurve({ data, height = 280, yFormat = (v)=>fmt.usd(v) }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(1300, [width]);
  const [hover, setHover] = useState(null);
  const W = width || 640, H = height;
  const pad = { t: 18, r: 18, b: 28, l: 52 };
  const iw = W - pad.l - pad.r, ih = H - pad.t - pad.b;
  const vals = data.map(d=>d.value);
  const ymax = Math.max(...vals, 0) * 1.1 || 1;
  const ymin = Math.min(...vals, 0) * 1.12;
  const x = sLin(0, data.length-1, pad.l, pad.l+iw);
  const y = sLin(ymin, ymax, pad.t+ih, pad.t);
  const ticks = niceTicks(ymin, ymax, 5);
  const pts = data.map((d,i)=>[x(i), y(d.value)]);
  const d0 = smoothPath(pts);
  const zeroY = y(0);
  // breakeven (first crossing to >=0)
  let beIdx = data.findIndex((d,i)=> i>0 && data[i-1].value<0 && d.value>=0);

  const onMove = (e)=>{ const r=e.currentTarget.getBoundingClientRect(); const i=Math.round((e.clientX-r.left-pad.l)/(iw/(data.length-1))); if(i>=0&&i<data.length) setHover(i); };

  return (
    <div ref={ref} style={{ position:'relative', width:'100%' }}>
      {width>0 && (
      <svg width={W} height={H} onMouseMove={onMove} onMouseLeave={()=>setHover(null)} style={{display:'block'}}>
        <defs>
          <linearGradient id="jcUp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#11C988" stopOpacity="0.20"/><stop offset="100%" stopColor="#11C988" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="jcDn" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor="#B4472E" stopOpacity="0.16"/><stop offset="100%" stopColor="#B4472E" stopOpacity="0"/>
          </linearGradient>
          <clipPath id="jcClip"><rect x={pad.l} y={pad.t} width={iw*p} height={ih}/></clipPath>
          <clipPath id="jcAbove"><rect x="0" y={pad.t} width={W} height={zeroY-pad.t}/></clipPath>
          <clipPath id="jcBelow"><rect x="0" y={zeroY} width={W} height={pad.t+ih-zeroY}/></clipPath>
        </defs>
        {ticks.map((tk,i)=>(
          <g key={i}>
            <line x1={pad.l} x2={pad.l+iw} y1={y(tk)} y2={y(tk)} stroke={tk===0?'#C3C6C0':'#EFEADF'} strokeWidth={tk===0?1.2:1}/>
            <text x={pad.l-10} y={y(tk)+3.5} textAnchor="end" fontSize="10.5" fontFamily="var(--mono)" fill="#9AA0A7">{yFormat(tk)}</text>
          </g>
        ))}
        {data.map((d,i)=> (i%Math.ceil(data.length/8||1)===0||i===data.length-1) && (
          <text key={i} x={x(i)} y={H-8} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill="#9AA0A7">{d.t}</text>
        ))}
        <g clipPath="url(#jcClip)">
          <path d={`${d0}L${x(data.length-1)},${zeroY}L${x(0)},${zeroY}Z`} fill="url(#jcUp)" clipPath="url(#jcAbove)"/>
          <path d={`${d0}L${x(data.length-1)},${zeroY}L${x(0)},${zeroY}Z`} fill="url(#jcDn)" clipPath="url(#jcBelow)"/>
          <path d={d0} fill="none" stroke="#0D5A43" strokeWidth="2.4" strokeLinecap="round"/>
        </g>
        {beIdx>0 && (
          <g opacity={p}>
            <line x1={x(beIdx)} x2={x(beIdx)} y1={pad.t} y2={pad.t+ih} stroke="#11C988" strokeWidth="1.2" strokeDasharray="4 3"/>
            <circle cx={x(beIdx)} cy={zeroY} r="4" fill="#11C988" stroke="#fff" strokeWidth="1.6"/>
            <text x={x(beIdx)+6} y={pad.t+12} fontSize="10" fontFamily="var(--mono)" fill="#0D5A43">breakeven</text>
          </g>
        )}
        {hover!=null && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t+ih} stroke="#0D5A43" strokeWidth="1" strokeDasharray="3 3" opacity="0.35"/>
            <circle cx={x(hover)} cy={y(data[hover].value)} r="4.5" fill="#0D5A43" stroke="#fff" strokeWidth="2"/>
          </g>
        )}
      </svg>)}
      {hover!=null && width>0 && (
        <div className="chart-tip" style={{ left:x(hover), top:y(data[hover].value) }}>
          <div className="tt-k">{data[hover].t} · Net cashflow</div>
          <div className="tt-v">{yFormat(data[hover].value)}</div>
        </div>
      )}
    </div>
  );
}
window.JCurve = JCurve;

/* ============================================================
   COHORT HEATMAP — vintage × metric grid colored by MOIC.
   rows: [{vintage, cells:[{label, value}]}], cols: [labels]
   ============================================================ */
function CohortHeatmap({ rows, cols, min = 0, max = 5, height }) {
  const [ref, { width }] = useMeasure();
  const [hi, setHi] = useState(null);
  const W = width || 640;
  const labelW = 64, cellGap = 6, topH = 24;
  const cw = (W - labelW) / cols.length - cellGap;
  const ch = 40;
  const H = topH + rows.length * (ch + cellGap);
  // green scale: low -> pale, high -> deep mint/green
  const colorFor = (v) => {
    const t = Math.max(0, Math.min(1, (v - min) / (max - min)));
    // interpolate paper -> mint -> green
    const stops = [[247,245,239],[214,242,230],[17,201,136],[13,90,67]];
    const seg = t*(stops.length-1); const i = Math.min(stops.length-2, Math.floor(seg)); const f = seg-i;
    const c = stops[i].map((s,k)=>Math.round(s+(stops[i+1][k]-s)*f));
    return `rgb(${c[0]},${c[1]},${c[2]})`;
  };
  return (
    <div ref={ref} style={{ width:'100%', position:'relative' }}>
      {width>0 && (
      <svg width={W} height={H} style={{display:'block'}}>
        {cols.map((c,j)=>(
          <text key={j} x={labelW + j*(cw+cellGap) + cw/2} y={15} textAnchor="middle"
            fontSize="10" fontFamily="var(--mono)" fill="#9AA0A7">{c}</text>
        ))}
        {rows.map((row,i)=>(
          <g key={i}>
            <text x={0} y={topH + i*(ch+cellGap) + ch/2 + 4} fontSize="12" fontFamily="var(--mono)" fontWeight="500" fill="#353B42">{row.vintage}</text>
            {row.cells.map((cell,j)=>{
              const isHi = hi && hi[0]===i && hi[1]===j;
              const t = (cell.value-min)/(max-min);
              return (
                <g key={j} onMouseEnter={()=>setHi([i,j])} onMouseLeave={()=>setHi(null)} style={{cursor:'pointer'}}>
                  <rect x={labelW + j*(cw+cellGap)} y={topH + i*(ch+cellGap)} width={cw} height={ch} rx="4"
                    fill={colorFor(cell.value)} stroke={isHi?'#0D5A43':'transparent'} strokeWidth="1.5"/>
                  <text x={labelW + j*(cw+cellGap) + cw/2} y={topH + i*(ch+cellGap) + ch/2 + 4}
                    textAnchor="middle" fontSize="12.5" fontFamily="var(--mono)" fontWeight="600"
                    fill={t>0.5?'#F4FBF8':'#14181C'}>{cell.label}</text>
                </g>
              );
            })}
          </g>
        ))}
      </svg>)}
    </div>
  );
}
window.CohortHeatmap = CohortHeatmap;

/* ============================================================
   RANK BARS — horizontal ranked bars (e.g., MOIC by company)
   data: [{label, value, sub?, color?}]
   ============================================================ */
function RankBars({ data, height, xFormat = (v)=>fmt.mult(v), barColor = '#0D5A43', max }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(1100, [width]);
  const W = width || 520;
  const labelW = 150, valW = 56, rowH = 38, gap = 10;
  const track = W - labelW - valW;
  const mx = max || Math.max(...data.map(d=>d.value)) * 1.05;
  return (
    <div ref={ref} style={{ width:'100%' }}>
      {width>0 && data.map((d,i)=>{
        const w = track * (d.value/mx) * p;
        return (
          <div key={i} style={{ display:'flex', alignItems:'center', height:rowH, marginBottom:gap }}>
            <div style={{ width:labelW, paddingRight:12, overflow:'hidden' }}>
              <div style={{ fontSize:13.5, fontWeight:500, color:'#14181C', whiteSpace:'nowrap', textOverflow:'ellipsis', overflow:'hidden' }}>{d.label}</div>
              {d.sub && <div style={{ fontFamily:'var(--mono)', fontSize:10.5, color:'#9AA0A7' }}>{d.sub}</div>}
            </div>
            <div style={{ width:track, position:'relative', height:'100%', display:'flex', alignItems:'center' }}>
              <div style={{ position:'absolute', left:0, right:0, height:8, background:'#F3F0E8', borderRadius:999 }}></div>
              <div style={{ position:'absolute', left:0, width:w, height:8, background:d.color||barColor, borderRadius:999, transition:'width .2s' }}></div>
            </div>
            <div style={{ width:valW, textAlign:'right', fontFamily:'var(--mono)', fontSize:13.5, fontWeight:600, color:'#0D5A43' }}>{xFormat(d.value)}</div>
          </div>
        );
      })}
    </div>
  );
}
window.RankBars = RankBars;

/* ============================================================
   GROUP BARS — grouped/paired vertical bars by category
   data: [{t, a, b}], seriesA/seriesB: {label,color}
   ============================================================ */
function GroupBars({ data, height = 260, seriesA, seriesB, yFormat = (v)=>fmt.usd(v), stacked = false }) {
  const [ref, { width }] = useMeasure();
  const p = useProgress(1000, [width]);
  const [hi, setHi] = useState(null);
  const W = width || 600, H = height;
  const pad = { t: 16, r: 14, b: 30, l: 50 };
  const iw = W-pad.l-pad.r, ih = H-pad.t-pad.b;
  const maxV = stacked
    ? Math.max(...data.map(d=>d.a+d.b))*1.1
    : Math.max(...data.map(d=>Math.max(d.a,d.b)))*1.1;
  const y = sLin(0, maxV, pad.t+ih, pad.t);
  const groupW = iw/data.length;
  const ticks = niceTicks(0, maxV, 5);
  const bw = stacked ? Math.min(34, groupW*0.5) : Math.min(16, groupW*0.28);
  return (
    <div ref={ref} style={{ position:'relative', width:'100%' }}>
      {width>0 && (
      <svg width={W} height={H} style={{display:'block'}}>
        {ticks.map((tk,i)=>(
          <g key={i}>
            <line x1={pad.l} x2={pad.l+iw} y1={y(tk)} y2={y(tk)} stroke="#EFEADF" strokeWidth="1"/>
            <text x={pad.l-10} y={y(tk)+3.5} textAnchor="end" fontSize="10.5" fontFamily="var(--mono)" fill="#9AA0A7">{yFormat(tk)}</text>
          </g>
        ))}
        {data.map((d,i)=>{
          const gx = pad.l + groupW*i + groupW/2;
          if (stacked) {
            const ha = (y(0)-y(d.a))*p, hb=(y(0)-y(d.b))*p;
            return (
              <g key={i} onMouseEnter={()=>setHi(i)} onMouseLeave={()=>setHi(null)}>
                <rect x={gx-bw/2} y={y(0)-ha} width={bw} height={ha} fill={seriesA.color} rx="2"/>
                <rect x={gx-bw/2} y={y(0)-ha-hb} width={bw} height={hb} fill={seriesB.color} rx="2" opacity="0.9"/>
                <text x={gx} y={H-9} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill="#9AA0A7">{d.t}</text>
              </g>
            );
          }
          const ha=(y(0)-y(d.a))*p, hb=(y(0)-y(d.b))*p;
          return (
            <g key={i} onMouseEnter={()=>setHi(i)} onMouseLeave={()=>setHi(null)}>
              <rect x={gx-bw-2} y={y(0)-ha} width={bw} height={ha} fill={seriesA.color} rx="2" opacity={hi==null||hi===i?1:0.5}/>
              <rect x={gx+2} y={y(0)-hb} width={bw} height={hb} fill={seriesB.color} rx="2" opacity={hi==null||hi===i?1:0.5}/>
              <text x={gx} y={H-9} textAnchor="middle" fontSize="10" fontFamily="var(--mono)" fill="#9AA0A7">{d.t}</text>
            </g>
          );
        })}
      </svg>)}
      {hi!=null && width>0 && (
        <div className="chart-tip" style={{ left: pad.l + groupW*hi + groupW/2, top: y(stacked?data[hi].a+data[hi].b:Math.max(data[hi].a,data[hi].b)) }}>
          <div className="tt-k">{data[hi].t}</div>
          <div className="tt-row" style={{marginTop:3}}><span className="tt-sw" style={{background:seriesA.color}}></span><span style={{fontSize:11,color:'#B8C0C6'}}>{seriesA.label}: {yFormat(data[hi].a)}</span></div>
          <div className="tt-row" style={{marginTop:2}}><span className="tt-sw" style={{background:seriesB.color}}></span><span style={{fontSize:11,color:'#B8C0C6'}}>{seriesB.label}: {yFormat(data[hi].b)}</span></div>
        </div>
      )}
    </div>
  );
}
window.GroupBars = GroupBars;
