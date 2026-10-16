import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PaisComboComponent } from '../../../shared/pais-combo/pais-combo.component';
import { EstadoComboComponent } from '../../../shared/estado-combo/estado-combo.component';
import { CidadeComboComponent } from '../../../shared/cidade-combo/cidade-combo.component';

/** Plan -> enabled modules preview (mirrors the backend plan_feature default matrix). */
interface PlanoResumo {
  code: string;
  label: string;
  modulos: string[];
  usuarios: string;
  ia: string;
}

@Component({
  selector: 'app-nova-empresa-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    PaisComboComponent,
    EstadoComboComponent,
    CidadeComboComponent
  ],
  template: `
    <div class="nova-empresa-dialog">
      <div class="dialog-header">
        <div class="header-left">
          <mat-icon class="header-icon">domain_add</mat-icon>
          <div>
            <h2>Nova Empresa</h2>
            <p class="header-subtitle">Preencha os dados para cadastrar uma nova empresa</p>
          </div>
        </div>
        <button mat-icon-button (click)="cancel()" class="close-btn">
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <div class="dialog-body">
        <form [formGroup]="form" class="form-grid">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Razão Social</mat-label>
            <input matInput formControlName="razaoSocial" placeholder="Razão social da empresa">
            <mat-icon matPrefix>business</mat-icon>
            <mat-error>Razão Social é obrigatória</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Nome Fantasia</mat-label>
            <input matInput formControlName="nomeFantasia" placeholder="Nome fantasia">
            <mat-icon matPrefix>store</mat-icon>
            <mat-error>Nome Fantasia é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>CNPJ</mat-label>
            <input matInput formControlName="cnpj" placeholder="00.000.000/0000-00">
            <mat-icon matPrefix>badge</mat-icon>
            <mat-error>CNPJ é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select formControlName="tipo">
              @for (t of tipos; track t) {
                <mat-option [value]="t">{{ t }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
          </mat-form-field>

          <app-pais-combo class="full-width" formControlName="pais" label="País"></app-pais-combo>

          <app-estado-combo formControlName="estado" label="Estado" (ufChange)="onUfChange($event)"></app-estado-combo>

          <app-cidade-combo formControlName="cidade" label="Cidade" [uf]="ufSelecionada"></app-cidade-combo>

          <mat-form-field appearance="outline">
            <mat-label>Responsável</mat-label>
            <input matInput formControlName="responsavel" placeholder="Nome do responsável">
            <mat-icon matPrefix>person</mat-icon>
            <mat-error>Responsável é obrigatório</mat-error>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Email</mat-label>
            <input matInput formControlName="email" placeholder="contato@empresa.com.br" type="email">
            <mat-icon matPrefix>email</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Telefone</mat-label>
            <input matInput formControlName="telefone" placeholder="(11) 3456-7890">
            <mat-icon matPrefix>phone</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Plano</mat-label>
            <mat-select formControlName="plano">
              @for (p of planos; track p.code) {
                <mat-option [value]="p.code">{{ p.label }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>workspace_premium</mat-icon>
          </mat-form-field>

          @if (planoResumo) {
            <div class="plano-resumo full-width">
              <div class="plano-resumo-header">
                <mat-icon>auto_awesome</mat-icon>
                <span>Parametrização automática do plano {{ planoResumo.label }}</span>
              </div>
              <div class="plano-modulos">
                @for (m of planoResumo.modulos; track m) {
                  <span class="modulo-chip"><mat-icon>check_circle</mat-icon>{{ m }}</span>
                }
              </div>
              <div class="plano-limites">
                <span><mat-icon>group</mat-icon>Usuários: {{ planoResumo.usuarios }}</span>
                <span><mat-icon>smart_toy</mat-icon>Créditos de IA: {{ planoResumo.ia }}</span>
              </div>
              <p class="plano-nota">Os módulos e limites acima serão aplicados automaticamente à empresa ao salvar.</p>
            </div>
          }
        </form>
      </div>

      <div class="dialog-footer">
        <button mat-button (click)="cancel()" class="cancel-btn">Cancelar</button>
        <button mat-raised-button color="primary" [disabled]="form.invalid" (click)="save()" class="save-btn">
          <mat-icon>save</mat-icon> Salvar Empresa
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    .nova-empresa-dialog { display: flex; flex-direction: column; height: 100%; max-height: 80vh; overflow: hidden; }
    .dialog-header { display: flex; align-items: center; justify-content: space-between; padding: 20px 28px 14px; border-bottom: 1px solid #e0e0e0; flex-shrink: 0; }
    .dialog-header .header-left { display: flex; align-items: center; gap: 14px; }
    .dialog-header .header-icon { font-size: 36px; width: 36px; height: 36px; color: #283593; background: rgba(40, 53, 147, 0.08); border-radius: 50%; padding: 8px; box-sizing: content-box; }
    .dialog-header h2 { margin: 0; font-weight: 500; font-size: 1.4rem; color: #283593; line-height: 1.2; }
    .dialog-header .header-subtitle { margin: 2px 0 0; font-size: 0.85rem; color: #666; }
    .dialog-header .close-btn { color: #999; }
    .dialog-header .close-btn:hover { color: #333; }
    .dialog-body { padding: 20px 28px; overflow-y: auto; flex: 1; min-height: 0; }
    .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
    .form-grid .full-width { grid-column: 1 / -1; }
    .plano-resumo { background: #f5f7ff; border: 1px solid #d7defb; border-radius: 10px; padding: 14px 16px; margin-top: 6px; }
    .plano-resumo-header { display: flex; align-items: center; gap: 8px; font-weight: 600; color: #283593; margin-bottom: 10px; }
    .plano-resumo-header mat-icon { color: #3f51b5; }
    .plano-modulos { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 10px; }
    .modulo-chip { display: inline-flex; align-items: center; gap: 4px; background: #fff; border: 1px solid #c5cae9; color: #283593; border-radius: 16px; padding: 3px 10px; font-size: 0.8rem; }
    .modulo-chip mat-icon { font-size: 16px; width: 16px; height: 16px; color: #43a047; }
    .plano-limites { display: flex; gap: 18px; font-size: 0.82rem; color: #555; }
    .plano-limites span { display: inline-flex; align-items: center; gap: 5px; }
    .plano-limites mat-icon { font-size: 17px; width: 17px; height: 17px; color: #5c6bc0; }
    .plano-nota { margin: 10px 0 0; font-size: 0.75rem; color: #888; }
    .dialog-footer { display: flex; justify-content: flex-end; align-items: center; gap: 12px; padding: 16px 28px; border-top: 1px solid #e0e0e0; flex-shrink: 0; background: #fafafa; }
    .dialog-footer .cancel-btn { color: #666; }
    .dialog-footer .save-btn { min-width: 160px; height: 40px; font-weight: 500; }
    @media (max-width: 600px) { .form-grid { grid-template-columns: 1fr; } .dialog-header { padding: 16px 20px 12px; } .dialog-body { padding: 16px 20px; } .dialog-footer { padding: 12px 20px; } }
  `]
})
export class NovaEmpresaDialogComponent {
  private dialogRef = inject(MatDialogRef<NovaEmpresaDialogComponent>);
  private fb = inject(FormBuilder);

