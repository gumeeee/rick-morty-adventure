import { CommonModule } from '@angular/common';
import { Component, computed, output, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import {
  AuthService,
  AVAILABLE_ROLES,
  User,
} from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  toggleSidebar = output<void>();

  dropdownOpen = false;

  currentUser!: WritableSignal<User | null>;
  isAuthenticated!: WritableSignal<boolean>;

  userRole = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return AVAILABLE_ROLES.find((r) => r.value === user.role);
  });

  constructor(private router: Router, private authService: AuthService) {
    this.currentUser = this.authService.currentUser;
    this.isAuthenticated = this.authService.isAuthenticated;
  }

  onToggleSidebar(): void {
    this.toggleSidebar.emit();
  }

  toggleDropdown(): void {
    this.dropdownOpen = !this.dropdownOpen;
  }

  goToProfile(): void {
    this.dropdownOpen = false;
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.dropdownOpen = false;
    this.authService.logout();
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
