import { Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ApiResponse, Character, Episode, Location } from '../models';

export interface CharacterFilters {
  page?: number;
  name?: string;
  status?: 'alive' | 'dead' | 'unknown';
  species?: string;
  type?: string;
  gender?: 'female' | 'male' | 'genderless' | 'unknown';
}

export interface LocationFilters {
  page?: number;
  name?: string;
  type?: string;
  dimension?: string;
}

export interface EpisodeFilters {
  page?: number;
  name?: string;
  episode?: string;
}

@Injectable({
  providedIn: 'root',
})
export class RickMortyApiService {
  private apiUrl = environment.apiUrl;

  loading = signal<boolean>(false);

  private searchTermSubject = new BehaviorSubject<string>('');
  searchTerm$ = this.searchTermSubject.asObservable();

  constructor(private http: HttpClient) {}

  private buildParams(filters: any): HttpParams {
    let params = new HttpParams();

    Object.keys(filters).forEach((key) => {
      if (
        filters[key] !== undefined &&
        filters[key] !== null &&
        filters[key] !== ''
      ) {
        params = params.set(key, filters[key].toString());
      }
    });

    return params;
  }

  setSearchTerm(term: string): void {
    this.searchTermSubject.next(term);
  }

  getSearchTerm(): string {
    return this.searchTermSubject.value;
  }

  getCharacters(
    filters: CharacterFilters = {}
  ): Observable<ApiResponse<Character>> {
    const params = this.buildParams({ page: 1, ...filters });

    this.loading.set(true);
    return this.http
      .get<ApiResponse<Character>>(`${this.apiUrl}/character`, {
        params,
      })
      .pipe(tap(() => this.loading.set(false)));
  }

  getCharacterById(id: number): Observable<Character> {
    this.loading.set(true);
    return this.http
      .get<Character>(`${this.apiUrl}/character/${id}`)
      .pipe(tap(() => this.loading.set(false)));
  }

  getLocations(
    filters: LocationFilters = {}
  ): Observable<ApiResponse<Location>> {
    const params = this.buildParams({ page: 1, ...filters });

    this.loading.set(true);
    return this.http
      .get<ApiResponse<Location>>(`${this.apiUrl}/location`, { params })
      .pipe(tap(() => this.loading.set(false)));
  }

  getLocationById(id: number): Observable<Location> {
    this.loading.set(true);
    return this.http
      .get<Location>(`${this.apiUrl}/location/${id}`)
      .pipe(tap(() => this.loading.set(false)));
  }

  getEpisodes(filters: EpisodeFilters = {}): Observable<ApiResponse<Episode>> {
    const params = this.buildParams({ page: 1, ...filters });

    this.loading.set(true);
    return this.http
      .get<ApiResponse<Episode>>(`${this.apiUrl}/episode`, { params })
      .pipe(tap(() => this.loading.set(false)));
  }

  getEpisodeById(id: number): Observable<Episode> {
    this.loading.set(true);
    return this.http
      .get<Episode>(`${this.apiUrl}/episode/${id}`)
      .pipe(tap(() => this.loading.set(false)));
  }
}
