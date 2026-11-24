import { useId } from 'react';

/* Generated cover art for posts without an uploaded image.
   Seeded posts have no `img`, so the old flat gradient made every card read the
   same. These are deterministic geometric patterns keyed off the post id and
   the category hue: no binary assets, no network, but each card is visibly
   different. */

const rings = (a, b, c) => (
  <>
    {[130, 100, 70, 40].map((r, i) => (
      <circle
        key={r}
        cx="330"
        cy="70"
        r={r}
        fill="none"
        stroke={i % 2 ? c : b}
        strokeOpacity={0.45 - i * 0.08}
        strokeWidth="12"
      />
    ))}
  </>
);

const stripes = (a, b, c) => (
  <>
    {[-160, -60, 40, 140, 240, 340].map((x, i) => (
      <rect
        key={x}
        x={x}
        y="-40"
        width="34"
        height="380"
        fill={i % 2 ? c : b}
        opacity={0.3}
        transform="rotate(-18 200 150)"
      />
    ))}
  </>
);

const dots = (a, b, c) => (
  <>
    {Array.from({ length: 60 }, (_, i) => {
      const col = i % 10;
      const row = Math.floor(i / 10);
      return (
        <circle
          key={i}
          cx={40 + col * 36}
          cy={40 + row * 44}
          r={7 + ((col + row) % 4) * 2.5}
          fill={i % 3 === 0 ? c : b}
          opacity={0.34}
        />
      );
    })}
  </>
);

const waves = (a, b, c) => (
  <>
    {[0, 52, 104, 156, 208].map((offset, i) => (
      <path
        key={offset}
        d={`M-40 ${90 + offset} C 60 ${40 + offset}, 150 ${150 + offset}, 250 ${92 + offset} S 380 ${40 + offset}, 460 ${96 + offset}`}
        fill="none"
        stroke={i % 2 ? c : b}
        strokeOpacity={0.42}
        strokeWidth="16"
      />
    ))}
  </>
);

const triangles = (a, b, c) => (
  <>
    {[
      [70, 250, 150, 90, 230, 250],
      [210, 260, 300, 110, 390, 260],
      [110, 200, 160, 110, 210, 200],
    ].map((points, i) => (
      <polygon
        key={i}
        points={points.join(' ')}
        fill={i % 2 ? c : b}
        opacity={0.36}
      />
    ))}
  </>
);

const bars = (a, b, c) => (
  <>
    {[0, 1, 2, 3, 4, 5, 6].map((i) => (
      <rect
        key={i}
        x={30 + i * 52}
        y={120 - i * 14}
        width="30"
        height={160 + i * 20}
        rx="4"
        fill={i % 2 ? c : b}
        opacity={0.38}
      />
    ))}
  </>
);

const PATTERNS = [rings, stripes, dots, waves, triangles, bars];

export default function CoverArt({ hue = 220, variant = 0 }) {
  const seed = Math.abs(Math.trunc(Number(variant) || 0));
  const draw = PATTERNS[seed % PATTERNS.length];
  const gradientId = `cover-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;

  const base = `hsl(${hue} 64% 50%)`;
  const deep = `hsl(${(hue + 26) % 360} 58% 26%)`;
  const light = `hsl(${hue} 78% 72%)`;

  return (
    <svg
      className="cover-art"
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={base} />
          <stop offset="1" stopColor={deep} />
        </linearGradient>
      </defs>

      <rect width="400" height="300" fill={`url(#${gradientId})`} />
      {draw(base, deep, light)}
    </svg>
  );
}
