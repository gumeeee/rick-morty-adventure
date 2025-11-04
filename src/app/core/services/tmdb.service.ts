import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of, tap, catchError, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { TMDBEpisodeDetails, TMDBSeasonDetails } from '../models/tmdb.model';

@Injectable({
  providedIn: 'root',
})
export class TmdbService {
  private apiKey = environment.tmdbApiKey;
  private baseUrl = environment.tmdbBaseUrl;
  private rickAndMortySeriesId = 60625;

  loading = signal<boolean>(false);

  private seasonCache = new Map<number, TMDBSeasonDetails>();

  constructor(private http: HttpClient) {}

  getSeasonDetails(seasonNumber: number): Observable<TMDBSeasonDetails | null> {
    if (this.seasonCache.has(seasonNumber)) {
      return of(this.seasonCache.get(seasonNumber)!);
    }

    this.loading.set(true);

    const params = new HttpParams().set('api_key', this.apiKey);

    const url = `${this.baseUrl}/tv/${this.rickAndMortySeriesId}/season/${seasonNumber}`;

    return this.http.get<TMDBSeasonDetails>(url, { params }).pipe(
      tap((data) => {
        this.seasonCache.set(seasonNumber, data);
        this.loading.set(false);
      }),
      catchError((error) => {
        console.error('Erro ao buscar temporada do TMDB:', error);
        this.loading.set(false);
        return of(null);
      })
    );
  }

  getEpisodeDetails(
    seasonNumber: number,
    episodeNumber: number
  ): Observable<TMDBEpisodeDetails | null> {
    return this.getSeasonDetails(seasonNumber).pipe(
      map((season) => {
        if (!season) return null;

        const episode = season.episodes.find(
          (ep) => ep.episode_number === episodeNumber
        );

        return episode || null;
      })
    );
  }

  parseEpisodeCode(episodeCode: string): {
    season: number;
    episode: number;
  } | null {
    const match = episodeCode.match(/S(\d+)E(\d+)/i);

    if (!match) return null;

    return {
      season: parseInt(match[1], 10),
      episode: parseInt(match[2], 10),
    };
  }

  getRatingColor(rating: number): string {
    if (rating >= 8) return '#97ce4c';
    if (rating >= 6) return '#f0e14a';
    return '#ef4444';
  }

  getRatingLabel(rating: number): string {
    if (rating >= 9) return 'Masterpiece';
    if (rating >= 8) return 'Excellent';
    if (rating >= 7) return 'Great';
    if (rating >= 6) return 'Good';
    if (rating >= 5) return 'Average';
    return 'Poor';
  }

  clearCache(): void {
    this.seasonCache.clear();
  }
}
