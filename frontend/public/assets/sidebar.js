/* ============================================================
   MANDATE — shared app sidebar. Injects into #side, marks active
   by current filename.
   ============================================================ */
(function () {
  const file = location.pathname.split('/').pop() || 'Dashboard.html';
  const ic = {
    overview: '<path d="M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    fund: '<path d="M3 21h18M5 21V10l7-5 7 5v11M9 21v-6h6v6" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    deal: '<path d="M4 5h16v14H4zM4 9h16M8 13h5" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    capital: '<circle cx="12" cy="12" r="8.5" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v10M9.5 9.2c0-1.1 1.1-1.7 2.5-1.7s2.5.7 2.5 1.9-1 1.6-2.5 1.6-2.5.5-2.5 1.7 1.1 1.8 2.5 1.8 2.5-.6 2.5-1.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>',
    lp: '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.5a3 3 0 010 5.8M19.5 19a5.5 5.5 0 00-3-4.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    mandate: '<path d="M12 3l8 3v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6l8-3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    audit: '<path d="M6 3h9l3 3v15H6zM9 12h6M9 16h4M9 8h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  };
  const items = [
    { sec: 'Fund' },
    { label: 'Overview', icon: ic.overview, href: 'Dashboard.html' },
    { label: 'Portfolio', icon: ic.fund, href: 'Fund.html' },
    { label: 'Deal flow', icon: ic.deal, href: 'Deal.html', badge: '5' },
    { sec: 'Capital' },
    { label: 'Capital & LPs', icon: ic.lp, href: 'LP.html' },
    { label: 'Distributions', icon: ic.capital, href: 'LP.html' },
    { sec: 'Governance' },
    { label: 'Mandate', icon: ic.mandate, href: '#' },
    { label: 'Audit trail', icon: ic.audit, href: '#' },
  ];

  const html = `
    <div class="side-brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M3 8V4.5C3 3.67 3.67 3 4.5 3H8" stroke="#11C988" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M21 8V4.5C21 3.67 20.33 3 19.5 3H16" stroke="#11C988" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M3 16V19.5C3 20.33 3.67 21 4.5 21H8" stroke="#11C988" stroke-width="1.7" stroke-linecap="round"/>
        <path d="M21 16V19.5C21 20.33 20.33 21 19.5 21H16" stroke="#11C988" stroke-width="1.7" stroke-linecap="round"/>
        <circle cx="12" cy="12" r="3.4" fill="#11C988"/>
      </svg>
      <span class="nm">Mandate</span><span class="tg">Fund III</span>
    </div>
    ${items.map(it => it.sec
      ? `<div class="side-sec">${it.sec}</div>`
      : `<a class="nav-item${file === it.href && it.label !== 'Distributions' ? ' active' : ''}" href="${it.href}">
           <svg viewBox="0 0 24 24" fill="none">${it.icon}</svg>${it.label}
           ${it.badge ? `<span class="badge-n">${it.badge}</span>` : ''}
         </a>`).join('')}
    <div class="side-foot">
      <div class="session-card">
        <div class="sh"><span class="sdot live"></span>Agent session · live</div>
        <div class="sb">Operating within Allocation Policy v4 · expires in 4h 12m</div>
        <div class="meter"><i style="width:64%"></i></div>
      </div>
      <div class="side-user">
        <div class="avatar">DR</div>
        <div style="flex:1;min-width:0"><div style="color:#E6ECE9;font-size:13px;font-weight:500">Dana Reyes</div><div style="color:#6E7B76;font-size:11px;font-family:var(--mono)">Portfolio Manager</div></div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:#6E7B76"><path d="M5 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>`;
  const el = document.getElementById('side');
  if (el) el.innerHTML = html;
})();
