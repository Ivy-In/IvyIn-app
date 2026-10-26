// Small count badge for navigation. Renders nothing when the count is zero.
export function Bubble({ n }: { n: number }) {
  if (n <= 0) return null;
  return (
    <span
      aria-label={`${n} new`}
      style={{
        display: "inline-block",
        minWidth: 20,
        padding: "0 6px",
        marginLeft: 6,
        borderRadius: 999,
        background: "var(--green)",
        color: "#fff",
        fontSize: 12,
        lineHeight: "20px",
        textAlign: "center",
        verticalAlign: "middle",
      }}
    >
      {n > 99 ? "99+" : n}
    </span>
  );
}
