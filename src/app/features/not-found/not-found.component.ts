import { CommonModule } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  isLoggedIn = signal<boolean>(false);

  rickMessages = [
    'Wubba lubba dub dub! Essa página não existe, Morty!',
    '*ARROTO* Dimensão errada, parceiro!',
    'Ah, poxa... Rick, acho que tamos perdidos aqui!',
    'Essa página foi cronenbergizada, Morty!',
    '404 - Página não encontrada neste universo!',
    'Parece que pegamos o portal errado, Morty!',
  ];

  currentMessage = signal<string>('');

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.isLoggedIn.set(this.authService.isAuthenticated());

    const randomIndex = Math.floor(Math.random() * this.rickMessages.length);
    this.currentMessage.set(this.rickMessages[randomIndex]);
  }

  goHome(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/characters']);
    } else {
      this.router.navigate(['/']);
    }
  }

  goBack(): void {
    window.history.back();
  }
}
