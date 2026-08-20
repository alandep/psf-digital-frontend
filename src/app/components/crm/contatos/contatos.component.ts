import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';

import { CrmMockService } from '../../../../services/crmMockService';
import { ExportService } from '../../../../services/exportService';
import { Contact } from '../../../../types/crm';

@Component({
  selector: 'app-contatos',
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
    MatChipsModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatMenuModule
  ],
  templateUrl: './contatos.component.html',
  styleUrls: ['./contatos.component.scss']
})
export class ContatosComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(CrmMockService);
  private exportService = inject(ExportService);
  private formBuilder = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  contacts: Contact[] = [];
  dataSource = new MatTableDataSource<Contact>([]);
  isLoading = false;

  filterForm!: FormGroup;

  displayedColumns: string[] = [
    'name', 'email', 'phone', 'role', 'customerName', 'status'
  ];

  ngOnInit(): void {
    this.initForms();
    this.loadContacts();
    this.setupFilterListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  private initForms(): void {
    this.filterForm = this.formBuilder.group({
      searchText: [''],
      status: ['']
    });
  }

  private setupFilterListeners(): void {
    this.filterForm.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(() => this.applyFilters());
  }

  loadContacts(): void {
    this.isLoading = true;
    this.service.getContacts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.contacts = data;
          this.dataSource.data = data;
          this.isLoading = false;
        },
        error: () => {
          this.snackBar.open('Erro ao carregar contatos', 'Fechar', { duration: 3000 });
          this.isLoading = false;
        }
      });
  }

  applyFilters(): void {
    const filters = this.filterForm.value;
    let filtered = [...this.contacts];

    if (filters.searchText) {
      const search = filters.searchText.toLowerCase();
      filtered = filtered.filter(c =>
        c.name.toLowerCase().includes(search) ||
        c.email.toLowerCase().includes(search) ||
        c.customerName.toLowerCase().includes(search) ||
        c.role.toLowerCase().includes(search)
      );
    }
    if (filters.status) {
      filtered = filtered.filter(c => c.status === filters.status);
    }

    this.dataSource.data = filtered;
  }

  clearFilters(): void {
    this.filterForm.reset({ searchText: '', status: '' });
  }

  exportPDF(): void {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'role', label: 'Cargo' },
      { key: 'customerName', label: 'Cliente' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToPDF('Contatos', this.dataSource.data, columns, 'contatos');
  }

  exportCSV(): void {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Telefone' },
      { key: 'role', label: 'Cargo' },
      { key: 'customerName', label: 'Cliente' },
      { key: 'status', label: 'Status' }
    ];
    this.exportService.exportToCSV(this.dataSource.data, columns, 'contatos');
  }

  getStatusLabel(status: string): string {
    return status === 'ACTIVE' ? 'Ativo' : 'Inativo';
  }

  getStatusClass(status: string): string {
    return status === 'ACTIVE' ? 'status-active' : 'status-inactive';
  }
}
