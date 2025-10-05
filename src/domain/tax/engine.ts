import rates2025 from './rates/2025.json'

export interface IncomeItem { gross: number; hstRegistered?: boolean }
export interface Inputs { income: IncomeItem[] }
export interface SetAsides { cpp: number; hstRemit: number; incomeTax: number; total: number }

function clamp(n: number) { return Math.max(0, Math.round(n * 100) / 100) }

function calcCPP(annualGross: number) {
  const { rate, ympe, basicExemption } = rates2025.cpp
  const pensionable = Math.max(0, Math.min(annualGross, ympe) - basicExemption)
  return clamp(pensionable * rate)
}

function calcProgressiveTax(taxable: number, brackets: { upTo: number | null, rate: number }[]) {
  let tax = 0, last = 0
  for (const b of brackets) {
    const cap = b.upTo ?? Number.POSITIVE_INFINITY
    const slice = Math.max(0, Math.min(taxable, cap) - last)
    tax += slice * b.rate
    last = cap
    if (taxable <= cap) break
  }
  return tax
}

function calcIncomeTax(annualGross: number, cppPaid: number) {
  const fedTaxable = Math.max(0, annualGross - rates2025.basicCredits.federal)
  const onTaxable  = Math.max(0, annualGross - rates2025.basicCredits.ontario)
  const fed = calcProgressiveTax(fedTaxable, rates2025.federal)
  const ont = calcProgressiveTax(onTaxable, rates2025.ontario)
  return clamp(Math.max(0, fed + ont - Math.min(cppPaid, 1000)))
}

function calcHSTRemit(items: IncomeItem[]) {
  const rate = rates2025.hstRate
  const taxable = items.filter(i => i.hstRegistered).reduce((s, i) => s + i.gross, 0)
  return clamp(taxable * rate)
}

export function computeSetAsides(input: Inputs): SetAsides {
  const annualGross = input.income.reduce((s, i) => s + i.gross, 0)
  const cpp = calcCPP(annualGross)
  const incomeTax = calcIncomeTax(annualGross, cpp)
  const hstRemit = calcHSTRemit(input.income)
  const total = clamp(cpp + incomeTax + hstRemit)
  return { cpp, incomeTax, hstRemit, total }
}


