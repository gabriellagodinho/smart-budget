import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { Transaction, TransactionType } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // BehaviorSubject to store and emit transactions
  private transactionsSubject = new BehaviorSubject<Transaction[]>([]);

  // Observable that components can subscribe to
  public transactions$ = this.transactionsSubject.asObservable();

  // Observable for income transactions
  public incomeTransactions$ = this.transactions$.pipe(
    map(transactions => transactions.filter(t => t.type === TransactionType.INCOME))
  );

  // Observable for expense transactions
  public expenseTransactions$ = this.transactions$.pipe(
    map(transactions => transactions.filter(t => t.type === TransactionType.EXPENSE))
  );

  // Observable for total balance
  public balance$ = this.transactions$.pipe(
    map(transactions => this.calculateBalance(transactions))
  );

  // Observable for total income
  public totalIncome$ = this.incomeTransactions$.pipe(
    map(transactions => this.calculateTotal(transactions))
  );

  // Observable for total expenses
  public totalExpenses$ = this.expenseTransactions$.pipe(
    map(transactions => this.calculateTotal(transactions))
  );

  constructor() {
    // Load transactions from localStorage on service initialization
    this.loadFromLocalStorage();
  }

  /**
   * Get all transactions
   */
  getAllTransactions(): Transaction[] {
    return this.transactionsSubject.getValue();
  }

  /**
   * Add a new transaction
   */
  addTransaction(transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Transaction {
    const transactions = this.getAllTransactions();

    // Create a new transaction with generated ID and timestamps
    const newTransaction: Transaction = {
      ...transaction,
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Update the BehaviorSubject with the new transaction
    this.transactionsSubject.next([...transactions, newTransaction]);

    // Save to localStorage
    this.saveToLocalStorage();

    return newTransaction;
  }

  /**
   * Update an existing transaction
   */
  updateTransaction(id: string, updates: Partial<Transaction>): Transaction | null {
    const transactions = this.getAllTransactions();
    const index = transactions.findIndex(t => t.id === id);

    if (index === -1) {
      return null;
    }

    // Create updated transaction
    const updatedTransaction: Transaction = {
      ...transactions[index],
      ...updates,
      updatedAt: new Date()
    };

    // Replace the old transaction with the updated one
    transactions[index] = updatedTransaction;

    // Update the BehaviorSubject
    this.transactionsSubject.next([...transactions]);

    // Save to localStorage
    this.saveToLocalStorage();

    return updatedTransaction;
  }

  /**
   * Delete a transaction
   */
  deleteTransaction(id: string): boolean {
    const transactions = this.getAllTransactions();
    const filteredTransactions = transactions.filter(t => t.id !== id);

    if (filteredTransactions.length === transactions.length) {
      // No transaction was removed
      return false;
    }

    // Update the BehaviorSubject
    this.transactionsSubject.next(filteredTransactions);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Get a transaction by ID
   */
  getTransactionById(id: string): Transaction | undefined {
    return this.getAllTransactions().find(t => t.id === id);
  }

  /**
   * Get transactions by type
   */
  getTransactionsByType(type: TransactionType): Transaction[] {
    return this.getAllTransactions().filter(t => t.type === type);
  }

  /**
   * Get transactions by category ID
   */
  getTransactionsByCategory(categoryId: string): Transaction[] {
    return this.getAllTransactions().filter(t => t.category.id === categoryId);
  }

  /**
   * Get transactions by date range
   */
  getTransactionsByDateRange(startDate: Date, endDate: Date): Transaction[] {
    return this.getAllTransactions().filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
  }

  /**
   * Calculate total balance
   */
  private calculateBalance(transactions: Transaction[]): number {
    return transactions.reduce((total, t) => {
      return t.type === TransactionType.INCOME
        ? total + t.amount
        : total - t.amount;
    }, 0);
  }

  /**
   * Calculate total amount for a list of transactions
   */
  private calculateTotal(transactions: Transaction[]): number {
    return transactions.reduce((total, t) => total + t.amount, 0);
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Save transactions to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('transactions', JSON.stringify(this.getAllTransactions()));
    } catch (error) {
      console.error('Error saving transactions to localStorage:', error);
    }
  }

  /**
   * Load transactions from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedTransactions = localStorage.getItem('transactions');
      if (storedTransactions) {
        const transactions: Transaction[] = JSON.parse(storedTransactions);

        // Convert string dates back to Date objects
        const parsedTransactions = transactions.map(t => ({
          ...t,
          date: new Date(t.date),
          createdAt: t.createdAt ? new Date(t.createdAt) : undefined,
          updatedAt: t.updatedAt ? new Date(t.updatedAt) : undefined
        }));

        this.transactionsSubject.next(parsedTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions from localStorage:', error);
    }
  }
}
