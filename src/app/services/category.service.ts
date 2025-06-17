import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Category } from '../models/transaction.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  // Default categories
  private defaultCategories: Category[] = [
    // Income categories
    { id: 'salary', name: 'Salary', icon: 'payments', color: '#4CAF50' },
    { id: 'freelance', name: 'Freelance', icon: 'work', color: '#8BC34A' },
    { id: 'investments', name: 'Investments', icon: 'trending_up', color: '#009688' },
    { id: 'gifts', name: 'Gifts', icon: 'card_giftcard', color: '#E91E63' },
    { id: 'other-income', name: 'Other Income', icon: 'add_circle', color: '#2196F3' },

    // Expense categories
    { id: 'housing', name: 'Housing', icon: 'home', color: '#FF5722' },
    { id: 'food', name: 'Food & Dining', icon: 'restaurant', color: '#FF9800' },
    { id: 'transportation', name: 'Transportation', icon: 'directions_car', color: '#795548' },
    { id: 'utilities', name: 'Utilities', icon: 'power', color: '#607D8B' },
    { id: 'entertainment', name: 'Entertainment', icon: 'movie', color: '#9C27B0' },
    { id: 'shopping', name: 'Shopping', icon: 'shopping_cart', color: '#F44336' },
    { id: 'health', name: 'Health & Medical', icon: 'local_hospital', color: '#00BCD4' },
    { id: 'education', name: 'Education', icon: 'school', color: '#3F51B5' },
    { id: 'personal', name: 'Personal Care', icon: 'face', color: '#FFEB3B' },
    { id: 'travel', name: 'Travel', icon: 'flight', color: '#673AB7' },
    { id: 'subscriptions', name: 'Subscriptions', icon: 'subscriptions', color: '#03A9F4' },
    { id: 'other-expense', name: 'Other Expenses', icon: 'more_horiz', color: '#9E9E9E' }
  ];

  // BehaviorSubject to store and emit categories
  private categoriesSubject = new BehaviorSubject<Category[]>([]);

  // Observable that components can subscribe to
  public categories$ = this.categoriesSubject.asObservable();

  constructor() {
    // Load categories from localStorage on service initialization
    this.loadFromLocalStorage();
  }

  /**
   * Get all categories
   */
  getAllCategories(): Category[] {
    return this.categoriesSubject.getValue();
  }

  /**
   * Add a new category
   */
  addCategory(category: Omit<Category, 'id'>): Category {
    const categories = this.getAllCategories();

    // Create a new category with generated ID
    const newCategory: Category = {
      ...category,
      id: this.generateId(category.name)
    };

    // Update the BehaviorSubject with the new category
    this.categoriesSubject.next([...categories, newCategory]);

    // Save to localStorage
    this.saveToLocalStorage();

    return newCategory;
  }

  /**
   * Update an existing category
   */
  updateCategory(id: string, updates: Partial<Category>): Category | null {
    const categories = this.getAllCategories();
    const index = categories.findIndex(c => c.id === id);

    if (index === -1) {
      return null;
    }

    // Create updated category
    const updatedCategory: Category = {
      ...categories[index],
      ...updates
    };

    // Replace the old category with the updated one
    categories[index] = updatedCategory;

    // Update the BehaviorSubject
    this.categoriesSubject.next([...categories]);

    // Save to localStorage
    this.saveToLocalStorage();

    return updatedCategory;
  }

  /**
   * Delete a category
   */
  deleteCategory(id: string): boolean {
    // Don't allow deletion of default categories
    if (this.defaultCategories.some(c => c.id === id)) {
      return false;
    }

    const categories = this.getAllCategories();
    const filteredCategories = categories.filter(c => c.id !== id);

    if (filteredCategories.length === categories.length) {
      // No category was removed
      return false;
    }

    // Update the BehaviorSubject
    this.categoriesSubject.next(filteredCategories);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Get a category by ID
   */
  getCategoryById(id: string): Category | undefined {
    return this.getAllCategories().find(c => c.id === id);
  }

  /**
   * Reset categories to default
   */
  resetToDefault(): void {
    this.categoriesSubject.next([...this.defaultCategories]);
    this.saveToLocalStorage();
  }

  /**
   * Generate a unique ID based on the category name
   */
  private generateId(name: string): string {
    const base = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const timestamp = Date.now().toString(36);
    return `${base}-${timestamp}`;
  }

  /**
   * Save categories to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('categories', JSON.stringify(this.getAllCategories()));
    } catch (error) {
      console.error('Error saving categories to localStorage:', error);
    }
  }

  /**
   * Load categories from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedCategories = localStorage.getItem('categories');
      if (storedCategories) {
        const categories: Category[] = JSON.parse(storedCategories);
        this.categoriesSubject.next(categories);
      } else {
        // If no categories in localStorage, use default categories
        this.categoriesSubject.next([...this.defaultCategories]);
      }
    } catch (error) {
      console.error('Error loading categories from localStorage:', error);
      // If there's an error, use default categories
      this.categoriesSubject.next([...this.defaultCategories]);
    }
  }
}
