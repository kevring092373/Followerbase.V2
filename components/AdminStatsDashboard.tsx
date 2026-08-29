"use client";

import { useMemo, useState } from "react";
import {
  DEFAULT_REVENUE_STATUSES,
  type AdminRevenuePoint,
} from "@/lib/admin-stats";
import { getStatusLabel, ORDER_STATUSES, type OrderStatus } from "@/lib/orders";
import { AdminRevenueChart } from "./AdminRevenueChart";
import styles from "../app/admin/admin-stats.module.css";

type RangeId = "today" | "7d" | "30d" | "90d" | "12m" | "all";
type Grain = "hour" | "day" | "week" | "month";

const RANGE_OPTIONS: { id: RangeId; label: string }[] = [
  { id: "today", label: "Heute" },
  { id: "7d", label: "Letzte 7 Tage" },
  { id: "30d", label: "Letzte 30 Tage" },
  { id: "90d", label: "Letzte 90 Tage" },
  { id: "12m", label: "Letzte 12 Monate" },
  { id: "all", label: "Gesamt" },
];

const STATUS_TONE: Record<OrderStatus, string> = {
  pending_payment: "pending",
  eingegangen: "eingegangen",
  gestartet: "gestartet",
  in_ausfuehrung: "ausfuehrung",
  abgeschlossen: "abgeschlossen",
  storniert: "storniert",
};

function formatEuro(cents: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(cents / 100);
}

function berlinDayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Berlin",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function berlinHour(date: Date): string {
  const raw = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Berlin",
    hour: "2-digit",
    hour12: false,
  }).format(date);
  let hour = Number.parseInt(raw.replace(/\D/g, ""), 10);
  if (!Number.isFinite(hour) || hour === 24) hour = 0;
  return String(hour).padStart(2, "0");
}

