import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { Character, Episode } from '../../../core/models';
import { RickMortyApiService } from '../../../core/services';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';

@Component({
  selector: 'app-character-details',
  standalone: true,
  imports: [CommonModule, RouterModule, InfiniteScrollDirective],
  templateUrl: './character-details.component.html',
  styleUrl: './character-details.component.scss',
})
export class CharacterDetailsComponent implements OnInit, OnDestroy {
  character = signal<Character | null>(null);
  episodes = signal<Episode[]>([]);
  loading = signal<boolean>(true);
  loadingEpisodes = signal<boolean>(false);
  loadingMoreEpisodes = signal<boolean>(false);
  error = signal<string | null>(null);
  hasMoreEpisodes = signal<boolean>(true);

  private allEpisodeIds: number[] = [];
  private currentEpisodeIndex = 0;
  private episodesPerPage = 6;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: RickMortyApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadCharacter(+id);
    } else {
      this.error.set('ID de personagem inválido.');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCharacter(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService
      .getCharacterById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (character) => {
          this.character.set(character);
          this.loading.set(false);

          if (character.episode.length > 0) {
            this.allEpisodeIds = character.episode.map((url) => {
              const parts = url.split('/');
              return +parts[parts.length - 1];
            });

            this.loadNextEpisodes();
          }
        },
        error: (err) => {
          console.error('Error loading character:', err);
          this.error.set(
            'Falha ao carregar os detalhes do personagem. Rick e Morty está ocupado! Tente novamente mais tarde.'
          );
          this.loading.set(false);
        },
      });
  }

  loadNextEpisodes(): void {
    if (this.currentEpisodeIndex >= this.allEpisodeIds.length) {
      this.hasMoreEpisodes.set(false);
      return;
    }

    const isInitialLoad = this.currentEpisodeIndex === 0;

    if (isInitialLoad) {
      this.loadingEpisodes.set(true);
    } else {
      this.loadingMoreEpisodes.set(true);
    }

    const nextIds = this.allEpisodeIds.slice(
      this.currentEpisodeIndex,
      this.currentEpisodeIndex + this.episodesPerPage
    );

    const requests = nextIds.map((id) =>
      this.apiService.getEpisodeById(id).pipe(takeUntil(this.destroy$))
    );

    forkJoin(requests).subscribe({
      next: (newEpisodes) => {
        const currentEpisodes = this.episodes();
        this.episodes.set([...currentEpisodes, ...newEpisodes]);

        this.currentEpisodeIndex += this.episodesPerPage;

        this.hasMoreEpisodes.set(
          this.currentEpisodeIndex < this.allEpisodeIds.length
        );

        this.loadingEpisodes.set(false);
        this.loadingMoreEpisodes.set(false);
      },
      error: (err) => {
        console.error('Error loading episodes:', err);
        this.loadingEpisodes.set(false);
        this.loadingMoreEpisodes.set(false);
      },
    });
  }

  onEpisodesScrollEnd(): void {
    if (
      !this.loadingMoreEpisodes() &&
      !this.loadingEpisodes() &&
      this.hasMoreEpisodes()
    ) {
      this.loadNextEpisodes();
    }
  }

  goBack(): void {
    this.router.navigate(['/characters']);
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Alive: 'status-alive',
      Dead: 'status-dead',
      unknown: 'status-unknown',
    };
    return statusMap[status] || 'status-unknown';
  }

  getStatusIcon(status: string): string {
    const iconMap: { [key: string]: string } = {
      Alive: 'bi-heart-fill',
      Dead: 'bi-x-circle-fill',
      unknown: 'bi-question-circle-fill',
    };
    return iconMap[status] || 'bi-question-circle-fill';
  }

  get totalEpisodes(): number {
    return this.allEpisodeIds.length;
  }
}
