import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';

import { ProductCatalogMockService } from '../../../../../services/productCatalogMockService';
import { Product } from '../../../../../types/productCatalog';

interface CSVProduct {
  row: number;
  data: Partial<Product>;
  isValid: boolean;
  errors: string[];
}

interface BulkCreateResult {
  success: number;
  failed: number;
  results: Product[];
}

@Component({
  selector: 'app-import-csv-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatCheckboxModule,
    MatProgressBarModule,
    MatTableModule,
    MatSnackBarModule,
    MatTabsModule,
    MatStepperModule
  ],
  template: `
    <div class="import-dialog-container">
      
      <!-- 📤 HEADER DO DIÁLOGO -->
      <div mat-dialog-title style="background: linear-gradient(135deg, #2e7d32, #4caf50); color: white; padding: 16px 24px; margin: -24px -24px 16px -24px; position: relative;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <mat-icon style="font-size: 28px; color: white;">file_upload</mat-icon>
          <div>
            <h2 style="margin: 0; color: white;">📤 Importar Produtos via CSV</h2>
            <p style="margin: 4px 0 0 0; opacity: 0.9; font-size: 14px;">Importe produtos em lote using arquivo CSV</p>
          </div>
        </div>
        <!-- Botão de fechar (X) -->
        <button mat-icon-button 
                (click)="dialogRef.close()" 
                style="position: absolute; top: 12px; right: 12px; color: white; opacity: 0.9;"
                aria-label="Fechar">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div mat-dialog-content style="padding: 0;">
        
        <!-- STEPPER DE IMPORTAÇÃO -->
        <mat-stepper linear #stepper style="margin-top: 8px;">
          
          <!-- PASSO 1: UPLOAD DO ARQUIVO -->
          <mat-step [stepControl]="uploadForm" label="Upload do Arquivo">
            <form [formGroup]="uploadForm" style="padding: 16px 0;">
              
              <div style="text-align: center; padding: 24px; border: 2px dashed #4caf50; border-radius: 12px; background: #f1f8e9;">
                <mat-icon style="font-size: 48px; color: #4caf50; margin-bottom: 12px;">cloud_upload</mat-icon>
                
                <h3 style="margin: 0 0 8px 0; color: #2e7d32;">Selecione o arquivo CSV</h3>
                <p style="margin: 0 0 16px 0; color: #666;">Selecione o arquivo CSV seguindo o exemplo de linha:</p>
                <div style="background: #fff; padding: 8px 12px; border-radius: 6px; margin: 0 0 16px 0; font-family: monospace; font-size: 11px; color: #333; border-left: 4px solid #4caf50; text-align: left;">
                  Soja Grão Premium,SOJA_PREM_001,SOJA,1201.90.00,1201,Brasil,450.50,USD,MT
                </div>
                
                <input type="file" 
                       #fileInput
                       (change)="onFileSelected($event)"
                       accept=".csv"
                       style="display: none;">
                
                <button mat-raised-button 
                        color="primary" 
                        (click)="fileInput.click()"
                        style="margin-bottom: 12px;">
                  <mat-icon>attach_file</mat-icon>
                  Selecionar Arquivo CSV
                </button>
                
                <div *ngIf="selectedFile" style="background: white; padding: 8px 12px; border-radius: 8px; margin-top: 12px;">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <mat-icon style="color: #4caf50;">description</mat-icon>
                    <span style="font-weight: bold;">{{selectedFile.name}}</span>
                    <span style="color: #666; font-size: 12px;">{{formatFileSize(selectedFile.size)}}</span>
                    <button mat-icon-button (click)="removeFile()" style="color: #f44336;">
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                </div>
              </div>

              <!-- CONFIGURAÇÕES DE IMPORTAÇÃO -->
              <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 16px; margin-top: 16px;">
                
                <mat-form-field appearance="outline">
                  <mat-label>Separador CSV</mat-label>
                  <mat-select formControlName="delimiter">
                    <mat-option value=",">Vírgula (,)</mat-option>
                    <mat-option value=";">Ponto e vírgula (;)</mat-option>
                    <mat-option value="\t">Tab</mat-option>
                  </mat-select>
                </mat-form-field>

                <div style="display: flex; align-items: center; gap: 16px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
                  <mat-checkbox formControlName="hasHeader" color="primary">
                    Primeira linha contém cabeçalhos
                  </mat-checkbox>
                  
                  <mat-checkbox formControlName="skipEmptyRows" color="primary">
                    Ignorar linhas vazias
                  </mat-checkbox>
                </div>

              </div>

              <div style="text-align: right; margin-top: 24px;">
                <button mat-button mat-dialog-close style="margin-right: 8px;">
                  Cancelar
                </button>
                <button mat-raised-button 
                        color="primary"
                        (click)="processCSV()"
                        [disabled]="!selectedFile || isProcessing">
                  <mat-icon>{{isProcessing ? 'hourglass_empty' : 'analytics'}}</mat-icon>
                  {{isProcessing ? 'Processando...' : 'Processar CSV'}}
                </button>
              </div>
            </form>
          </mat-step>

          <!-- PASSO 2: PREVIEW E VALIDAÇÃO -->
          <mat-step [stepControl]="previewForm" label="Preview dos Dados">
            <form [formGroup]="previewForm" style="padding: 16px 0;">
              
              <div style="margin-bottom: 16px;">
                <h3 style="margin: 0 0 8px 0;">📊 Resumo da Importação</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px;">
                  
                  <div style="background: #e8f5e8; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #2e7d32;">{{validProducts}}</div>
                    <div style="font-size: 11px; color: #666;">Produtos Válidos</div>
                  </div>
                  
                  <div style="background: #fff3e0; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #ed6c02;">{{invalidProducts}}</div>
                    <div style="font-size: 11px; color: #666;">Com Erros</div>
                  </div>
                  
                  <div style="background: #e3f2fd; padding: 12px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 20px; font-weight: bold; color: #1976d2;">{{totalRows}}</div>
                    <div style="font-size: 11px; color: #666;">Total de Linhas</div>
                  </div>

                </div>
              </div>

              <!-- TABELA DE PREVIEW -->
              <div style="background: white; border-radius: 8px; overflow: hidden; border: 1px solid #e0e0e0;">
                <div style="background: #f8f9fa; padding: 12px; border-bottom: 1px solid #e0e0e0;">
                  <h4 style="margin: 0; display: flex; align-items: center; gap: 8px; font-size: 14px;">
                    <mat-icon style="font-size: 18px;">preview</mat-icon>
                    Preview dos Produtos ({{csvProducts.length}} registros)
                  </h4>
                </div>

                <div style="max-height: 500px; overflow-y: auto;">
                  <table mat-table [dataSource]="csvProducts" style="width: 100%;">
                    
                    <!-- Coluna Status -->
                    <ng-container matColumnDef="status">
                      <th mat-header-cell *matHeaderCellDef>Status</th>
                      <td mat-cell *matCellDef="let product">
                        <mat-icon [style.color]="product.isValid ? '#4caf50' : '#f44336'">
                          {{product.isValid ? 'check_circle' : 'error'}}
                        </mat-icon>
                      </td>
                    </ng-container>

                    <!-- Coluna Linha -->
                    <ng-container matColumnDef="row">
                      <th mat-header-cell *matHeaderCellDef>Linha</th>
                      <td mat-cell *matCellDef="let product">{{product.row}}</td>
                    </ng-container>

                    <!-- Coluna Nome -->
                    <ng-container matColumnDef="name">
                      <th mat-header-cell *matHeaderCellDef>Nome do Produto</th>
                      <td mat-cell *matCellDef="let product">
                        {{product.data.name || '-'}}
                      </td>
                    </ng-container>

                    <!-- Coluna Código -->
                    <ng-container matColumnDef="code">
                      <th mat-header-cell *matHeaderCellDef>Código</th>
                      <td mat-cell *matCellDef="let product">
                        {{product.data.product_code || '-'}}
                      </td>
                    </ng-container>

                    <!-- Coluna Commodity -->
                    <ng-container matColumnDef="commodity">
                      <th mat-header-cell *matHeaderCellDef>Commodity</th>
                      <td mat-cell *matCellDef="let product">
                        {{product.data.commodity_type || '-'}}
                      </td>
                    </ng-container>

                    <!-- Coluna NCM -->
                    <ng-container matColumnDef="ncm">
                      <th mat-header-cell *matHeaderCellDef>NCM</th>
                      <td mat-cell *matCellDef="let product">
                        {{product.data.ncm_code || '-'}}
                      </td>
                    </ng-container>

                    <!-- Coluna Erros -->
                    <ng-container matColumnDef="errors">
                      <th mat-header-cell *matHeaderCellDef>Erros</th>
                      <td mat-cell *matCellDef="let product">
                        <div *ngIf="product.errors.length > 0" style="color: #f44336; font-size: 11px;">
                          <div *ngFor="let error of product.errors">• {{error}}</div>
                        </div>
                        <span *ngIf="product.errors.length === 0" style="color: #4caf50; font-size: 11px;">✓ OK</span>
                      </td>
                    </ng-container>

                    <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                    <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
                  </table>
                </div>
              </div>

              <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 24px;">
                <button mat-button (click)="stepper.previous()">
                  <mat-icon>arrow_back</mat-icon>
                  Voltar
                </button>
                
                <div style="display: flex; gap: 12px;">
                  <button mat-button mat-dialog-close>
                    Cancelar
                  </button>
                  <button mat-raised-button 
                          color="primary"
                          (click)="importValidProducts()"
                          [disabled]="validProducts === 0 || isImporting">
                    <mat-icon>{{isImporting ? 'hourglass_empty' : 'cloud_upload'}}</mat-icon>
                    {{isImporting ? 'Importando...' : 'Importar Produtos Válidos'}}
                  </button>
                </div>
              </div>
            </form>
          </mat-step>

          <!-- PASSO 3: RESULTADO -->  
          <mat-step label="Resultado">
            <div style="padding: 16px 0; text-align: center;">
              
              <mat-icon style="font-size: 48px; color: #4caf50; margin-bottom: 12px;">
                check_circle
              </mat-icon>
              
              <h3 style="margin: 0 0 8px 0; color: #2e7d32;">✅ Importação Concluída!</h3>
              <p style="margin: 0 0 16px 0; color: #666;">
                {{importResult.success}} produtos importados com sucesso
                <span *ngIf="importResult.skipped > 0"> | {{importResult.skipped}} ignorados devido a erros</span>
              </p>

              <div style="background: #e8f5e8; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
                <h4 style="margin: 0 0 12px 0; color: #2e7d32; font-size: 14px;">📈 Estatísticas da Importação</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 8px; text-align: center;">
                  <div>
                    <div style="font-size: 20px; font-weight: bold; color: #4caf50;">{{importResult.success}}</div>
                    <div style="font-size: 12px; color: #666;">Importados</div>
                  </div>
                  <div>
                    <div style="font-size: 20px; font-weight: bold; color: #ff9800;">{{importResult.skipped}}</div>
                    <div style="font-size: 12px; color: #666;">Ignorados</div>
                  </div>
                  <div>
                    <div style="font-size: 20px; font-weight: bold; color: #2196f3;">{{importResult.total}}</div>
                    <div style="font-size: 12px; color: #666;">Total</div>
                  </div>
                </div>
              </div>

              <div style="display: flex; gap: 12px; justify-content: center;">
                <button mat-raised-button color="primary" mat-dialog-close>
                  <mat-icon>done</mat-icon>
                  Fechar
                </button>
                
                <button mat-stroked-button (click)="downloadLog()" *ngIf="importResult.log">
                  <mat-icon>download</mat-icon>
                  Baixar Log
                </button>
              </div>
            </div>
          </mat-step>

        </mat-stepper>

      </div>
    </div>
  `,
  styles: [`
    .import-dialog-container {
      width: 1200px;
      max-width: 98vw;
      max-height: 95vh;
      padding: 0;
      overflow: hidden;
    }
    
    ::ng-deep .mat-dialog-content {
      max-height: 82vh;
      overflow-y: auto;
      padding: 0 !important;
    }
    
    ::ng-deep .mat-dialog-container {
      padding: 0 !important;
      overflow: hidden;
    }
    
    ::ng-deep .mat-stepper-content {
      padding: 0 16px 16px 16px !important;
    }
    
    table {
      font-size: 11px;
    }
    
    .mat-mdc-row:hover {
      background-color: #f5f5f5;
    }
    
    /* Otimização para tabelas longas */
    .mat-mdc-table {
      width: 100%;
    }
    
    /* Melhor aproveitamento do espaço horizontal */
    .mat-mdc-header-cell, .mat-mdc-cell {
      padding: 6px 8px !important;
      font-size: 11px !important;
    }
    
    /* Compactação das colunas */
    .mat-column-status {
      width: 60px !important;
    }
    
    .mat-column-row {
      width: 50px !important;
    }
    
    .mat-column-name {
      min-width: 200px !important;
    }
    
    .mat-column-code {
      width: 120px !important;
    }
    
    .mat-column-commodity {
      width: 80px !important;
    }
    
    .mat-column-ncm {
      width: 100px !important;
    }
    
    .mat-column-errors {
      min-width: 180px !important;
    }
  `]
})
export class ImportCsvDialogComponent {
  private readonly fb = inject(FormBuilder);
  public readonly dialogRef = inject(MatDialogRef<ImportCsvDialogComponent>);
  private readonly snackBar = inject(MatSnackBar);
  private readonly productService = inject(ProductCatalogMockService);

