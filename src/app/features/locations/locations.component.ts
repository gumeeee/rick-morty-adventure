import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { RickMortyApiService } from '../../core/services';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { LocationCardComponent } from '../../shared/components/location-card/location-card.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { Location as LocationModel } from '../../core/models';
import {
  LocationFiltersComponent,
  LocationFilterValues,
} from '../../shared/components/location-filters/location-filters.component';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    LocationCardComponent,
    LoadingSkeletonComponent,
    LocationFiltersComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './locations.component.html',
  styleUrl: './locations.component.scss',
})
export class LocationsComponent {
  locations = signal<LocationModel[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  error = signal<string | null>(null);

  private activeFilters: LocationFilterValues = {};
  private currentPage = 1;
  private searchTerm = '';
  private totalPages = 1;

  private destroy$ = new Subject<void>();

  constructor(private apiService: RickMortyApiService) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLocations(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 1;
      this.locations.set([]);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.error.set(null);

    this.apiService
      .getLocations({
        page: this.currentPage,
        name: this.searchTerm || undefined,
        type: this.activeFilters.type || undefined,
        dimension: this.activeFilters.dimension || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const currentLocations = reset ? [] : this.locations();
          this.locations.set([...currentLocations, ...response.results]);

          this.totalPages = response.info.pages;
          this.hasMore.set(this.currentPage < this.totalPages);

          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err) => {
          console.error('Error loading locations:', err);
          this.error.set(
            'Falha ao carregar os locais. Tente novamente mais tarde. Rick está ocupado lidando com outra coisa.'
          );
          this.loading.set(false);
          this.loadingMore.set(false);
          this.hasMore.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadLocations(true);
  }

  onFiltersChange(filters: LocationFilterValues): void {
    this.activeFilters = filters;
    this.loadLocations(true);
  }

  onScrollEnd(): void {
    if (!this.loadingMore() && !this.loading() && this.hasMore()) {
      this.currentPage++;
      this.loadLocations(false);
    }
  }
}
