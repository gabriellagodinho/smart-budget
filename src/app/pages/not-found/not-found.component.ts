import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {
  // List of suggested pages for navigation
  suggestedPages = [
    { path: '/dashboard', name: 'Dashboard', icon: '📊' },
    { path: '/expenses', name: 'Expenses', icon: '💸' },
    { path: '/income', name: 'Income', icon: '💵' },
    { path: '/budgets', name: 'Budgets', icon: '📝' },
    { path: '/goals', name: 'Financial Goals', icon: '🎯' }
  ];
}
