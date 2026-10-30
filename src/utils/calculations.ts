import { BudgetItem, ShoppingItem, TimelineTask } from '../types';

export interface BudgetMetrics {
  totalPlanned: number;
  totalActual: number;
  remainingBudget: number;
  utilizationPercentage: number;
  isOverBudget: boolean;
  variance: number;
}

export function calculateBudgetMetrics(
  totalBudget: number,
  categories: BudgetItem[] = []
): BudgetMetrics {
  const safeTotalBudget = Number.isFinite(totalBudget) ? Math.max(0, totalBudget) : 0;

  const totalPlanned = categories.reduce((sum, item) => {
    const val = Number(item?.allocatedAmount);
    return sum + (Number.isFinite(val) ? Math.max(0, val) : 0);
  }, 0);

  const totalActual = categories.reduce((sum, item) => {
    const val = Number(item?.actualAmount);
    return sum + (Number.isFinite(val) ? Math.max(0, val) : 0);
  }, 0);

  const remainingBudget = safeTotalBudget - totalPlanned;
  const utilizationPercentage =
    safeTotalBudget > 0 ? Math.round((totalPlanned / safeTotalBudget) * 100) : 0;
  const isOverBudget = totalPlanned > safeTotalBudget;
  const variance = totalPlanned - totalActual;

  return {
    totalPlanned,
    totalActual,
    remainingBudget,
    utilizationPercentage,
    isOverBudget,
    variance,
  };
}

export interface ShoppingTotals {
  totalShoppingEstimated: number;
  totalPurchased: number;
  totalPending: number;
  totalItemsCount: number;
  purchasedCount: number;
  completionRate: number;
}

export function calculateShoppingTotals(items: ShoppingItem[] = []): ShoppingTotals {
  let totalShoppingEstimated = 0;
  let totalPurchased = 0;
  let purchasedCount = 0;

  for (const item of items) {
    const qty = Number(item?.quantity);
    const price = Number(item?.estimatedUnitPrice);
    const safeQty = Number.isFinite(qty) ? Math.max(0, qty) : 0;
    const safePrice = Number.isFinite(price) ? Math.max(0, price) : 0;
    const itemTotal = safeQty * safePrice;

    totalShoppingEstimated += itemTotal;

    if (item?.status === 'purchased') {
      totalPurchased += itemTotal;
      purchasedCount += 1;
    }
  }

  const totalPending = Math.max(0, totalShoppingEstimated - totalPurchased);
  const totalItemsCount = items.length;
  const completionRate =
    totalItemsCount > 0 ? Math.round((purchasedCount / totalItemsCount) * 100) : 0;

  return {
    totalShoppingEstimated,
    totalPurchased,
    totalPending,
    totalItemsCount,
    purchasedCount,
    completionRate,
  };
}

export interface ReturnGiftMetrics {
  totalGiftCost: number;
  isExceedingAllocated: boolean;
  variance: number;
  suggestedBudgetPerGift: number;
}

export function calculateReturnGiftMetrics(
  recipients: number,
  budgetPerGift: number,
  allocatedBudget: number = 0
): ReturnGiftMetrics {
  const safeRecipients = Number.isFinite(recipients) ? Math.max(0, Math.floor(recipients)) : 0;
  const safeBudgetPerGift = Number.isFinite(budgetPerGift) ? Math.max(0, budgetPerGift) : 0;
  const safeAllocated = Number.isFinite(allocatedBudget) ? Math.max(0, allocatedBudget) : 0;

  const totalGiftCost = safeRecipients * safeBudgetPerGift;
  const isExceedingAllocated = totalGiftCost > safeAllocated;
  const variance = safeAllocated - totalGiftCost;
  const suggestedBudgetPerGift =
    safeRecipients > 0 ? Math.floor(safeAllocated / safeRecipients) : 0;

  return {
    totalGiftCost,
    isExceedingAllocated,
    variance,
    suggestedBudgetPerGift,
  };
}

export interface TimelineProgress {
  totalTasks: number;
  completedCount: number;
  pendingCount: number;
  progressPercent: number;
}

export function calculateTimelineProgress(tasks: TimelineTask[] = []): TimelineProgress {
  const totalTasks = tasks.length;
  const completedCount = tasks.filter((t) => Boolean(t?.isCompleted)).length;
  const pendingCount = totalTasks - completedCount;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedCount / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedCount,
    pendingCount,
    progressPercent,
  };
}
