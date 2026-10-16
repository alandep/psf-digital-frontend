import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';

import { IMPORTADOR_SERVICE } from '../../../services/importador/importador-service.token';
import { IImportadorService } from '../../../services/importador/importador-service.interface';
import { Importador, NovoImportador } from '../../../../types/importador';
import { PaisComboComponent } from '../../shared/pais-combo/pais-combo.component';

/**
 * Diálogo de cadastro rápido de um novo importador. Ao salvar com sucesso,
 * fecha retornando o Importador criado para que o host (formulário de
 * exportação) possa selecioná-lo automaticamente.
 */
@Component({
  selector: 'app-importador-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    PaisComboComponent
  ],
  templateUrl: './importador-form-dialog.component.html',
  styleUrls: ['./importador-form-dialog.component.scss']
})
export class ImportadorFormDialogComponent {
  /** Formulário do novo importador. */
  form: FormGroup;
  /** Indica que a criação está em andamento. */
  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ImportadorFormDialogComponent, Importador | undefined>,
    @Inject(IMPORTADOR_SERVICE) private importadorService: IImportadorService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      document: [''],
      country: [''],
      address: [''],
      contact: ['']
    });
  }

  /** Valida e cria o importador; fecha o diálogo com o registro criado. */
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.form.getRawValue() as NovoImportador;

    this.importadorService.criar(payload).subscribe({
      next: (created: Importador) => {
        this.saving = false;
        this.snackBar.open('Importador cadastrado com sucesso', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(created);
      },
      error: (error: unknown) => {
        console.error('Erro ao cadastrar importador:', error);
        this.saving = false;
        this.snackBar.open('Erro ao cadastrar importador', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /** Fecha o diálogo sem criar nenhum importador. */
  cancelar(): void {
    this.dialogRef.close();
  }
}
