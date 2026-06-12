// ============================================================
// MANDATE — Three.js scenes (ESM). Light-theme calibrated.
// Robust: built-in materials, dpr-capped, first-frame guaranteed,
// visibility-paused after first paint, pointer-reactive.
// ============================================================
import * as THREE from 'three';

const PALETTE = {
  ink:0x39434d, green:0x0d5a43, greenL:0x2f8466, mint:0x11c988, mint2:0x12e29a,
  sky:0x2f6e8f, clay:0xb5764a, gold:0x9a7a3c, plum:0x6a4a7a, hair:0xcfd6cf,
};
const SECTORS = [PALETTE.green, PALETTE.mint, PALETTE.sky, PALETTE.clay, PALETTE.gold, PALETTE.plum];

function makeRenderer(canvas, alpha = true) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha, powerPreference: 'high-performance', preserveDrawingBuffer: true });
  r.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  r.setClearColor(0x000000, 0);
  return r;
}
function sizeOf(canvas) {
  const p = canvas.parentElement || canvas;
  const w = p.clientWidth || canvas.clientWidth || 600;
  const h = p.clientHeight || canvas.clientHeight || 400;
  return { w: Math.max(1, w), h: Math.max(1, h) };
}
function runLoop(canvas, renderer, tick) {
  let raf = 0, visible = true, seen = false;
  const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; seen = true; }, { threshold: 0 });
  io.observe(canvas);
  let t0 = performance.now();
  tick(0, t0 / 1000); // guaranteed first frame
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (seen && !visible) return;
    const dt = Math.min(0.05, (now - t0) / 1000); t0 = now;
    tick(dt, now / 1000);
  }
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); io.disconnect(); renderer.dispose(); };
}
let _disc = null;
function discTexture() {
  if (_disc) return _disc;
  const s = 64, c = document.createElement('canvas'); c.width = c.height = s;
  const g = c.getContext('2d');
  const grd = g.createRadialGradient(s/2, s/2, 0, s/2, s/2, s/2);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.5, 'rgba(255,255,255,1)');
  grd.addColorStop(0.78, 'rgba(255,255,255,0.5)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.beginPath(); g.arc(s/2, s/2, s/2, 0, Math.PI*2); g.fill();
  _disc = new THREE.CanvasTexture(c);
  return _disc;
}
// helper: build a Points cloud from positions + colors at a uniform size
function pointCloud(positions, colors, size) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
  g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(colors), 3));
  const m = new THREE.PointsMaterial({ map: discTexture(), vertexColors: true, transparent: true,
    depthWrite: false, sizeAttenuation: true, size });
  return new THREE.Points(g, m);
}

