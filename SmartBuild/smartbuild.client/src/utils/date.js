// src/utils/date.js
export function dateOnly(v) {
  if (!v) return '';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return '';
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
    .toISOString()
    .slice(0, 10);
}
export function addDays(isoDate, days) {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (Number.isNaN(d.getTime())) return '';
  d.setDate(d.getDate() + Number(days || 0));
  return dateOnly(d);
}
export function isHalfStep(n) {
  const x = Number(n);
  return Number.isFinite(x) && Math.round(x * 2) === x * 2;
}
export function isWithinRange(d, ini, fin) {
  if (!d || !ini || !fin) return false;
  const D = new Date(dateOnly(d)).getTime();
  const I = new Date(dateOnly(ini)).getTime();
  const F = new Date(dateOnly(fin)).getTime();
  return D >= I && D <= F;
}

/** Suma de horas válida (0.5..24 y múltiplos de 0.5) */
export function isValidHours(h) {
  const x = Number(h);
  return isHalfStep(x) && x >= 0.5 && x <= 24;
}