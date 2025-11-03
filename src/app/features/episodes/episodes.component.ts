import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Episode } from '../../core/models';
import { EpisodeCardComponent } from '../../shared/components/episode-card/episode-card.component';
import {
  EpisodeFiltersComponent,
  EpisodeFilterValues,
} from '../../shared/components/episode-filters/episode-filters.component';
import { LoadingSkeletonComponent } from '../../shared/components/loading-skeleton/loading-skeleton.component';
import { SearchBarComponent } from '../../shared/components/search-bar/search-bar.component';
import { InfiniteScrollDirective } from '../../shared/directives/infinite-scroll.directive';
import { Subject, takeUntil } from 'rxjs';
import { RickMortyApiService } from '../../core/services';

@Component({
  selector: 'app-episodes',
  standalone: true,
  imports: [
    CommonModule,
    SearchBarComponent,
    EpisodeCardComponent,
    EpisodeFiltersComponent,
    LoadingSkeletonComponent,
    InfiniteScrollDirective,
  ],
  templateUrl: './episodes.component.html',
  styleUrl: './episodes.component.scss',
})
export class EpisodesComponent implements OnInit, OnDestroy {
  episodes = signal<Episode[]>([]);
  loading = signal<boolean>(false);
  loadingMore = signal<boolean>(false);
  hasMore = signal<boolean>(true);
  error = signal<string | null>(null);

  private activeFilters: EpisodeFilterValues = {};
  private currentPage = 1;
  private searchTerm = '';
  private totalPages = 1;

  private destroy$ = new Subject<void>();

  constructor(private apiService: RickMortyApiService) {}

  ngOnInit(): void {
    this.loadEpisodes();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEpisodes(reset: boolean = false): void {
    if (reset) {
      this.currentPage = 1;
      this.episodes.set([]);
      this.loading.set(true);
    } else {
      this.loadingMore.set(true);
    }

    this.error.set(null);

    this.apiService
      .getEpisodes({
        page: this.currentPage,
        name: this.searchTerm || undefined,
        episode: this.activeFilters.episode || undefined,
      })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          const currentEpisodes = reset ? [] : this.episodes();
          this.episodes.set([...currentEpisodes, ...response.results]);

          this.totalPages = response.info.pages;
          this.hasMore.set(this.currentPage < this.totalPages);

          this.loading.set(false);
          this.loadingMore.set(false);
        },
        error: (err) => {
          console.error('Error loading episodes:', err);
          this.error.set(
            'Falha ao carregar os episódios. Rick quebrou o controle remoto! Tente novamente mais tarde.'
          );
          this.loading.set(false);
          this.loadingMore.set(false);
          this.hasMore.set(false);
        },
      });
  }

  onSearch(term: string): void {
    this.searchTerm = term;
    this.loadEpisodes(true);
  }

  onFiltersChange(filters: EpisodeFilterValues): void {
    this.activeFilters = filters;
    this.loadEpisodes(true);
  }

  onScrollEnd(): void {
    if (!this.loadingMore() && !this.loading() && this.hasMore()) {
      this.currentPage++;
      this.loadEpisodes(false);
    }
  }
}
