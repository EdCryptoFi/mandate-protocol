/* ============================================================
   MANDATE PROTOCOL — HTML sanitizer for innerHTML injection
   🔒 VULN-1: All data from the Canton ledger is counterparty-
   controlled. Never inject ledger data via innerHTML without
   escaping — prevents stored XSS (CWE-79).
   ============================================================ */
window.escapeHTML = function(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// Numeric-only sanitizer — rejects non-numeric, clamps to range
window.sanitizeAmount = function(v, min, max) {
  const n = parseFloat(v);
  if (!isFinite(n)) return 0;
  return Math.min(Math.max(n, min), max);
};
