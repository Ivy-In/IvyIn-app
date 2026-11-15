// Scene 12 of the reel: a black liquid blob that keeps changing shape, with small ultramarine drops
// floating inside it. An SVG "goo" filter melts overlapping circles together; CSS moves the circles.
const DROPS = [
  [150, 170, 13], [205, 140, 10], [240, 205, 15], [185, 235, 11], [130, 215, 9], [215, 260, 12], [265, 160, 9],
] as const;

export function GooBlob({ className }: { className?: string }) {
  return (
    <svg className={`rl-goo ${className ?? ""}`} viewBox="0 0 400 400" aria-hidden="true" focusable="false">
      <defs>
        <filter id="rl-goo" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="16" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 30 -13" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
        <filter id="rl-goo-s" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="b" />
          <feColorMatrix in="b" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 22 -9" result="g" />
          <feComposite in="SourceGraphic" in2="g" operator="atop" />
        </filter>
      </defs>
      <g filter="url(#rl-goo)" fill="#17191D">
        <circle className="g1" cx="200" cy="200" r="104" />
        <circle className="g2" cx="112" cy="160" r="62" />
        <circle className="g3" cx="292" cy="250" r="68" />
        <circle className="g4" cx="236" cy="96" r="50" />
      </g>
      <g filter="url(#rl-goo-s)" fill="#244CFF">
        {DROPS.map(([x, y, r], i) => <circle key={i} className={`d${i}`} cx={x} cy={y} r={r} />)}
      </g>
    </svg>
  );
}
