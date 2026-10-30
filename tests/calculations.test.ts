import { describe, it, expect } from 'vitest';
import {
  calculateBudgetMetrics,
  calculateShoppingTotals,
  calculateReturnGiftMetrics,
  calculateTimelineProgress,
} from '../src/utils/calculations';
import { BudgetItem, ShoppingItem, TimelineTask } from '../src/types';

describe('calculateBudgetMetrics', () => {
  it('calculates total planned, actual, remaining, and utilization accurately', () => {
    const categories: BudgetItem[] = [
      {
        id: '1',
        category: 'Venue & Staging',
        allocatedAmount: 20000,
        actualAmount: 18000,
        notes: '',
        isEssential: true,
      },
      {
        id: '2',
        category: 'Catering & Beverages',
        allocatedAmount: 25000,
        actualAmount: 25000,
        notes: '',
        isEssential: true,
      },
      {
        id: '3',
        category: 'Decor & Lighting',
        allocatedAmount: 10000,
        actualAmount: 12000,
        notes: '',
        isEssential: false,
      },
    ];

    const result = calculateBudgetMetrics(60000, categories);

    expect(result.totalPlanned).toBe(55000);
    expect(result.totalActual).toBe(55000);
    expect(result.remainingBudget).toBe(5000);
    expect(result.utilizationPercentage).toBe(92); // Math.round((55000 / 60000) * 100) = 92
    expect(result.isOverBudget).toBe(false);
    expect(result.variance).toBe(0);
  });

  it('correctly flags over-budget status when planned exceeds total budget', () => {
    const categories: BudgetItem[] = [
      {
        id: '1',
        category: 'Venue',
        allocatedAmount: 35000,
        actualAmount: 35000,
        notes: '',
        isEssential: true,
      },
      {
        id: '2',
        category: 'Food',
        allocatedAmount: 25000,
        actualAmount: 25000,
        notes: '',
        isEssential: true,
      },
    ];

    const result = calculateBudgetMetrics(50000, categories);

    expect(result.totalPlanned).toBe(60000);
    expect(result.remainingBudget).toBe(-10000);
    expect(result.isOverBudget).toBe(true);
    expect(result.utilizationPercentage).toBe(120);
  });

  it('handles empty category lists gracefully', () => {
    const result = calculateBudgetMetrics(40000, []);

    expect(result.totalPlanned).toBe(0);
    expect(result.totalActual).toBe(0);
    expect(result.remainingBudget).toBe(40000);
    expect(result.utilizationPercentage).toBe(0);
    expect(result.isOverBudget).toBe(false);
  });

  it('handles zero or negative budget values safely without NaN', () => {
    const categories: BudgetItem[] = [
      {
        id: '1',
        category: 'Decor',
        allocatedAmount: 5000,
        actualAmount: 0,
        notes: '',
        isEssential: true,
      },
    ];

    const result = calculateBudgetMetrics(0, categories);

    expect(result.totalPlanned).toBe(5000);
    expect(result.remainingBudget).toBe(-5000);
    expect(result.utilizationPercentage).toBe(0);
    expect(result.isOverBudget).toBe(true);
  });

  it('sanitizes NaN and negative category values', () => {
    const categories: any[] = [
      { id: '1', category: 'A', allocatedAmount: 'invalid', actualAmount: 1000 },
      { id: '2', category: 'B', allocatedAmount: -200, actualAmount: 'NaN' },
      { id: '3', category: 'C', allocatedAmount: 3000, actualAmount: 2500 },
    ];

    const result = calculateBudgetMetrics(10000, categories);

    expect(result.totalPlanned).toBe(3000);
    expect(result.totalActual).toBe(3500);
    expect(result.remainingBudget).toBe(7000);
  });
});

