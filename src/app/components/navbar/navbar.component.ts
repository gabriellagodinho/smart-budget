import { Component, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  isMenuOpen = false;
  isMobile = false;
  isSettingsOpen = false;

  constructor(
    public notificationService: NotificationService,
    private elementRef: ElementRef
  ) {
    this.checkScreenSize();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    // Close settings dropdown when clicking outside
    if (this.isSettingsOpen && !this.elementRef.nativeElement.querySelector('.user-menu').contains(event.target)) {
      this.isSettingsOpen = false;
    }
  }

  @HostListener('window:resize')
  checkScreenSize() {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isMenuOpen = false;
    }
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  closeMenu() {
    this.isMenuOpen = false;
    this.isSettingsOpen = false;
  }

  toggleSettings(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  closeSettings() {
    this.isSettingsOpen = false;
  }
}
