import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  OnDestroy,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.scss',
})
export class SearchBarComponent implements OnInit, OnDestroy {
  searchChange = output<string>();

  manualMode = input<boolean>(false);

  searchTerm = signal<string>('');
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (!this.manualMode()) {
      this.searchSubject
        .pipe(
          debounceTime(400),
          distinctUntilChanged(),
          takeUntil(this.destroy$)
        )
        .subscribe((term) => {
          this.searchChange.emit(term);
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);

    if (!this.manualMode()) {
      this.searchSubject.next(value);
    }
  }

  onSearchChange(term: string): void {
    this.searchTerm.set(term);
    this.searchSubject.next(term);
  }

  onSearchSubmit(): void {
    if (this.manualMode()) {
      this.searchChange.emit(this.searchTerm());
    }
  }
  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.manualMode()) {
      this.onSearchSubmit();
    }
  }

  clearSearch(): void {
    this.searchTerm.set('');

    if (this.manualMode()) {
      this.searchChange.emit('');
    } else {
      this.searchSubject.next('');
    }
  }
}
