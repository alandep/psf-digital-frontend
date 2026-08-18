import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

// Services and Types
import { ConfiguracoesMockService } from '../../../../services/configuracoesMockService';
import { ConfigGroup, ConfigCategory, ConfigItem } from '../../../../types/admin-configuracoes';

@Component({
  selector: 'app-configuracoes',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatListModule,
    MatSnackBarModule,
    MatProgressBarModule,
    MatTooltipModule,
    MatDividerModule
  ],
  templateUrl: './configuracoes.component.html',
  styleUrls: ['./configuracoes.component.scss']
})
export class ConfiguracoesComponent implements OnInit, OnDestroy {

  private configService = inject(ConfiguracoesMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);
  private destroy$ = new Subject<void>();

  configGroups: ConfigGroup[] = [];
  selectedCategory: ConfigCategory = 'GERAL';
  selectedGroup: ConfigGroup | null = null;
  configForm!: FormGroup;
  isLoading = false;
  hasChanges = false;

  ngOnInit(): void {
    this.loadData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadData(): void {
    this.isLoading = true;
    this.configService.getConfigGroups()
      .pipe(takeUntil(this.destroy$))
      .subscribe(groups => {
        this.configGroups = groups;
        this.selectCategory(this.selectedCategory);
        this.isLoading = false;
      });
  }

  selectCategory(category: ConfigCategory): void {
    this.selectedCategory = category;
    this.selectedGroup = this.configGroups.find(g => g.category === category) || null;
    this.buildForm();
  }

  private buildForm(): void {
    if (!this.selectedGroup) return;

    const formControls: Record<string, any> = {};
    this.selectedGroup.items.forEach(item => {
      formControls[item.key] = [item.value];
    });

    this.configForm = this.fb.group(formControls);
    this.hasChanges = false;

    this.configForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasChanges = true;
      });
  }

  saveChanges(): void {
    if (!this.selectedGroup) return;

    const updatedItems: ConfigItem[] = this.selectedGroup.items.map(item => ({
      ...item,
      value: this.configForm.get(item.key)?.value,
      lastModified: new Date(),
      modifiedBy: 'admin@empresa.com'
    }));

    this.configService.saveConfig(updatedItems)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.hasChanges = false;
        this.snackBar.open('Configurações salvas com sucesso!', 'OK', { duration: 3000 });
      });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
