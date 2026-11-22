"use client";

type Point = { label: string; value: number };

/** Graphique radar en SVG pur (valeurs de 0 à 100). */
export default function RadarChart({ data }: { data: Point[] }) {
  const W = 420;
  const H = 330;
  const cx = W / 2;
  const cy = H / 2 + 5;
  const R = 105;
  const n = data.length;

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, v: number): [number, number] => [
    cx + ((R * v) / 100) * Math.cos(angle(i)),
    cy + ((R * v) / 100) * Math.sin(angle(i)),
  ];
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Radar des domaines" className="radar">
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={poly(data.map(() => ring))}
          fill="none"
          stroke="#d5dee7"
          strokeWidth={1}
        />
      ))}
      {data.map((_, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#d5dee7" />;
      })}
      <polygon
        points={poly(data.map((d) => d.value))}
        fill="rgba(23,107,91,0.25)"
        stroke="#176b5b"
        strokeWidth={2}
      />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return <circle key={i} cx={x} cy={y} r={4} fill="#176b5b" />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 128);
        const anchor = Math.abs(x - cx) < 8 ? "middle" : x > cx ? "start" : "end";
        return (
          <text
            key={d.label}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            fontSize={13}
            fill="#17324d"
            fontWeight={700}
          >
            {d.label} {d.value}%
          </text>
        );
      })}
    </svg>
  );
}
