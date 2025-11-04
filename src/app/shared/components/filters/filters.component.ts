import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface FilterValues {
  status?: 'alive' | 'dead' | 'unknown' | '';
  gender?: 'female' | 'male' | 'genderless' | 'unknown' | '';
  species?: string;
  type?: string;
}

@Component({
  selector: 'app-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './filters.component.html',
  styleUrl: './filters.component.scss',
})
export class FiltersComponent {
  filtersChange = output<FilterValues>();

  filters: FilterValues = {
    status: '',
    gender: '',
    species: '',
    type: '',
  };

  isExpanded = false;

  statusOptions = [
    { value: '', label: 'Todos os Status' },
    { value: 'alive', label: 'Alive' },
    { value: 'dead', label: 'Dead' },
    { value: 'unknown', label: 'Unknown' },
  ];

  genderOptions = [
    { value: '', label: 'Todos os Gêneros' },
    { value: 'female', label: 'Female' },
    { value: 'male', label: 'Male' },
    { value: 'genderless', label: 'Genderless' },
    { value: 'unknown', label: 'Unknown' },
  ];

  onFilterChange(): void {
    const activeFilters: FilterValues = {};

    if (this.filters.status) activeFilters.status = this.filters.status;
    if (this.filters.gender) activeFilters.gender = this.filters.gender;
    if (this.filters.species?.trim())
      activeFilters.species = this.filters.species.trim();
    if (this.filters.type?.trim())
      activeFilters.type = this.filters.type.trim();

    this.filtersChange.emit(activeFilters);
  }

  clearFilters(): void {
    this.filters = {
      status: '',
      gender: '',
      species: '',
      type: '',
    };
    this.filtersChange.emit({});
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get hasActiveFilters(): boolean {
    return !!(
      this.filters.status ||
      this.filters.gender ||
      this.filters.species?.trim() ||
      this.filters.type?.trim()
    );
  }
}
