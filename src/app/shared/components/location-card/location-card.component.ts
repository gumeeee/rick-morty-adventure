import { CommonModule } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { Location as LocationModel } from '../../../core/models';

@Component({
  selector: 'app-location-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './location-card.component.html',
  styleUrl: './location-card.component.scss',
})
export class LocationCardComponent {
  location = input.required<LocationModel>();

  getTypeIcon(type: string): string {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('planet')) return 'bi-globe';
    if (lowerType.includes('cluster')) return 'bi-diagram-3';
    if (lowerType.includes('space')) return 'bi-stars';
    if (lowerType.includes('dimension')) return 'bi-box-arrow-in-right';
    if (lowerType.includes('microverse')) return 'bi-box';

    return 'bi-geo-alt-fill';
  }
}