  form: FormGroup;
  tipos = ['EXPORTADOR', 'TRADING', 'COOPERATIVA', 'INDÚSTRIA', 'OPERADOR_LOGÍSTICO'];
  ufSelecionada = '';

  planos: PlanoResumo[] = [
    { code: 'START', label: 'EIP Start', modulos: ['Exportações', 'NCM', 'Documentos'], usuarios: '3', ia: '500/mês' },
    { code: 'BUSINESS', label: 'EIP Business', modulos: ['Exportações', 'NCM', 'Documentos', 'Compliance', 'Logística'], usuarios: '15', ia: '5.000/mês' },
    { code: 'PRO', label: 'EIP Pro', modulos: ['Exportações', 'NCM', 'Documentos', 'Compliance', 'Logística', 'Financeiro', 'CRM', 'Inteligência', 'API'], usuarios: '50', ia: '20.000/mês' },
    { code: 'ENTERPRISE', label: 'EIP Enterprise', modulos: ['Todos os módulos'], usuarios: 'Ilimitado', ia: 'Ilimitado' }
  ];

  constructor() {
    this.form = this.fb.group({
      razaoSocial: ['', Validators.required],
      nomeFantasia: ['', Validators.required],
      cnpj: ['', Validators.required],
      tipo: ['EXPORTADOR'],
      pais: ['Brasil'],
      estado: [''],
      cidade: [''],
      responsavel: ['', Validators.required],
      email: [''],
      telefone: [''],
      plano: ['BUSINESS']
    });
  }

  get planoResumo(): PlanoResumo | undefined {
    return this.planos.find(p => p.code === this.form.get('plano')?.value);
  }

  onUfChange(uf: string): void {
    this.ufSelecionada = uf;
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  save(): void {
    if (this.form.valid) {
      this.dialogRef.close(this.form.value);
    }
  }
}
