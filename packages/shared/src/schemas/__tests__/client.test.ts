/**
 * Unit Tests for Client Zod Schemas
 * Story 2.1: Client CRUD & Database Schema
 */

import { ClientCreateSchema, ClientUpdateSchema } from '../client';

describe('ClientCreateSchema', () => {
  it('should validate valid client data', () => {
    const validData = {
      name: 'Acme Corporation',
      company: 'Acme Corp',
      role: 'CEO',
      email: 'john@acme.com',
      phone: '+1234567890',
      website: 'https://acme.com',
      linkedin_url: 'https://linkedin.com/in/johndoe',
    };

    const result = ClientCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Acme Corporation');
      expect(result.data.email).toBe('john@acme.com');
    }
  });

  it('should require name field', () => {
    const invalidData = {
      company: 'Acme Corp',
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].path).toContain('name');
    }
  });

  it('should validate name length (min 2 characters)', () => {
    const invalidData = {
      name: 'A', // Too short
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at least 2 characters');
    }
  });

  it('should validate name length (max 100 characters)', () => {
    const invalidData = {
      name: 'A'.repeat(101), // Too long
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('at most 100 characters');
    }
  });

  it('should validate email format', () => {
    const invalidData = {
      name: 'John Doe',
      email: 'invalid-email',
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid email format');
    }
  });

  it('should allow empty string for email', () => {
    const validData = {
      name: 'John Doe',
      email: '',
    };

    const result = ClientCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate website URL format', () => {
    const invalidData = {
      name: 'John Doe',
      website: 'not-a-url',
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid URL format');
    }
  });

  it('should allow empty string for website', () => {
    const validData = {
      name: 'John Doe',
      website: '',
    };

    const result = ClientCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate linkedin_url URL format', () => {
    const invalidData = {
      name: 'John Doe',
      linkedin_url: 'not-a-url',
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.errors[0].message).toContain('Invalid URL format');
    }
  });

  it('should allow optional fields to be omitted', () => {
    const validData = {
      name: 'John Doe',
    };

    const result = ClientCreateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject unknown fields', () => {
    const invalidData = {
      name: 'John Doe',
      unknownField: 'value',
    };

    const result = ClientCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from string fields', () => {
    const data = {
      name: '  John Doe  ',
      company: '  Acme Corp  ',
    };

    const result = ClientCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('John Doe');
      expect(result.data.company).toBe('Acme Corp');
    }
  });

  it('should default tags to empty array', () => {
    const data = {
      name: 'John Doe',
    };

    const result = ClientCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });

  it('should default status to active', () => {
    const data = {
      name: 'John Doe',
    };

    const result = ClientCreateSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.status).toBe('active');
    }
  });
});

describe('ClientUpdateSchema', () => {
  it('should validate valid update data', () => {
    const validData = {
      name: 'Updated Name',
      email: 'newemail@example.com',
    };

    const result = ClientUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should allow all fields to be optional', () => {
    const validData = {};

    const result = ClientUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should validate name length when provided', () => {
    const invalidData = {
      name: 'A', // Too short
    };

    const result = ClientUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate email format when provided', () => {
    const invalidData = {
      email: 'invalid-email',
    };

    const result = ClientUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should allow null values for optional fields', () => {
    const validData = {
      company: null,
      role: null,
      email: null,
    };

    const result = ClientUpdateSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject unknown fields', () => {
    const invalidData = {
      name: 'John Doe',
      unknownField: 'value',
    };

    const result = ClientUpdateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should trim whitespace from string fields', () => {
    const data = {
      name: '  Updated Name  ',
    };

    const result = ClientUpdateSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe('Updated Name');
    }
  });
});
