import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  // Login form data
  loginData = {
    email: '',
    password: ''
  };

  // UI state
  isLoading = false;
  errorMessage = '';
  showPassword = false;

  constructor(private router: Router) {}

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Handle login form submission
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Simulate API call delay
    setTimeout(() => {
      // For demo purposes, accept any non-empty email/password
      if (this.loginData.email && this.loginData.password) {
        // In a real app, this would call an auth service
        console.log('Login successful', this.loginData);

        // Store user info in localStorage (for demo purposes)
        localStorage.setItem('user', JSON.stringify({
          email: this.loginData.email,
          name: this.loginData.email.split('@')[0],
          isLoggedIn: true
        }));

        // Navigate to dashboard
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMessage = 'Please enter both email and password.';
      }

      this.isLoading = false;
    }, 1000);
  }
}
