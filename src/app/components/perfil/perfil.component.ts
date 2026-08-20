import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './perfil.component.html',
  styleUrls: ['./perfil.component.scss']
})
export class PerfilComponent implements OnInit {
  profileForm!: FormGroup;
  darkMode = false;
  selectedLanguage = 'pt';
  selectedTimezone = 'America/Sao_Paulo';

  // Simulated user data
  userData = {
    name: 'Carlos Eduardo Silva',
    email: 'carlos.silva@exportai.com.br',
    role: 'Gerente de Exportação',
    company: 'Export AI Ltda',
    department: 'Operações',
    phone: '+55 11 99999-0000',
    mfaEnabled: true,
    lastLogin: '2024-01-15 14:30',
    accountCreated: '2023-06-01'
  };

  languages = [
    { value: 'pt', label: 'Português' },
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' }
  ];

  timezones = [
    { value: 'America/Sao_Paulo', label: 'Brasília (GMT-3)' },
    { value: 'America/New_York', label: 'Nova York (GMT-5)' },
    { value: 'Europe/London', label: 'Londres (GMT+0)' },
    { value: 'Europe/Berlin', label: 'Berlim (GMT+1)' },
    { value: 'Asia/Tokyo', label: 'Tóquio (GMT+9)' }
  ];

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.profileForm = this.fb.group({
      name: [this.userData.name],
      email: [{ value: this.userData.email, disabled: true }],
      role: [{ value: this.userData.role, disabled: true }],
      company: [this.userData.company],
      department: [this.userData.department],
      phone: [this.userData.phone]
    });

    // Load dark mode from localStorage
    const savedDarkMode = localStorage.getItem('eip-dark-mode');
    this.darkMode = savedDarkMode === 'true';
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
    }
  }

  toggleDarkMode(): void {
    this.darkMode = !this.darkMode;
    if (this.darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('eip-dark-mode', 'true');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('eip-dark-mode', 'false');
    }
  }

  changePassword(): void {
    this.snackBar.open('Email de alteração enviado', 'OK', {
      duration: 3000,
      panelClass: ['info-snackbar']
    });
  }

  saveProfile(): void {
    const formValues = this.profileForm.getRawValue();
    this.snackBar.open('Perfil atualizado com sucesso!', 'OK', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }
}
