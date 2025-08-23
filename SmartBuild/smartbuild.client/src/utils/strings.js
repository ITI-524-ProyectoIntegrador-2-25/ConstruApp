// src/utils/strings.js
/** Normaliza nombres: sin espacios dobles, trim y minúsculas */
export function sanitizeName(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}