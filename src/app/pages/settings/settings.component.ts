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
    currency: 'BRL',
    language: 'pt',
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
    { value: 'daily', label: 'Diário' },
    { value: 'weekly', label: 'Semanal' },
    { value: 'monthly', label: 'Mensal' },
    { value: 'manual', label: 'Apenas manual' }
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
      this.successMessage = 'Configurações salvas com sucesso';

      // Create notification
      this.notificationService.addNotification({
        type: 'success',
        title: 'Configurações Atualizadas',
        message: 'Suas configurações foram atualizadas com sucesso.'
      });
    } catch (error) {
      this.errorMessage = 'Falha ao salvar configurações';
      console.error('Erro ao salvar configurações:', error);
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
    if (confirm('Tem certeza que deseja redefinir todas as categorias para o padrão? Isso não pode ser desfeito.')) {
      this.categoryService.resetToDefault();

      this.notificationService.addNotification({
        type: 'info',
        title: 'Categorias Redefinidas',
        message: 'Todas as categorias foram redefinidas para os valores padrão.'
      });
    }
  }

  /**
   * Clear all data (factory reset)
   */
  clearAllData(): void {
    if (confirm('AVISO: Isso excluirá TODOS os seus dados, incluindo transações, orçamentos e metas. Esta ação não pode ser desfeita. Tem certeza?')) {
      if (confirm('Tem ABSOLUTA certeza? Todos os seus dados financeiros serão excluídos permanentemente.')) {
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
          title: 'Dados Apagados',
          message: 'Todos os seus dados foram excluídos. O aplicativo foi redefinido para as configurações de fábrica.'
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
        title: 'Dados Exportados',
        message: 'Seus dados foram exportados com sucesso.'
      });
    } catch (error) {
      this.errorMessage = 'Falha ao exportar dados';
      console.error('Erro ao exportar dados:', error);
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
          throw new Error('Formato de arquivo de backup inválido');
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
          title: 'Dados Importados',
          message: 'Seus dados foram importados com sucesso. O aplicativo será recarregado.'
        });

        // Reload the page to refresh all services
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (error) {
        this.errorMessage = 'Falha ao importar dados: Formato de arquivo inválido';
        console.error('Erro ao importar dados:', error);
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
