/**
 * Pure utility functions for Glide Guard card calculations and sorting
 * All functions are unit-testable and deterministic
 */

import { GlideCard, SnoozePlan } from "../types/glideguard";

// --- Core math ---
export const utilPercent = (card: GlideCard): number =>
  Math.max(0, Math.round((card.posted / card.limit) * 100));

export const targetPercent = (card: GlideCard): number =>
  Math.round(card.target * 100);

export const gapToTarget = (card: GlideCard): number =>
  Math.max(0, Math.round(card.posted - card.target * card.limit));

export const needsPay = (card: GlideCard): boolean =>
  card.pay > 0 && utilPercent(card) > targetPercent(card);

// --- Sorting & selection ---
export const selectTopAction = (cards: GlideCard[]): GlideCard | undefined =>
  cards.find(c => c.topAction) ?? cards.find(needsPay) ?? cards[0];

/** Helper to compute days-to-close; if unavailable, push to end. */
export function daysToClose(card: GlideCard, now = new Date()): number {
  if (!card.nextCloseTs) return Number.POSITIVE_INFINITY;
  const diff = new Date(card.nextCloseTs).getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

/** Default sort: Days to close ↑, Over-target % ↓, APR ↓, Limit ↑ */
export function sortCards(a: GlideCard, b: GlideCard, now = new Date()): number {
  const da = daysToClose(a, now), db = daysToClose(b, now);
  if (da !== db) return da - db;

  const overA = utilPercent(a) - targetPercent(a);
  const overB = utilPercent(b) - targetPercent(b);
  if (overA !== overB) return overB - overA; // higher over-target first

  if (a.apr !== b.apr) return b.apr - a.apr; // higher APR first
  return a.limit - b.limit;                   // smaller limits first
}

export const actionQueue = (cards: GlideCard[], now = new Date()): GlideCard[] =>
  cards.filter(c => !c.topAction && needsPay(c)).sort((a,b) => sortCards(a,b,now)).slice(0, 3);

// --- Smart Snooze ---
/**
 * Snap to next cadence date; if safe-by is earlier, set a pre-checkpoint reminder
 * so payment still *posts* before close (assumes ≥2 biz-day posting buffer upstream).
 */
export function computeSmartSnooze(args: {
  nextCadenceTsISO: string;
  safeByTsISO: string;
}): SnoozePlan {
  const nextCadence = new Date(args.nextCadenceTsISO).getTime();
  const safeBy = new Date(args.safeByTsISO).getTime();
  const oneDay = 24 * 60 * 60 * 1000;

  // If safe-by is BEFORE the next money day → remind the day before safe-by
  if (safeBy < nextCadence) {
    const remindAt = new Date(safeBy - oneDay).toISOString();
    return { remindAt, note: "Reminder before safe-by so it posts in time." };
  }
  // Else snap to cadence
  return { remindAt: new Date(nextCadence).toISOString(), note: "Next money day." };
}

// --- Additional utility functions ---
export const getOverTargetPercent = (card: GlideCard): number => {
  const util = utilPercent(card);
  const target = targetPercent(card);
  return Math.max(0, util - target);
};

export const isCardHealthy = (card: GlideCard): boolean => {
  return card.pay === 0 || utilPercent(card) <= targetPercent(card);
};

export const getCardStatus = (card: GlideCard): "OK" | "PAY" | "URGENT" => {
  if (!needsPay(card)) return "OK";
  const days = daysToClose(card);
  if (days <= 1) return "URGENT";
  return "PAY";
};

/** Format currency consistently in CAD */
export function fmtCAD(value: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(value)
}