describe('calculateShoppingTotals', () => {
  it('computes total estimated, purchased, pending and completion rate', () => {
    const items: ShoppingItem[] = [
      {
        id: 's1',
        name: 'Balloons Pack',
        category: 'Decor',
        quantity: 5,
        unit: 'pack',
        estimatedUnitPrice: 200,
        isEssential: true,
        status: 'purchased',
      },
      {
        id: 's2',
        name: 'Fairy String Lights',
        category: 'Lighting',
        quantity: 4,
        unit: 'set',
        estimatedUnitPrice: 350,
        isEssential: true,
        status: 'purchased',
      },
      {
        id: 's3',
        name: 'Welcome Signboard',
        category: 'Decor',
        quantity: 1,
        unit: 'pc',
        estimatedUnitPrice: 600,
        isEssential: false,
        status: 'need_to_buy',
      },
      {
        id: 's4',
        name: 'Disposable Cutlery Pack',
        category: 'Catering',
        quantity: 2,
        unit: 'pack',
        estimatedUnitPrice: 250,
        isEssential: true,
        status: 'shortlisted',
      },
    ];

    // Total: (5*200) + (4*350) + (1*600) + (2*250) = 1000 + 1400 + 600 + 500 = 3500
    // Purchased: (5*200) + (4*350) = 1000 + 1400 = 2400
    // Pending: 3500 - 2400 = 1100
    // Completion: 2 of 4 items = 50%
    const result = calculateShoppingTotals(items);

    expect(result.totalShoppingEstimated).toBe(3500);
    expect(result.totalPurchased).toBe(2400);
    expect(result.totalPending).toBe(1100);
    expect(result.totalItemsCount).toBe(4);
    expect(result.purchasedCount).toBe(2);
    expect(result.completionRate).toBe(50);
  });

  it('handles empty shopping lists gracefully', () => {
    const result = calculateShoppingTotals([]);

    expect(result.totalShoppingEstimated).toBe(0);
    expect(result.totalPurchased).toBe(0);
    expect(result.totalPending).toBe(0);
    expect(result.totalItemsCount).toBe(0);
    expect(result.completionRate).toBe(0);
  });

  it('handles invalid or non-numeric unit prices and quantities', () => {
    const items: any[] = [
      { id: '1', name: 'Item 1', quantity: 'abc', estimatedUnitPrice: 100, status: 'need_to_buy' },
      { id: '2', name: 'Item 2', quantity: 2, estimatedUnitPrice: -50, status: 'purchased' },
      { id: '3', name: 'Item 3', quantity: 3, estimatedUnitPrice: 200, status: 'purchased' },
    ];

    const result = calculateShoppingTotals(items);

    // Item 1: qty 0 * 100 = 0
    // Item 2: qty 2 * 0 = 0
    // Item 3: qty 3 * 200 = 600
    expect(result.totalShoppingEstimated).toBe(600);
    expect(result.totalPurchased).toBe(600);
    expect(result.totalPending).toBe(0);
  });
});

describe('calculateReturnGiftMetrics', () => {
  it('accurately calculates gift budget metrics within allocated budget', () => {
    const recipients = 50;
    const budgetPerGift = 150;
    const allocatedBudget = 10000;

    // Total = 50 * 150 = 7500
    const result = calculateReturnGiftMetrics(recipients, budgetPerGift, allocatedBudget);

    expect(result.totalGiftCost).toBe(7500);
    expect(result.isExceedingAllocated).toBe(false);
    expect(result.variance).toBe(2500); // 10000 - 7500
    expect(result.suggestedBudgetPerGift).toBe(200); // 10000 / 50 = 200
  });

  it('flags warning when return gift budget exceeds allocation', () => {
    const recipients = 80;
    const budgetPerGift = 200;
    const allocatedBudget = 12000;

    // Total = 80 * 200 = 16000 > 12000
    const result = calculateReturnGiftMetrics(recipients, budgetPerGift, allocatedBudget);

    expect(result.totalGiftCost).toBe(16000);
    expect(result.isExceedingAllocated).toBe(true);
    expect(result.variance).toBe(-4000);
    expect(result.suggestedBudgetPerGift).toBe(150); // 12000 / 80 = 150
  });

  it('handles 0 recipients or negative values safely', () => {
    const result = calculateReturnGiftMetrics(0, 150, 5000);

    expect(result.totalGiftCost).toBe(0);
    expect(result.isExceedingAllocated).toBe(false);
    expect(result.suggestedBudgetPerGift).toBe(0);
  });
});

describe('calculateTimelineProgress', () => {
  it('calculates progress percentage correctly', () => {
    const tasks: TimelineTask[] = [
      { id: '1', title: 'Task 1', category: 'C', dueDate: '', dueDescription: '', isEssential: true, isCompleted: true },
      { id: '2', title: 'Task 2', category: 'C', dueDate: '', dueDescription: '', isEssential: true, isCompleted: true },
      { id: '3', title: 'Task 3', category: 'C', dueDate: '', dueDescription: '', isEssential: true, isCompleted: false },
      { id: '4', title: 'Task 4', category: 'C', dueDate: '', dueDescription: '', isEssential: true, isCompleted: false },
    ];

    const result = calculateTimelineProgress(tasks);

    expect(result.totalTasks).toBe(4);
    expect(result.completedCount).toBe(2);
    expect(result.pendingCount).toBe(2);
    expect(result.progressPercent).toBe(50);
  });

  it('returns 100% when all tasks are completed', () => {
    const tasks: TimelineTask[] = [
      { id: '1', title: 'Task 1', category: 'C', dueDate: '', dueDescription: '', isEssential: true, isCompleted: true },
    ];

    const result = calculateTimelineProgress(tasks);
    expect(result.progressPercent).toBe(100);
    expect(result.pendingCount).toBe(0);
  });

  it('returns 0% when no tasks exist', () => {
    const result = calculateTimelineProgress([]);
    expect(result.totalTasks).toBe(0);
    expect(result.completedCount).toBe(0);
    expect(result.progressPercent).toBe(0);
  });
});
