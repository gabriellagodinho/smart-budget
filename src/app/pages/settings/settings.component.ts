import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoryService } from '../../services/category.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  // User settings
  settings = {
    darkMode: true,
    notifications: true,
    currency: 'USD',
    language: 'en',
    backupFrequency: 'weekly'
  };

  // UI state
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Available options
  currencies = [
    { code: 'USD', symbol: '$', name: 'US Dollar' },
    { code: 'EUR', symbol: '€', name: 'Euro' },
    { code: 'GBP', symbol: '£', name: 'British Pound' },
    { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' }
  ];

  languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'pt', name: 'Português' },
    { code: 'ja', name: '日本語' },
    { code: 'zh', name: '中文' }
  ];

  backupOptions = [
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'manual', label: 'Manual only' }
  ];

  constructor(
    private categoryService: CategoryService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // Load settings from localStorage
    this.loadSettings();
  }

  /**
   * Save settings
   */
  saveSettings(): void {
    this.isLoading = true;
    this.successMessage = '';
    this.errorMessage = '';

    try {
      // Save settings to localStorage
      localStorage.setItem('userSettings', JSON.stringify(this.settings));

      // Apply settings
      this.applySettings();

      // Show success message
      this.successMessage = 'Settings saved successfully';

      // Create notification
      this.notificationService.addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Your settings have been updated successfully.'
      });
    } catch (error) {
      this.errorMessage = 'Failed to save settings';
      console.error('Error saving settings:', error);
    } finally {
      this.isLoading = false;

      // Clear success message after 3 seconds
      if (this.successMessage) {
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      }
    }
  }

  /**
   * Reset categories to default
   */
  resetCategories(): void {
    if (confirm('Are you sure you want to reset all categories to default? This cannot be undone.')) {
      this.categoryService.resetToDefault();

      this.notificationService.addNotification({
        type: 'info',
        title: 'Categories Reset',
        message: 'All categories have been reset to default values.'
      });
    }
  }

  /**
   * Clear all data (factory reset)
   */
  clearAllData(): void {
    if (confirm('WARNING: This will delete ALL your data including transactions, budgets, and goals. This action cannot be undone. Are you sure?')) {
      if (confirm('Are you ABSOLUTELY sure? All your financial data will be permanently deleted.')) {
        // Clear all localStorage data except user authentication
        const userAuth = localStorage.getItem('user');
        localStorage.clear();
        if (userAuth) {
          localStorage.setItem('user', userAuth);
        }

        // Save current settings
        localStorage.setItem('userSettings', JSON.stringify(this.settings));

        // Show notification
        this.notificationService.addNotification({
          type: 'warning',
          title: 'Data Cleared',
          message: 'All your data has been deleted. App has been reset to factory settings.'
        });

        // Reload the page to reset all services
        window.location.reload();
      }
    }
  }

  /**
   * Export data as JSON
   */
  exportData(): void {
    try {
      // Collect all data from localStorage
      const data = {
        transactions: JSON.parse(localStorage.getItem('transactions') || '[]'),
        categories: JSON.parse(localStorage.getItem('categories') || '[]'),
        budgets: JSON.parse(localStorage.getItem('budgets') || '[]'),
        goals: JSON.parse(localStorage.getItem('financialGoals') || '[]'),
        settings: this.settings,
        exportDate: new Date().toISOString()
      };

      // Convert to JSON string
      const jsonString = JSON.stringify(data, null, 2);

      // Create download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `smartbudget-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Show notification
      this.notificationService.addNotification({
        type: 'success',
        title: 'Data Exported',
        message: 'Your data has been exported successfully.'
      });
    } catch (error) {
      this.errorMessage = 'Failed to export data';
      console.error('Error exporting data:', error);
    }
  }

  /**
   * Import data from JSON file
   */
  importData(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);

        // Validate data structure
        if (!data.transactions || !data.categories || !data.budgets || !data.goals) {
          throw new Error('Invalid backup file format');
        }

        // Store data in localStorage
        localStorage.setItem('transactions', JSON.stringify(data.transactions));
        localStorage.setItem('categories', JSON.stringify(data.categories));
        localStorage.setItem('budgets', JSON.stringify(data.budgets));
        localStorage.setItem('financialGoals', JSON.stringify(data.goals));

        // Update settings if available
        if (data.settings) {
          this.settings = data.settings;
          localStorage.setItem('userSettings', JSON.stringify(this.settings));
        }

        // Show notification
        this.notificationService.addNotification({
          type: 'success',
          title: 'Data Imported',
          message: 'Your data has been imported successfully. The app will now reload.'
        });

        // Reload the page to refresh all services
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        this.errorMessage = 'Failed to import data: Invalid file format';
        console.error('Error importing data:', error);
      }
    };

    reader.readAsText(file);
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings(): void {
    try {
      const storedSettings = localStorage.getItem('userSettings');
      if (storedSettings) {
        this.settings = { ...this.settings, ...JSON.parse(storedSettings) };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  /**
   * Apply settings to the application
   */
  private applySettings(): void {
    // Apply dark mode
    document.documentElement.classList.toggle('light-mode', !this.settings.darkMode);

    // Other settings would be applied through services in a real app
  }
}
