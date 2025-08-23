// src/utils/strings.js
export function sanitizeName(s) {
  return String(s || '')
    .normalize('NFKD')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}
