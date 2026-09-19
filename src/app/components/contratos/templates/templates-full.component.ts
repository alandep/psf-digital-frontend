import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { ContractTemplatesMockService } from '../../../../services/contractTemplatesMockService';
import { TemplateFullDialogComponent } from './template-edit-dialog/template-full-dialog.component';
import {
  TemplateValidationDialogComponent,
  TemplateValidationDialogData
} from './template-validation-dialog/template-validation-dialog.component';
import {
  ConfirmarAcaoDialogComponent,
  ConfirmDialogData
} from '../../admin/usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';
import {
  ContractTemplate,
  TemplateFilters,
  TemplateFilterOptions,
  CONTRACT_TYPE_LABELS,
  COMMODITY_LABELS
} from '../../../../types/contractTemplates';
import { HasPermissionDirective } from '../../../directives/has-permission.directive';

@Component({
  selector: 'app-templates-full',
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
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatMenuModule,
    MatDividerModule,
    MatDialogModule
  ],
  templateUrl: './templates-full.component.html',
  styleUrls: ['./templates-full.component.scss']
})
export class TemplatesFullComponent implements OnInit {
  private readonly templatesService = inject(ContractTemplatesMockService);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  public templates: ContractTemplate[] = [];
  public filterOptions: TemplateFilterOptions | null = null;
  public isLoading = false;

  // KPIs
  public totalTemplates = 0;
  public activeTemplates = 0;
  public templatesComIA = 0;
  public uniqueCommodities = 0;

  public filtroForm: FormGroup;

