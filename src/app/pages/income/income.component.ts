import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { CategoryService } from '../../services/category.service';
import { Transaction, TransactionType } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-income',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './income.component.html',
  styleUrls: ['./income.component.scss']
})
export class IncomeComponent implements OnInit {
  // Income data
  incomes$: Observable<Transaction[]>;
  totalIncome$: Observable<number>;

  // Filtering and sorting
  selectedPeriod: string = 'month';
  selectedCategory: string | null = null;
  sortBy: 'date' | 'amount' | 'category' = 'date';
  sortDirection: 'asc' | 'desc' = 'desc';

  // UI state
  isLoading = true;
  showAddIncomeModal = false;

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService
  ) {
    this.incomes$ = this.transactionService.incomeTransactions$;
    this.totalIncome$ = this.transactionService.totalIncome$;
  }

  ngOnInit(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  /**
   * Open the add income modal
   */
  openAddIncomeModal(): void {
    this.showAddIncomeModal = true;
  }

  /**
   * Close the add income modal
   */
  closeAddIncomeModal(): void {
    this.showAddIncomeModal = false;
  }

  /**
   * Add a new income
   */
  addIncome(incomeData: Partial<Transaction>): void {
    // Implementation will be added when we create the transaction form component
    this.closeAddIncomeModal();
  }

  /**
   * Delete an income
   */
  deleteIncome(id: string): void {
    if (confirm('Are you sure you want to delete this income?')) {
      this.transactionService.deleteTransaction(id);
    }
  }

  /**
   * Filter incomes by period
   */
  filterByPeriod(period: string): void {
    this.selectedPeriod = period;
    // Actual filtering will be implemented in the HTML with ngIf or a custom pipe
  }

  /**
   * Filter incomes by category
   */
  filterByCategory(categoryId: string | null): void {
    this.selectedCategory = categoryId;
    // Actual filtering will be implemented in the HTML with ngIf or a custom pipe
  }

  /**
   * Sort incomes
   */
  sortIncomes(sortBy: 'date' | 'amount' | 'category'): void {
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
