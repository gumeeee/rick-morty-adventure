import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import {
  debounceTime,
  distinctUntilChanged,
  Subject,
  takeUntil
} from 'rxjs';
import { Character } from '../../core/models';
import { RickMortyApiService } from '../../core/services';
import { CharacterCardComponent } from '../../shared/components/character-card/character-card.component';
import {
  FiltersComponent,
  FilterValues,
} from '../../shared/components/filters/filters.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-characters',
  standalone: true,
  imports: [
    CommonModule,
    CharacterCardComponent,
    LoadingSkeletonComponent,
    FiltersComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './characters.component.html',
  styleUrl: './characters.component.scss',
})
export class CharactersComponent implements OnInit, OnDestroy {
  characters = signal<Character[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  error = signal<string | null>(null);

  private activeFilters: FilterValues = {};

  private currentPage = 1;
  private searchTerm = '';
  private totalPage = 1;

  private destroy$ = new Subject<void>();

  constructor(private apiService: RickMortyApiService) {}

  ngOnInit(): void {
    this.searchTerm = this.apiService.getSearchTerm();

    this.apiService.searchTerm$
      .pipe(debounceTime(400), distinctUntilChanged(), takeUntil(this.destroy$))
      .subscribe((term) => {
        this.searchTerm = term;
        this.loadCharacters(true);
      });

    this.loadCharacters();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCharacters(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 1;
      this.characters.set([]);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.error.set(null);

    this.apiService
      .getCharacters({
        page: this.currentPage,
        name: this.searchTerm || undefined,
        gender: this.activeFilters.gender || undefined,
        status: this.activeFilters.status || undefined,
        species: this.activeFilters.species || undefined,
        type: this.activeFilters.type || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const currentCharacters = reset ? [] : this.characters();
          this.characters.set([...currentCharacters, ...response.results]);

          this.totalPage = response.info.pages;
          this.hasMore.set(this.currentPage < this.totalPage);

          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err) => {
          console.error('Error loading characters:', err);
          this.error.set(
            'Erro ao carregar personagens. Por favor, tente novamente.'
          );
          this.loading.set(false);
          this.loadingMore.set(false);
          this.hasMore.set(false);
        },
      });
  }

  onScrollEnd(): void {
    if (!this.loadingMore() && !this.loading() && this.hasMore()) {
      this.currentPage++;
      this.loadCharacters(false);
    }
  }

  onFiltersChange(filters: FilterValues): void {
    this.activeFilters = filters;
    this.loadCharacters(true);
  }
}
