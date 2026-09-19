import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

import { ConstrutorTelasMockService } from '../../../../services/construtorTelasMockService';
import { WidgetCatalogItem, ScreenWidget, LayoutType } from '../../../../types/construtor-telas';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-nova-tela',
  standalone: true,
  imports: [
    HasPermissionDirective,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  templateUrl: './nova-tela.component.html',
  styleUrls: ['./nova-tela.component.scss']
})
export class NovaTelaComponent implements OnInit, OnDestroy {

  private service = inject(ConstrutorTelasMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  screenForm!: FormGroup;
  widgetCatalog: WidgetCatalogItem[] = [];
  addedWidgets: ScreenWidget[] = [];
  layouts: { value: LayoutType; label: string }[] = [];

  ngOnInit(): void {
    this.screenForm = this.fb.group({
      name: ['', Validators.required],
      description: [''],
      layout: ['2_COLUMNS', Validators.required]
    });
    this.widgetCatalog = this.service.getWidgetCatalog();
    this.layouts = this.service.getLayouts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  addWidget(widget: WidgetCatalogItem): void {
    const newWidget: ScreenWidget = {
      id: `widget-${Date.now()}-${this.addedWidgets.length}`,
      type: widget.type,
      title: widget.name,
      config: {},
      position: this.addedWidgets.length
    };
    this.addedWidgets.push(newWidget);
    this.snackBar.open(`Widget "${widget.name}" adicionado!`, 'OK', { duration: 2000 });
  }

  removeWidget(index: number): void {
    this.addedWidgets.splice(index, 1);
    this.addedWidgets.forEach((w, i) => w.position = i);
  }

  moveWidget(index: number, direction: 'up' | 'down'): void {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= this.addedWidgets.length) return;
    const temp = this.addedWidgets[index];
    this.addedWidgets[index] = this.addedWidgets[newIndex];
    this.addedWidgets[newIndex] = temp;
    this.addedWidgets.forEach((w, i) => w.position = i);
  }

  saveScreen(): void {
    if (!this.screenForm.valid) {
      this.snackBar.open('Preencha o nome da tela', 'OK', { duration: 3000 });
      return;
    }
    if (this.addedWidgets.length === 0) {
      this.snackBar.open('Adicione pelo menos um widget', 'OK', { duration: 3000 });
      return;
    }
    const formData = this.screenForm.value;
    this.service.createScreen({
      name: formData.name,
      description: formData.description,
      layout: formData.layout,
      widgets: this.addedWidgets
    }).pipe(takeUntil(this.destroy$))
      .subscribe(screen => {
        this.snackBar.open(`Tela "${screen.name}" salva com sucesso!`, 'OK', { duration: 3000 });
        this.screenForm.reset({ layout: '2_COLUMNS' });
        this.addedWidgets = [];
      });
  }

  getWidgetIcon(type: string): string {
    const w = this.widgetCatalog.find(c => c.type === type);
    return w?.icon || 'widgets';
  }
}
