export type PlanEvent = { kind: "card" | "bill"; when: string; label: string; tone?: "info" | "warn" }
export type HstInfo = { registered: boolean; ytdTaxable: number; threshold: number }
export type ReserveSplit = { tax: number; cpp: number; hst: number }

export type SpendPowerModel = {
  week: string
  deposits: number
  spendPower: number
  reserve: number
  locked: number
  cushion: number
  events: PlanEvent[]
  split: ReserveSplit
  hst: HstInfo
}