// ------------------------------------------------------------
// HERO NETWORK — drifting constellation, two node tiers + edges
// ------------------------------------------------------------
export function heroNetwork(canvas, opts = {}) {
  const N = opts.count || 62;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  let { w, h } = sizeOf(canvas);
  const camera = new THREE.PerspectiveCamera(52, w/h, 0.1, 100);
  camera.position.set(0, 0, 16);
  const group = new THREE.Group(); scene.add(group);

  const pts = [], tier = [];
  for (let i = 0; i < N; i++) {
    const r = 5.0 + Math.random()*3.6, th = Math.random()*Math.PI*2, ph = Math.acos(2*Math.random()-1);
    pts.push(new THREE.Vector3(r*Math.sin(ph)*Math.cos(th)*1.5, r*Math.sin(ph)*Math.sin(th)*0.92, r*Math.cos(ph)*0.8));
    tier.push(Math.random());
  }
  // small ink dots
  const smallPos = [], smallCol = [], bigPos = [], bigCol = [], mintPos = [], mintCol = [];
  const cInk = new THREE.Color(PALETTE.ink), cGreen = new THREE.Color(PALETTE.green), cMint = new THREE.Color(PALETTE.mint);
  pts.forEach((p,i) => {
    if (tier[i] > 0.82) { mintPos.push(p.x,p.y,p.z); mintCol.push(cMint.r,cMint.g,cMint.b); }
    else if (tier[i] > 0.5) { bigPos.push(p.x,p.y,p.z); bigCol.push(cGreen.r,cGreen.g,cGreen.b); }
    else { smallPos.push(p.x,p.y,p.z); smallCol.push(cInk.r,cInk.g,cInk.b); }
  });
  group.add(pointCloud(smallPos, smallCol, 0.34));
  group.add(pointCloud(bigPos, bigCol, 0.62));
  const mintCloud = pointCloud(mintPos, mintCol, 0.92);
  group.add(mintCloud);

  // edges to nearest neighbours
  const segPos = [];
  for (let i = 0; i < N; i++) {
    const near = [];
    for (let j = 0; j < N; j++) if (j !== i) near.push([pts[i].distanceTo(pts[j]), j]);
    near.sort((a,b)=>a[0]-b[0]);
    const k = 2 + (Math.random()<0.4?1:0);
    for (let m = 0; m < k; m++) { const j = near[m][1]; if (i < j) { const a=pts[i],b=pts[j]; segPos.push(a.x,a.y,a.z,b.x,b.y,b.z); } }
  }
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(segPos), 3));
  group.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: PALETTE.greenL, transparent:true, opacity:0.34, depthWrite:false })));

  let tx=0, ty=0, mx=0, my=0;
  const host = canvas.parentElement || canvas;
  host.addEventListener('pointermove', (e) => { const r=host.getBoundingClientRect();
    tx=((e.clientX-r.left)/r.width-0.5)*2; ty=((e.clientY-r.top)/r.height-0.5)*2; });
  function resize(){ const s=sizeOf(canvas); w=s.w; h=s.h; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);

  const stop = runLoop(canvas, renderer, (dt,t) => {
    mx+=(tx-mx)*0.04; my+=(ty-my)*0.04;
    group.rotation.y = t*0.05 + mx*0.35;
    group.rotation.x = -0.06 + my*0.18;
    mintCloud.material.size = 0.92 * (1 + 0.12*Math.sin(t*1.6));
    renderer.render(scene, camera);
  });
  return () => { window.removeEventListener('resize', resize); stop(); };
}

// ------------------------------------------------------------
// PORTFOLIO GRAPH — clustered nodes by sector around a fund core
// ------------------------------------------------------------
export function portfolioGraph(canvas, opts = {}) {
  const clusters = opts.clusters || 6, perCluster = opts.perCluster || 7;
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  let { w, h } = sizeOf(canvas);
  const camera = new THREE.PerspectiveCamera(48, w/h, 0.1, 100);
  camera.position.set(0, 1.5, 19);
  const group = new THREE.Group(); group.rotation.x = -0.18; scene.add(group);

  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.9, 1), new THREE.MeshBasicMaterial({ color: PALETTE.green }));
  group.add(core);
  const coreGlow = new THREE.Mesh(new THREE.SphereGeometry(1.6, 24, 24), new THREE.MeshBasicMaterial({ color: PALETTE.mint, transparent:true, opacity:0.07 }));
  group.add(coreGlow);

  const posByColor = {}, linePos = [];
  for (let c = 0; c < clusters; c++) {
    const ang=(c/clusters)*Math.PI*2, cx=Math.cos(ang)*8.5, cz=Math.sin(ang)*8.5, cy=(Math.random()-0.5)*3.5;
    const color = SECTORS[c % SECTORS.length];
    posByColor[color] = posByColor[color] || { pos:[], col:[] };
    const col = new THREE.Color(color);
    for (let i = 0; i < perCluster; i++) {
      const x=cx+(Math.random()-0.5)*4.2, y=cy+(Math.random()-0.5)*3.6, z=cz+(Math.random()-0.5)*4.2;
      posByColor[color].pos.push(x,y,z); posByColor[color].col.push(col.r,col.g,col.b);
      linePos.push(0,0,0, x,y,z);
    }
  }
  Object.keys(posByColor).forEach(c => group.add(pointCloud(posByColor[c].pos, posByColor[c].col, 0.66)));
  const lGeo = new THREE.BufferGeometry();
  lGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePos), 3));
  group.add(new THREE.LineSegments(lGeo, new THREE.LineBasicMaterial({ color: PALETTE.hair, transparent:true, opacity:0.4 })));

  let tx=0,ty=0,mx=0,my=0; const host=canvas.parentElement||canvas;
  host.addEventListener('pointermove',(e)=>{ const r=host.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-0.5)*2; ty=((e.clientY-r.top)/r.height-0.5)*2; });
  function resize(){ const s=sizeOf(canvas); w=s.w; h=s.h; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);

  const stop = runLoop(canvas, renderer, (dt,t)=>{
    mx+=(tx-mx)*0.05; my+=(ty-my)*0.05;
    group.rotation.y = t*0.08 + mx*0.5; group.rotation.x = -0.18 + my*0.2;
    core.rotation.y += dt*0.4; core.rotation.x += dt*0.2;
    coreGlow.scale.setScalar(1 + 0.05*Math.sin(t*1.4));
    renderer.render(scene,camera);
  });
  return ()=>{ window.removeEventListener('resize', resize); stop(); };
}

