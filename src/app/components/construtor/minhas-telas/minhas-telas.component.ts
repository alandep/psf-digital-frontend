import { Component, OnInit, OnDestroy, inject, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatSortModule, MatSort } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ConstrutorTelasMockService } from '../../../../services/construtorTelasMockService';
import { ExportService } from '../../../../services/exportService';
import { CustomScreen, LayoutType, ScreenStatus } from '../../../../types/construtor-telas';

@Component({
  selector: 'app-minhas-telas',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  templateUrl: './minhas-telas.component.html',
  styleUrls: ['./minhas-telas.component.scss']
})
export class MinhasTelasComponent implements OnInit, OnDestroy, AfterViewInit {

  private service = inject(ConstrutorTelasMockService);
  private exportService = inject(ExportService);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  dataSource = new MatTableDataSource<CustomScreen>([]);

  displayedColumns: string[] = [
    'name', 'description', 'layout', 'widgets', 'status', 'createdAt', 'updatedAt', 'actions'
  ];

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.service.getScreens()
      .pipe(takeUntil(this.destroy$))
      .subscribe(screens => this.dataSource.data = screens);
  }

  getLayoutLabel(layout: LayoutType): string {
    const map: Record<LayoutType, string> = {
      '1_COLUMN': '1 Coluna',
      '2_COLUMNS': '2 Colunas',
      '3_COLUMNS': '3 Colunas'
    };
    return map[layout] || layout;
  }

  getStatusLabel(status: ScreenStatus): string {
    const map: Record<ScreenStatus, string> = {
      'PUBLICADA': 'Publicada',
      'RASCUNHO': 'Rascunho',
      'ARQUIVADA': 'Arquivada'
    };
    return map[status] || status;
  }

  editScreen(screen: CustomScreen): void {
    this.snackBar.open(`Editando: ${screen.name}`, 'OK', { duration: 3000 });
  }

  duplicateScreen(screen: CustomScreen): void {
    this.service.duplicateScreen(screen.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(copy => {
        if (copy) {
          this.snackBar.open(`Tela duplicada: ${copy.name}`, 'OK', { duration: 3000 });
          this.loadData();
        }
      });
  }

  deleteScreen(screen: CustomScreen): void {
    this.service.deleteScreen(screen.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe(ok => {
        if (ok) {
          this.snackBar.open(`Tela "${screen.name}" excluída`, 'OK', { duration: 3000 });
          this.loadData();
        }
      });
  }

  exportCSV(): void {
    const columns = [
      { key: 'name', label: 'Nome' },
      { key: 'description', label: 'Descrição' },
      { key: 'layout', label: 'Layout' },
      { key: 'status', label: 'Status' },
      { key: 'createdAt', label: 'Criada em' },
      { key: 'updatedAt', label: 'Modificada em' },
    ];
    this.exportService.exportToCSV(this.dataSource.filteredData, columns, 'minhas-telas');
    this.snackBar.open('CSV exportado com sucesso!', 'OK', { duration: 3000 });
  }
}
