/**
 * Transaction types enum
 */
export enum TransactionType {
  INCOME = 'income',
  EXPENSE = 'expense'
}

/**
 * Category interface
 */
export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
}

/**
 * Transaction interface
 * Represents a financial transaction (income or expense)
 */
export interface Transaction {
  id: string;
  type: TransactionType;
  description: string;
  category: Category;
  amount: number;
  date: Date;
  createdAt?: Date;
  updatedAt?: Date;
  notes?: string;
  tags?: string[];
  recurring?: boolean;
  recurringPeriod?: 'daily' | 'weekly' | 'monthly' | 'yearly';
}

/**
 * Budget interface
 * Represents a budget for a specific category
 */
export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  currentSpent?: number;
}

/**
 * Financial Goal interface
 * Represents a savings goal
 */
export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: Date;
  description?: string;
  category?: string;
  priority?: 'low' | 'medium' | 'high';
}
