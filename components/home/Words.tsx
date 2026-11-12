import type { CSSProperties } from "react";

// Splits a headline into words so each one can rise out of a mask. The last word can carry the signal-lime accent.
export function Words({ text, accent = false }: { text: string; accent?: boolean }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <span key={i}>
          {i > 0 && " "}
          <span className={`fx-w${accent && i === words.length - 1 ? " fx-acc" : ""}`} style={{ "--i": i } as CSSProperties}>
            <span>{w}</span>
          </span>
        </span>
      ))}
    </>
  );
}
