"use client";

import { useId, useMemo, useState } from "react";
import styles from "../app/admin/admin-stats.module.css";

export type ChartPoint = {
  key: string;
  label: string;
  cents: number;
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function formatAxisEuro(cents: number): string {
  const euros = cents / 100;
  if (euros >= 1000) {
    const thousands = euros / 1000;
    const digits = thousands >= 10 ? 0 : 1;
    return `${thousands.toFixed(digits).replace(".", ",")}k €`;
  }
  return `${Math.round(euros)} €`;
}

type Props = { series: ChartPoint[] };

export function AdminRevenueChart({ series }: Props) {
  const [hover, setHover] = useState<number | null>(null);
  const clipId = useId().replace(/:/g, "");
  const width = 920;
  const height = 260;
  const pad = { top: 18, right: 16, bottom: 36, left: 52 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const maxCents = Math.max(0, ...series.map((point) => point.cents));
  const niceMax = maxCents === 0 ? 100 : Math.ceil(maxCents / 4) * 4 || maxCents;

  const coords = useMemo(() => {
    if (series.length === 0) return [];
    const step = series.length === 1 ? 0 : innerW / (series.length - 1);
    return series.map((point, index) => {
      const x = pad.left + (series.length === 1 ? innerW / 2 : index * step);
      const y = pad.top + innerH - (point.cents / niceMax) * innerH;
      return { x, y, ...point };
    });
  }, [series, innerW, innerH, niceMax, pad.left, pad.top]);

  const line = coords.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
  const area =
    coords.length === 0
      ? ""
      : `${line} L${coords[coords.length - 1].x},${pad.top + innerH} L${coords[0].x},${pad.top + innerH} Z`;

  const ticks = [0, 0.25, 0.5, 0.75, 1].map((ratio) => ({
    y: pad.top + innerH * (1 - ratio),
    label: formatAxisEuro(Math.round(niceMax * ratio)),
  }));

  const labelEvery = Math.max(1, Math.ceil(series.length / 7));
  const active = hover != null ? coords[hover] : null;

  if (series.length === 0) {
    return (
      <p className={styles.chartEmpty}>Keine Bestellungen in diesem Zeitraum und Filter.</p>
    );
  }

  return (
    <div className={styles.chartWrap}>
      <svg
        className={styles.chart}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Umsatz nach Zeit"
        onMouseLeave={() => setHover(null)}
      >
        <defs>
          <linearGradient id={`${clipId}-fill`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#8a55ee" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#8a55ee" stopOpacity="0.02" />
          </linearGradient>
        </defs>
        {ticks.map((tick) => (
          <g key={tick.y}>
            <line
              x1={pad.left}
              x2={width - pad.right}
              y1={tick.y}
              y2={tick.y}
              className={styles.chartGrid}
            />
            <text x={pad.left - 8} y={tick.y + 4} className={styles.chartAxis} textAnchor="end">
              {tick.label}
            </text>
          </g>
        ))}
        {area ? <path d={area} fill={`url(#${clipId}-fill)`} /> : null}
        {line ? <path d={line} className={styles.chartLine} /> : null}
        {coords.map((point, index) => (
          <rect
            key={point.key}
            x={point.x - (series.length === 1 ? innerW / 2 : innerW / series.length / 2)}
            y={pad.top}
            width={series.length === 1 ? innerW : Math.max(innerW / series.length, 8)}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(index)}
          />
        ))}
        {active ? (
          <>
            <line
              x1={active.x}
              x2={active.x}
              y1={pad.top}
              y2={pad.top + innerH}
              className={styles.chartHoverLine}
            />
            <circle cx={active.x} cy={active.y} r="5" className={styles.chartDot} />
          </>
        ) : null}
        {coords.map((point, index) =>
          index % labelEvery === 0 || index === coords.length - 1 ? (
            <text key={`${point.key}-label`} x={point.x} y={height - 10} className={styles.chartAxis} textAnchor="middle">
              {point.label}
            </text>
          ) : null
        )}
      </svg>
      {active ? (
        <div className={styles.chartTooltip} role="status">
          <strong>{active.label}</strong>
          <span>{formatEuro(active.cents)}</span>
        </div>
      ) : null}
    </div>
  );
}
