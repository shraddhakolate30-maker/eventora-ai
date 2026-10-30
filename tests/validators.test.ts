import { describe, it, expect } from 'vitest';
import {
  validateEmail,
  validatePassword,
  validateUserSignup,
  validateEventInput,
  validateBudgetItem,
  validateShoppingItem,
  validateTimelineTask,
  validateReturnGiftPlan,
} from '../src/utils/validators';

describe('validateEmail', () => {
  it('accepts standard valid email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
    expect(validateEmail('user.name+tag@domain.co.in')).toBe(true);
    expect(validateEmail('organizer@eventora.ai')).toBe(true);
  });

  it('rejects invalid email formats', () => {
    expect(validateEmail('plainaddress')).toBe(false);
    expect(validateEmail('@missingusername.com')).toBe(false);
    expect(validateEmail('username@.com')).toBe(false);
    expect(validateEmail('user@domain')).toBe(false);
    expect(validateEmail('user name@example.com')).toBe(false);
    expect(validateEmail('')).toBe(false);
    expect(validateEmail(null as any)).toBe(false);
  });
});

describe('validatePassword', () => {
  it('accepts passwords with 6 or more characters', () => {
    expect(validatePassword('secret123').valid).toBe(true);
    expect(validatePassword('abcdef').valid).toBe(true);
  });

  it('rejects passwords shorter than 6 characters', () => {
    const res = validatePassword('12345');
    expect(res.valid).toBe(false);
    expect(res.error).toContain('at least 6 characters');
  });

  it('rejects empty or missing passwords', () => {
    expect(validatePassword('').valid).toBe(false);
    expect(validatePassword(undefined as any).valid).toBe(false);
  });
});

describe('validateUserSignup', () => {
  it('validates a complete and correct signup submission', () => {
    const res = validateUserSignup('Priya Sharma', 'priya@example.com', 'mypassword123');
    expect(res.valid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('detects multiple errors in an invalid signup payload', () => {
    const res = validateUserSignup('P', 'invalid-email', '123');
    expect(res.valid).toBe(false);
    expect(res.errors.name).toBeDefined();
    expect(res.errors.email).toBeDefined();
    expect(res.errors.password).toBeDefined();
  });
});

describe('validateEventInput', () => {
  it('passes on complete valid event details', () => {
    const res = validateEventInput({
      name: 'Aarav 1st Birthday Bash',
      type: 'Birthday Party',
      date: '2026-12-15',
      guestCount: 50,
      budget: 60000,
    });
    expect(res.valid).toBe(true);
    expect(Object.keys(res.errors).length).toBe(0);
  });

  it('rejects missing name, negative guest count, and zero budget', () => {
    const res = validateEventInput({
      name: ' ',
      type: 'Birthday Party',
      date: '2026-12-15',
      guestCount: 0,
      budget: -500,
    });
    expect(res.valid).toBe(false);
    expect(res.errors.name).toBeDefined();
    expect(res.errors.guestCount).toBeDefined();
    expect(res.errors.budget).toBeDefined();
  });
});

describe('item validators', () => {
  it('validates budget item properly', () => {
    expect(validateBudgetItem({ category: 'Decor', allocatedAmount: 5000 }).valid).toBe(true);
    expect(validateBudgetItem({ category: '', allocatedAmount: 5000 }).valid).toBe(false);
    expect(validateBudgetItem({ category: 'Decor', allocatedAmount: -10 }).valid).toBe(false);
  });

  it('validates shopping item properly', () => {
    expect(validateShoppingItem({ name: 'Fairy lights', quantity: 2, estimatedUnitPrice: 150 }).valid).toBe(true);
    expect(validateShoppingItem({ name: '', quantity: 2, estimatedUnitPrice: 150 }).valid).toBe(false);
    expect(validateShoppingItem({ name: 'Lights', quantity: 0, estimatedUnitPrice: 150 }).valid).toBe(false);
  });

  it('validates timeline task properly', () => {
    expect(validateTimelineTask({ title: 'Book cake' }).valid).toBe(true);
    expect(validateTimelineTask({ title: ' ' }).valid).toBe(false);
  });

  it('validates return gift plan properly', () => {
    expect(validateReturnGiftPlan({ recipients: 40, budgetPerGift: 100 }).valid).toBe(true);
    expect(validateReturnGiftPlan({ recipients: 0, budgetPerGift: 100 }).valid).toBe(false);
    expect(validateReturnGiftPlan({ recipients: 40, budgetPerGift: -5 }).valid).toBe(false);
  });
});
