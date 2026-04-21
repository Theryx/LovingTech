import { describe, it, expect } from 'vitest';
import { LOCAL_PRODUCTS } from '@/lib/localProducts';

describe('Product Filtering Logic', () => {
  it('should filter products by stock status - in_stock', () => {
    const stockFilter = 'in_stock';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      if (!stockFilter) return true;
      return product.stock_status === stockFilter;
    });

    filteredProducts.forEach((product) => {
      expect(product.stock_status).toBe('in_stock');
    });
  });

  it('should filter products by stock status - out_of_stock', () => {
    const stockFilter = 'out_of_stock';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      if (!stockFilter) return true;
      return product.stock_status === stockFilter;
    });

    filteredProducts.forEach((product) => {
      expect(product.stock_status).toBe('out_of_stock');
    });
  });

  it('should return all products when no filter', () => {
    const stockFilter = '';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      if (!stockFilter) return true;
      return product.stock_status === stockFilter;
    });

    expect(filteredProducts.length).toBe(LOCAL_PRODUCTS.length);
  });

  it('should search products by name', () => {
    const search = 'logitech';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      return product.name.toLowerCase().includes(search.toLowerCase());
    });

    filteredProducts.forEach((product) => {
      expect(product.name.toLowerCase()).toContain('logitech');
    });
  });

  it('should search products by description', () => {
    const search = 'mouse';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      return product.description.toLowerCase().includes(search.toLowerCase());
    });

    filteredProducts.forEach((product) => {
      expect(product.description.toLowerCase()).toContain('mouse');
    });
  });

  it('should filter products by brand', () => {
    const brandFilter = 'Logitech';
    const filteredProducts = LOCAL_PRODUCTS.filter((product) => {
      return !brandFilter || product.brand === brandFilter;
    });

    filteredProducts.forEach((product) => {
      expect(product.brand).toBe('Logitech');
    });
  });

  it('should get unique brands', () => {
    const brands = Array.from(new Set(LOCAL_PRODUCTS.map((p) => p.brand)));
    
    expect(brands.length).toBeGreaterThan(0);
    expect(brands).toContain('Logitech');
    expect(brands).toContain('Anker');
    expect(brands).toContain('Keychron');
  });
});