import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Role {
  value: string;
  label: string;
  description: string;
  icon: string;
  color: string;
}

export const AVAILABLE_ROLES: Role[] = [
  {
    value: 'Scientist',
    label: 'Scientist',
    description: 'Acesso completo a todas as funcionalidades',
    icon: 'bi-lightning-charge-fill',
    color: '#97ce4c',
  },
  {
    value: 'Agent',
    label: 'Agent',
    description: 'Acesso a personagens, localizações e episódios',
    icon: 'bi-shield-fill-check',
    color: '#11b0c8',
  },
  {
    value: 'Student',
    label: 'Student',
    description: 'Acesso a personagens e episódios',
    icon: 'bi-book-fill',
    color: '#f0e14a',
  },
  {
    value: 'Visitor',
    label: 'Visitor',
    description: 'Acesso apenas a personagens',
    icon: 'bi-eye-fill',
    color: '#6b7280',
  },
];

export interface User {
  id: number;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  name: string;
  email: string;
  password: string;
  avatar?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user';
  private readonly USERS_DB_KEY = 'users_database';

  isAuthenticated = signal<boolean>(false);
  currentUser = signal<User | null>(null);

  private authStatusSubject = new BehaviorSubject<boolean>(this.hasToken());
  authStatus$ = this.authStatusSubject.asObservable();

  constructor(private router: Router) {
    this.checkAuthStatus();
    this.initializeUsersDatabase();
  }

  private initializeUsersDatabase(): void {
    const users = this.getUsersDatabase();
    if (users.length === 0) {
      const defaultUser: User & { password: string } = {
        id: 1,
        name: 'Rick Sanchez',
        email: 'rick@citadel.com',
        password: 'portal123',
        avatar: 'https://rickandmortyapi.com/api/character/avatar/1.jpeg',
        role: 'Scientist',
      };
      this.saveToDatabase([defaultUser]);
    }
  }

  private checkAuthStatus(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user) {
      this.isAuthenticated.set(true);
      this.currentUser.set(user);
      this.authStatusSubject.next(true);
    }
  }

  register(credentials: RegisterCredentials): Observable<boolean> {
    return new Observable((observer) => {
      setTimeout(() => {
        const users = this.getUsersDatabase();

        const emailExists = users.some(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (emailExists) {
          observer.error({
            message:
              'Este email já está cadastrado. Faça login ou use outro email.',
          });
          return;
        }

        if (!credentials.name || credentials.name.trim().length < 3) {
          observer.error({ message: 'Nome deve ter pelo menos 3 caracteres.' });
          return;
        }

        if (!credentials.email || !this.isValidEmail(credentials.email)) {
          observer.error({ message: 'Email inválido.' });
          return;
        }

        if (!credentials.password || credentials.password.length < 6) {
          observer.error({
            message: 'Senha deve ter pelo menos 6 caracteres.',
          });
          return;
        }

        const newUser: User & { password: string } = {
          id: users.length + 1,
          name: credentials.name.trim(),
          email: credentials.email.toLowerCase().trim(),
          password: credentials.password,
          avatar:
            credentials.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(
              credentials.name
            )}&background=97ce4c&color=fff&size=200`,
          role: credentials.role || 'User',
        };

        users.push(newUser);
        this.saveToDatabase(users);

        const { password, ...userWithoutPassword } = newUser;
        this.performLogin(userWithoutPassword, credentials.email);

        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  login(credentials: LoginCredentials): Observable<boolean> {
    return new Observable((observer) => {
      setTimeout(() => {
        const users = this.getUsersDatabase();

        const user = users.find(
          (u) => u.email.toLowerCase() === credentials.email.toLowerCase()
        );

        if (!user) {
          observer.error({
            message: 'Email não encontrado. Verifique ou crie uma conta.',
          });
          return;
        }

        if (user.password !== credentials.password) {
          observer.error({ message: 'Senha incorreta.' });
          return;
        }

        const { password, ...userWithoutPassword } = user;

        this.performLogin(userWithoutPassword, credentials.email);

        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  private performLogin(user: User, email: string): void {
    const fakeToken = this.generateFakeJWT(email);

    localStorage.setItem(this.TOKEN_KEY, fakeToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));

    this.isAuthenticated.set(true);
    this.currentUser.set(user);
    this.authStatusSubject.next(true);
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);

    this.isAuthenticated.set(false);
    this.currentUser.set(null);
    this.authStatusSubject.next(false);

    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  getAvailableRoles(): Role[] {
    return AVAILABLE_ROLES;
  }

  hasToken(): boolean {
    return !!this.getToken();
  }

  private getStoredUser(): User | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  updateUser(updatedUser: Partial<User>): Observable<boolean> {
    return new Observable((observer) => {
      setTimeout(() => {
        const currentUser = this.currentUser();

        if (!currentUser) {
          observer.error({ message: 'Usuário não autenticado.' });
          return;
        }

        const newUser: User = {
          ...currentUser,
          ...updatedUser,
          id: currentUser.id,
          email: currentUser.email,
        };

        const users = this.getUsersDatabase();
        const userIndex = users.findIndex((u) => u.id === currentUser.id);

        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...newUser };
          this.saveToDatabase(users);
        }

        localStorage.setItem(this.USER_KEY, JSON.stringify(newUser));
        this.currentUser.set(newUser);

        observer.next(true);
        observer.complete();
      }, 800);
    });
  }

  private getUsersDatabase(): (User & { password: string })[] {
    const usersStr = localStorage.getItem(this.USERS_DB_KEY);
    if (usersStr) {
      try {
        return JSON.parse(usersStr);
      } catch {
        return [];
      }
    }
    return [];
  }

  private saveToDatabase(users: (User & { password: string })[]): void {
    localStorage.setItem(this.USERS_DB_KEY, JSON.stringify(users));
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private generateFakeJWT(email: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(
      JSON.stringify({
        email: email,
        exp: Date.now() + 86400000,
        iat: Date.now(),
      })
    );
    const signature = btoa('fake-signature-' + email);

    return `${header}.${payload}.${signature}`;
  }

  isAuthenticatedSync(): boolean {
    return this.hasToken();
  }

  hasAccessTo(page: string): boolean {
    const user = this.currentUser();
    if (!user) return false;

    const rolePermissions: { [key: string]: string[] } = {
      Scientist: ['characters', 'locations', 'episodes', 'profile'],
      Agent: ['characters', 'locations', 'episodes', 'profile'],
      Student: ['characters', 'episodes', 'profile'],
      Visitor: ['characters', 'profile'],
    };

    return rolePermissions[user.role]?.includes(page) || false;
  }
}
