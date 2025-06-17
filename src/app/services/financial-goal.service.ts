import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { FinancialGoal } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class FinancialGoalService {
  // BehaviorSubject to store and emit financial goals
  private goalsSubject = new BehaviorSubject<FinancialGoal[]>([]);

  // Observable that components can subscribe to
  public goals$ = this.goalsSubject.asObservable();

  // Observable for goals with progress calculation
  public goalsWithProgress$ = this.goals$.pipe(
    map(goals => goals.map(goal => {
      const progress = goal.targetAmount > 0
        ? Math.min(Math.round((goal.currentAmount / goal.targetAmount) * 100), 100)
        : 0;

      const remaining = Math.max(goal.targetAmount - goal.currentAmount, 0);

      return {
        ...goal,
        progress,
        remaining,
        isCompleted: goal.currentAmount >= goal.targetAmount
      };
    }))
  );

  constructor() {
    // Load goals from localStorage on service initialization
    this.loadFromLocalStorage();
  }

  /**
   * Get all financial goals
   */
  getAllGoals(): FinancialGoal[] {
    return this.goalsSubject.getValue();
  }

  /**
   * Add a new financial goal
   */
  addGoal(goal: Omit<FinancialGoal, 'id'>): FinancialGoal {
    const goals = this.getAllGoals();

    // Create a new goal with generated ID
    const newGoal: FinancialGoal = {
      ...goal,
      id: this.generateId()
    };

    // Update the BehaviorSubject with the new goal
    this.goalsSubject.next([...goals, newGoal]);

    // Save to localStorage
    this.saveToLocalStorage();

    return newGoal;
  }

  /**
   * Update an existing financial goal
   */
  updateGoal(id: string, updates: Partial<FinancialGoal>): FinancialGoal | null {
    const goals = this.getAllGoals();
    const index = goals.findIndex(g => g.id === id);

    if (index === -1) {
      return null;
    }

    // Create updated goal
    const updatedGoal: FinancialGoal = {
      ...goals[index],
      ...updates
    };

    // Replace the old goal with the updated one
    goals[index] = updatedGoal;

    // Update the BehaviorSubject
    this.goalsSubject.next([...goals]);

    // Save to localStorage
    this.saveToLocalStorage();

    return updatedGoal;
  }

  /**
   * Delete a financial goal
   */
  deleteGoal(id: string): boolean {
    const goals = this.getAllGoals();
    const filteredGoals = goals.filter(g => g.id !== id);

    if (filteredGoals.length === goals.length) {
      // No goal was removed
      return false;
    }

    // Update the BehaviorSubject
    this.goalsSubject.next(filteredGoals);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Get a financial goal by ID
   */
  getGoalById(id: string): FinancialGoal | undefined {
    return this.getAllGoals().find(g => g.id === id);
  }

  /**
   * Add funds to a financial goal
   */
  addFunds(id: string, amount: number): FinancialGoal | null {
    const goal = this.getGoalById(id);

    if (!goal) {
      return null;
    }

    return this.updateGoal(id, {
      currentAmount: goal.currentAmount + amount
    });
  }

  /**
   * Withdraw funds from a financial goal
   */
  withdrawFunds(id: string, amount: number): FinancialGoal | null {
    const goal = this.getGoalById(id);

    if (!goal) {
      return null;
    }

    // Don't allow withdrawing more than the current amount
    const withdrawAmount = Math.min(amount, goal.currentAmount);

    return this.updateGoal(id, {
      currentAmount: goal.currentAmount - withdrawAmount
    });
  }

  /**
   * Get goals by category
   */
  getGoalsByCategory(category: string): FinancialGoal[] {
    return this.getAllGoals().filter(g => g.category === category);
  }

  /**
   * Get completed goals
   */
  getCompletedGoals(): FinancialGoal[] {
    return this.getAllGoals().filter(g => g.currentAmount >= g.targetAmount);
  }

  /**
   * Get incomplete goals
   */
  getIncompleteGoals(): FinancialGoal[] {
    return this.getAllGoals().filter(g => g.currentAmount < g.targetAmount);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Save goals to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('financialGoals', JSON.stringify(this.getAllGoals()));
    } catch (error) {
      console.error('Error saving financial goals to localStorage:', error);
    }
  }

  /**
   * Load goals from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedGoals = localStorage.getItem('financialGoals');
      if (storedGoals) {
        const goals: FinancialGoal[] = JSON.parse(storedGoals);

        // Convert string dates back to Date objects
        const parsedGoals = goals.map(g => ({
          ...g,
          deadline: g.deadline ? new Date(g.deadline) : undefined
        }));

        this.goalsSubject.next(parsedGoals);
      }
    } catch (error) {
      console.error('Error loading financial goals from localStorage:', error);
    }
  }
}
