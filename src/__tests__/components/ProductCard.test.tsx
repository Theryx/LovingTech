import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import ProductCard from '@/components/ProductCard'

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    language: 'fr',
    toggleLanguage: vi.fn(),
    t: (translations: { en: string; fr: string }) => translations.fr,
  }),
}))

vi.mock('@/components/LeadModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="lead-modal">Lead Modal Open</div> : null,
  __esModule: true,
}))

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}))

vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />,
}))

const mockProduct = {
  id: 'test-product-id',
  name: 'Logitech MX Keys',
  price_xaf: 45000,
  brand: 'Logitech',
  stock_status: 'in_stock' as const,
  condition: 'new' as const,
  images: ['/test-image.jpg'],
  description: 'A great keyboard',
  specs: {},
  category: 'keyboards' as const,
}

describe('ProductCard', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders product name', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Logitech MX Keys')).toBeInTheDocument()
  })

  it('renders product price', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText(/45.*000.*FCFA/)).toBeInTheDocument()
  })

  it('renders brand label', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Logitech')).toBeInTheDocument()
  })

  it('renders condition badge for new product', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Neuf')).toBeInTheDocument()
  })

  it('renders out of stock badge for out_of_stock product', () => {
    const outOfStockProduct = { ...mockProduct, stock_status: 'out_of_stock' as const }
    render(<ProductCard product={outOfStockProduct} />)
    expect(screen.getByText('Rupture de stock')).toBeInTheDocument()
  })

  it('renders second_hand badge for second_hand product', () => {
    const usedProduct = { ...mockProduct, condition: 'second_hand' as const }
    render(<ProductCard product={usedProduct} />)
    expect(screen.getByText('Occasion')).toBeInTheDocument()
  })

  it('renders refurbished badge for refurbished product', () => {
    const refurbProduct = { ...mockProduct, condition: 'refurbished' as const }
    render(<ProductCard product={refurbProduct} />)
    expect(screen.getByText('Reconditionné')).toBeInTheDocument()
  })

  it('renders compare-at price when provided', () => {
    const productWithSale = { ...mockProduct, compare_at_price: 55000 }
    render(<ProductCard product={productWithSale} />)
    expect(screen.getByText(/55.*000.*FCFA/)).toBeInTheDocument()
  })

  it('renders Commander button', () => {
    render(<ProductCard product={mockProduct} />)
    expect(screen.getByText('Commander')).toBeInTheDocument()
  })

  it('renders Details button with correct link', () => {
    render(<ProductCard product={mockProduct} />)
    const detailsLink = screen.getByText('Détails')
    expect(detailsLink.closest('a')).toHaveAttribute('href', '/product/test-product-id')
  })

  it('opens lead modal on Commander click', () => {
    render(<ProductCard product={mockProduct} />)
    fireEvent.click(screen.getByText('Commander'))
    expect(screen.getByTestId('lead-modal')).toBeInTheDocument()
  })
})