  public selectedFile: File | null = null;
  public isProcessing = false;
  public isImporting = false;
  public csvProducts: CSVProduct[] = [];
  public displayedColumns = ['status', 'row', 'name', 'code', 'commodity', 'ncm', 'errors'];

  public validProducts = 0;
  public invalidProducts = 0;
  public totalRows = 0;

  public importResult = {
    success: 0,
    skipped: 0,
    total: 0,
    log: ''
  };

  public uploadForm: FormGroup;
  public previewForm: FormGroup;

  constructor() {
    this.uploadForm = this.fb.group({
      delimiter: [',', Validators.required],
      hasHeader: [true],
      skipEmptyRows: [true]
    });

    this.previewForm = this.fb.group({
      confirmed: [false, Validators.requiredTrue]
    });
  }

  public onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'text/csv') {
      this.selectedFile = file;
      console.log('📁 Arquivo selecionado:', file.name);
    } else {
      this.snackBar.open('Por favor, selecione um arquivo CSV válido', 'Fechar', { duration: 3000 });
    }
  }

  public removeFile(): void {
    this.selectedFile = null;
    this.csvProducts = [];
    this.resetCounters();
  }

  public formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  public processCSV(): void {
    if (!this.selectedFile) {
      this.snackBar.open('Selecione um arquivo CSV primeiro', 'Fechar', { duration: 3000 });
      return;
    }

    this.isProcessing = true;
    console.log('⚙️ Processando CSV...');

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csvText = e.target?.result as string;
        this.parseCSV(csvText);
        this.isProcessing = false;
      } catch (error) {
        console.error('❌ Erro ao processar CSV:', error);
        this.snackBar.open('Erro ao processar arquivo CSV', 'Fechar', { duration: 3000 });
        this.isProcessing = false;
      }
    };

    reader.readAsText(this.selectedFile);
  }

  private parseCSV(csvText: string): void {
    const { delimiter, hasHeader, skipEmptyRows } = this.uploadForm.value;
    
    const lines = csvText.split('\n')
      .map(line => line.trim())
      .filter(line => !skipEmptyRows || line.length > 0);

    let headers: string[] = [];
    let dataLines: string[] = [];

    if (hasHeader && lines.length > 0) {
      headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''));
      dataLines = lines.slice(1);
    } else {
      // Headers padrão se não houver cabeçalho
      headers = ['name', 'product_code', 'commodity_type', 'ncm_code', 'hs_code', 'origin_country'];
      dataLines = lines;
    }

    console.log('📋 Headers detectados:', headers);

    this.csvProducts = [];
    dataLines.forEach((line, index) => {
      if (line.trim()) {
        const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''));
        const productData = this.mapCSVToProduct(headers, values);
        const csvProduct = this.validateProduct(productData, index + (hasHeader ? 2 : 1));
        this.csvProducts.push(csvProduct);
      }
    });

    this.calculateStats();
    console.log('✅ CSV processado:', this.csvProducts.length, 'produtos');
  }

  private mapCSVToProduct(headers: string[], values: string[]): Partial<Product> {
    const product: any = {};
    
    headers.forEach((header, index) => {
      const value = values[index];
      if (value) {
        // Mapear headers comuns
        switch (header.toLowerCase()) {
          case 'name':
          case 'nome':
          case 'produto':
            product.name = value;
            break;
          case 'code':
          case 'codigo':
          case 'product_code':
            product.product_code = value;
            break;
          case 'commodity':
          case 'commodity_type':
          case 'tipo':
            product.commodity_type = value.toUpperCase();
            break;
          case 'ncm':
          case 'ncm_code':
            product.ncm_code = value;
            break;
          case 'hs':
          case 'hs_code':
            product.hs_code = value;
            break;
          case 'country':
          case 'origin_country':
          case 'pais':
          case 'origem':
            product.origin_country = value;
            break;
          case 'price':
          case 'preco':
          case 'standard_price':
            product.standard_price = parseFloat(value) || 0;
            break;
          case 'currency':
          case 'moeda':
            product.currency = value.toUpperCase();
            break;
          case 'unit':
          case 'unidade':
            product.unit = value.toUpperCase();
            break;
          default:
            product[header] = value;
        }
      }
    });

    // Valores padrão
    product.active = true;
    product.commodity_type = product.commodity_type || 'GRAO';
    product.origin_country = product.origin_country || 'Brasil';
    product.currency = product.currency || 'USD';
    product.unit = product.unit || 'MT';
    product.package_type = 'BULK';
    product.storage_type = 'DRY';
    product.price_unit = 'USD_MT';

    return product;
  }

  private validateProduct(productData: Partial<Product>, row: number): CSVProduct {
    const errors: string[] = [];

    // Validações obrigatórias
    if (!productData.name) {
      errors.push('Nome do produto é obrigatório');
    }

    if (!productData.product_code) {
      errors.push('Código do produto é obrigatório');
    }

    if (!productData.ncm_code) {
      errors.push('Código NCM é obrigatório');
    } else if (!/^\d{4}\.\d{2}\.\d{2}$/.test(productData.ncm_code)) {
      errors.push('Formato NCM inválido (deve ser 0000.00.00)');
    }

    if (!productData.hs_code) {
      errors.push('Código HS é obrigatório');
    }

    // Validar tipos conhecidos
    const validCommodities = ['GRAO', 'CAFE', 'ACUCAR', 'ALGODAO', 'SOJA', 'MILHO'];
    if (productData.commodity_type && !validCommodities.includes(productData.commodity_type)) {
      errors.push(`Tipo de commodity inválido. Use: ${validCommodities.join(', ')}`);
    }

    return {
      row,
      data: productData,
      isValid: errors.length === 0,
      errors
    };
  }

  private calculateStats(): void {
    this.totalRows = this.csvProducts.length;
    this.validProducts = this.csvProducts.filter(p => p.isValid).length;
    this.invalidProducts = this.csvProducts.filter(p => !p.isValid).length;
  }

  private resetCounters(): void {
    this.validProducts = 0;
    this.invalidProducts = 0;
    this.totalRows = 0;
  }

  public async importValidProducts(): Promise<void> {
    const validProductsData = this.csvProducts
      .filter(p => p.isValid)
      .map(p => p.data as Product);

    if (validProductsData.length === 0) {
      this.snackBar.open('Nenhum produto válido para importar', 'Fechar', { duration: 3000 });
      return;
    }

    this.isImporting = true;
    console.log('📤 Importando', validProductsData.length, 'produtos em lote...');

    try {
      const result = await firstValueFrom(this.productService.bulkCreateProducts(validProductsData));
      
      if (result) {
        this.importResult = {
          success: result.success,
          skipped: result.failed,
          total: validProductsData.length,
          log: this.generateImportLog(result)
        };

        this.snackBar.open(
          `✅ ${result.success} produtos importados com sucesso!`,
          'Fechar',
          { duration: 5000 }
        );
      }

      this.isImporting = false;

    } catch (error) {
      console.error('❌ Erro durante importação em lote:', error);
      this.snackBar.open('Erro durante a importação', 'Fechar', { duration: 3000 });
      this.isImporting = false;
    }
  }

  private generateImportLog(result: BulkCreateResult): string {
    const logEntries: string[] = [];
    
    logEntries.push('=== RELATÓRIO DE IMPORTAÇÃO CSV ===');
    logEntries.push(`Data: ${new Date().toLocaleString('pt-BR')}`);
    logEntries.push(`Total de produtos processados: ${result.success + result.failed}`);
    logEntries.push(`Produtos importados com sucesso: ${result.success}`);
    logEntries.push(`Produtos ignorados/falha: ${result.failed}`);
    logEntries.push('');
    
    if (result.results && result.results.length > 0) {
      logEntries.push('=== PRODUTOS IMPORTADOS ===');
      result.results.forEach((product: Product) => {
        logEntries.push(`✅ ${product.name} (${product.product_code})`);
      });
    }
    
    if (result.failed > 0) {
      logEntries.push('');
      logEntries.push('=== PRODUTOS IGNORADOS ===');
      logEntries.push(`${result.failed} produtos não foram importados (códigos duplicados ou erros)`);
    }
    
    return logEntries.join('\n');
  }

  public downloadLog(): void {
    const blob = new Blob([this.importResult.log], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `import-log-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}