// ------------------------------------------------------------
// GLOBE — dotted sphere, deal hubs, animated great-circle arcs
// ------------------------------------------------------------
export function globe(canvas, opts = {}) {
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  let { w, h } = sizeOf(canvas);
  const camera = new THREE.PerspectiveCamera(40, w/h, 0.1, 100);
  camera.position.set(0, 0.4, 6.2);
  const R = 2;
  const group = new THREE.Group(); group.rotation.z = 0.32; scene.add(group);

  group.add(new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.SphereGeometry(R, 28, 20)),
    new THREE.LineBasicMaterial({ color: PALETTE.hair, transparent:true, opacity:0.5 })));

  const DN = 800, dPos = [], dCol = [], dotC = new THREE.Color(0x8fa39a);
  for (let i=0;i<DN;i++){ const y=1-(i/(DN-1))*2, rad=Math.sqrt(1-y*y), th=i*2.399963;
    dPos.push(Math.cos(th)*rad*R, y*R, Math.sin(th)*rad*R); dCol.push(dotC.r,dotC.g,dotC.b); }
  group.add(pointCloud(dPos, dCol, 0.05));

  function llToVec(lat, lon, r=R){ const ph=(90-lat)*Math.PI/180, th=(lon+180)*Math.PI/180;
    return new THREE.Vector3(-r*Math.sin(ph)*Math.cos(th), r*Math.cos(ph), r*Math.sin(ph)*Math.sin(th)); }
  const hubs = opts.hubs || [[37.77,-122.41],[40.71,-74.0],[51.50,-0.12],[1.35,103.8],[52.52,13.40],[35.68,139.69],[19.07,72.87],[-23.55,-46.63]];
  const hMat = new THREE.MeshBasicMaterial({ color: PALETTE.green });
  hubs.forEach(([la,lo])=>{ const v=llToVec(la,lo,R*1.01);
    const m=new THREE.Mesh(new THREE.SphereGeometry(0.04,12,12), hMat); m.position.copy(v); group.add(m);
    const ring=new THREE.Mesh(new THREE.RingGeometry(0.055,0.078,22), new THREE.MeshBasicMaterial({color:PALETTE.mint, transparent:true, opacity:0.55, side:THREE.DoubleSide}));
    ring.position.copy(v); ring.lookAt(v.clone().multiplyScalar(2)); group.add(ring); });

  const arcs = [], pairs = [[0,2],[0,3],[1,2],[1,7],[4,3],[5,3],[0,1],[2,6]];
  pairs.forEach(([a,b])=>{ const va=llToVec(...hubs[a]), vb=llToVec(...hubs[b]);
    const mid=va.clone().add(vb).multiplyScalar(0.5).normalize().multiplyScalar(R*(1.3+va.distanceTo(vb)*0.12));
    const curve=new THREE.QuadraticBezierCurve3(va, mid, vb);
    const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(60)), new THREE.LineBasicMaterial({color:PALETTE.mint, transparent:true, opacity:0}));
    group.add(line);
    const dot=new THREE.Mesh(new THREE.SphereGeometry(0.032,10,10), new THREE.MeshBasicMaterial({color:PALETTE.green}));
    group.add(dot); arcs.push({ line, curve, dot, phase: Math.random() }); });

  let tx=0,mx=0; const host=canvas.parentElement||canvas;
  host.addEventListener('pointermove',(e)=>{ const r=host.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-0.5)*2; });
  function resize(){ const s=sizeOf(canvas); w=s.w; h=s.h; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);

  const stop = runLoop(canvas, renderer, (dt,t)=>{
    mx+=(tx-mx)*0.05; group.rotation.y = t*0.12 + mx*0.6;
    arcs.forEach(a=>{ const cyc=(t*0.35+a.phase)%1.6, on=cyc<1.0;
      a.line.material.opacity = on ? 0.5*Math.sin(Math.min(1,cyc)*Math.PI) : 0;
      if(on){ a.dot.visible=true; a.dot.position.copy(a.curve.getPoint(Math.min(0.999,cyc))); } else a.dot.visible=false; });
    renderer.render(scene,camera);
  });
  return ()=>{ window.removeEventListener('resize', resize); stop(); };
}

