"use client";

type Point = { label: string; value: number };

/** Graphique radar en SVG pur (valeurs de 0 à 100). */
export default function RadarChart({ data }: { data: Point[] }) {
  // Grande zone avec marges latérales : les étiquettes ne sont plus coupées.
  const W = 560;
  const H = 380;
  const cx = W / 2;
  const cy = H / 2 + 6;
  const R = 112;
  const n = data.length;

  const angle = (i: number) => -Math.PI / 2 + (2 * Math.PI * i) / n;
  const pt = (i: number, v: number): [number, number] => [
    cx + ((R * v) / 100) * Math.cos(angle(i)),
    cy + ((R * v) / 100) * Math.sin(angle(i)),
  ];
  const poly = (vals: number[]) => vals.map((v, i) => pt(i, v).join(",")).join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      role="img"
      aria-label="Radar des domaines"
      className="radar"
      overflow="visible"
    >
      {[25, 50, 75, 100].map((ring) => (
        <polygon
          key={ring}
          points={poly(data.map(() => ring))}
          fill={ring === 100 ? "#f7fafc" : "none"}
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
        fill="rgba(21,122,104,0.22)"
        stroke="#157a68"
        strokeWidth={2.5}
        strokeLinejoin="round"
      />
      {data.map((d, i) => {
        const [x, y] = pt(i, d.value);
        return <circle key={i} cx={x} cy={y} r={4.5} fill="#157a68" stroke="#fff" strokeWidth={2} />;
      })}
      {data.map((d, i) => {
        const [x, y] = pt(i, 126);
        const dx = x - cx;
        const anchor = Math.abs(dx) < 10 ? "middle" : dx > 0 ? "start" : "end";
        return (
          <text key={d.label} x={x} y={y} textAnchor={anchor} fontSize={14} fill="#14304a">
            <tspan x={x} fontWeight={700}>
              {d.label}
            </tspan>
            <tspan x={x} dy="1.3em" fill="#5d6b79">
              {d.value} %
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
