import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BudgetService } from '../../services/budget.service';
import { CategoryService } from '../../services/category.service';
import { TransactionService } from '../../services/transaction.service';
import { Budget, Category } from '../../models/transaction.model';
import { Observable, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

interface BudgetWithProgress extends Budget {
  category: Category;
  currentSpent: number;
  percentUsed: number;
  remaining: number;
}

@Component({
  selector: 'app-budgets',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './budgets.component.html',
  styleUrls: ['./budgets.component.scss']
})
export class BudgetsComponent implements OnInit {
  // Budgets data
  budgetsWithProgress$: Observable<BudgetWithProgress[]>;
  categories: Category[] = [];

  // UI state
  isLoading = true;
  showAddBudgetModal = false;
  selectedBudgetForEdit: Budget | null = null;

  constructor(
    private budgetService: BudgetService,
    private categoryService: CategoryService,
    private transactionService: TransactionService
  ) {
    // Get budgets with spending data and category information
    this.budgetsWithProgress$ = combineLatest([
      this.budgetService.budgetsWithSpending$,
      this.categoryService.categories$
    ]).pipe(
      map(([budgetsWithSpending, categories]) => {
        return budgetsWithSpending.map(budget => {
          const category = categories.find(c => c.id === budget.categoryId) || {
            id: 'unknown',
            name: 'Unknown Category',
            icon: 'help',
            color: '#9E9E9E'
          };

          return {
            ...budget,
            category
          } as BudgetWithProgress;
        });
      })
    );
  }

  ngOnInit(): void {
    // Load categories
    this.categoryService.categories$.subscribe(categories => {
      this.categories = categories;
    });

    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  /**
   * Open the add budget modal
   */
  openAddBudgetModal(): void {
    this.selectedBudgetForEdit = null;
    this.showAddBudgetModal = true;
  }

  /**
   * Open the edit budget modal
   */
  openEditBudgetModal(budget: Budget): void {
    this.selectedBudgetForEdit = budget;
    this.showAddBudgetModal = true;
  }

  /**
   * Close the budget modal
   */
  closeBudgetModal(): void {
    this.showAddBudgetModal = false;
    this.selectedBudgetForEdit = null;
  }

  /**
   * Add a new budget
   */
  addBudget(budgetData: Omit<Budget, 'id'>): void {
    this.budgetService.addBudget(budgetData);
    this.closeBudgetModal();
  }

  /**
   * Update an existing budget
   */
  updateBudget(id: string, updates: Partial<Budget>): void {
    this.budgetService.updateBudget(id, updates);
    this.closeBudgetModal();
  }

  /**
   * Delete a budget
   */
  deleteBudget(id: string): void {
    if (confirm('Are you sure you want to delete this budget?')) {
      this.budgetService.deleteBudget(id);
    }
  }

  /**
   * Get the status class based on budget usage percentage
   */
  getBudgetStatusClass(percentUsed: number): string {
    if (percentUsed >= 100) {
      return 'exceeded';
    } else if (percentUsed >= 90) {
      return 'warning';
    } else if (percentUsed >= 75) {
      return 'caution';
    } else {
      return 'good';
    }
  }

  /**
   * Format the period for display
   */
  formatPeriod(period: string): string {
    switch (period) {
      case 'daily': return 'Daily';
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'yearly': return 'Yearly';
      default: return period;
    }
  }
}
