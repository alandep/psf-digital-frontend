import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject, debounceTime, distinctUntilChanged, startWith, map } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { NovosPedidosService } from '../../novos-pedidos.service';

@Component({
  selector: 'app-informacao-basica',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDividerModule,
    MatChipsModule,
    MatAutocompleteModule,
    MatTooltipModule
  ],
  templateUrl: './informacao-basica.component.html',
  styleUrls: ['./informacao-basica.component.scss']
})
export class InformacaoBasicaComponent implements OnInit, OnDestroy {
  @Input() data: any = {};
  @Output() dataChanged = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private novosPedidosService = inject(NovosPedidosService);
  private destroy$ = new Subject<void>();

  form!: FormGroup;
  loading = false;
  
  // Dados para seleção
  exportTypes = [
    { value: 'Regular', label: 'Regular', icon: 'inventory_2' },
    { value: 'Express', label: 'Express', icon: 'bolt' },
    { value: 'Sample', label: 'Amostra', icon: 'science' },
    { value: 'Return', label: 'Retorno', icon: 'undo' }
  ];
  
  priorities = [
    { value: 'Low', label: 'Baixa', color: '#4caf50', icon: 'trending_down' },
    { value: 'Normal', label: 'Normal', color: '#2196f3', icon: 'trending_flat' },
    { value: 'High', label: 'Alta', color: '#ff9800', icon: 'trending_up' },
    { value: 'Critical', label: 'Crítica', color: '#f44336', icon: 'priority_high' }
  ];
  
  exporters: any[] = [];
  countries: any[] = [];
  filteredCountries: any[] = [];
  
