import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinancialGoalService } from '../../services/financial-goal.service';
import { FinancialGoal } from '../../models/transaction.model';
import { Observable, map } from 'rxjs';

interface GoalWithProgress extends FinancialGoal {
  progress: number;
  remaining: number;
  isCompleted: boolean;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
})
export class GoalsComponent implements OnInit {
  // Goals data
  goalsWithProgress$: Observable<GoalWithProgress[]>;
  completedGoals$: Observable<GoalWithProgress[]>;
  activeGoals$: Observable<GoalWithProgress[]>;

  // UI state
  isLoading = true;
  showAddGoalModal = false;
  showContributeModal = false;
  selectedGoalForEdit: FinancialGoal | null = null;
  selectedGoalForContribution: FinancialGoal | null = null;
  contributionAmount = 0;

  constructor(private goalService: FinancialGoalService) {
    this.goalsWithProgress$ = this.goalService.goalsWithProgress$;

    // Create filtered observables
    this.completedGoals$ = this.goalsWithProgress$.pipe(
      map(goals => goals.filter(goal => goal.isCompleted))
    );

    this.activeGoals$ = this.goalsWithProgress$.pipe(
      map(goals => goals.filter(goal => !goal.isCompleted))
    );
  }

  ngOnInit(): void {
    // Simulate loading delay
    setTimeout(() => {
      this.isLoading = false;
    }, 500);
  }

  /**
   * Open the add goal modal
   */
  openAddGoalModal(): void {
    this.selectedGoalForEdit = null;
    this.showAddGoalModal = true;
  }

  /**
   * Open the edit goal modal
   */
  openEditGoalModal(goal: FinancialGoal): void {
    this.selectedGoalForEdit = goal;
    this.showAddGoalModal = true;
  }

  /**
   * Close the goal modal
   */
  closeGoalModal(): void {
    this.showAddGoalModal = false;
    this.selectedGoalForEdit = null;
  }

  /**
   * Open the contribute modal
   */
  openContributeModal(goal: FinancialGoal): void {
    this.selectedGoalForContribution = goal;
    this.contributionAmount = 0;
    this.showContributeModal = true;
  }

  /**
   * Close the contribute modal
   */
  closeContributeModal(): void {
    this.showContributeModal = false;
    this.selectedGoalForContribution = null;
    this.contributionAmount = 0;
  }

  /**
   * Add a new goal
   */
  addGoal(goalData: Omit<FinancialGoal, 'id'>): void {
    this.goalService.addGoal(goalData);
    this.closeGoalModal();
  }

  /**
   * Update an existing goal
   */
  updateGoal(id: string, updates: Partial<FinancialGoal>): void {
    this.goalService.updateGoal(id, updates);
    this.closeGoalModal();
  }

  /**
   * Delete a goal
   */
  deleteGoal(id: string): void {
    if (confirm('Are you sure you want to delete this goal?')) {
      this.goalService.deleteGoal(id);
    }
  }

  /**
   * Add funds to a goal
   */
  addFundsToGoal(): void {
    if (this.selectedGoalForContribution && this.contributionAmount > 0) {
      this.goalService.addFunds(this.selectedGoalForContribution.id, this.contributionAmount);
      this.closeContributeModal();
    }
  }

  /**
   * Withdraw funds from a goal
   */
  withdrawFundsFromGoal(id: string, amount: number): void {
    if (confirm(`Are you sure you want to withdraw ${amount} from this goal?`)) {
      this.goalService.withdrawFunds(id, amount);
    }
  }

  /**
   * Get the status class based on goal progress percentage
   */
  getGoalStatusClass(progress: number): string {
    if (progress >= 100) {
      return 'completed';
    } else if (progress >= 75) {
      return 'almost';
    } else if (progress >= 50) {
      return 'halfway';
    } else if (progress >= 25) {
      return 'started';
    } else {
      return 'beginning';
    }
  }

  /**
   * Calculate time remaining until deadline
   */
  getTimeRemaining(deadline: Date | undefined): string {
    if (!deadline) {
      return 'No deadline';
    }

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - now.getTime();

    if (diffTime <= 0) {
      return 'Deadline passed';
    }

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 365) {
      const years = Math.floor(diffDays / 365);
      return `${years} year${years > 1 ? 's' : ''} left`;
    } else if (diffDays > 30) {
      const months = Math.floor(diffDays / 30);
      return `${months} month${months > 1 ? 's' : ''} left`;
    } else {
      return `${diffDays} day${diffDays > 1 ? 's' : ''} left`;
    }
  }
}
