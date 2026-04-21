import { describe, it, expect } from 'vitest';
import { Product } from '@/lib/supabase';

describe('Product Type', () => {
  it('should have all required fields', () => {
    const product: Product = {
      id: '1',
      name: 'Test Product',
      description: 'Test description',
      price_xaf: 10000,
      brand: 'TestBrand',
      specs: { key: 'value' },
      images: ['/image.jpg'],
      stock_status: 'in_stock',
    };

    expect(product.id).toBe('1');
    expect(product.name).toBe('Test Product');
    expect(product.description).toBe('Test description');
    expect(product.price_xaf).toBe(10000);
    expect(product.brand).toBe('TestBrand');
    expect(product.specs).toEqual({ key: 'value' });
    expect(product.images).toEqual(['/image.jpg']);
    expect(product.stock_status).toBe('in_stock');
  });

  it('should allow all valid stock_status values', () => {
    const statuses: Product['stock_status'][] = ['in_stock', 'out_of_stock', 'pre_order'];

    statuses.forEach((status) => {
      const product: Product = {
        id: '1',
        name: 'Test',
        description: '',
        price_xaf: 0,
        brand: '',
        specs: {},
        images: [],
        stock_status: status,
      };
      expect(product.stock_status).toBe(status);
    });
  });

  it('should allow specs as Record<string, string>', () => {
    const product: Product = {
      id: '1',
      name: 'Test',
      description: '',
      price_xaf: 0,
      brand: '',
      specs: {
        sensor: '8000 DPI',
        battery: '70 days',
        connectivity: 'Bluetooth, USB',
      },
      images: [],
      stock_status: 'in_stock',
    };

    expect(product.specs.sensor).toBe('8000 DPI');
    expect(product.specs.battery).toBe('70 days');
    expect(product.specs.connectivity).toBe('Bluetooth, USB');
  });

  it('should allow multiple images', () => {
    const product: Product = {
      id: '1',
      name: 'Test',
      description: '',
      price_xaf: 0,
      brand: '',
      specs: {},
      images: ['/img1.jpg', '/img2.jpg', '/img3.jpg'],
      stock_status: 'in_stock',
    };

    expect(product.images.length).toBe(3);
  });
});