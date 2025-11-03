import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
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
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: '**',
    redirectTo: 'characters',
  },
];
