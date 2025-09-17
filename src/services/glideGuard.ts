import { trackEvent } from './analytics'
import { CardProfile, RecurringBill, UserProfile } from '../types'
import { PROVINCE_TAX_RATES, TAX_CONSTANTS } from '../constants'

export interface GlideGuardSlice {
  cardId: string
  cardName: string
  amount: number
  safeBy: string
  rationale: string
}

export interface GlideGuardPlan {
  thisWeek: GlideGuardSlice[]
  asOf: string
}

export function computeDemoGlideGuardPlan(): GlideGuardPlan {
  const plan: GlideGuardPlan = {
    thisWeek: [
      { cardId: 'td-visa', cardName: 'TD Visa', amount: 62, safeBy: 'Tue 5pm', rationale: 'Posts before Thu close; target 9%.' },
      { cardId: 'rbc-mc', cardName: 'RBC MC', amount: 45, safeBy: 'Thu 5pm', rationale: 'Posts before Fri close; target 30%.' }
    ],
    asOf: new Date().toISOString()
  }
  return plan
}

export function markSlicePaid(cardId: string, amount: number) {
  trackEvent('glideguard_pay_clicked', { cardId, amount })
}

export interface ComputePlanArgs {
  cards: CardProfile[]
  userProfile: UserProfile
  upcomingBills: RecurringBill[]
  weeklyIncome: number
  today?: Date
}

export function computePlan({ cards, userProfile, upcomingBills, weeklyIncome, today = new Date() }: ComputePlanArgs): GlideGuardPlan {
  const cadence = userProfile.glideGuardCadence || 'weekly'
  const targetPct = userProfile.glideGuardTargetPercent || 0.30
  const cushion = userProfile.cushionBuffer ?? 100

  const province = userProfile.province
  const hstRate = PROVINCE_TAX_RATES[province].hstRate
  const incomeTaxWeekly = weeklyIncome * (userProfile.effectiveTaxRate || 0.18)
  const annual = weeklyIncome * 52
  const cppWeekly = Math.max(0, Math.min(annual, 68500) - 3500) * TAX_CONSTANTS.CPP_RATE / 52
  const hstWeekly = userProfile.hstRegistered ? weeklyIncome * hstRate : 0

  const setAsideWeekly = incomeTaxWeekly + cppWeekly + hstWeekly
  const upcomingBillsSum = upcomingBills.reduce((s, b) => s + (b.amount || 0), 0)

  const availableBudget = Math.max(0, weeklyIncome - setAsideWeekly - upcomingBillsSum - cushion)

  // Posting buffer: 2 business days (approx)
  const safeBy = new Date(today)
  safeBy.setDate(today.getDate() + 2)

  const slices: GlideGuardSlice[] = []
  if (!cards.length || availableBudget <= 0) {
    return { thisWeek: [], asOf: new Date().toISOString() }
  }

  // Simple allocator: proportional to GAP across cards, capped by available budget
  const gaps = cards.map(c => {
    const limit = c.limit || 0
    const posted = Math.max(0, c.postedBalance || 0)
    const target = limit * targetPct
    const gap = Math.max(0, posted - target)
    return { card: c, gap }
  }).filter(g => g.gap > 0)

  const totalGap = gaps.reduce((s, g) => s + g.gap, 0)
  if (totalGap === 0) return { thisWeek: [], asOf: new Date().toISOString() }

  let budgetLeft = availableBudget
  for (const g of gaps) {
    if (budgetLeft <= 0) break
    const share = (g.gap / totalGap) * availableBudget
    const amount = Math.min(g.gap, Math.max(0, Math.round(share)))
    if (amount <= 0) continue
    slices.push({
      cardId: g.card.id,
      cardName: g.card.cardName || g.card.institution || 'Card',
      amount,
      safeBy: safeBy.toISOString(),
      rationale: `Limit $${g.card.limit} • Target ${Math.round(targetPct * 100)}% • Gap $${Math.round(g.gap)}`
    } as any)
    budgetLeft -= amount
  }

  return {
    thisWeek: slices.map(s => ({
      cardId: s.cardId,
      cardName: s.cardName,
      amount: s.amount,
      safeBy: new Date(s.safeBy).toLocaleString('en-CA', { weekday: 'short', hour: '2-digit' }),
      rationale: s.rationale
    })),
    asOf: new Date().toISOString()
  }
}


