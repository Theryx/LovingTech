import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { promoDbRow } from '../../test/helpers'

vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}))

import { supabase } from '@/lib/supabase'
import { validatePromo } from '@/lib/validatePromo'

describe('validatePromo', () => {
  let fromMock: any
  let selectMock: any
  let ilikeMock: any
  let singleMock: any

  beforeEach(() => {
    singleMock = vi.fn()
    ilikeMock = vi.fn(() => ({ single: singleMock }))
    selectMock = vi.fn(() => ({ ilike: ilikeMock }))
    fromMock = vi.fn(() => ({ select: selectMock }))
    vi.mocked(supabase.from).mockImplementation(fromMock)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns valid discount for a percent promo code', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ type: 'percent', value: 20 }),
      error: null,
    })

    const result = await validatePromo('SUMMER20', 50000, 2000)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discount).toBe(10000)
      expect(result.message).toMatch(/10[\s\u202F]000/)
    }
  })

  it('returns valid discount for a fixed promo code', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ type: 'fixed', value: 5000 }),
      error: null,
    })

    const result = await validatePromo('FIXED5K', 50000, 2000)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discount).toBe(5000)
    }
  })

  it('returns error for nonexistent promo code', async () => {
    singleMock.mockResolvedValue({
      data: null,
      error: { message: 'Not found' },
    })

    const result = await validatePromo('UNKNOWN', 50000, 2000)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('invalide')
    }
  })

  it('returns error for inactive promo code', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ is_active: false }),
      error: null,
    })

    const result = await validatePromo('DISABLED', 50000, 2000)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('invalide')
    }
  })

  it('returns error for expired promo code', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ expires_at: '2025-01-01T00:00:00Z' }),
      error: null,
    })

    const result = await validatePromo('EXPIRED', 50000, 2000)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('expir')
    }
  })

  it('returns error when promo code max uses is reached', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ max_uses: 100, uses_count: 100 }),
      error: null,
    })

    const result = await validatePromo('MAXUSED', 50000, 2000)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('épuisé')
    }
  })

  it('returns error when order subtotal is below min_order_amount', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ min_order_amount: 10000 }),
      error: null,
    })

    const result = await validatePromo('MIN10K', 5000, 2000)
    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.error).toContain('minimum')
    }
  })

  it('caps discount so total never goes below delivery fee', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ type: 'percent', value: 90 }),
      error: null,
    })

    const result = await validatePromo('HUGE90', 10000, 2000)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discount).toBe(8000)
    }
  })

  it('returns 0 discount when subtotal equals delivery fee', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ type: 'percent', value: 50 }),
      error: null,
    })

    const result = await validatePromo('HALF', 2000, 2000)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discount).toBe(0)
    }
  })

  it('performs case-insensitive code lookup', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow(),
      error: null,
    })

    await validatePromo('summer20', 50000, 2000)
    expect(ilikeMock).toHaveBeenCalledWith('code', 'summer20')
  })

  it('allows promo when uses_count is below max_uses', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ max_uses: 100, uses_count: 50 }),
      error: null,
    })

    const result = await validatePromo('ACTIVE50', 50000, 2000)
    expect(result.valid).toBe(true)
  })

  it('allows promo when max_uses is null (unlimited)', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ max_uses: null, uses_count: 1000 }),
      error: null,
    })

    const result = await validatePromo('UNLIMITED', 50000, 2000)
    expect(result.valid).toBe(true)
  })

  it('floors percent discount (no decimals)', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ type: 'percent', value: 33 }),
      error: null,
    })

    const result = await validatePromo('THIRTY3', 10000, 1000)
    expect(result.valid).toBe(true)
    if (result.valid) {
      expect(result.discount).toBe(3300)
    }
  })

  it('allows non-expired promo code', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ expires_at: '2030-01-01T00:00:00Z' }),
      error: null,
    })

    const result = await validatePromo('FUTURE', 50000, 2000)
    expect(result.valid).toBe(true)
  })

  it('allows order at exactly min_order_amount', async () => {
    singleMock.mockResolvedValue({
      data: promoDbRow({ min_order_amount: 10000 }),
      error: null,
    })

    const result = await validatePromo('EXACTLY10K', 10000, 2000)
    expect(result.valid).toBe(true)
  })
})
