import { EventItem, BudgetItem, ShoppingItem, TimelineTask, ReturnGiftPlan } from '../types';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password is required' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password must be at least 6 characters long' };
  }
  return { valid: true };
}

export function validateUserSignup(
  name: string,
  email: string,
  password: string
): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  if (!name || !name.trim()) {
    errors.name = 'Full name is required';
  } else if (name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters';
  }

  if (!email || !email.trim()) {
    errors.email = 'Email address is required';
  } else if (!validateEmail(email)) {
    errors.email = 'Invalid email address format';
  }

  const pwdCheck = validatePassword(password);
  if (!pwdCheck.valid) {
    errors.password = pwdCheck.error || 'Password invalid';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateEventInput(data: Partial<EventItem>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!data.name || !data.name.trim()) {
    errors.name = 'Event name is required';
  }

  if (!data.type) {
    errors.type = 'Event type is required';
  }

  if (!data.date) {
    errors.date = 'Event date is required';
  }

  if (data.guestCount === undefined || data.guestCount === null || isNaN(Number(data.guestCount))) {
    errors.guestCount = 'Guest count is required';
  } else if (Number(data.guestCount) <= 0) {
    errors.guestCount = 'Guest count must be at least 1';
  }

  if (data.budget === undefined || data.budget === null || isNaN(Number(data.budget))) {
    errors.budget = 'Budget is required';
  } else if (Number(data.budget) <= 0) {
    errors.budget = 'Budget must be greater than zero';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateBudgetItem(item: Partial<BudgetItem>): { valid: boolean; error?: string } {
  if (!item.category || !item.category.trim()) {
    return { valid: false, error: 'Category name is required' };
  }
  const allocated = Number(item.allocatedAmount);
  if (isNaN(allocated) || allocated < 0) {
    return { valid: false, error: 'Allocated amount must be a positive number' };
  }
  return { valid: true };
}

export function validateShoppingItem(item: Partial<ShoppingItem>): { valid: boolean; error?: string } {
  if (!item.name || !item.name.trim()) {
    return { valid: false, error: 'Item name is required' };
  }
  const qty = Number(item.quantity);
  if (isNaN(qty) || qty <= 0) {
    return { valid: false, error: 'Quantity must be at least 1' };
  }
  const price = Number(item.estimatedUnitPrice);
  if (isNaN(price) || price < 0) {
    return { valid: false, error: 'Unit price must be 0 or higher' };
  }
  return { valid: true };
}

export function validateTimelineTask(task: Partial<TimelineTask>): { valid: boolean; error?: string } {
  if (!task.title || !task.title.trim()) {
    return { valid: false, error: 'Task title is required' };
  }
  return { valid: true };
}

export function validateReturnGiftPlan(plan: Partial<ReturnGiftPlan>): { valid: boolean; error?: string } {
  const recipients = Number(plan.recipients);
  if (isNaN(recipients) || recipients <= 0) {
    return { valid: false, error: 'Recipients must be at least 1' };
  }
  const budgetPerGift = Number(plan.budgetPerGift);
  if (isNaN(budgetPerGift) || budgetPerGift < 0) {
    return { valid: false, error: 'Budget per gift must be 0 or higher' };
  }
  return { valid: true };
}
