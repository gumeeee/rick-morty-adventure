import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { Router } from '@angular/router';

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

  userName = 'Rick Sanchez';

  constructor(private router: Router) {}

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
    console.log('Navigating to login... Logout clicked');
    this.router.navigate(['/login']);
  }

  closeDropdown(): void {
    this.dropdownOpen = false;
  }
}
