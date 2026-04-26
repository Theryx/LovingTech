'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ProductWithFeatured } from '@/lib/localProducts';
import LeadModal from './LeadModal';
import Card from './ui/Card';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useLanguage } from '@/context/LanguageContext';

interface ProductCardProps {
  product: ProductWithFeatured;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { language } = useLanguage();

  const isOutOfStock = product.stock_status === 'out_of_stock';

  return (
    <>
      <Card
        image={product.images?.[0] || '/images/placeholder.svg'}
        name={product.name}
        price={product.price_xaf}
        compareAtPrice={product.compare_at_price}
        brandLabel={product.brand}
        isOutOfStock={isOutOfStock}
        badge={
          isOutOfStock ? (
            <Badge variant="out_of_stock" label={language === 'fr' ? 'Rupture de stock' : 'Out of Stock'} />
          ) : (
            <Badge variant="new" label={language === 'fr' ? 'Neuf' : 'New'} />
          )
        }
        ctaSlot={
          <div className="flex gap-2">
            <Button
              variant="primary"
              className="flex-1 py-2 text-xs"
              onClick={() => setIsModalOpen(true)}
              aria-label={language === 'fr' ? `Commander ${product.name}` : `Order ${product.name}`}
            >
              {language === 'fr' ? 'Commander' : 'Order'}
            </Button>
            <Button
              variant="secondary"
              className="px-4 py-2 text-xs"
              href={`/product/${product.id}`}
              aria-label={language === 'fr' ? `Voir les détails de ${product.name}` : `View details for ${product.name}`}
            >
              {language === 'fr' ? 'Détails' : 'Details'}
            </Button>
          </div>
        }
      />

      <LeadModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
