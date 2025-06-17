import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss']
})
export class ExpensesComponent implements OnInit {
  // Expenses data
  expenses$: Observable<Transaction[]>;
  totalExpenses$: Observable<number>;

  // Filtering and sorting
  selectedPeriod: string = 'month';
  selectedCategory: string | null = null;
  sortBy: 'date' | 'amount' | 'category' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // UI state
  isLoading = true;
  showAddExpenseModal = false;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.expenses$ = this.transactionService.expenseTransactions$;
    this.totalExpenses$ = this.transactionService.totalExpenses$;
  }

  ngOnInit(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  /**
   * Open the add expense modal
   */
  openAddExpenseModal(): void {
    this.showAddExpenseModal = true;
  }

  /**
   * Close the add expense modal
   */
  closeAddExpenseModal(): void {
    this.showAddExpenseModal = false;
  }

  /**
   * Add a new expense
   */
  addExpense(expenseData: Partial<Transaction>): void {
    // Implementation will be added when we create the transaction form component
    this.closeAddExpenseModal();
  }

  /**
   * Delete an expense
   */
  deleteExpense(id: string): void {
    if (confirm('Are you sure you want to delete this expense?')) {
      this.transactionService.deleteTransaction(id);
    }
  }

  /**
   * Filter expenses by period
   */
  filterByPeriod(period: string): void {
    this.selectedPeriod = period;
    // Actual filtering will be implemented in the HTML with ngIf or a custom pipe
  }

  /**
   * Filter expenses by category
   */
  filterByCategory(categoryId: string | null): void {
    this.selectedCategory = categoryId;
    // Actual filtering will be implemented in the HTML with ngIf or a custom pipe
  }

  /**
   * Sort expenses
   */
  sortExpenses(sortBy: 'date' | 'amount' | 'category'): void {
    if (this.sortBy === sortBy) {
      // Toggle sort direction if clicking the same column
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = sortBy;
      this.sortDirection = 'desc'; // Default to descending
    }
    // Actual sorting will be implemented in the HTML with a custom pipe or in the component
  }

  /**
   * Get the date range for the selected period
   * This is a helper method for filtering
   */
  getDateRangeForPeriod(): { start: Date, end: Date } {
    const end = new Date();
    let start = new Date();

    switch (this.selectedPeriod) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
      default:
        start = new Date(0); // Beginning of time
        break;
    }

    return { start, end };
  }
}
