import { CommonModule } from '@angular/common';
import { Component, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface EpisodeFilterValues {
  episode?: string;
}
@Component({
  selector: 'app-episode-filters',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './episode-filters.component.html',
  styleUrl: './episode-filters.component.scss',
})
export class EpisodeFiltersComponent {
  filtersChange = output<EpisodeFilterValues>();

  filters: EpisodeFilterValues = {
    episode: '',
  };

  isExpanded = false;

  onFilterChange(): void {
    const activeFilters: EpisodeFilterValues = {};

    if (this.filters.episode?.trim())
      activeFilters.episode = this.filters.episode.trim();

    this.filtersChange.emit(activeFilters);
  }

  clearFilters(): void {
    this.filters = {
      episode: '',
    };
    this.filtersChange.emit({});
  }

  toggleExpanded(): void {
    this.isExpanded = !this.isExpanded;
  }

  get hasActiveFilters(): boolean {
    return !!this.filters.episode?.trim();
  }
}
