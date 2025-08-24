// src/utils/date.js
// Utilidades de fecha robustas en UTC (evita off-by-one)

export function dateOnly(v) {
  if (!v) return '';
  const d = typeof v === 'string' ? new Date(v) : v instanceof Date ? v : new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function parseYMD(ymd) {
  if (!ymd || typeof ymd !== 'string') return null;
  const [y, m, d] = ymd.split('-').map(Number);
  if (!y || !m || !d) return null;
  const dt = new Date(Date.UTC(y, m - 1, d, 12)); // 12:00 UTC para evitar DST
  return Number.isNaN(dt.getTime()) ? null : dt;
}

export function addDaysYMD(ymd, days) {
  const base = parseYMD(ymd);
  if (!base) return '';
  base.setUTCDate(base.getUTCDate() + Number(days || 0));
  return dateOnly(base);
}

// Compatibilidad con código previo
export function addDays(ymd, days) { return addDaysYMD(ymd, days); }

export function isHalfStep(n) {
  const x = Number(n);
  return Number.isFinite(x) && Math.round(x * 2) === x * 2;
}

export function isValidHours(v) {
  const x = Number(v);
  return Number.isFinite(x) && x >= 0 && x <= 24 && isHalfStep(x);
}

export function isWithinRange(d, ini, fin) {
  if (!d || !ini || !fin) return false;
  const D = parseYMD(dateOnly(d));
  const I = parseYMD(ini);
  const F = parseYMD(fin);
  return !!(D && I && F && D.getTime() >= I.getTime() && D.getTime() <= F.getTime());
}
