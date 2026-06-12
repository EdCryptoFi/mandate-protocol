/* ============================================================
   MANDATE PROTOCOL — app sidebar. Injects into #side.
   ============================================================ */
(function () {
  const file = location.pathname.split('/').pop() || 'Dashboard.html';
  const ic = {
    overview:  '<path d="M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 14h7v7H3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    pool:      '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    margin:    '<path d="M12 9v4M12 17h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20A10 10 0 0012 2z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    audit:     '<path d="M6 3h9l3 3v15H6zM9 12h6M9 16h4M9 8h3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
    mandate:   '<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5"/><path d="M7 8h10M7 12h7M7 16h5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    session:   '<circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="1.5"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>',
    regulator: '<circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.5"/><path d="M3.5 19a5.5 5.5 0 0111 0M16 6.5a3 3 0 010 5.8M19.5 19a5.5 5.5 0 00-3-4.9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>',
    guide:     '<path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2zM22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>',
  };

  const items = [
    { sec: 'Treasury' },
    { label: 'Overview',        icon: ic.overview,  href: 'Dashboard.html' },
    { label: 'Collateral Pool', icon: ic.pool,      href: 'Fund.html' },
    { label: 'Margin Calls',    icon: ic.margin,    href: 'Deal.html', badge: '1' },
    { sec: 'Governance' },
    { label: 'Mandate Config',  icon: ic.mandate,   href: 'Fund.html' },
    { label: 'Agent Sessions',  icon: ic.session,   href: 'Deal.html' },
    { sec: 'Compliance' },
    { label: 'Regulator View',  icon: ic.regulator, href: 'LP.html' },
    { label: 'Audit Trail',     icon: ic.audit,     href: 'LP.html' },
    { label: 'User Guide',      icon: ic.guide,     href: 'LP.html' },
  ];

  const html = `
    <div class="side-brand">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" fill="#11C988" opacity=".18"/>
        <path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z" stroke="#11C988" stroke-width="1.6" stroke-linejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="#11C988" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span class="nm">Mandate</span><span class="tg">Bank A · Treasury</span>
    </div>
    ${items.map(it => it.sec
      ? `<div class="side-sec">${it.sec}</div>`
      : `<a class="nav-item${file === it.href ? ' active' : ''}" href="${it.href}">
           <svg viewBox="0 0 24 24" fill="none">${it.icon}</svg>${it.label}
           ${it.badge ? `<span class="badge-n">${it.badge}</span>` : ''}
         </a>`).join('')}
    <div class="side-foot">
      <div class="session-card">
        <div class="sh"><span class="sdot live"></span>Agent session · live</div>
        <div class="sb">AGT-2026-001 · CanRebalance · CanRespondToMarginCall · expires 8h 12m</div>
        <div class="meter"><i style="width:22%"></i></div>
      </div>
      <div class="side-user">
        <div class="avatar">AT</div>
        <div style="flex:1;min-width:0"><div style="color:#E6ECE9;font-size:13px;font-weight:500">Alex Torres</div><div style="color:#6E7B76;font-size:11px;font-family:var(--mono)">Treasury Manager · Bank A</div></div>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style="color:#6E7B76"><path d="M5 6l3 3 3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </div>
    </div>`;

  const el = document.getElementById('side');
  if (el) el.innerHTML = html;
})();
