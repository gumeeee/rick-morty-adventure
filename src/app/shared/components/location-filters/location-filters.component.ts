import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface LocationFilterValues {
  type?: string;
  dimension?: string;
}

@Component({
  selector: 'app-location-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './location-filters.component.html',
  styleUrl: './location-filters.component.scss',
})
export class LocationFiltersComponent {
  filtersChange = output<LocationFilterValues>();

  filters: LocationFilterValues = {
    type: '',
    dimension: '',
  };

  isExpanded = false;

  onFilterChange(): void {
    const activeFilters: LocationFilterValues = {};

    if (this.filters.type?.trim())
      activeFilters.type = this.filters.type.trim();
    if (this.filters.dimension?.trim())
      activeFilters.dimension = this.filters.dimension.trim();

    this.filtersChange.emit(activeFilters);
  }

  clearFilters(): void {
    this.filters = {
      type: '',
      dimension: '',
    };
    this.filtersChange.emit({});
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get hasActiveFilters(): boolean {
    return !!(this.filters.type?.trim() || this.filters.dimension?.trim());
  }
}
