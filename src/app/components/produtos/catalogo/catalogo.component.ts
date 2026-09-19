import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import { ProductCatalogMockService } from '../../../../services/productCatalogMockService';
import { ImportCsvDialogComponent } from './import-csv-dialog/import-csv-dialog.component';
import { AiCreateDialogComponent } from './ai-create-dialog/ai-create-dialog.component';
import {
  ProductValidationDialogComponent,
  ProductValidationDialogData
} from './product-validation-dialog/product-validation-dialog.component';
import { ProductFormDialogComponent } from './product-form-dialog/product-form-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import { 
  Product, 
  ProductFilters, 
  ProductFilterOptions,
  COMMODITY_TYPE_LABELS,
  UNIT_LABELS,
  CURRENCY_LABELS,
  PACKAGE_TYPE_LABELS,
  STORAGE_TYPE_LABELS,
  PRICE_UNIT_LABELS,
  PRODUCT_STATUS_LABELS,
  FUTURES_EXCHANGE_LABELS,
  INSPECTION_STANDARD_LABELS
} from '../../../../types/productCatalog';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-catalogo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatTabsModule,
    MatSlideToggleModule,
    MatChipsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,
    HasPermissionDirective,
    MatTooltipModule,
    MatDividerModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './catalogo.component.html',
  styleUrls: ['./catalogo.component.scss']
})
export class CatalogoComponent implements OnInit {
  private readonly productService = inject(ProductCatalogMockService);
  private readonly fb = inject(FormBuilder);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  // Constantes para labels
  public readonly PACKAGE_TYPE_LABELS = PACKAGE_TYPE_LABELS;
  public readonly STORAGE_TYPE_LABELS = STORAGE_TYPE_LABELS;
  public readonly FUTURES_EXCHANGE_LABELS = FUTURES_EXCHANGE_LABELS;
  public readonly INSPECTION_STANDARD_LABELS = INSPECTION_STANDARD_LABELS;

  public products: Product[] = [];
  public filterOptions: ProductFilterOptions | null = null;
  public isLoading = false;
  
  // KPIs
  public totalProducts = 0;
  public activeProducts = 0;
  public aiGeneratedProducts = 0;
  public uniqueCommodities = 0;

  public filtroForm: FormGroup;

