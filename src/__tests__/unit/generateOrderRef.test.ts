import { describe, it, expect, vi, beforeEach } from 'vitest'

describe('generateOrderRef', () => {
  let generateOrderRef: () => string

  beforeEach(async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-04-30T12:00:00Z'))
    const mod = await import('@/lib/generateOrderRef')
    generateOrderRef = mod.generateOrderRef
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns a string matching the LT-YYYYMMDD-XXXX format', () => {
    const ref = generateOrderRef()
    expect(ref).toMatch(/^LT-\d{8}-\d{4}$/)
  })

  it('includes the current date in YYYYMMDD format', () => {
    const ref = generateOrderRef()
    expect(ref).toContain('20260430')
  })

  it('starts with LT- prefix', () => {
    const ref = generateOrderRef()
    expect(ref.startsWith('LT-')).toBe(true)
  })

  it('generates a 4-digit random portion between 1000 and 9999', () => {
    const refs = Array.from({ length: 100 }, () => {
      const ref = generateOrderRef()
      const randomPart = ref.split('-')[2]
      return parseInt(randomPart, 10)
    })
    for (const r of refs) {
      expect(r).toBeGreaterThanOrEqual(1000)
      expect(r).toBeLessThanOrEqual(9999)
    }
  })

  it('generates unique refs across multiple calls', () => {
    const refs = new Set(Array.from({ length: 50 }, () => generateOrderRef()))
    expect(refs.size).toBeGreaterThan(30)
  })

  it('adapts when date changes', () => {
    const ref1 = generateOrderRef()
    vi.setSystemTime(new Date('2026-12-25T00:00:00Z'))
    const ref2 = generateOrderRef()
    expect(ref2).toContain('20261225')
    expect(ref2).not.toBe(ref1)
  })
})
