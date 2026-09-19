import { Component, Inject, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';

import { ProductCatalogMockService } from '../../../../../services/productCatalogMockService';
import {
  ProductValidationDialogComponent,
  ProductValidationDialogData
} from '../product-validation-dialog/product-validation-dialog.component';
import { Product } from '../../../../../types/productCatalog';

export interface ProductFormDialogData {
  product: Product | null;
  isViewMode: boolean;
}

@Component({
  selector: 'app-product-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatTooltipModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule
  ],
  templateUrl: './product-form-dialog.component.html',
  styleUrls: ['./product-form-dialog.component.scss']
})
export class ProductFormDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly productService = inject(ProductCatalogMockService);
  public readonly dialogRef = inject(MatDialogRef<ProductFormDialogComponent>);

  public readonly editingProduct: Product | null;
  public readonly isViewMode: boolean;
  public selectedTabIndex = 0;
  public isSaving = false;
  public productForm: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductFormDialogData) {
    this.editingProduct = data.product;
    this.isViewMode = data.isViewMode;

    this.productForm = this.fb.group({
      // ABA 1: GERAL
      product_code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      short_name: [''],
      scientific_name: [''],
      description: [''],
      commodity_type: ['GRAO', [Validators.required]],
      origin_country: ['Brasil', [Validators.required]],
      active: [true],

      // ABA 2: FISCAL
      ncm_code: ['', [Validators.required, Validators.pattern(/^\d{4}\.\d{2}\.\d{2}$/)]],
      ncm_description: [''],
      hs_code: ['', [Validators.required]],
      export_tax: [0, [Validators.min(0), Validators.max(100)]],
      cfop: [''],
      cest: [''],
      requires_export_license: [false],
      export_license_type: [''],

      // ABA 3: LOGÍSTICA
      unit: ['MT', [Validators.required]],
      net_weight: [0, [Validators.min(0)]],
      gross_weight: [0, [Validators.min(0)]],
      volume: [0, [Validators.min(0)]],
      package_type: ['BULK'],
      storage_type: ['DRY'],
      density: [{ value: 0, disabled: true }],
      tare_percentage: [0, [Validators.min(0), Validators.max(100)]],
      stowage_factor: [0, [Validators.min(0)]],

      // ABA 4: COMERCIAL
      standard_price: [0, [Validators.min(0)]],
      currency: ['USD'],
      price_unit: ['USD_MT'],
      min_order_quantity: [0, [Validators.min(0)]],
      max_order_quantity: [0, [Validators.min(0)]],
      futures_exchange: [''],
      current_futures_price: [{ value: 0, disabled: true }],
      price_last_update: [{ value: '', disabled: true }],

      // ABA 5: QUALIDADE
      moisture_content: [0, [Validators.min(0), Validators.max(100)]],
      protein_content: [0, [Validators.min(0), Validators.max(100)]],
      oil_content: [0, [Validators.min(0), Validators.max(100)]],
      foreign_matter: [0, [Validators.min(0), Validators.max(100)]],
      broken_grains: [0, [Validators.min(0), Validators.max(100)]],
      inspection_standard: [''],
      quality_certification: [''],
      analysis_expiry_date: [''],

      // ABA 6: INTELIGÊNCIA ARTIFICIAL
      ai_auto_update: [false],
      ai_auto_classify: [false],
      ai_price_prediction: [false],
      ai_confidence_level: ['MEDIUM']
    });
  }

  ngOnInit(): void {
    if (this.editingProduct) {
      this.populateForm(this.editingProduct);
    }
    if (this.isViewMode) {
      this.productForm.disable();
    }
  }

  public get headerTitle(): string {
    if (!this.editingProduct) {
      return 'Novo Produto';
    }
    return this.isViewMode ? 'Visualizar Produto' : 'Editar Produto';
  }

  /**
   * Popula o formulário com os dados de um produto existente.
   * Mapeia campos aninhados (quality_specs, ai_config) para os controles planos.
   */
  private populateForm(product: Product): void {
    const quality = product.quality_specs ?? {};
    const ai = product.ai_config ?? ({} as Product['ai_config']);

    this.productForm.reset();
    this.productForm.patchValue({
      // GERAL
      product_code: product.product_code ?? '',
      name: product.name ?? '',
      short_name: product.short_name ?? '',
      scientific_name: product.scientific_name ?? '',
      description: product.description ?? '',
      commodity_type: product.commodity_type ?? 'GRAO',
      origin_country: product.origin_country ?? 'Brasil',
      active: product.active ?? true,

      // FISCAL
      ncm_code: product.ncm_code ?? '',
      ncm_description: product.ncm_description ?? '',
      hs_code: product.hs_code ?? '',
      export_tax: product.export_tax ?? 0,
      cfop: product.cfop ?? '',
      cest: product.cest ?? '',
      requires_export_license: product.requires_export_license ?? false,
      export_license_type: product.export_license_type ?? '',

      // LOGÍSTICA
      unit: product.unit ?? 'MT',
      net_weight: product.net_weight ?? 0,
      gross_weight: product.gross_weight ?? 0,
      volume: product.volume_m3 ?? 0,
      package_type: product.package_type ?? 'BULK',
      storage_type: product.storage_type ?? 'DRY',
      tare_percentage: 0,
      stowage_factor: 0,

      // COMERCIAL
      standard_price: product.standard_price ?? 0,
      currency: product.currency ?? 'USD',
      price_unit: product.price_unit ?? 'USD_MT',
      min_order_quantity: product.minimum_quantity ?? 0,
      max_order_quantity: product.maximum_quantity ?? 0,
      futures_exchange: product.futures_exchange ?? '',

      // QUALIDADE
      moisture_content: quality.moisture_max ?? 0,
      protein_content: quality.protein_min ?? 0,
      oil_content: quality.oil_content_min ?? 0,
      foreign_matter: quality.foreign_material_max ?? 0,
      broken_grains: quality.broken_kernels_max ?? 0,
      inspection_standard: quality.inspection_standard ?? '',
      quality_certification: '',
      analysis_expiry_date: '',

      // IA
      ai_auto_update: ai.ai_auto_update_enabled ?? false,
      ai_auto_classify: ai.ai_auto_classify ?? false,
      ai_price_prediction: ai.ai_price_prediction ?? false,
      ai_confidence_level: ai.ai_confidence_level ?? 'MEDIUM'
    });
  }

  public close(): void {
    this.dialogRef.close();
  }

  public saveProduct(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    // getRawValue inclui os controles desabilitados (density, futuros, etc.)
    const formData = this.productForm.getRawValue();

    // Calcular densidade automaticamente
    if (formData.net_weight && formData.volume) {
      formData.density = formData.net_weight / formData.volume;
    }

    // O componente pai persiste (create/update) e recarrega a lista.
    this.dialogRef.close(formData);
  }

  public saveAsDraft(): void {
    this.snackBar.open('Rascunho salvo com sucesso!', 'Fechar', { duration: 2000 });
  }

  // MÉTODOS DA INTELIGÊNCIA ARTIFICIAL
  public enrichProductWithAI(): void {
    this.snackBar.open('Enriquecimento com IA iniciado. Aguarde...', 'Fechar', { duration: 3000 });

    setTimeout(() => {
      const currentData = this.productForm.value;

      if (currentData.commodity_type === 'GRAO' && currentData.name?.toLowerCase().includes('soja')) {
        this.productForm.patchValue({
          scientific_name: 'Glycine max',
          ncm_code: '1201.90.00',
          ncm_description: 'Soja, mesmo triturada, exceto para semeadura',
          hs_code: '1201',
          protein_content: 38.5,
          oil_content: 18.2,
          moisture_content: 14.0,
          inspection_standard: 'SGS',
          package_type: 'BULK',
          storage_type: 'DRY'
        });
      }

      this.snackBar.open('Produto enriquecido com IA!', 'Fechar', { duration: 3000 });
    }, 2000);
  }

  /**
   * Botão "Validar NCM" do cabeçalho do formulário.
   * Se estiver editando um produto, valida-o via serviço; caso contrário usa a validação por IA.
   */
  public validateCurrentProduct(): void {
    if (this.editingProduct) {
      this.validateProduct(this.editingProduct);
    } else {
      this.validateWithAI();
    }
  }

  private validateProduct(product: Product): void {
    this.productService.validateProduct(product).subscribe({
      next: (result) => {
        const data: ProductValidationDialogData = {
          productName: product.name,
          isValid: result.isValid,
          errors: (result.errors ?? []).map(e => ({
            field: e.field,
            message: e.message,
            severity: e.severity
          })),
          warnings: (result.warnings ?? []).map(w => ({
            field: w.field,
            message: w.message,
            suggestion: w.suggestion
          }))
        };

        this.dialog.open(ProductValidationDialogComponent, {
          width: '560px',
          maxWidth: '92vw',
          autoFocus: false,
          panelClass: 'product-validation-dialog-panel',
          data
        });
      },
      error: () => {
        this.snackBar.open('Erro ao validar produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public predictPrices(): void {
    this.snackBar.open('Análise de predição de preços iniciada...', 'Fechar', { duration: 3000 });

    setTimeout(() => {
      const predictedPrice = Math.random() * 100 + 400;
      this.productForm.patchValue({
        standard_price: predictedPrice.toFixed(2),
        current_futures_price: (predictedPrice * 1.05).toFixed(2),
        price_last_update: new Date().toISOString().split('T')[0]
      });

      this.snackBar.open(`Preço predito: $${predictedPrice.toFixed(2)}/MT`, 'Fechar', { duration: 4000 });
    }, 1500);
  }

  public validateWithAI(): void {
    this.snackBar.open('Validação com IA em andamento...', 'Fechar', { duration: 3000 });

    setTimeout(() => {
      const validationScore = Math.random() * 30 + 70;
      let message = '';

      if (validationScore >= 90) {
        message = `Produto validado! Score: ${validationScore.toFixed(1)}% - Excelente`;
      } else if (validationScore >= 80) {
        message = `Produto validado com ressalvas. Score: ${validationScore.toFixed(1)}% - Bom`;
      } else {
        message = `Produto precisa de ajustes. Score: ${validationScore.toFixed(1)}% - Regular`;
      }

      this.snackBar.open(message, 'Fechar', { duration: 5000 });
    }, 1500);
  }

  public optimizeProduct(): void {
    this.snackBar.open('Otimização de produto iniciada...', 'Fechar', { duration: 3000 });

    setTimeout(() => {
      const currentData = this.productForm.value;

      if (currentData.net_weight && currentData.gross_weight && !currentData.tare_percentage) {
        const tare = ((currentData.gross_weight - currentData.net_weight) / currentData.gross_weight * 100);
        this.productForm.patchValue({ tare_percentage: tare.toFixed(2) });
      }

      if (currentData.net_weight && currentData.volume) {
        const density = currentData.net_weight / currentData.volume;
        this.productForm.patchValue({ density: density.toFixed(2) });
      }

      this.snackBar.open('Produto otimizado! Cálculos automáticos aplicados.', 'Fechar', { duration: 4000 });
    }, 1500);
  }
}
