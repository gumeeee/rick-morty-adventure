import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InfiniteScrollDirective } from '../../../shared/directives/infinite-scroll.directive';
import { Character, Location as LocationModel } from '../../../core/models';
import { forkJoin, Subject, takeUntil } from 'rxjs';
import { RickMortyApiService } from '../../../core/services';

@Component({
  selector: 'app-location-details',
  standalone: true,
  imports: [CommonModule, RouterModule, InfiniteScrollDirective],
  templateUrl: './location-details.component.html',
  styleUrl: './location-details.component.scss',
})
export class LocationDetailsComponent implements OnInit, OnDestroy {
  location = signal<LocationModel | null>(null);
  residents = signal<Character[]>([]);
  loading = signal<boolean>(true);
  loadingResidents = signal<boolean>(false);
  loadingMoreResidents = signal<boolean>(false);
  error = signal<string | null>(null);
  hasMoreResidents = signal<boolean>(true);

  private allResidentIds: number[] = [];
  private currentResidentIndex = 0;
  private residentsPerPage = 6;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: RickMortyApiService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.loadLocation(+id);
    } else {
      this.error.set('ID de localização inválido.');
      this.loading.set(false);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadLocation(id: number): void {
    this.loading.set(true);
    this.error.set(null);

    this.apiService
      .getLocationById(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (location) => {
          this.location.set(location);
          this.loading.set(false);

          if (location.residents.length > 0) {
            this.allResidentIds = location.residents.map((url) => {
              const parts = url.split('/');
              return +parts[parts.length - 1];
            });

            this.loadNextResidents();
          } else {
            this.hasMoreResidents.set(false);
          }
        },
        error: (err) => {
          console.error('Error loading location:', err);
          this.error.set(
            'Falha ao carregar os detalhes da localização. Rick está em outra dimensão! Tente novamente mais tarde.'
          );
          this.loading.set(false);
        },
      });
  }

  loadNextResidents(): void {
    if (this.currentResidentIndex >= this.allResidentIds.length) {
      this.hasMoreResidents.set(false);
      return;
    }

    const isInitialLoad = this.currentResidentIndex === 0;

    if (isInitialLoad) {
      this.loadingResidents.set(true);
    } else {
      this.loadingMoreResidents.set(true);
    }

    const nextIds = this.allResidentIds.slice(
      this.currentResidentIndex,
      this.currentResidentIndex + this.residentsPerPage
    );

    const requests = nextIds.map((id) =>
      this.apiService.getCharacterById(id).pipe(takeUntil(this.destroy$))
    );

    forkJoin(requests).subscribe({
      next: (newResidents) => {
        const currentResidents = this.residents();
        this.residents.set([...currentResidents, ...newResidents]);

        this.currentResidentIndex += this.residentsPerPage;

        this.hasMoreResidents.set(
          this.currentResidentIndex < this.allResidentIds.length
        );

        this.loadingResidents.set(false);
        this.loadingMoreResidents.set(false);
      },
      error: (err) => {
        console.error('Error loading residents:', err);
        this.loadingResidents.set(false);
        this.loadingMoreResidents.set(false);
      },
    });
  }

  onResidentsScrollEnd(): void {
    if (
      !this.loadingMoreResidents() &&
      !this.loadingResidents() &&
      this.hasMoreResidents()
    ) {
      this.loadNextResidents();
    }
  }

  goBack(): void {
    this.router.navigate(['/locations']);
  }

  getTypeIcon(type: string): string {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('planet')) return 'bi-globe';
    if (lowerType.includes('cluster')) return 'bi-diagram-3';
    if (lowerType.includes('space')) return 'bi-stars';
    if (lowerType.includes('dimension')) return 'bi-box-arrow-in-right';
    if (lowerType.includes('microverse')) return 'bi-box';

    return 'bi-geo-alt-fill';
  }

  getTypeClass(type: string): string {
    const lowerType = type.toLowerCase();

    if (lowerType.includes('planet')) return 'type-planet';
    if (lowerType.includes('cluster')) return 'type-cluster';
    if (lowerType.includes('space')) return 'type-space';
    if (lowerType.includes('dimension')) return 'type-dimension';
    if (lowerType.includes('microverse')) return 'type-microverse';

    return 'type-default';
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      Alive: 'status-alive',
      Dead: 'status-dead',
      unknown: 'status-unknown',
    };
    return statusMap[status] || 'status-unknown';
  }

  get totalResidents(): number {
    return this.allResidentIds.length;
  }
}
