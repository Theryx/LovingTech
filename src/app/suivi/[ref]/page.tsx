import { notFound } from 'next/navigation';
import { orderService } from '@/lib/supabase';
import TrackingPageClient from './TrackingPageClient';

export default async function TrackingPage({ params }: { params: { ref: string } }) {
  const order = await orderService.getByRef(params.ref.toUpperCase());
  if (!order) notFound();

  return <TrackingPageClient order={order} />;
}
