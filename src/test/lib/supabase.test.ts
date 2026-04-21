import { describe, it, expect } from 'vitest';
import { Lead } from '@/lib/supabase';

describe('Lead Type', () => {
  it('should allow valid lead object', () => {
    const lead: Lead = {
      id: '1',
      product_id: '123',
      whatsapp_number: '+237612345678',
      address: 'Douala, Cameroon',
      status: 'pending',
      created_at: '2026-01-01T00:00:00Z',
    };

    expect(lead.id).toBe('1');
    expect(lead.product_id).toBe('123');
    expect(lead.whatsapp_number).toBe('+237612345678');
    expect(lead.address).toBe('Douala, Cameroon');
    expect(lead.status).toBe('pending');
  });

  it('should allow all valid status values', () => {
    const statuses: Lead['status'][] = ['pending', 'contacted', 'completed'];

    statuses.forEach((status) => {
      const lead: Lead = {
        product_id: '1',
        whatsapp_number: '+237612345678',
        address: 'Test',
        status,
      };
      expect(lead.status).toBe(status);
    });
  });

  it('should allow optional fields to be undefined', () => {
    const lead: Lead = {
      product_id: '1',
      whatsapp_number: '+237612345678',
      address: 'Test',
    };

    expect(lead.id).toBeUndefined();
    expect(lead.status).toBeUndefined();
    expect(lead.created_at).toBeUndefined();
  });
});