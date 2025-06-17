import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  // Registration form data
  registerData = {
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  // UI state
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(private router: Router) {}

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  /**
   * Handle registration form submission
   */
  onSubmit(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Basic validation
    if (!this.registerData.name || !this.registerData.email || !this.registerData.password) {
      this.errorMessage = 'Please fill in all required fields.';
      this.isLoading = false;
      return;
    }

    if (this.registerData.password !== this.registerData.confirmPassword) {
      this.errorMessage = 'Passwords do not match.';
      this.isLoading = false;
      return;
    }

    // Simulate API call delay
    setTimeout(() => {
      // In a real app, this would call an auth service
      console.log('Registration successful', this.registerData);

      // Store user info in localStorage (for demo purposes)
      localStorage.setItem('user', JSON.stringify({
        name: this.registerData.name,
        email: this.registerData.email,
        isLoggedIn: true
      }));

      // Navigate to dashboard
      this.router.navigate(['/dashboard']);

      this.isLoading = false;
    }, 1000);
  }
}