  ngOnInit(): void {
    this.initializeForm();
    this.loadInitialData();
    this.setupFormObservers();
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
  
  private initializeForm(): void {
    this.form = this.fb.group({
      // Dados da Exportação
      exportNumber: ['', [Validators.required, Validators.pattern(/^EXP-\d{4}-\d{4}$/)]],
      exportType: ['Regular', Validators.required],
      priority: ['Normal', Validators.required],
      responsible: ['', [Validators.required, Validators.minLength(3)]],
      isUrgent: [false],
      expectedDate: [null],
      
      // Dados do Exportador
      exporterId: ['', Validators.required],
      exporterName: [''],
      exporterDocument: [''],
      
      // Dados do Importador
      importerName: ['', [Validators.required, Validators.minLength(2)]],
      importerDocument: ['', Validators.required],
      importerCountry: ['', Validators.required],
      importerAddress: ['', [Validators.required, Validators.minLength(10)]],
      importerContact: [''],
      
      // Condições Comerciais
      destinationCountry: ['', Validators.required],
      incoterm: ['FOB', Validators.required],
      currency: ['USD', Validators.required],
      paymentMethod: ['L/C', Validators.required],
      paymentTerms: ['']
    });
    
    // Pré-preenche com dados existentes
    if (this.data) {
      this.form.patchValue(this.data);
    }
  }
  
  private loadInitialData(): void {
    this.loading = true;
    
    this.novosPedidosService.getInitialData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.exporters = data.exporters;
          this.countries = data.countries;
          this.filteredCountries = [...this.countries];
          
          // Auto-gera número de exportação
          this.generateExportNumber();
          
          this.loading = false;
        },
        error: (error) => {
          console.error('Erro ao carregar dados:', error);
          this.loading = false;
        }
      });
  }
  
  private setupFormObservers(): void {
    // Emite mudanças do formulário
    this.form.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.emitFormData();
      });
    
    // Observer para mudança de exportador
    this.form.get('exporterId')?.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(exporterId => {
        const exporter = this.exporters.find(e => e.id === exporterId);
        if (exporter) {
          this.form.patchValue({
            exporterName: exporter.name,
            exporterDocument: exporter.document
          });
        }
      });
    
    // Observer para filtrar países
    this.form.get('destinationCountry')?.valueChanges
      .pipe(
        startWith(''),
        map(value => this.filterCountries(value)),
        takeUntil(this.destroy$)
      )
      .subscribe(filtered => {
        this.filteredCountries = filtered;
      });
    
    // Auto-validação de importador
    this.form.get('importerDocument')?.valueChanges
      .pipe(
        debounceTime(800),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(document => {
        if (document && this.form.get('importerCountry')?.value) {
          this.validateImporter(document, this.form.get('importerCountry')?.value);
        }
      });
  }
  
  private filterCountries(value: string): any[] {
    if (!value) return this.countries;
    
    const filterValue = value.toLowerCase();
    return this.countries.filter(country =>
      country.name.toLowerCase().includes(filterValue) ||
      country.code.toLowerCase().includes(filterValue)
    );
  }
  
  private emitFormData(): void {
    const formData = {
      ...this.form.value,
      isValid: this.form.valid
    };
    
    this.dataChanged.emit(formData);
  }
  
  // ========== AÇÕES ==========
  
  generateExportNumber(): void {
    this.novosPedidosService.generateExportNumber()
      .pipe(takeUntil(this.destroy$))
      .subscribe(exportNumber => {
        this.form.patchValue({ exportNumber });
      });
  }
  
  validateImporter(document: string, country: string): void {
    this.novosPedidosService.validateImporter(document, country)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result.valid && result.data) {
            this.form.patchValue({
              importerName: result.data.name,
              importerAddress: result.data.address,
              importerContact: result.data.contact
            });
          }
        },
        error: (error) => {
          console.error('Erro na validação:', error);
        }
      });
  }
  
  onCountrySelected(country: any): void {
    this.form.patchValue({
      destinationCountry: country.name,
      importerCountry: country.name,
      currency: country.currency
    });
  }
  
  onPriorityChange(priority: string): void {
    // Auto-marca como urgente se for crítica
    if (priority === 'Critical') {
      this.form.patchValue({ isUrgent: true });
    }
  }
  
  // ========== VALIDAÇÕES CUSTOMIZADAS ==========

  // Template helper methods
  getExportTypeBadgeClass(): string {
    const type = this.form.get('exportType')?.value;
    const classes: any = {
      'Regular': 'regular-badge',
      'Express': 'express-badge',
      'Sample': 'sample-badge',
      'Return': 'return-badge'
    };
    return classes[type] || 'regular-badge';
  }

  getExportTypeIcon(): string {
    const type = this.form.get('exportType')?.value;
    const exportType = this.exportTypes.find(t => t.value === type);
    return exportType?.icon || '';
  }

  getExportTypeValue(): string {
    return this.form.get('exportType')?.value || '';
  }

  getPriorityBadgeClass(): string {
    const priority = this.form.get('priority')?.value;
    const classes: any = {
      'Low': 'low-priority',
      'Normal': 'normal-priority',
      'High': 'high-priority',
      'Critical': 'critical-priority'
    };
    return classes[priority] || 'normal-priority';
  }

  getPriorityIcon(): string {
    const priority = this.form.get('priority')?.value;
    const priorityObj = this.priorities.find(p => p.value === priority);
    return priorityObj?.icon || '';
  }

  getPriorityLabel(): string {
    const priority = this.form.get('priority')?.value;
    const priorityObj = this.priorities.find(p => p.value === priority);
    return priorityObj?.label || '';
  }
  
  // ========== UTILITÁRIOS ==========
  
  hasError(fieldName: string, errorType?: string): boolean {
    const field = this.form.get(fieldName);
    if (!field) return false;
    
    if (errorType) {
      return field.hasError(errorType) && (field.dirty || field.touched);
    }
    
    return field.invalid && (field.dirty || field.touched);
  }
  
  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors) return '';
    
    const errors: any = {
      required: 'Campo obrigatório',
      minlength: `Mínimo de ${field.errors['minlength']?.requiredLength} caracteres`,
      pattern: 'Formato inválido'
    };
    
    const errorKey = Object.keys(field.errors)[0];
    return errors[errorKey] || 'Campo inválido';
  }
  
  isFieldValid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return field ? field.valid && field.touched : false;
  }
}