function shiftDayKey(key: string, days: number): string {
  const date = new Date(`${key}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return berlinDayKey(date);
}

function mondayKey(dayKey: string): string {
  const date = new Date(`${dayKey}T12:00:00Z`);
  const weekday = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() - (weekday - 1));
  return berlinDayKey(date);
}

function rangeStartDay(range: RangeId, todayKey: string): string | null {
  if (range === "all") return null;
  if (range === "today") return todayKey;
  const back = range === "7d" ? 6 : range === "30d" ? 29 : range === "90d" ? 89 : 364;
  return shiftDayKey(todayKey, -back);
}

function grainFor(range: RangeId, startDay: string | null, todayKey: string, earliestDay?: string): Grain {
  if (range === "today") return "hour";
  if (range === "12m") return "week";
  if (!startDay) {
    const start = earliestDay ?? todayKey;
    const span =
      (new Date(`${todayKey}T12:00:00Z`).getTime() - new Date(`${start}T12:00:00Z`).getTime()) /
      86400000;
    if (span > 400) return "month";
    if (span > 90) return "week";
  }
  return "day";
}

function pointBucket(iso: string, grain: Grain): string {
  const date = new Date(iso);
  const day = berlinDayKey(date);
  if (grain === "hour") return `${day}T${berlinHour(date)}`;
  if (grain === "month") return day.slice(0, 7);
  if (grain === "week") return mondayKey(day);
  return day;
}

function enumerateBuckets(startDay: string | null, todayKey: string, grain: Grain, points: AdminRevenuePoint[]): string[] {
  const firstPointDay = points
    .map((point) => berlinDayKey(new Date(point.createdAt)))
    .sort()[0];
  const fromDay = startDay ?? firstPointDay;
  if (!fromDay) return [];

  if (grain === "hour") {
    return Array.from({ length: 24 }, (_, hour) => `${todayKey}T${String(hour).padStart(2, "0")}`);
  }
  if (grain === "month") {
    const keys: string[] = [];
    const cursor = new Date(`${fromDay.slice(0, 7)}-01T12:00:00Z`);
    const end = todayKey.slice(0, 7);
    while (berlinDayKey(cursor).slice(0, 7) <= end) {
      keys.push(berlinDayKey(cursor).slice(0, 7));
      cursor.setUTCMonth(cursor.getUTCMonth() + 1);
    }
    return keys;
  }
  if (grain === "week") {
    const keys: string[] = [];
    let cursor = mondayKey(fromDay);
    const end = mondayKey(todayKey);
    while (cursor <= end) {
      keys.push(cursor);
      cursor = shiftDayKey(cursor, 7);
    }
    return keys;
  }
  const keys: string[] = [];
  let cursor = fromDay;
  while (cursor <= todayKey) {
    keys.push(cursor);
    cursor = shiftDayKey(cursor, 1);
  }
  return keys;
}

function formatBucketLabel(key: string, grain: Grain): string {
  if (grain === "hour") return `${key.slice(-2)}:00`;
  if (grain === "month") {
    const [year, month] = key.split("-");
    return `${month}.${year}`;
  }
  const [, month, day] = key.split("-");
  const label = `${day}.${month}.`;
  return grain === "week" ? `ab ${label}` : label;
}

type Props = { points: AdminRevenuePoint[] };

export function AdminStatsDashboard({ points }: Props) {
  const [range, setRange] = useState<RangeId>("30d");
  const [selected, setSelected] = useState<OrderStatus[]>(DEFAULT_REVENUE_STATUSES);
  const todayKey = berlinDayKey(new Date());
  const startDay = rangeStartDay(range, todayKey);

  const ranged = useMemo(
    () =>
      points.filter((point) => {
        const day = berlinDayKey(new Date(point.createdAt));
        if (day > todayKey) return false;
        if (startDay && day < startDay) return false;
        return true;
      }),
    [points, startDay, todayKey]
  );

  const statusStats = useMemo(
    () =>
      ORDER_STATUSES.map((status) => {
        const list = ranged.filter((point) => point.status === status);
        return {
          status,
          count: list.length,
          cents: list.reduce((sum, point) => sum + point.amountCents, 0),
        };
      }),
    [ranged]
  );

  const filtered = useMemo(
    () => ranged.filter((point) => selected.includes(point.status)),
    [ranged, selected]
  );

  const totalCents = filtered.reduce((sum, point) => sum + point.amountCents, 0);
  const earliestDay = ranged[0]
    ? ranged
        .map((point) => berlinDayKey(new Date(point.createdAt)))
        .sort()[0]
    : todayKey;
  const grain = grainFor(range, startDay, todayKey, earliestDay);

  const series = useMemo(() => {
    const buckets = enumerateBuckets(startDay, todayKey, grain, filtered);
    const sums = new Map(buckets.map((key) => [key, 0]));
    for (const point of filtered) {
      const key = pointBucket(point.createdAt, grain);
      if (sums.has(key)) sums.set(key, (sums.get(key) ?? 0) + point.amountCents);
      else sums.set(key, point.amountCents);
    }
    const keys = buckets.length > 0 ? buckets : Array.from(sums.keys()).sort();
    return keys.map((key) => ({
      key,
      label: formatBucketLabel(key, grain),
      cents: sums.get(key) ?? 0,
    }));
  }, [filtered, startDay, todayKey, grain]);

  function toggleStatus(status: OrderStatus) {
    setSelected((current) => {
      if (current.includes(status)) {
        if (current.length === 1) return current;
        return current.filter((item) => item !== status);
      }
      return ORDER_STATUSES.filter((item) => item === status || current.includes(item));
    });
  }

  const rangeLabel = RANGE_OPTIONS.find((option) => option.id === range)?.label ?? "";

  return (
    <div className={styles.wrap}>
      <div className={styles.toolbar}>
        <label className={styles.rangeLabel}>
          <span>Zeitraum</span>
          <select
            className={styles.rangeSelect}
            value={range}
            onChange={(event) => setRange(event.target.value as RangeId)}
            aria-label="Zeitraum für die Umsatzstatistik"
          >
            {RANGE_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <div className={styles.toolbarActions}>
          <button type="button" className={styles.ghostBtn} onClick={() => setSelected(DEFAULT_REVENUE_STATUSES)}>
            Nur Umsatzstatus
          </button>
          <button type="button" className={styles.ghostBtn} onClick={() => setSelected([...ORDER_STATUSES])}>
            Alle Status
          </button>
        </div>
      </div>

      <section className={styles.hero} aria-labelledby="admin-umsatz-titel">
        <div className={styles.heroTop}>
          <p className={styles.kicker}>Gesamtumsatz</p>
          <h2 id="admin-umsatz-titel" className={styles.heroValue}>
            {formatEuro(totalCents)}
          </h2>
          <p className={styles.heroHint}>
            {filtered.length} {filtered.length === 1 ? "Bestellung" : "Bestellungen"} · {rangeLabel}
          </p>
        </div>
        <AdminRevenueChart series={series} />
      </section>

      <section className={styles.statusSection} aria-labelledby="admin-status-titel">
        <div className={styles.statusHead}>
          <h2 id="admin-status-titel" className={styles.sectionTitle}>
            Nach Status
          </h2>
          <p className={styles.sectionHint}>Zum Ein- und Ausblenden in Summe und Grafik antippen.</p>
        </div>
        <div className={styles.statusGrid}>
          {statusStats.map((item) => {
            const active = selected.includes(item.status);
            const toneClass = {
              pending: styles.tonePending,
              eingegangen: styles.toneEingegangen,
              gestartet: styles.toneGestartet,
              ausfuehrung: styles.toneAusfuehrung,
              abgeschlossen: styles.toneAbgeschlossen,
              storniert: styles.toneStorniert,
            }[STATUS_TONE[item.status]];
            return (
              <button
                key={item.status}
                type="button"
                className={`${styles.statusCard} ${toneClass} ${active ? styles.statusCardActive : ""}`}
                aria-pressed={active}
                onClick={() => toggleStatus(item.status)}
              >
                <span className={styles.statusLabel}>{getStatusLabel(item.status)}</span>
                <span className={styles.statusValue}>{formatEuro(item.cents)}</span>
                <span className={styles.statusCount}>
                  {item.count} {item.count === 1 ? "Bestellung" : "Bestellungen"}
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