// ------------------------------------------------------------
// ALLOCATION RING 3D — extruded donut wedges, height ~ weight
// ------------------------------------------------------------
export function allocationRing(canvas, opts = {}) {
  const data = opts.data || [
    { label:'Fintech', value:26, color:PALETTE.green }, { label:'AI/ML', value:24, color:PALETTE.mint },
    { label:'Infra', value:18, color:PALETTE.sky }, { label:'Crypto', value:14, color:PALETTE.plum },
    { label:'Bio', value:10, color:PALETTE.clay }, { label:'Climate', value:8, color:PALETTE.gold },
  ];
  const renderer = makeRenderer(canvas);
  const scene = new THREE.Scene();
  let { w, h } = sizeOf(canvas);
  const camera = new THREE.PerspectiveCamera(42, w/h, 0.1, 100);
  camera.position.set(0, 3.7, 6.6); camera.lookAt(0,0,0);
  scene.add(new THREE.AmbientLight(0xffffff, 0.9));
  const key = new THREE.DirectionalLight(0xffffff, 0.7); key.position.set(4,8,6); scene.add(key);
  const rim = new THREE.DirectionalLight(0x9fe3c8, 0.35); rim.position.set(-5,2,-4); scene.add(rim);
  const group = new THREE.Group(); group.rotation.x = -0.04; scene.add(group);

  const total = data.reduce((s,d)=>s+d.value,0);
  const rIn = 1.2, rOut = 2.3; let a0 = -Math.PI/2;
  data.forEach(d=>{
    const frac=d.value/total, a1=a0+frac*Math.PI*2, seg=Math.max(8, Math.floor(frac*120));
    const shape=new THREE.Shape(); shape.absarc(0,0,rOut,a0,a1,false); shape.absarc(0,0,rIn,a1,a0,true);
    const depth=0.4+frac*1.8;
    const geo=new THREE.ExtrudeGeometry(shape,{depth, bevelEnabled:true, bevelThickness:0.04, bevelSize:0.04, bevelSegments:2, curveSegments:seg});
    geo.rotateX(-Math.PI/2);
    group.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color:d.color, roughness:0.5, metalness:0.05 })));
    a0=a1;
  });
  let tx=0,mx=0; const host=canvas.parentElement||canvas;
  host.addEventListener('pointermove',(e)=>{ const r=host.getBoundingClientRect(); tx=((e.clientX-r.left)/r.width-0.5)*2; });
  function resize(){ const s=sizeOf(canvas); w=s.w; h=s.h; renderer.setSize(w,h,false); camera.aspect=w/h; camera.updateProjectionMatrix(); }
  resize(); window.addEventListener('resize', resize);
  const stop = runLoop(canvas, renderer, (dt,t)=>{ mx+=(tx-mx)*0.05; group.rotation.y = t*0.2 + mx*0.5; renderer.render(scene,camera); });
  return ()=>{ window.removeEventListener('resize', resize); stop(); };
}

export const Mandate3D = { heroNetwork, portfolioGraph, globe, allocationRing };
