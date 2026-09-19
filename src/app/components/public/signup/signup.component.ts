import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { SignupMockService } from '../../../../services/signupMockService';

interface GoalOption {
  key: string;
  label: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
})
export class SignupComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private signupService = inject(SignupMockService);
  private snackBar = inject(MatSnackBar);

  step = 1;
  readonly totalSteps = 4;

  accountForm!: FormGroup;
  companyForm!: FormGroup;

  hidePassword = true;

  // CNPJ verification state (§48).
  cnpjChecking = false;
  cnpjTaken = false;

  // Trial creation state.
  submitting = false;

  // Stable array of selected goal keys (never rebuilt via getter in *ngFor).
  selectedGoals: string[] = [];

  readonly segmentos = ['Agro', 'Alimentos', 'Indústria', 'Trading', 'Logística', 'Outros'];

  readonly goalOptions: GoalOption[] = [
    { key: 'exportacoes', label: 'Gestão das exportações' },
    { key: 'documentos', label: 'Documentos' },
    { key: 'logistica', label: 'Logística' },
    { key: 'compliance', label: 'Compliance' },
    { key: 'financeiro', label: 'Financeiro' },
    { key: 'ia', label: 'IA' },
    { key: 'integracoes', label: 'Integrações' },
  ];

  ngOnInit(): void {
    this.accountForm = this.fb.group({
      name: ['', Validators.required],
      cpf: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.companyForm = this.fb.group({
      cnpj: ['', Validators.required],
      razaoSocial: ['', Validators.required],
      nomeFantasia: [''],
      segmento: [''],
    });
  }

  trackGoal(_index: number, opt: GoalOption): string {
    return opt.key;
  }

  isGoalSelected(key: string): boolean {
    return this.selectedGoals.includes(key);
  }

  toggleGoal(key: string, checked: boolean): void {
    if (checked) {
      if (!this.selectedGoals.includes(key)) {
        this.selectedGoals = [...this.selectedGoals, key];
      }
    } else {
      this.selectedGoals = this.selectedGoals.filter((g) => g !== key);
    }
  }

  goalLabels(): string {
    if (!this.selectedGoals.length) {
      return 'Nenhum objetivo selecionado';
    }
    return this.goalOptions
      .filter((o) => this.selectedGoals.includes(o.key))
      .map((o) => o.label)
      .join(', ');
  }

  // Step 1 -> Step 2
  nextFromAccount(): void {
    if (this.accountForm.invalid) {
      this.accountForm.markAllAsTouched();
      return;
    }
    this.step = 2;
  }

  // Step 2: verify CNPJ then advance if available.
  verifyAndContinue(): void {
    if (this.companyForm.invalid) {
      this.companyForm.markAllAsTouched();
      return;
    }
    const cnpj = this.companyForm.value.cnpj as string;
    this.cnpjChecking = true;
    this.cnpjTaken = false;
    this.signupService.checkCnpj(cnpj).subscribe((res) => {
      this.cnpjChecking = false;
      if (res.available) {
        this.cnpjTaken = false;
        this.step = 3;
      } else {
        this.cnpjTaken = true;
      }
    });
  }

  requestAccess(): void {
    this.snackBar.open(
      'Solicitação de acesso enviada ao administrador (mock)',
      'Fechar',
      { duration: 4000 }
    );
  }

  // Step 3 -> Step 4
  nextFromGoals(): void {
    this.step = 4;
  }

  back(): void {
    if (this.step > 1) {
      this.step -= 1;
    }
  }

  finish(): void {
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    this.signupService
      .startTrial(
        this.accountForm.value,
        this.companyForm.value,
        this.selectedGoals
      )
      .subscribe(() => {
        this.submitting = false;
        this.router.navigate(['/trial']);
      });
  }
}
