import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import { Budget } from '../models/transaction.model';
import { TransactionService } from './transaction.service';
import { NotificationService } from './notification.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class BudgetService {
  // BehaviorSubject to store and emit budgets
  private budgetsSubject = new BehaviorSubject<Budget[]>([]);

  // Observable that components can subscribe to
  public budgets$ = this.budgetsSubject.asObservable();

  // Observable for budgets with current spending
  public budgetsWithSpending$ = combineLatest([
    this.budgets$,
    this['transactionService'].transactions$
  ]).pipe(
    map(([budgets, transactions]) => {
      return budgets.map(budget => {
        const categoryTransactions = transactions.filter(t =>
          t.category.id === budget.categoryId &&
          new Date(t.date) >= budget.startDate &&
          (!budget.endDate || new Date(t.date) <= budget.endDate)
        );

        const currentSpent = categoryTransactions.reduce((total, t) => total + t.amount, 0);
        const percentUsed = budget.amount > 0 ? Math.round((currentSpent / budget.amount) * 100) : 0;

        return {
          ...budget,
          currentSpent,
          percentUsed,
          remaining: budget.amount - currentSpent
        };
      });
    })
  );

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) {
    // Load budgets from localStorage on service initialization
    this.loadFromLocalStorage();

    // Set up budget monitoring
    this.monitorBudgets();
  }

  /**
   * Get all budgets
   */
  getAllBudgets(): Budget[] {
    return this.budgetsSubject.getValue();
  }

  /**
   * Add a new budget
   */
  addBudget(budget: Omit<Budget, 'id'>): Budget {
    const budgets = this.getAllBudgets();

    // Create a new budget with generated ID
    const newBudget: Budget = {
      ...budget,
      id: this.generateId()
    };

    // Update the BehaviorSubject with the new budget
    this.budgetsSubject.next([...budgets, newBudget]);

    // Save to localStorage
    this.saveToLocalStorage();

    return newBudget;
  }

  /**
   * Update an existing budget
   */
  updateBudget(id: string, updates: Partial<Budget>): Budget | null {
    const budgets = this.getAllBudgets();
    const index = budgets.findIndex(b => b.id === id);

    if (index === -1) {
      return null;
    }

    // Create updated budget
    const updatedBudget: Budget = {
      ...budgets[index],
      ...updates
    };

    // Replace the old budget with the updated one
    budgets[index] = updatedBudget;

    // Update the BehaviorSubject
    this.budgetsSubject.next([...budgets]);

    // Save to localStorage
    this.saveToLocalStorage();

    return updatedBudget;
  }

  /**
   * Delete a budget
   */
  deleteBudget(id: string): boolean {
    const budgets = this.getAllBudgets();
    const filteredBudgets = budgets.filter(b => b.id !== id);

    if (filteredBudgets.length === budgets.length) {
      // No budget was removed
      return false;
    }

    // Update the BehaviorSubject
    this.budgetsSubject.next(filteredBudgets);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Get a budget by ID
   */
  getBudgetById(id: string): Budget | undefined {
    return this.getAllBudgets().find(b => b.id === id);
  }

  /**
   * Get budgets by category ID
   */
  getBudgetsByCategory(categoryId: string): Budget[] {
    return this.getAllBudgets().filter(b => b.categoryId === categoryId);
  }

  /**
   * Check if a category has an active budget
   */
  hasCategoryBudget(categoryId: string): boolean {
    const now = new Date();
    return this.getAllBudgets().some(b =>
      b.categoryId === categoryId &&
      new Date(b.startDate) <= now &&
      (!b.endDate || new Date(b.endDate) >= now)
    );
  }

  /**
   * Monitor budgets for threshold alerts
   */
  private monitorBudgets(): void {
    this.budgetsWithSpending$.subscribe(budgetsWithSpending => {
      budgetsWithSpending.forEach(budget => {
        const { percentUsed, currentSpent } = budget;

        // Check if budget is at or over threshold (80%, 90%, 100%)
        if (percentUsed >= 100 || percentUsed >= 90 || percentUsed >= 80) {
          // Get category name
          const category = this.categoryService.getCategoryById(budget.categoryId);
          if (category) {
            // Create notification
            this.notificationService.createBudgetAlert(
              category.name,
              budget.amount,
              currentSpent
            );
          }
        }
      });
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Save budgets to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('budgets', JSON.stringify(this.getAllBudgets()));
    } catch (error) {
      console.error('Error saving budgets to localStorage:', error);
    }
  }

  /**
   * Load budgets from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedBudgets = localStorage.getItem('budgets');
      if (storedBudgets) {
        const budgets: Budget[] = JSON.parse(storedBudgets);

        // Convert string dates back to Date objects
        const parsedBudgets = budgets.map(b => ({
          ...b,
          startDate: new Date(b.startDate),
          endDate: b.endDate ? new Date(b.endDate) : undefined
        }));

        this.budgetsSubject.next(parsedBudgets);
      }
    } catch (error) {
      console.error('Error loading budgets from localStorage:', error);
    }
  }
}
