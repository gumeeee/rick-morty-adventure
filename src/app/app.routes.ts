import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, loginGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/landing/landing.component').then(
        (m) => m.LandingComponent
      ),
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: '',
        redirectTo: 'characters',
        pathMatch: 'full',
      },
      {
        path: 'characters',
        loadComponent: () =>
          import('./features/characters/characters.component').then(
            (m) => m.CharactersComponent
          ),
      },
      {
        path: 'characters/:id',
        loadComponent: () =>
          import(
            './features/characters/character-details/character-details.component'
          ).then((m) => m.CharacterDetailsComponent),
      },
      {
        path: 'locations',
        loadComponent: () =>
          import('./features/locations/locations.component').then(
            (m) => m.LocationsComponent
          ),
      },
      {
        path: 'locations/:id',
        loadComponent: () =>
          import(
            './features/locations/location-details/location-details.component'
          ).then((m) => m.LocationDetailsComponent),
      },
      {
        path: 'episodes',
        loadComponent: () =>
          import('./features/episodes/episodes.component').then(
            (m) => m.EpisodesComponent
          ),
      },
      {
        path: 'episodes/:id',
        loadComponent: () =>
          import(
            './features/episodes/episode-details/episode-details.component'
          ).then((m) => m.EpisodeDetailsComponent),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./features/auth/profile/profile.component').then(
            (m) => m.ProfileComponent
          ),
      },
    ],
  },
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '404',
    loadComponent: () =>
      import('./features/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
  {
    path: '**',
    redirectTo: '404',
  },
];
