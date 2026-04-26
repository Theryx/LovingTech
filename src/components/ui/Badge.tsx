import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type BadgeVariant = 'new' | 'refurbished' | 'second_hand' | 'out_of_stock' | 'low_stock' | 'sale';

interface BadgeProps {
  variant: BadgeVariant;
  label?: string;
  className?: string;
}

const Badge = ({ variant, label, className }: BadgeProps) => {
  const variants = {
    new: {
      styles: 'bg-[#D1FAE5] text-[#065F46]',
      defaultLabel: 'Neuf / New'
    },
    refurbished: {
      styles: 'bg-[#DBEAFE] text-[#1E3A8A]',
      defaultLabel: 'Reconditionné / Refurbished'
    },
    second_hand: {
      styles: 'bg-[#FEF3C7] text-[#92400E]',
      defaultLabel: 'Occasion / Second-hand'
    },
    out_of_stock: {
      styles: 'bg-[#FEE2E2] text-[#991B1B]',
      defaultLabel: 'Rupture de stock / Out of Stock'
    },
    low_stock: {
      styles: 'bg-[#FEF3C7] text-[#92400E]',
      defaultLabel: 'Stock limité / Low Stock'
    },
    sale: {
      styles: 'bg-brand-orange text-white',
      defaultLabel: 'Promo'
    }
  };

  const config = variants[variant];

  return (
    <span className={cn(
      'rounded-full px-3 py-1 text-xs font-semibold inline-block',
      config.styles,
      className
    )}>
      {label || config.defaultLabel}
    </span>
  );
};

export default Badge;
