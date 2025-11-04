import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  AuthService,
  AVAILABLE_ROLES,
  Role,
  User,
} from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser!: WritableSignal<User | null>;
  loading = signal<boolean>(false);
  successMessage = signal<string>('');
  errorMessage = signal<string>('');
  isEditing = signal<boolean>(false);

  availableRoles: Role[] = AVAILABLE_ROLES;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.currentUser = this.authService.currentUser;
  }

  ngOnInit(): void {
    this.initForm();
  }

  private initForm(): void {
    const user = this.currentUser();

    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    this.profileForm = this.fb.group({
      name: [user.name, [Validators.required, Validators.minLength(3)]],
      email: [{ value: user.email, disabled: true }],
      avatar: [user.avatar, [Validators.pattern(/^https?:\/\/.+/)]],
      role: [user.role, [Validators.required]],
    });
  }

  toggleEdit(): void {
    if (this.isEditing()) {
      this.initForm();
      this.isEditing.set(false);
      this.errorMessage.set('');
      this.successMessage.set('');
    } else {
      this.isEditing.set(true);
      this.errorMessage.set('');
      this.successMessage.set('');
    }
  }

  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.markFormGroupTouched(this.profileForm);
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const updatedData = {
      name: this.profileForm.get('name')?.value,
      avatar:
        this.profileForm.get('avatar')?.value || this.generateDefaultAvatar(),
      role: this.profileForm.get('role')?.value,
    };

    this.authService.updateUser(updatedData).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Perfil atualizado com sucesso!');
        this.isEditing.set(false);

        setTimeout(() => {
          this.successMessage.set('');
        }, 3000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(
          err.message || 'Erro ao atualizar perfil. Tente novamente.'
        );
      },
    });
  }

  private generateDefaultAvatar(): string {
    const name = this.profileForm.get('name')?.value || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(
      name
    )}&background=97ce4c&color=fff&size=200`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach((key) => {
      formGroup.get(key)?.markAsTouched();
    });
  }

  goBack(): void {
    this.router.navigate(['/characters']);
  }

  get name() {
    return this.profileForm.get('name');
  }

  get avatar() {
    return this.profileForm.get('avatar');
  }

  get role() {
    return this.profileForm.get('role');
  }

  getRoleInfo(roleValue: string): Role | undefined {
    return this.availableRoles.find((r) => r.value === roleValue);
  }

  getPreviewAvatar(): string {
    const avatarUrl = this.profileForm.get('avatar')?.value;
    if (avatarUrl && avatarUrl.trim()) {
      return avatarUrl;
    }
    return this.generateDefaultAvatar();
  }
}