  constructor() {
    this.filtroForm = this.fb.group({
      search: [''],
      commodity: [[]],
      active: [null]
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isLoading = true;

    this.templatesService.getFilterOptions().subscribe({
      next: (options) => {
        this.filterOptions = options;
      },
      error: () => {
        this.snackBar.open('Erro ao carregar opções de filtro', 'Fechar', { duration: 3000 });
      }
    });

    this.loadTemplates();
  }

  private loadTemplates(additionalFilters?: Partial<TemplateFilters>): void {
    this.isLoading = true;

    const filters: TemplateFilters = {
      ...additionalFilters
    };

    this.templatesService.getTemplates(filters).subscribe({
      next: (templates) => {
        this.templates = templates;
        this.calculateKPIs();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Erro ao carregar templates', 'Fechar', { duration: 3000 });
      }
    });
  }

  private calculateKPIs(): void {
    this.totalTemplates = this.templates.length;
    this.activeTemplates = this.templates.filter(t => t.active).length;
    this.templatesComIA = this.templates.filter(t => t.ai_config.ai_enabled).length;
    this.uniqueCommodities = new Set(this.templates.map(t => t.commodity)).size;
  }

  public applyFilters(): void {
    const formValue = this.filtroForm.value;

    const filters: TemplateFilters = {
      search: formValue.search || undefined,
      commodity: formValue.commodity?.length ? formValue.commodity : undefined,
      active: formValue.active
    };

    this.loadTemplates(filters);
  }

  public clearFilters(): void {
    this.filtroForm.reset({
      search: '',
      commodity: [],
      active: null
    });

    this.loadTemplates();
  }

  // ========== CREATE / EDIT / VIEW (centered tabbed dialog, ESC closes) ==========

  public openNewTemplate(): void {
    const dialogRef = this.dialog.open(TemplateFullDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'template-dialog-panel',
      data: { isEditMode: false }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.templatesService.createTemplate(result).subscribe({
        next: () => {
          this.snackBar.open('Template criado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: () => {
          this.snackBar.open('Erro ao criar template', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  public editTemplate(template: ContractTemplate): void {
    const dialogRef = this.dialog.open(TemplateFullDialogComponent, {
      width: '1100px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      panelClass: 'template-dialog-panel',
      data: { isEditMode: true, template }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (!result) {
        return;
      }

      this.templatesService.updateTemplate(template.template_id!, result).subscribe({
        next: () => {
          this.snackBar.open('Template atualizado com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: () => {
          this.snackBar.open('Erro ao atualizar template', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  public viewTemplate(template: ContractTemplate): void {
    this.editTemplate(template);
  }

  public generateContract(template: ContractTemplate): void {
    this.snackBar.open('Gerando contrato a partir do template...', 'Fechar', { duration: 3000 });
    this.router.navigate(['/home-logged/contratos/novo']);
  }

  public duplicateTemplate(template: ContractTemplate): void {
    const newName = `${template.template_name} - Cópia`;

    this.templatesService.duplicateTemplate(template.template_id!, newName).subscribe({
      next: () => {
        this.snackBar.open('Template duplicado com sucesso!', 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: () => {
        this.snackBar.open('Erro ao duplicar template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public createVersion(template: ContractTemplate): void {
    this.templatesService.createVersion(template.template_id!).subscribe({
      next: (newVersion) => {
        this.snackBar.open(`Nova versão ${newVersion.version} criada!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: () => {
        this.snackBar.open('Erro ao criar nova versão', 'Fechar', { duration: 3000 });
      }
    });
  }

  public validateTemplate(template: ContractTemplate): void {
    this.templatesService.validateTemplate(template).subscribe({
      next: (result) => {
        const data: TemplateValidationDialogData = {
          templateName: template.template_name,
          isValid: result.isValid,
          errors: result.errors ?? [],
          warnings: result.warnings ?? []
        };

        this.dialog.open(TemplateValidationDialogComponent, {
          width: '560px',
          maxWidth: '92vw',
          autoFocus: false,
          panelClass: 'template-validation-dialog-panel',
          data
        });
      },
      error: () => {
        this.snackBar.open('Erro ao validar template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public analyzeRisk(template: ContractTemplate): void {
    this.templatesService.analyzeRisk(template).subscribe({
      next: (analysis) => {
        const riskLevel = analysis.overallRisk;
        const message = `Risco ${riskLevel.toUpperCase()}: ${analysis.risks.length} riscos identificados`;
        this.snackBar.open(message, 'Fechar', { duration: 5000 });
      },
      error: () => {
        this.snackBar.open('Erro ao analisar riscos', 'Fechar', { duration: 3000 });
      }
    });
  }

  public toggleActive(template: ContractTemplate): void {
    const newStatus = !template.active;

    this.templatesService.updateTemplate(template.template_id!, { active: newStatus }).subscribe({
      next: () => {
        this.snackBar.open(`Template ${newStatus ? 'ativado' : 'desativado'} com sucesso!`, 'Fechar', { duration: 3000 });
        this.loadTemplates();
      },
      error: () => {
        this.snackBar.open('Erro ao alterar status do template', 'Fechar', { duration: 3000 });
      }
    });
  }

  public deleteTemplate(template: ContractTemplate): void {
    const data: ConfirmDialogData = {
      title: 'Excluir Template',
      message: `Tem certeza que deseja excluir o template "${template.template_name}"? Esta ação não pode ser desfeita.`,
      icon: 'delete',
      iconColor: '#f44336',
      confirmText: 'Excluir',
      confirmColor: 'warn'
    };

    const dialogRef = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '440px',
      data
    });

    dialogRef.afterClosed().subscribe((confirmed) => {
      if (!confirmed) {
        return;
      }

      this.templatesService.deleteTemplate(template.template_id!).subscribe({
        next: () => {
          this.snackBar.open('Template excluído com sucesso!', 'Fechar', { duration: 3000 });
          this.loadTemplates();
        },
        error: () => {
          this.snackBar.open('Erro ao excluir template', 'Fechar', { duration: 3000 });
        }
      });
    });
  }

  // ========== HELPER METHODS ==========

  public getContractTypeLabel(type: string): string {
    return CONTRACT_TYPE_LABELS[type as keyof typeof CONTRACT_TYPE_LABELS] || type;
  }

  public getCommodityLabel(commodity: string): string {
    return COMMODITY_LABELS[commodity as keyof typeof COMMODITY_LABELS] || commodity;
  }

  public formatNumber(value: number): string {
    return new Intl.NumberFormat('pt-BR').format(value || 0);
  }
}
