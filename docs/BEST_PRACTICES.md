# Best Practices for Next.js E-commerce Site

This document outlines the essential best practices for building a production-ready e-commerce application with Next.js and Supabase.

---

## Table of Contents

1. [Performance](#performance)
2. [SEO](#seo)
3. [Security](#security)
4. [UX](#ux)
5. [Checkout](#checkout)
6. [Monitoring](#monitoring)

---

## Performance

### Image Optimization

- Use `next/image` for all images with proper `sizes` and `priority` attributes
- Set `priority={true}` on LCP (Largest Contentful Paint) images like hero banners and featured products
- Use modern formats (WebP/AVIF) via Next.js automatic optimization

```tsx
<Image
  src={product.image}
  alt={product.name}
  width={400}
  height={400}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isFeatured}
/>
```

### Lazy Loading

- Implement lazy loading for product galleries using `next/dynamic` or React Suspense
- Load below-the-fold images only when approaching viewport

### Caching Strategy

- Use ISR (Incremental Static Regeneration) for product pages
- Set `revalidate` period based on update frequency (e.g., 60 seconds for products)

```tsx
export async function generateStaticParams() {
  const products = await fetchProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export const revalidate = 60
```

### Edge Functions

- Use Edge Runtime for regional pricing and currency conversion
- Configure Edge functions in `next.config.js`

---

## SEO

### Server-Side Rendering

- Use Server Components for product pages to enable dynamic metadata
- Generate metadata dynamically based on product data

```tsx
export async function generateMetadata({ params }) {
  const product = await getProduct(params.slug)
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      images: [product.image],
    },
  }
}
```

### Sitemap and Robots

- Generate `sitemap.xml` using `next-sitemap` or Next.js built-in
- Create `robots.txt` to control crawler access

```tsx
// app/sitemap.ts
export default async function sitemap() {
  const products = await fetchProducts()
  const urls = products.map((product) => ({
    url: `/product/${product.slug}`,
    lastModified: product.updatedAt,
  }))
  return [
    { url: 'https://yoursite.com', lastModified: new Date() },
    ...urls,
  ]
}
```

### Structured Data

- Implement JSON-LD for products (price, availability, reviews)
- Use `next-seo` or custom Schema.org markup

```tsx
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{
    __html: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: product.name,
      description: product.description,
      offers: {
        '@type': 'Offer',
        price: product.price,
        priceCurrency: 'USD',
        availability: product.inStock
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    }),
  }}
/>
```

### URL Structure

- Use clean, descriptive URLs: `/product/[slug]`
- Avoid query parameters for canonical product pages

---

## Security

### Supabase RLS

- Enable Row Level Security (RLS) on all tables
- Create policies for authenticated vs anonymous access

```sql
-- Products: readable by all, writable by admins only
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products are updatable by admins" ON products
  FOR UPDATE USING (auth.role() = 'authenticated')
  WITH CHECK (auth.jwt() -> 'role' = 'admin');
```

### Rate Limiting

- Implement rate limiting on auth and payment endpoints using Upstash Redis
- Protect endpoints like `/api/auth/`, `/api/checkout/`

```tsx
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '10s'),
})

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') ?? 'anonymous'
  const { success } = await ratelimit.limit(ip)
  if (!success) return new Response('Too Many Requests', { status: 429 })
  // ...
}
```

### Input Sanitization

- Validate all user inputs using Zod schemas
- Sanitize outputs to prevent XSS

```tsx
import { z } from 'zod'

const checkoutSchema = z.object({
  email: z.string().email(),
  address: z.string().min(10).max(200),
  items: z.array(z.object({
    id: z.string().uuid(),
    quantity: z.number().int().min(1).max(10),
  })),
})
```

### Session Management

- Use HTTP-only cookies for session tokens
- Configure SameSite and Secure flags in production

---

## UX

### Optimistic UI

- Implement optimistic updates for cart actions (add, remove, update quantity)
- Use React Query or SWR for mutation handling

```tsx
const { mutate } = useMutation({
  mutationFn: addToCart,
  onMutate: async (newItem) => {
    await queryClient.cancelQueries(['cart'])
    const previousCart = queryClient.getQueryData(['cart'])
    queryClient.setQueryData(['cart'], (old) => [...old, newItem])
    return { previousCart }
  },
  onError: (err, newItem, context) => {
    queryClient.setQueryData(['cart'], context.previousCart)
  },
})
```

### Skeleton Loaders

- Display skeleton loaders during data fetching
- Use `loading.tsx` for route-level loading states

```tsx
// app/product/[slug]/loading.tsx
export default function Loading() {
  return (
    <div className="animate-pulse">
      <div className="h-96 bg-gray-200 rounded-lg mb-4" />
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
    </div>
  )
}
```

### Error Boundaries

- Create custom error boundaries for graceful failure handling
- Implement `error.tsx` for route-specific errors

```tsx
// app/error.tsx
'use client'
export default function Error({ reset }) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <button onClick={() => reset()}>Try again</button>
    </div>
  )
}
```

### Mobile-First Design

- Design for mobile first, then scale up
- Use Tailwind's responsive utilities: `md:`, `lg:`, `xl:`

---

## Checkout

### Payment Security

- Never store payment information locally
- Use Stripe Elements or PayPal SDK for secure payment handling

### Webhooks

- Verify webhook signatures for order confirmation
- Implement idempotent webhook processing to prevent duplicate orders

```tsx
import Stripe from 'stripe'
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    return new Response('Webhook Error', { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    // Process order (idempotent)
    await fulfillOrder(event.data.object)
  }

  return new Response(null, { status: 200 })
}
```

### Idempotency Keys

- Use idempotency keys for payment retries to prevent duplicate charges
- Store keys in database with processed status

---

## Monitoring

### Error Tracking

- Integrate Sentry for error monitoring and performance tracking

```tsx
// instrumentation.ts
import * as Sentry from '@sentry/nextjs'

export function register() {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    tracesSampleRate: 0.1,
  })
}
```

### Analytics

- Implement analytics for conversion funnels (Google Analytics, Mixpanel, or PostHog)
- Track key events: `add_to_cart`, `begin_checkout`, `purchase`

### Real User Monitoring

- Use Sentry or other RUM solutions for performance insights
- Monitor Core Web Vitals: LCP, FID, CLS

---

## Quick Reference Checklist

### Before Production

- [ ] Run `npm run build` without errors
- [ ] Enable RLS on all Supabase tables
- [ ] Configure environment variables in production
- [ ] Generate sitemap.xml and robots.txt
- [ ] Add JSON-LD structured data to product pages
- [ ] Set up error tracking (Sentry)
- [ ] Implement rate limiting on sensitive endpoints
- [ ] Test mobile responsive design
- [ ] Verify Lighthouse performance score > 80
- [ ] Configure HTTP-only cookies for sessions

---

## Resources

- [Next.js Image Component](https://nextjs.org/docs/app/api-reference/components/image)
- [Supabase RLS Docs](https://supabase.com/docs/guides/auth/row-level-security)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Sentry Next.js Integration](https://docs.sentry.io/platforms/javascript/guides/nextjs/)
- [Google SEO Guide](https://developers.google.com/search/docs)