  constructor() {
    this.filtroForm = this.fb.group({
      search: [''],
      commodity_types: [[]],
      currencies: [[]],
      status: [''],
      origin_countries: [[]],
      active: [null],
      ai_generated: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.productService.getFilterOptions().subscribe({
      next: (options: ProductFilterOptions) => {
        this.filterOptions = options;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar opções de filtro', 'Fechar', { duration: 3000 });
      }
    });

    // Carregar produtos
    this.loadProducts();
  }

  private loadProducts(additionalFilters?: Partial<ProductFilters>): void {
    this.isLoading = true;
    
    const filters: ProductFilters = {
      ...additionalFilters
    };
    
    this.productService.getProducts(filters).subscribe({
      next: (products: Product[]) => {
        this.products = products;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalProducts = this.products.length;
    this.activeProducts = this.products.filter(p => p.active).length;
    this.aiGeneratedProducts = this.products.filter(p => p.ai_config?.ai_generated).length;
    this.uniqueCommodities = new Set(this.products.map(p => p.commodity_type)).size;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    
    const filters: ProductFilters = {
      search: formValue.search || undefined,
      commodity_types: formValue.commodity_types?.length ? formValue.commodity_types : undefined,
      currencies: formValue.currencies?.length ? formValue.currencies : undefined,
      status: formValue.status ? [formValue.status] : undefined,
      origin_countries: formValue.origin_countries?.length ? formValue.origin_countries : undefined,
      active: formValue.active,
      ai_generated: formValue.ai_generated
    };

    this.loadProducts(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      search: '',
      commodity_types: [],
      currencies: [],
      status: '',
      origin_countries: [],
      active: null,
      ai_generated: null
    });
    
    this.loadProducts();
  }

  /**
   * Abre o formulário de produto em um diálogo centralizado (fecha com ESC).
   * @param product Produto para popular o formulário (null = novo).
   * @param isViewMode Somente leitura.
   * @param editingId Quando informado, o resultado do diálogo atualiza o produto; caso contrário cria um novo.
   */
  private openProductFormDialog(
    product: Product | null,
    isViewMode: boolean,
    editingId: string | null
  ): void {
    const dialogRef = this.dialog.open(ProductFormDialogComponent, {
      width: '1000px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      autoFocus: false,
      panelClass: 'product-form-dialog-panel',
      data: { product, isViewMode }
    });

    dialogRef.afterClosed().subscribe((result: Record<string, unknown> | undefined) => {
      if (!result) {
        return;
      }

      // Calcular densidade automaticamente antes de persistir
      const netWeight = result['net_weight'] as number | undefined;
      const volume = result['volume'] as number | undefined;
      if (netWeight && volume) {
        result['density'] = netWeight / volume;
      }

      // O formulário é plano; o serviço mock aceita os dados como Product parcial.
      const formData = result as unknown as Product;

      if (editingId) {
        this.productService.updateProduct(editingId, formData).subscribe({
          next: () => {
            this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          },
          error: () => {
            this.snackBar.open('Erro ao atualizar produto', 'Fechar', { duration: 3000 });
          }
        });
      } else {
        this.productService.createProduct(formData).subscribe({
          next: () => {
            this.snackBar.open('Produto criado com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          },
          error: () => {
            this.snackBar.open('Erro ao criar produto', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  public createProduct(): void {
    this.openProductFormDialog(null, false, null);
  }

  public createProductWithAI(): void {
    const dialogRef = this.dialog.open(AiCreateDialogComponent, {
      width: '520px',
      maxWidth: '92vw'
    });

    dialogRef.afterClosed().subscribe((description: string | undefined) => {
      if (description && description.trim()) {
        this.isLoading = true;

        this.productService.createProductWithAI({
          user_description: description.trim(),
          auto_enrich: true,
          use_price_prediction: true
        }).subscribe({
          next: (response) => {
            this.isLoading = false;
            this.snackBar.open(`Produto criado com IA! Confiança: ${response.confidence_score}%`, 'Fechar', {
              duration: 5000
            });
            this.loadProducts();
          },
          error: () => {
            this.isLoading = false;
            this.snackBar.open('Erro ao criar produto com IA', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  public viewProduct(product: Product): void {
    this.openProductFormDialog(product, true, null);
  }

  public editProduct(product: Product): void {
    this.openProductFormDialog(product, false, product.product_id);
  }

  public duplicateProduct(product: Product): void {
    // Cria uma cópia: sem id em edição e com código/nome ajustados
    const cloned: Product = {
      ...product,
      product_code: `${product.product_code}_COPIA`,
      name: `${product.name} (Cópia)`
    };
    this.snackBar.open('Ajuste os dados e salve para criar a cópia', 'Fechar', { duration: 4000 });
    this.openProductFormDialog(cloned, false, null);
  }

  public enrichWithAI(product: Product): void {
    this.productService.enrichProductWithAI(product.product_id).subscribe({
      next: () => {
        this.snackBar.open(`${product.name} enriquecido com IA!`, 'Fechar', { duration: 3000 });
        this.loadProducts();
      },
      error: () => {
        this.snackBar.open('Erro ao enriquecer produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public validateProduct(product: Product): void {
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

  public toggleActive(product: Product): void {
    const newStatus = !product.active;
    
    this.productService.updateProduct(product.product_id, { active: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Produto ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadProducts();
      },
      error: () => {
        this.snackBar.open('Erro ao alterar status do produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public deleteProduct(product: Product): void {
    const data: ConfirmDialogData = {
      title: 'Excluir Produto',
      message: `Tem certeza que deseja excluir o produto "${product.name}"? Esta ação não pode ser desfeita.`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      autoFocus: false,
      data
    });

    dialogRef.afterClosed().subscribe((confirmed: boolean) => {
      if (confirmed === true) {
        this.productService.deleteProduct(product.product_id).subscribe({
          next: () => {
            this.snackBar.open('Produto excluído com sucesso!', 'Fechar', { duration: 3000 });
            this.loadProducts();
          },
          error: () => {
            this.snackBar.open('Erro ao excluir produto', 'Fechar', { duration: 3000 });
          }
        });
      }
    });
  }

  public importProducts(): void {
    const dialogRef = this.dialog.open(ImportCsvDialogComponent, {
      width: '1200px',
      maxWidth: '98vw',
      maxHeight: '95vh',
      disableClose: false,
      panelClass: ['custom-dialog-container'],
      data: {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadProducts();
        this.snackBar.open('Produtos importados com sucesso!', 'Fechar', { duration: 4000 });
      }
    });
  }

  // ========== HELPER METHODS ==========

  public getCommodityTypeLabel(type: string): string {
    return COMMODITY_TYPE_LABELS[type as keyof typeof COMMODITY_TYPE_LABELS] || type;
  }

  public getUnitLabel(unit: string): string {
    return UNIT_LABELS[unit as keyof typeof UNIT_LABELS] || unit;
  }

  public getCurrencyLabel(currency: string): string {
    return CURRENCY_LABELS[currency as keyof typeof CURRENCY_LABELS] || currency;
  }

  public getProductStatusLabel(status: string): string {
    return PRODUCT_STATUS_LABELS[status as keyof typeof PRODUCT_STATUS_LABELS] || status;
  }

  public getPriceUnitLabel(priceUnit: string): string {
    return PRICE_UNIT_LABELS[priceUnit as keyof typeof PRICE_UNIT_LABELS] || priceUnit;
  }

  public formatCurrency(value: number, currency: string): string {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: currency === 'BRL' ? 'BRL' : 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  }
}
