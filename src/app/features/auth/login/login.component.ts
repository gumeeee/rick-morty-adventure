import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthService,
  AVAILABLE_ROLES,
  Role,
} from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  isLoginMode = signal<boolean>(true);
  loading = signal<boolean>(false);
  errorMessage = signal<string>('');
  successMessage = signal<string>('');

  availableRoles: Role[] = AVAILABLE_ROLES;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    if (this.authService.isAuthenticatedSync()) {
      this.router.navigate(['/characters']);
    }
  }

  private initForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['Visitor', [Validators.required]],
      avatar: [''],
    });
  }

  toggleMode(): void {
    this.isLoginMode.update((mode) => !mode);
    this.errorMessage.set('');
    this.successMessage.set('');
    this.loginForm.reset();
    this.registerForm.reset({ role: 'Visitor' });
  }

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    this.authService.login(this.loginForm.value).subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl =
          this.route.snapshot.queryParams['returnUrl'] || '/characters';
        this.router.navigate([returnUrl]);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.message || 'Erro ao fazer login. Tente novamente.'
        );
      },
    });
  }

  onRegister(): void {
    if (this.registerForm.invalid) {
      this.markFormGroupTouched(this.registerForm);
      return;
    }

    const password = this.registerForm.get('password')?.value;
    const confirmPassword = this.registerForm.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { confirmPassword: _, ...registerData } = this.registerForm.value;

    this.authService.register(registerData).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/characters']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.message || 'Erro ao criar conta. Tente novamente.'
        );
      },
    });
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  get loginEmail() {
    return this.loginForm.get('email');
  }
  get loginPassword() {
    return this.loginForm.get('password');
  }

  get registerName() {
    return this.registerForm.get('name');
  }
  get registerEmail() {
    return this.registerForm.get('email');
  }
  get registerPassword() {
    return this.registerForm.get('password');
  }
  get registerConfirmPassword() {
    return this.registerForm.get('confirmPassword');
  }
  get registerRole() {
    return this.registerForm.get('role');
  }
  get registerAvatar() {
    return this.registerForm.get('avatar');
  }

  getRoleColor(roleValue: string): string {
    return (
      this.availableRoles.find((r) => r.value === roleValue)?.color || '#6b7280'
    );
  }

  getRoleIcon(roleValue: string): string {
    return (
      this.availableRoles.find((r) => r.value === roleValue)?.icon ||
      'bi-info-circle'
    );
  }

  getRoleDescription(roleValue: string): string {
    return (
      this.availableRoles.find((r) => r.value === roleValue)?.description || ''
    );
  }

  getSelectedRole(): Role | undefined {
    const roleValue = this.registerRole?.value;
    return this.availableRoles.find((r) => r.value === roleValue);
  }
}
