// Invalid external anchors must not interrupt route effects or focus recovery.
export function decodeAnchor(hash = '') {
  const value = hash.startsWith('#') ? hash.slice(1) : hash;
  try { return decodeURIComponent(value); }
  catch { return value; }
}
