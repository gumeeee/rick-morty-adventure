import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface Stat {
  value: number;
  label: string;
  current: number;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.scss',
})
export class LandingComponent implements OnInit {
  isLoggedIn = signal<boolean>(false);
  userName = signal<string>('');
  userRole = signal<string>('');

  features: Feature[] = [
    {
      icon: 'bi-people-fill',
      title: 'Explore os Personagens',
      description:
        'Descubra mais de 800 personagens de todo o multiverso. Filtre por status, espécie e muito mais!',
      color: '#97ce4c',
    },
    {
      icon: 'bi-globe-americas',
      title: 'Visitar Locais',
      description:
        'Viaje através de dimensões e explore planetas exóticos, estações espaciais e reinos de fantasia.',
      color: '#11b0c8',
    },
    {
      icon: 'bi-film',
      title: 'Conheça os Episódios',
      description:
        'Reviva as aventuras! Navegue por todos os episódios com detalhes sobre as aparições dos personagens.',
      color: '#f0e14a',
    },
  ];

  stats: Stat[] = [
    { value: 826, label: 'Characters', current: 0 },
    { value: 126, label: 'Locations', current: 0 },
    { value: 51, label: 'Episodes', current: 0 },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    const isAuth = this.authService.isAuthenticated();
    this.isLoggedIn.set(isAuth);

    if (isAuth) {
      const user = this.authService.currentUser();
      if (user) {
        this.userName.set(user.name);
        this.userRole.set(user.role);
      }
    }

    this.animateCounters();
  }

  animateCounters(): void {
    this.stats.forEach((stat, index) => {
      setTimeout(() => {
        this.countUp(stat);
      }, index * 200);
    });
  }

  countUp(stat: Stat): void {
    const duration = 2000;
    const steps = 60;
    const increment = stat.value / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= stat.value) {
        stat.current = stat.value;
        clearInterval(timer);
      } else {
        stat.current = Math.floor(current);
      }
    }, duration / steps);
  }

  getStarted(): void {
    if (this.isLoggedIn()) {
      this.router.navigate(['/characters']);
    } else {
      this.router.navigate(['/login']);
    }
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  logout(): void {
    this.authService.logout();
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.userRole.set('');
  }

  scrollToFeatures(): void {
    document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
  }

  getRoleColor(): string {
    const colors: { [key: string]: string } = {
      Scientist: '#97ce4c',
      Agent: '#11b0c8',
      Student: '#f0e14a',
      Visitor: '#6b7280',
    };
    return colors[this.userRole()] || '#6b7280';
  }

  getRoleIcon(): string {
    const icons: { [key: string]: string } = {
      Scientist: 'bi-flask',
      Agent: 'bi-shield-fill-check',
      Student: 'bi-book-fill',
      Visitor: 'bi-eye-fill',
    };
    return icons[this.userRole()] || 'bi-person-fill';
  }
}
