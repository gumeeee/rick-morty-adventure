import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { RouterModule } from '@angular/router';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  isExpanded = input<boolean>(true);

  sidebarToggle = output<void>();

  navItems: NavItem[] = [
    { label: 'Personagens', route: '/characters', icon: 'bi-people-fill' },
    { label: 'Locais', route: '/locations', icon: 'bi-geo-alt-fill' },
    { label: 'Episódios', route: '/episodes', icon: 'bi-play-circle-fill' },
  ];

  closeSidebar(): void {
    this.sidebarToggle.emit();
  }
}
