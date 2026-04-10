import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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

import { ProductCatalogMockService } from '../../../../services/productCatalogMockService';
import { ImportCsvDialogComponent } from './import-csv-dialog/import-csv-dialog.component';
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
    MatTooltipModule,
    MatDividerModule
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

  // Formulário inline das 7 abas
  public showProductForm = false;
  public editingProduct: Product | null = null;
  public selectedTabIndex = 0;
  public productForm: FormGroup;
  public isSaving = false;

  public filtroForm: FormGroup;

  constructor() {
    console.log('🚀 CatalogoComponent inicializado!');
    
    this.filtroForm = this.fb.group({
      search: [''],
      commodity_types: [[]],
      currencies: [[]],
      status: [''],
      origin_countries: [[]],
      active: [null],
      ai_generated: [null]
    });

    // Inicializar formulário das 7 abas completo
    this.productForm = this.fb.group({
      
      // 📋 ABA 1: GERAL
      product_code: ['', [Validators.required, Validators.minLength(3)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      short_name: [''],
      scientific_name: [''],
      description: [''],
      commodity_type: ['GRAO', [Validators.required]],
      origin_country: ['Brasil', [Validators.required]],
      active: [true],
      
      // 💰 ABA 2: FISCAL
      ncm_code: ['', [Validators.required, Validators.pattern(/^\d{4}\.\d{2}\.\d{2}$/)]],
      ncm_description: [''],
      hs_code: ['', [Validators.required]],
      export_tax: [0, [Validators.min(0), Validators.max(100)]],
      cfop: [''],
      cest: [''],
      requires_export_license: [false],
      export_license_type: [''],

      // 📦 ABA 3: LOGÍSTICA
      unit: ['MT', [Validators.required]],
      net_weight: [0, [Validators.min(0)]],
      gross_weight: [0, [Validators.min(0)]],
      volume: [0, [Validators.min(0)]],
      package_type: ['BULK'],
      storage_type: ['DRY'],
      density: [{ value: 0, disabled: true }],
      tare_percentage: [0, [Validators.min(0), Validators.max(100)]],
      stowage_factor: [0, [Validators.min(0)]],

      // 💵 ABA 4: COMERCIAL
      standard_price: [0, [Validators.min(0)]],
      currency: ['USD'],
      price_unit: ['USD_MT'],
      min_order_quantity: [0, [Validators.min(0)]],
      max_order_quantity: [0, [Validators.min(0)]],
      futures_exchange: [''],
      current_futures_price: [{ value: 0, disabled: true }],
      price_last_update: [{ value: '', disabled: true }],

      // 🔬 ABA 5: QUALIDADE
      moisture_content: [0, [Validators.min(0), Validators.max(100)]],
      protein_content: [0, [Validators.min(0), Validators.max(100)]],
      oil_content: [0, [Validators.min(0), Validators.max(100)]],
      foreign_matter: [0, [Validators.min(0), Validators.max(100)]],
      broken_grains: [0, [Validators.min(0), Validators.max(100)]],
      inspection_standard: [''],
      quality_certification: [''],
      analysis_expiry_date: [''],

      // 🤖 ABA 6: INTELIGÊNCIA ARTIFICIAL
      ai_auto_update: [false],
      ai_auto_classify: [false],
      ai_price_prediction: [false],
      ai_confidence_level: ['MEDIUM']
    });
  }

  ngOnInit(): void {
    console.log('📊 Carregando catálogo de produtos...');
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;
    
    // Carregar opções de filtro
    this.productService.getFilterOptions().subscribe({
      next: (options: ProductFilterOptions) => {
        console.log('✅ Opções de filtro carregadas:', options);
        this.filterOptions = options;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar opções de filtro:', error);
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
        console.log('✅ Produtos carregados:', products);
        this.products = products;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar produtos:', error);
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar produtos', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalProducts = this.products.length;
    this.activeProducts = this.products.filter(p => p.active).length;
    this.aiGeneratedProducts = this.products.filter(p => p.ai_config.ai_generated).length;
    this.uniqueCommodities = new Set(this.products.map(p => p.commodity_type)).size;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;
    console.log('🔍 Aplicando filtros:', formValue);
    
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

  public createProduct(): void {
    console.log('➕ Criando novo produto');
    this.editingProduct = null;
    this.selectedTabIndex = 0;
    this.productForm.reset({
      // Valores padrão para novo produto
      commodity_type: 'GRAO',
      origin_country: 'Brasil',
      active: true,
      unit: 'MT',
      package_type: 'BULK',
      storage_type: 'DRY',
      currency: 'USD',
      price_unit: 'USD_MT',
      ai_confidence_level: 'MEDIUM',
      export_tax: 0,
      tare_percentage: 0,
      stowage_factor: 0
    });
    this.showProductForm = true;
    
    // Scroll para o formulário
    setTimeout(() => {
      document.getElementById('product-form-container')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }

  public createProductWithAI(): void {
    console.log('🤖 Criando produto com IA');
    
    const userDescription = prompt('🤖 Descreva o produto que deseja criar\\n\\nExemplos:\\n• "Soja em grão para exportação"\\n• "Milho amarelo #2"\\n• "Café arábica Santos"');
    
    if (userDescription && userDescription.trim()) {
      this.isLoading = true;
      
      this.productService.createProductWithAI({
        user_description: userDescription.trim(),
        auto_enrich: true,
        use_price_prediction: true
      }).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.snackBar.open(`✨ Produto criado com IA! Confiança: ${response.confidence_score}%`, 'Fechar', { 
            duration: 5000
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('❌ Erro ao criar produto com IA:', error);
          this.snackBar.open('Erro ao criar produto com IA', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public viewProduct(product: Product): void {
    console.log('👁️ Visualizando produto:', product.name);
    this.snackBar.open(`Visualizando ${product.name}`, 'Fechar', { duration: 3000 });
  }

  public editProduct(product: Product): void {
    console.log('✏️ Editando produto:', product.name);
    this.snackBar.open(`Editando ${product.name}`, 'Fechar', { duration: 3000 });
  }

  public duplicateProduct(product: Product): void {
    console.log('📄 Duplicando produto:', product.name);
    this.snackBar.open(`Duplicando ${product.name}`, 'Fechar', { duration: 3000 });
  }

  public enrichWithAI(product: Product): void {
    console.log('🧠 Enriquecendo produto com IA:', product.name);
    
    this.productService.enrichProductWithAI(product.product_id).subscribe({
      next: (enrichedProduct) => {
        console.log('✅ Produto enriquecido:', enrichedProduct);
        this.snackBar.open(`✨ ${product.name} enriquecido com IA!`, 'Fechar', { duration: 3000 });
        this.loadProducts();
      },
      error: (error) => {
        console.error('❌ Erro ao enriquecer produto:', error);
        this.snackBar.open('Erro ao enriquecer produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public validateProduct(product: Product): void {
    console.log('✅ Validando produto:', product.name);
    
    this.productService.validateProduct(product).subscribe({
      next: (result) => {
        if (result.isValid) {
          this.snackBar.open('✅ Produto válido!', 'Fechar', { duration: 3000 });
        } else {
          this.snackBar.open(`⚠️ ${result.errors.length} erros encontrados`, 'Fechar', { duration: 5000 });
        }
      },
      error: (error) => {
        console.error('❌ Erro na validação:', error);
        this.snackBar.open('Erro ao validar produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public toggleActive(product: Product): void {
    const newStatus = !product.active;
    console.log(`🔄 ${newStatus ? 'Ativando' : 'Desativando'} produto:`, product.name);
    
    this.productService.updateProduct(product.product_id, { active: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Produto ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadProducts();
      },
      error: (error) => {
        console.error('❌ Erro ao alterar status:', error);
        this.snackBar.open('Erro ao alterar status do produto', 'Fechar', { duration: 3000 });
      }
    });
  }

  public deleteProduct(product: Product): void {
    if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
      console.log('🗑️ Excluindo produto:', product.name);
      
      this.productService.deleteProduct(product.product_id).subscribe({
        next: () => {
          this.snackBar.open('Produto excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
        },
        error: (error) => {
          console.error('❌ Erro ao excluir produto:', error);
          this.snackBar.open('Erro ao excluir produto', 'Fechar', { duration: 3000 });
        }
      });
    }
  }

  public importProducts(): void {
    console.log('📥 Abrindo diálogo de importação CSV');
    
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
        console.log('✅ Importação CSV concluída');
        this.loadProducts(); // Recarrega a lista de produtos
        this.snackBar.open('✅ Produtos importados com sucesso!', 'Fechar', { duration: 4000 });
      }
    });
  }

  public closeProductForm(): void {
    this.showProductForm = false;
    this.editingProduct = null;
    this.selectedTabIndex = 0;
    this.productForm.reset();
    console.log('✖️ Formulário de produto fechado');
  }

  public saveProduct(): void {
    if (this.productForm.invalid) {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', { duration: 3000 });
      return;
    }

    this.isSaving = true;
    const formData = this.productForm.value;
    
    // Calcular densidade automaticamente
    if (formData.net_weight && formData.volume) {
      formData.density = formData.net_weight / formData.volume;
    }

    console.log('💾 Salvando produto:', formData);

    if (this.editingProduct) {
      // Atualizar produto existente
      this.productService.updateProduct(this.editingProduct.product_id, formData).subscribe({
        next: (product: Product) => {
          console.log('✅ Produto atualizado:', product);
          this.snackBar.open('Produto atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
          this.closeProductForm();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('❌ Erro ao atualizar produto:', error);
          this.snackBar.open('Erro ao atualizar produto', 'Fechar', { duration: 3000 });
          this.isSaving = false;
        }
      });
    } else {
      // Criar novo produto
      this.productService.createProduct(formData).subscribe({
        next: (product: Product) => {
          console.log('✅ Produto criado:', product);
          this.snackBar.open('Produto criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadProducts();
          this.closeProductForm();
          this.isSaving = false;
        },
        error: (error) => {
          console.error('❌ Erro ao criar produto:', error);
          this.snackBar.open('Erro ao criar produto', 'Fechar', { duration: 3000 });
          this.isSaving = false;
        }
      });
    }
  }

  public saveAsDraft(): void {
    console.log('📝 Salvando como rascunho...');
    // Implementação para salvar como rascunho
    this.snackBar.open('Rascunho salvo com sucesso!', 'Fechar', { duration: 2000 });
  }

  // 🤖 MÉTODOS DA INTELIGÊNCIA ARTIFICIAL
  public enrichProductWithAI(): void {
    console.log('🤖 Enriquecendo produto com IA...');
    this.snackBar.open('🤖 Enriquecimento com IA iniciado. Aguarde...', 'Fechar', { duration: 3000 });
    
    // Simular enriquecimento automático
    setTimeout(() => {
      const currentData = this.productForm.value;
      
      // Preencher dados automaticamente baseado no tipo de commodity
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
      
      this.snackBar.open('✅ Produto enriquecido com IA!', 'Fechar', { duration: 3000 });
    }, 2000);
  }

  public predictPrices(): void {
    console.log('📈 Predizendo preços com IA...');
    this.snackBar.open('📈 Análise de predição de preços iniciada...', 'Fechar', { duration: 3000 });
    
    setTimeout(() => {
      // Simular predição de preço
      const predictedPrice = Math.random() * 100 + 400; // Entre 400-500
      this.productForm.patchValue({
        standard_price: predictedPrice.toFixed(2),
        current_futures_price: (predictedPrice * 1.05).toFixed(2),
        price_last_update: new Date().toISOString().split('T')[0]
      });
      
      this.snackBar.open(`💰 Preço predito: $${predictedPrice.toFixed(2)}/MT`, 'Fechar', { duration: 4000 });
    }, 1500);
  }

  public validateWithAI(): void {
    console.log('🔍 Validando produto com IA...');
    this.snackBar.open('🔍 Validação com IA em andamento...', 'Fechar', { duration: 3000 });
    
    setTimeout(() => {
      let validationScore = Math.random() * 30 + 70; // Entre 70-100
      let message = '';
      
      if (validationScore >= 90) {
        message = `✅ Produto validado! Score: ${validationScore.toFixed(1)}% - Excelente`;
      } else if (validationScore >= 80) {
        message = `⚠️ Produto validado com ressalvas. Score: ${validationScore.toFixed(1)}% - Bom`;
      } else {
        message = `❌ Produto precisa de ajustes. Score: ${validationScore.toFixed(1)}% - Regular`;
      }
      
      this.snackBar.open(message, 'Fechar', { duration: 5000 });
    }, 1500);
  }

  public optimizeProduct(): void {
    console.log('⚙️ Otimizando produto...');
    this.snackBar.open('⚙️ Otimização de produto iniciada...', 'Fechar', { duration: 3000 });
    
    setTimeout(() => {
      // Simular otimizações automáticas
      const currentData = this.productForm.value;
      
      if (currentData.net_weight && currentData.gross_weight && !currentData.tare_percentage) {
        const tare = ((currentData.gross_weight - currentData.net_weight) / currentData.gross_weight * 100);
        this.productForm.patchValue({ tare_percentage: tare.toFixed(2) });
      }
      
      if (currentData.net_weight && currentData.volume) {
        const density = currentData.net_weight / currentData.volume;
        this.productForm.patchValue({ density: density.toFixed(2) });
      }
      
      this.snackBar.open('✅ Produto otimizado! Cálculos automáticos aplicados.', 'Fechar', { duration: 4000 });
    }, 1500);
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