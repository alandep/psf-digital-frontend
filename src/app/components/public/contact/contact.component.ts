import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

interface Channel {
  id: string;
  label: string;
  value: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule, RouterModule, ReactiveFormsModule,
    MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule,
    MatIconModule, MatSnackBarModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
})
export class ContactComponent {
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  subjects = ['Comercial', 'Suporte', 'Parcerias', 'Imprensa', 'Outros'];

  channels: Channel[] = [
    { id: 'comercial', label: 'Comercial', value: 'comercial@eip.exemplo' },
    { id: 'suporte', label: 'Suporte', value: 'Configurado institucionalmente' },
    { id: 'parcerias', label: 'Parcerias', value: 'parcerias@eip.exemplo' },
  ];

  form: FormGroup = this.fb.group({
    nome: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    empresa: [''],
    assunto: ['', Validators.required],
    mensagem: ['', Validators.required],
  });

  trackById(_: number, item: Channel): string { return item.id; }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.snackBar.open('Mensagem enviada. Nossa equipe entrará em contato (mock).', 'Fechar', { duration: 4000 });
    this.form.reset();
  }
}
