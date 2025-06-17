import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    route?: string;
    callback?: () => void;
  };
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // BehaviorSubject to store and emit notifications
  private notificationsSubject = new BehaviorSubject<Notification[]>([]);

  // Observable that components can subscribe to
  public notifications$ = this.notificationsSubject.asObservable();

  // Observable for unread notifications count
  public unreadCount$: Observable<number> = new Observable(observer => {
    this.notifications$.subscribe(notifications => {
      const count = notifications.filter(n => !n.read).length;
      observer.next(count);
    });
  });

  constructor() {
    // Load notifications from localStorage on service initialization
    this.loadFromLocalStorage();
  }

  /**
   * Get all notifications
   */
  getAllNotifications(): Notification[] {
    return this.notificationsSubject.getValue();
  }

  /**
   * Add a new notification
   */
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): Notification {
    const notifications = this.getAllNotifications();

    // Create a new notification with generated ID and timestamp
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date(),
      read: false
    };

    // Update the BehaviorSubject with the new notification
    this.notificationsSubject.next([newNotification, ...notifications]);

    // Save to localStorage
    this.saveToLocalStorage();

    return newNotification;
  }

  /**
   * Mark a notification as read
   */
  markAsRead(id: string): boolean {
    const notifications = this.getAllNotifications();
    const index = notifications.findIndex(n => n.id === id);

    if (index === -1) {
      return false;
    }

    // Mark as read
    notifications[index] = {
      ...notifications[index],
      read: true
    };

    // Update the BehaviorSubject
    this.notificationsSubject.next([...notifications]);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Mark all notifications as read
   */
  markAllAsRead(): void {
    const notifications = this.getAllNotifications();
    const updatedNotifications = notifications.map(n => ({
      ...n,
      read: true
    }));

    // Update the BehaviorSubject
    this.notificationsSubject.next(updatedNotifications);

    // Save to localStorage
    this.saveToLocalStorage();
  }

  /**
   * Delete a notification
   */
  deleteNotification(id: string): boolean {
    const notifications = this.getAllNotifications();
    const filteredNotifications = notifications.filter(n => n.id !== id);

    if (filteredNotifications.length === notifications.length) {
      // No notification was removed
      return false;
    }

    // Update the BehaviorSubject
    this.notificationsSubject.next(filteredNotifications);

    // Save to localStorage
    this.saveToLocalStorage();

    return true;
  }

  /**
   * Clear all notifications
   */
  clearAll(): void {
    this.notificationsSubject.next([]);
    this.saveToLocalStorage();
  }

  /**
   * Create a budget alert notification
   */
  createBudgetAlert(categoryName: string, budgetAmount: number, currentSpent: number): Notification {
    const percentSpent = Math.round((currentSpent / budgetAmount) * 100);

    return this.addNotification({
      type: percentSpent >= 100 ? 'error' : 'warning',
      title: `Budget Alert: ${categoryName}`,
      message: percentSpent >= 100
        ? `You've exceeded your budget for ${categoryName}. Budget: $${budgetAmount}, Spent: $${currentSpent}`
        : `You've used ${percentSpent}% of your budget for ${categoryName}. Budget: $${budgetAmount}, Spent: $${currentSpent}`,
      action: {
        label: 'View Budget',
        route: '/dashboard'
      }
    });
  }

  /**
   * Create a transaction notification
   */
  createTransactionNotification(type: 'income' | 'expense', amount: number, category: string): Notification {
    return this.addNotification({
      type: type === 'income' ? 'success' : 'info',
      title: type === 'income' ? 'Income Added' : 'Expense Recorded',
      message: `${type === 'income' ? 'Income' : 'Expense'} of $${amount} in ${category} has been recorded.`
    });
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }

  /**
   * Save notifications to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      localStorage.setItem('notifications', JSON.stringify(this.getAllNotifications()));
    } catch (error) {
      console.error('Error saving notifications to localStorage:', error);
    }
  }

  /**
   * Load notifications from localStorage
   */
  private loadFromLocalStorage(): void {
    try {
      const storedNotifications = localStorage.getItem('notifications');
      if (storedNotifications) {
        const notifications: Notification[] = JSON.parse(storedNotifications);

        // Convert string dates back to Date objects
        const parsedNotifications = notifications.map(n => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));

        this.notificationsSubject.next(parsedNotifications);
      }
    } catch (error) {
      console.error('Error loading notifications from localStorage:', error);
    }
  }
}
