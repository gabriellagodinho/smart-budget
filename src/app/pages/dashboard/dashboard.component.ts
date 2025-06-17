import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  // Observables for financial data
  balance$: Observable<number>;
  totalIncome$: Observable<number>;
  totalExpenses$: Observable<number>;
  recentTransactions: Transaction[] = [];

  // Chart data
  incomeVsExpensesData: any;
// Loading state
  isLoading = true;

  constructor(
    private transactionService: TransactionService
  ) {
    this.balance$ = this.transactionService.balance$;
    this.totalIncome$ = this.transactionService.totalIncome$;
    this.totalExpenses$ = this.transactionService.totalExpenses$;
  }

  ngOnInit(): void {
    // Get recent transactions
    this.loadRecentTransactions();

    // Prepare chart data
    this.prepareChartData();

    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  /**
   * Load the most recent transactions
   */
  private loadRecentTransactions(): void {
    const allTransactions = this.transactionService.getAllTransactions();

    // Sort by date (newest first) and take the first 5
    this.recentTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }

  /**
   * Prepare data for charts
   */
  private prepareChartData(): void {
    // Income vs Expenses data
    this.incomeVsExpensesData = {
      labels: ['Income', 'Expenses'],
      datasets: [{
        data: [0, 0], // Will be populated with actual data
        backgroundColor: ['#4CAF50', '#F44336']
      }]
    };

    // Subscribe to get actual values
    this.totalIncome$.subscribe(income => {
      this.incomeVsExpensesData.datasets[0].data[0] = income;
    });

    this.totalExpenses$.subscribe(expenses => {
      this.incomeVsExpensesData.datasets[0].data[1] = expenses;
    });

    // Category breakdown data will be prepared here
    // This would typically involve grouping transactions by category
    // and calculating totals for each category
  }
}
