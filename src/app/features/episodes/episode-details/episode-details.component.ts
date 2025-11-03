import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { Character, Episode } from '../../../core/models';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { RickMortyApiService } from '../../../core/services';

@Component({
  selector: 'app-episode-details',
  standalone: true,
  imports: [CommonModule, RouterModule, InfiniteScrollDirective],
  templateUrl: './episode-details.component.html',
  styleUrl: './episode-details.component.scss',
})
export class EpisodeDetailsComponent implements OnInit, OnDestroy {
  episode = signal<Episode | null>(null);
  characters = signal<Character[]>([]);
  loading = signal<boolean>(true);
  loadingCharacters = signal<boolean>(false);
  loadingMoreCharacters = signal<boolean>(false);
  error = signal<string | null>(null);
  hasMoreCharacters = signal<boolean>(true);

  private allCharacterIds: number[] = [];
  private currentCharacterIndex = 0;
  private charactersPerPage = 6;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: RickMortyApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadEpisode(+id);
    } else {
      this.error.set('ID de episódio inválido.');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEpisode(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService
      .getEpisodeById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (episode) => {
          this.episode.set(episode);
          this.loading.set(false);

          if (episode.characters.length > 0) {
            this.allCharacterIds = episode.characters.map((url) => {
              const parts = url.split('/');
              return +parts[parts.length - 1];
            });

            this.loadNextCharacters();
          } else {
            this.hasMoreCharacters.set(false);
          }
        },
        error: (err) => {
          console.error('Error loading episode:', err);
          this.error.set(
            'Falha ao carregar os detalhes do episódio. Rick perdeu o controle remoto! Tente novamente mais tarde.'
          );
          this.loading.set(false);
        },
      });
  }

  loadNextCharacters(): void {
    if (this.currentCharacterIndex >= this.allCharacterIds.length) {
      this.hasMoreCharacters.set(false);
      return;
    }

    const isInitialLoad = this.currentCharacterIndex === 0;

    if (isInitialLoad) {
      this.loadingCharacters.set(true);
    } else {
      this.loadingMoreCharacters.set(true);
    }

    const nextIds = this.allCharacterIds.slice(
      this.currentCharacterIndex,
      this.currentCharacterIndex + this.charactersPerPage
    );

    const requests = nextIds.map((id) =>
      this.apiService.getCharacterById(id).pipe(takeUntil(this.destroy$))
    );

    forkJoin(requests).subscribe({
      next: (newCharacters) => {
        const currentCharacters = this.characters();
        this.characters.set([...currentCharacters, ...newCharacters]);

        this.currentCharacterIndex += this.charactersPerPage;

        this.hasMoreCharacters.set(
          this.currentCharacterIndex < this.allCharacterIds.length
        );

        this.loadingCharacters.set(false);
        this.loadingMoreCharacters.set(false);
      },
      error: (err) => {
        console.error('Error loading characters:', err);
        this.loadingCharacters.set(false);
        this.loadingMoreCharacters.set(false);
      },
    });
  }

  onCharactersScrollEnd(): void {
    if (
      !this.loadingMoreCharacters() &&
      !this.loadingCharacters() &&
      this.hasMoreCharacters()
    ) {
      this.loadNextCharacters();
    }
  }

  goBack(): void {
    this.router.navigate(['/episodes']);
  }

  getSeasonNumber(episodeCode: string): number {
    const match = episodeCode.match(/S(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  getEpisodeNumber(episodeCode: string): number {
    const match = episodeCode.match(/E(\d+)/);
    return match ? parseInt(match[1]) : 1;
  }

  getSeasonColor(season: number): string {
    const colors = [
      '#97ce4c',
      '#11b0c8',
      '#f0e14a',
      '#5a1e76',
      '#ef4444',
      '#8b5cf6',
    ];
    return colors[(season - 1) % colors.length];
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Alive: 'status-alive',
      Dead: 'status-dead',
      unknown: 'status-unknown',
    };
    return statusMap[status] || 'status-unknown';
  }

  get totalCharacters(): number {
    return this.allCharacterIds.length;
  }
}
