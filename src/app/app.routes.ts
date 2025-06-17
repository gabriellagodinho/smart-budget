import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent),
    title: 'Dashboard - SmartBudget'
  },
  {
    path: 'expenses',
    loadComponent: () => import('./pages/expenses/expenses.component').then(m => m.ExpensesComponent),
    title: 'Expenses - SmartBudget'
  },
  {
    path: 'income',
    loadComponent: () => import('./pages/income/income.component').then(m => m.IncomeComponent),
    title: 'Income - SmartBudget'
  },
  {
    path: 'budgets',
    loadComponent: () => import('./pages/budgets/budgets.component').then(m => m.BudgetsComponent),
    title: 'Budgets - SmartBudget'
  },
  {
    path: 'goals',
    loadComponent: () => import('./pages/goals/goals.component').then(m => m.GoalsComponent),
    title: 'Financial Goals - SmartBudget'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/auth/login/login.component').then(m => m.LoginComponent),
    title: 'Login - SmartBudget'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/auth/register/register.component').then(m => m.RegisterComponent),
    title: 'Register - SmartBudget'
  },
  {
    path: 'settings',
    loadComponent: () => import('./pages/settings/settings.component').then(m => m.SettingsComponent),
    title: 'Settings - SmartBudget'
  },
  {
    path: '**',
    loadComponent: () => import('./pages/not-found/not-found.component').then(m => m.NotFoundComponent),
    title: 'Page Not Found - SmartBudget'
  }
];
