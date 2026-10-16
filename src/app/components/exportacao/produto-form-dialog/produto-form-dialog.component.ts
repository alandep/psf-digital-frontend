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

import { PRODUTO_SERVICE } from '../../../services/produto/produto-service.token';
import { IProdutoService } from '../../../services/produto/produto-service.interface';
import { Produto, NovoProduto } from '../../../../types/produto';

/**
 * Diálogo de cadastro rápido de um novo produto do catálogo. Ao salvar com
 * sucesso, fecha retornando o Produto criado para que o host (formulário de
 * exportação) possa selecioná-lo automaticamente no item correspondente.
 */
@Component({
  selector: 'app-produto-form-dialog',
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
    MatSnackBarModule
  ],
  templateUrl: './produto-form-dialog.component.html',
  styleUrls: ['./produto-form-dialog.component.scss']
})
export class ProdutoFormDialogComponent {
  /** Formulário do novo produto. */
  form: FormGroup;
  /** Indica que a criação está em andamento. */
  saving = false;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<ProdutoFormDialogComponent, Produto | undefined>,
    @Inject(PRODUTO_SERVICE) private produtoService: IProdutoService,
    private snackBar: MatSnackBar
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      ncm: [''],
      description: [''],
      unit: ['MT'],
      standardPrice: [0],
      currency: ['USD'],
      originCountry: ['Brasil']
    });
  }

  /** Valida e cria o produto; fecha o diálogo com o registro criado. */
  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving = true;
    const payload = this.form.getRawValue() as NovoProduto;

    this.produtoService.criar(payload).subscribe({
      next: (created: Produto) => {
        this.saving = false;
        this.snackBar.open('Produto cadastrado com sucesso', 'Fechar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });
        this.dialogRef.close(created);
      },
      error: (error: unknown) => {
        console.error('Erro ao cadastrar produto:', error);
        this.saving = false;
        this.snackBar.open('Erro ao cadastrar produto', 'Fechar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /** Fecha o diálogo sem criar nenhum produto. */
  cancelar(): void {
    this.dialogRef.close();
  }
}
