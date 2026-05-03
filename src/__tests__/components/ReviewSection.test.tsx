import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import ReviewSection from '@/components/ReviewSection'
import { reviewService } from '@/lib/supabase'

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'fr',
    toggleLanguage: vi.fn(),
    t: (translations: { en: string; fr: string }) => translations.fr,
  }),
}))

vi.mock('@/lib/supabase', () => ({
  reviewService: {
    getByProduct: vi.fn(),
    create: vi.fn(),
  },
}))

vi.mock('lucide-react', () => ({
  Star: ({ className }: any) => (
    <span data-testid="star-icon" className={className}>
      ★
    </span>
  ),
  Check: ({ className }: any) => (
    <span data-testid="check-icon" className={className}>
      ✓
    </span>
  ),
  ChevronLeft: ({ className }: any) => (
    <span data-testid="chevron-left" className={className}>
      ◀
    </span>
  ),
  ChevronRight: ({ className }: any) => (
    <span data-testid="chevron-right" className={className}>
      ▶
    </span>
  ),
}))

describe('ReviewSection', () => {
  const productId = 'test-product-123'

  beforeEach(() => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue([])
    vi.mocked(reviewService.create).mockResolvedValue({} as any)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the Reviews heading', async () => {
    render(<ReviewSection productId={productId} />)
    expect(screen.getByText('Avis')).toBeInTheDocument()
  })

  it('shows "Be the first" message when no reviews', async () => {
    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText(/Soyez le premier à laisser un avis/)).toBeInTheDocument()
    })
  })

  it('displays reviews with reviewer name', async () => {
    vi.mocked(reviewService.getByProduct).mockResolvedValue([
      { id: '1', reviewer_name: 'Jean', rating: 5, comment: 'Great!', created_at: '2026-01-01', status: 'approved' },
      { id: '2', reviewer_name: 'Marie', rating: 4, comment: 'Good', created_at: '2026-01-02', status: 'approved' },
    ] as any)

    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Jean')).toBeInTheDocument()
      expect(screen.getByText('Marie')).toBeInTheDocument()
    })
  })

  it('shows review form when "Leave a review" button is clicked', async () => {
    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    expect(screen.getByPlaceholderText('LT-20260101-1234')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Jean Dupont')).toBeInTheDocument()
  })

  it('validates rating is required on submit', async () => {
    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    const submitBtn = screen.getByText('Envoyer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Veuillez sélectionner une note/)).toBeInTheDocument()
    })
  })

  it('validates name is required (min 2 chars)', async () => {
    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    fireEvent.click(screen.getByLabelText('5 étoiles'))
    const nameInput = screen.getByPlaceholderText('Jean Dupont')
    fireEvent.change(nameInput, { target: { value: 'J' } })

    const submitBtn = screen.getByText('Envoyer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Nom requis/)).toBeInTheDocument()
    })
  })

  it('validates order reference is required', async () => {
    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    fireEvent.click(screen.getByLabelText('5 étoiles'))
    const nameInput = screen.getByPlaceholderText('Jean Dupont')
    fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } })

    const submitBtn = screen.getByText('Envoyer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/Référence de commande requise/)).toBeInTheDocument()
    })
  })

  it('calls reviewService.create with correct data on valid submit', async () => {
    vi.mocked(reviewService.create).mockResolvedValue({
      id: 'new-review',
      product_id: productId,
      reviewer_name: 'Jean Dupont',
      rating: 5,
      order_ref: 'LT-20260430-1234',
      comment: 'Excellent!',
      status: 'pending',
    } as any)

    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    const orderRefInput = screen.getByPlaceholderText('LT-20260101-1234')
    fireEvent.change(orderRefInput, { target: { value: 'LT-20260430-1234' } })

    const nameInput = screen.getByPlaceholderText('Jean Dupont')
    fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } })

    fireEvent.click(screen.getByLabelText('5 étoiles'))

    const submitBtn = screen.getByText('Envoyer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(reviewService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          product_id: productId,
          reviewer_name: 'Jean Dupont',
          order_ref: 'LT-20260430-1234',
          rating: 5,
        })
      )
    })
  })

  it('shows success message after review submission', async () => {
    vi.mocked(reviewService.create).mockResolvedValue({
      id: 'new-review',
      product_id: productId,
      reviewer_name: 'Test',
      rating: 5,
      order_ref: 'LT-TEST',
      status: 'pending',
    } as any)

    vi.mocked(reviewService.getByProduct).mockResolvedValue([])

    render(<ReviewSection productId={productId} />)
    await waitFor(() => {
      expect(screen.getByText('Laisser un avis')).toBeInTheDocument()
    })

    fireEvent.click(screen.getByText('Laisser un avis'))

    fireEvent.click(screen.getByLabelText('5 étoiles'))
    const nameInput = screen.getByPlaceholderText('Jean Dupont')
    fireEvent.change(nameInput, { target: { value: 'Jean Dupont' } })
    const orderRefInput = screen.getByPlaceholderText('LT-20260101-1234')
    fireEvent.change(orderRefInput, { target: { value: 'LT-TEST' } })

    const submitBtn = screen.getByText('Envoyer')
    fireEvent.click(submitBtn)

    await waitFor(() => {
      expect(screen.getByText(/en attente de validation/)).toBeInTheDocument()
    })
  })

  it('fetches reviews on mount', () => {
    render(<ReviewSection productId={productId} />)
    expect(reviewService.getByProduct).toHaveBeenCalledWith(productId)
  })
})
