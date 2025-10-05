import { describe, it, expect } from 'vitest'
import { computeSetAsides } from '../../../src/domain/tax/engine'

describe('tax engine', () => {
  it('computes plausible set-asides', () => {
    const res = computeSetAsides({
      income: [
        { gross: 52000, hstRegistered: true },
        { gross: 8000, hstRegistered: false }
      ]
    })
    expect(res.cpp).toBeGreaterThan(0)
    expect(res.incomeTax).toBeGreaterThan(0)
    expect(res.hstRemit).toBeGreaterThan(0)
    expect(res.total).toBeCloseTo(res.cpp + res.incomeTax + res.hstRemit, 2)
  })
})


