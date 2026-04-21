import { describe, it, expect } from 'vitest';
import { LOCAL_PRODUCTS, ProductWithFeatured } from '@/lib/localProducts';

describe('LOCAL_PRODUCTS', () => {
  it('should have at least one product', () => {
    expect(LOCAL_PRODUCTS.length).toBeGreaterThan(0);
  });

  it('should have all required product fields', () => {
    const product = LOCAL_PRODUCTS[0];
    expect(product).toHaveProperty('id');
    expect(product).toHaveProperty('name');
    expect(product).toHaveProperty('description');
    expect(product).toHaveProperty('price_xaf');
    expect(product).toHaveProperty('brand');
    expect(product).toHaveProperty('specs');
    expect(product).toHaveProperty('images');
    expect(product).toHaveProperty('stock_status');
  });

  it('should have valid price_xaf as number', () => {
    const product = LOCAL_PRODUCTS[0];
    expect(typeof product.price_xaf).toBe('number');
    expect(product.price_xaf).toBeGreaterThan(0);
  });

  it('should have valid stock_status', () => {
    const validStatuses = ['in_stock', 'out_of_stock', 'pre_order'];
    LOCAL_PRODUCTS.forEach((product) => {
      expect(validStatuses).toContain(product.stock_status);
    });
  });

  it('should have images array with at least one image', () => {
    const product = LOCAL_PRODUCTS[0];
    expect(Array.isArray(product.images)).toBe(true);
    expect(product.images.length).toBeGreaterThan(0);
  });

  it('should have featured field as boolean', () => {
    LOCAL_PRODUCTS.forEach((product) => {
      const p = product as ProductWithFeatured;
      expect(typeof p.featured).toBe('boolean');
    });
  });

  it('should have at least one featured product', () => {
    const featuredProducts = LOCAL_PRODUCTS.filter(
      (p) => (p as ProductWithFeatured).featured === true
    );
    expect(featuredProducts.length).toBeGreaterThan(0);
  });

  it('should have unique product ids', () => {
    const ids = LOCAL_PRODUCTS.map((p) => p.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(LOCAL_PRODUCTS.length);
  });
});