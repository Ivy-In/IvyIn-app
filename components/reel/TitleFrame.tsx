// Title-card furniture from the reel: crosshairs in the four corners and tiny technical labels.
// Drop it as the first child of a hero section that has the "rl-title" class.
export function TitleFrame({ label = "College consulting" }: { label?: string }) {
  return (
    <>
      <span className="rl-x tl" aria-hidden="true" /><span className="rl-x tr" aria-hidden="true" />
      <span className="rl-x bl" aria-hidden="true" /><span className="rl-x br" aria-hidden="true" />
      <span className="rl-corner tl rl-label" aria-hidden="true">IvyIn / {label}</span>
      <span className="rl-corner tr rl-label" aria-hidden="true">Season 2026&ndash;27</span>
      <span className="rl-corner bl rl-label" aria-hidden="true">ED &middot; REA &middot; RD</span>
      <span className="rl-corner br rl-label" aria-hidden="true">Scroll &darr;</span>
    </>
  );
}
