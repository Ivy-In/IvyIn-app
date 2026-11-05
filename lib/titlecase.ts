// Title Case for headings: small words stay lowercase (except first and last), hyphenated words capitalise each part,
// and anything with its own capitals or digits (IvyIn, USD, 2027) is left alone.
const SMALL = new Set(["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "nor", "of", "on", "or", "over", "the", "to", "vs", "with"]);

function cap(part: string): string {
  const i = part.search(/[A-Za-z]/);
  if (i < 0) return part;
  return part.slice(0, i) + part[i].toUpperCase() + part.slice(i + 1);
}

export function titleCase(s: string): string {
  const words = s.split(/(\s+)/);
  const real = words.map((w, i) => ({ w, i })).filter((x) => x.w.trim());
  const last = real[real.length - 1]?.i;
  const first = real[0]?.i;
  return words
    .map((w, i) => {
      if (!w.trim()) return w;
      if (/[A-Z]/.test(w.slice(1)) || /\d/.test(w)) return w; // IvyIn, USD, 2027
      const bare = w.toLowerCase().replace(/[^a-z]/g, "");
      if (i !== first && i !== last && SMALL.has(bare)) return w.toLowerCase();
      // Hyphenated words: "All-in-One" keeps small words lowercase in the middle.
      const parts = w.split("-");
      return parts.map((x, k) => (k > 0 && k < parts.length - 1 && SMALL.has(x.toLowerCase().replace(/[^a-z]/g, "")) ? x.toLowerCase() : cap(x))).join("-");
    })
    .join("");
}
