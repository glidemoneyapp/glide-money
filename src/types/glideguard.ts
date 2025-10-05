/**
 * Glide Guard types for the upgraded interactive card management system
 * Provides comprehensive type safety for card operations, sorting, and UI state
 */

export type GlideCard = {
  id: string;
  issuer?: string;           // optional issuer key for deep links
  brand: string;
  last4: string;
  limit: number;
  posted: number;            // posted balance
  apr: number;               // APR %
  target: number;            // 0.09 | 0.10 | 0.30
  pay: number;               // recommended payment
  safeBy: string;            // e.g., "Tue 5:00 pm" (local user-time copy)
  closes: string;            // e.g., "Thu" (display)
  pLag: string;              // e.g., "~2 biz days"
  topAction?: boolean;
  // Optional machine fields if available later:
  nextCloseTs?: string;      // ISO
  dueTs?: string;            // ISO
};

export type GlidePlan = {
  asOfISO: string;
  safeToSpend: number;
  setAside: number;
  cushion: number;
  targetUtilDefault: number; // 0.10 default
  cards: GlideCard[];
};

export type SheetState =
  | null
  | { type: "why"; payload: GlideCard }
  | { type: "pay"; payload: GlideCard }
  | { type: "snooze"; payload: GlideCard }
  | { type: "all"; payload: GlideCard[] }
  | { type: "card"; payload: GlideCard }
  | { type: "sort" };

export type SnoozePlan = { 
  remindAt: string; 
  note: string; 
};

export type FilterType = "needs" | "all" | "ok";
export type SortType = "daysToClose" | "overTarget" | "apr" | "limit";
