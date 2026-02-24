import { Component, inject, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDividerModule } from '@angular/material/divider';
import { CommonModule } from '@angular/common';
import { VisitaDomiciliar } from '../visita-domiciliar.component';

interface DialogData {
  visita: VisitaDomiciliar | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-visita-domiciliar-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>{{data.isEdit ? 'edit' : 'add'}}</mat-icon>
        {{data.isEdit ? 'Editar' : 'Nova'}} Visita Domiciliar
      </h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <mat-dialog-content class="dialog-content">
      <form [formGroup]="visitaForm" class="form-container">
        
        <!-- Seção Principal -->
        <div class="form-section">
          <h3>Informações Básicas</h3>
          <div class="form-grid">
            
            <mat-form-field appearance="outline">
              <mat-label>Nº do Cartão SUS do Profissional</mat-label>
              <mat-icon matPrefix>credit_card</mat-icon>
              <input matInput formControlName="cartaoSusProfissional" maxlength="15">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cód. CNES Unidade</mat-label>
              <mat-icon matPrefix>business</mat-icon>
              <input matInput formControlName="codigoCnes" maxlength="7">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Cód. Equipe (INE)</mat-label>
              <mat-icon matPrefix>group</mat-icon>
              <input matInput formControlName="codigoEquipe" maxlength="10">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Microárea</mat-label>
              <mat-icon matPrefix>place</mat-icon>
              <input matInput formControlName="microarea">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data</mat-label>
              <mat-icon matPrefix>calendar_today</mat-icon>
              <input matInput [matDatepicker]="picker1" formControlName="data">
              <mat-datepicker-toggle matIconSuffix [for]="picker1"></mat-datepicker-toggle>
              <mat-datepicker #picker1></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Turno</mat-label>
              <mat-icon matPrefix>schedule</mat-icon>
              <mat-select formControlName="turno">
                <mat-option value="manha">Manhã</mat-option>
                <mat-option value="tarde">Tarde</mat-option>
                <mat-option value="noite">Noite</mat-option>
              </mat-select>
            </mat-form-field>

          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Seção Endereço -->
        <div class="form-section">
          <h3>Informações do Endereço</h3>
          <div class="form-grid">
            
            <mat-form-field appearance="outline">
              <mat-label>Tipo de Imóvel</mat-label>
              <mat-icon matPrefix>home</mat-icon>
              <mat-select formControlName="tipoImovel">
                <mat-option value="casa">Casa</mat-option>
                <mat-option value="apartamento">Apartamento</mat-option>
                <mat-option value="comercio">Comércio</mat-option>
                <mat-option value="outros">Outros</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Tipo de Logradouro</mat-label>
              <mat-icon matPrefix>map</mat-icon>
              <mat-select formControlName="tipoLogradouro">
                <mat-option value="rua">Rua</mat-option>
                <mat-option value="avenida">Avenida</mat-option>
                <mat-option value="travessa">Travessa</mat-option>
                <mat-option value="outros">Outros</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nome do Logradouro</mat-label>
              <mat-icon matPrefix>place</mat-icon>
              <input matInput formControlName="nomeLogradouro">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Número</mat-label>
              <mat-icon matPrefix>tag</mat-icon>
              <input matInput formControlName="numero">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Complemento</mat-label>
              <mat-icon matPrefix>info</mat-icon>
              <input matInput formControlName="complemento">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Desfecho</mat-label>
              <mat-icon matPrefix>assignment_turned_in</mat-icon>
              <mat-select formControlName="desfecho">
                <mat-option value="realizada">Visita Realizada</mat-option>
                <mat-option value="recusada">Visita Recusada</mat-option>
                <mat-option value="ausente">Morador Ausente</mat-option>
              </mat-select>
            </mat-form-field>

          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Seção Responsável -->
        <div class="form-section">
          <h3>Informações do Responsável</h3>
          <div class="form-grid">
            
            <mat-form-field appearance="outline">
              <mat-label>Nº Prontuário</mat-label>
              <mat-icon matPrefix>folder</mat-icon>
              <input matInput formControlName="numeroProntuario">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Nº Cartão SUS do Responsável</mat-label>
              <mat-icon matPrefix>credit_card</mat-icon>
              <input matInput formControlName="cartaoSusResponsavel" maxlength="15">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Data de Nascimento</mat-label>
              <mat-icon matPrefix>cake</mat-icon>
              <input matInput [matDatepicker]="picker2" formControlName="dataNascimento">
              <mat-datepicker-toggle matIconSuffix [for]="picker2"></mat-datepicker-toggle>
              <mat-datepicker #picker2></mat-datepicker>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Sexo</mat-label>
              <mat-icon matPrefix>person</mat-icon>
              <mat-select formControlName="sexo">
                <mat-option value="masculino">Masculino</mat-option>
                <mat-option value="feminino">Feminino</mat-option>
                <mat-option value="outros">Outros</mat-option>
              </mat-select>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Peso do Cidadão (KG)</mat-label>
              <mat-icon matPrefix>fitness_center</mat-icon>
              <input matInput type="number" step="0.1" formControlName="peso">
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Altura do Cidadão (CM)</mat-label>
              <mat-icon matPrefix>height</mat-icon>
              <input matInput type="number" formControlName="altura">
            </mat-form-field>

          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Seção Visita Compartilhada -->
        <div class="form-section">
          <div class="toggle-section">
            <label>Visita Compartilhada com Outro Profissional?</label>
            <mat-slide-toggle formControlName="visitaCompartilhada">
              {{visitaForm.get('visitaCompartilhada')?.value ? 'Sim' : 'Não'}}
            </mat-slide-toggle>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Seção Motivo da Visita -->
        <div class="form-section">
          <h3>Motivo da Visita</h3>
          
          <div class="checkbox-group">
            <h4>Cadastramento/Atualização</h4>
            <mat-checkbox formControlName="motivoCadastramento">Cadastramento/Atualização</mat-checkbox>
            <mat-checkbox formControlName="motivoVisitaPeriodica">Visita Periódica</mat-checkbox>
          </div>

          <div class="checkbox-group">
            <h4>Busca Ativa</h4>
            <mat-checkbox formControlName="buscaConsulta">Consulta</mat-checkbox>
            <mat-checkbox formControlName="buscaExame">Exame</mat-checkbox>
            <mat-checkbox formControlName="buscaVacina">Vacina</mat-checkbox>
            <mat-checkbox formControlName="buscaBolsaFamilia">Condicionalidades do Bolsa Família</mat-checkbox>
          </div>

          <div class="checkbox-group">
            <h4>Acompanhamento</h4>
            <mat-checkbox formControlName="acompGestante">Gestante</mat-checkbox>
            <mat-checkbox formControlName="acompPuerpera">Puérpera</mat-checkbox>
            <mat-checkbox formControlName="acompRecemNascido">Recém-Nascido</mat-checkbox>
            <mat-checkbox formControlName="acompCrianca">Criança</mat-checkbox>
            <mat-checkbox formControlName="acompDesnutricao">Pessoa Com Desnutrição</mat-checkbox>
            <mat-checkbox formControlName="acompReabilitacao">Pessoa em Reabilitação ou Com Deficiência</mat-checkbox>
            <mat-checkbox formControlName="acompHipertensao">Pessoa Com Hipertensão</mat-checkbox>
            <mat-checkbox formControlName="acompDiabetes">Pessoa com Diabetes</mat-checkbox>
            <mat-checkbox formControlName="acompAsma">Pessoa Com Asma</mat-checkbox>
            <mat-checkbox formControlName="acompDpoc">Pessoa com DPOC/Enfisema</mat-checkbox>
            <mat-checkbox formControlName="acompCancer">Pessoa Com Câncer</mat-checkbox>
            <mat-checkbox formControlName="acompCronicas">Pessoa Com Outras Doenças Crônicas</mat-checkbox>
            <mat-checkbox formControlName="acompHanseniase">Pessoa Com Hanseníase</mat-checkbox>
            <mat-checkbox formControlName="acompTuberculose">Pessoa Com Tuberculose</mat-checkbox>
            <mat-checkbox formControlName="acompRespiratorios">Sintomáticos Respiratórios</mat-checkbox>
            <mat-checkbox formControlName="acompTabagista">Tabagista</mat-checkbox>
            <mat-checkbox formControlName="acompDomiciliados">Domiciliados/Acamados</mat-checkbox>
            <mat-checkbox formControlName="acompVulnerabilidade">Condições de Vulnerabilidade Social</mat-checkbox>
            <mat-checkbox formControlName="acompBolsaFamiliaAcomp">Condicionalidades do Bolsa Família</mat-checkbox>
            <mat-checkbox formControlName="acompSaudeMental">Saúde Mental</mat-checkbox>
            <mat-checkbox formControlName="acompAlcool">Usuário de Álcool</mat-checkbox>
            <mat-checkbox formControlName="acompDrogas">Usuário de Outras Drogas</mat-checkbox>
          </div>

          <div class="checkbox-group">
            <h4>Controle de Ambientes/Vetores</h4>
            <mat-checkbox formControlName="controleEducativa">Ação Educativa</mat-checkbox>
            <mat-checkbox formControlName="controleImovelFoco">Imóvel com Foco</mat-checkbox>
            <mat-checkbox formControlName="controleMecanica">Ação Mecânica</mat-checkbox>
            <mat-checkbox formControlName="controleFocal">Tratamento Focal</mat-checkbox>
          </div>

          <div class="checkbox-group">
            <h4>Outros</h4>
            <mat-checkbox formControlName="outrosEgresso">Egresso de Internação</mat-checkbox>
            <mat-checkbox formControlName="outrosConvite">Convite Atividades Coletivas/Campanha de Saúde</mat-checkbox>
            <mat-checkbox formControlName="outrosOrientacao">Orientação/Prevenção</mat-checkbox>
            <mat-checkbox formControlName="outrosGerais">Outros</mat-checkbox>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Seção Microárea -->
        <div class="form-section">
          <div class="toggle-section">
            <label>Cidadão Fora da Microárea?</label>
            <mat-slide-toggle formControlName="foraMicroarea" (change)="onForaMicroareaChange($event)">
              {{visitaForm.get('foraMicroarea')?.value ? 'Sim' : 'Não'}}
            </mat-slide-toggle>
          </div>

          <mat-form-field appearance="outline" 
                        *ngIf="!visitaForm.get('foraMicroarea')?.value"
                        class="full-width">
            <mat-label>Microárea Cidadão</mat-label>
            <mat-icon matPrefix>place</mat-icon>
            <input matInput formControlName="microareaCidadao">
          </mat-form-field>
        </div>

      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button 
              type="button" 
              (click)="onCancel()"
              class="cancel-button">
        <mat-icon>cancel</mat-icon>
        Cancelar
      </button>
      
      <button mat-raised-button 
              color="primary" 
              type="button"
              (click)="onSubmit()"
              [disabled]="isLoading"
              class="save-button">
        <mat-icon>{{isLoading ? 'hourglass_empty' : 'save'}}</mat-icon>
        {{isLoading ? 'Salvando...' : 'Salvar'}}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e0e0e0;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      font-weight: 600;
      color: #e91e63;
      font-size: 1.5rem;
    }

    .dialog-content {
      max-height: calc(90vh - 150px);
      overflow-y: auto;
      padding: 0 8px 0 0 !important;
    }

    .form-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }

    .form-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .form-section h3 {
      color: #e91e63;
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
      border-bottom: 2px solid #e91e63;
      padding-bottom: 8px;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 16px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .toggle-section {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .toggle-section label {
      font-weight: 500;
      color: #333;
      font-size: 1rem;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
      margin-bottom: 16px;
    }

    .checkbox-group h4 {
      color: #e91e63;
      margin: 0 0 12px 0;
      font-size: 1rem;
      font-weight: 600;
      border-bottom: 1px solid #e91e63;
      padding-bottom: 4px;
    }

    .checkbox-group mat-checkbox {
      margin: 4px 0;
    }

    .dialog-actions {
      padding: 24px 0 0 0;
      border-top: 1px solid #e0e0e0;
      gap: 16px;
      margin-top: 24px;
    }

    .cancel-button,
    .save-button {
      display: flex !important;
      align-items: center !important;
      gap: 8px !important;
      font-weight: 500;
      height: 44px;
      padding: 0 24px;
      border-radius: 8px;
      transition: all 0.3s ease;
      min-width: 120px;
    }

    .save-button {
      background: #e91e63 !important;
      color: white !important;
    }

    mat-divider {
      margin: 16px 0;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .dialog-actions {
        flex-direction: column;
      }
      
      .cancel-button,
      .save-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class VisitaDomiciliarEditDialogComponent implements OnInit {
  private fb = inject(FormBuilder);
  
  isLoading = false;
  visitaForm!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<VisitaDomiciliarEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.loadData();
  }

  private initializeForm(): void {
    this.visitaForm = this.fb.group({
      // Informações Básicas
      cartaoSusProfissional: ['', Validators.required],
      codigoCnes: ['', Validators.required],
      codigoEquipe: ['', Validators.required],
      microarea: ['', Validators.required],
      data: [new Date(), Validators.required],
      turno: ['', Validators.required],
      
      // Endereço
      tipoImovel: ['', Validators.required],
      tipoLogradouro: ['', Validators.required],
      nomeLogradouro: ['', Validators.required],
      numero: [''],
      complemento: [''],
      desfecho: ['', Validators.required],
      
      // Responsável
      numeroProntuario: [''],
      cartaoSusResponsavel: ['', Validators.required],
      dataNascimento: [''],
      sexo: [''],
      peso: [''],
      altura: [''],
      
      // Visita Compartilhada
      visitaCompartilhada: [false],
      
      // Motivos - Cadastramento
      motivoCadastramento: [false],
      motivoVisitaPeriodica: [false],
      
      // Motivos - Busca Ativa
      buscaConsulta: [false],
      buscaExame: [false],
      buscaVacina: [false],
      buscaBolsaFamilia: [false],
      
      // Motivos - Acompanhamento
      acompGestante: [false],
      acompPuerpera: [false],
      acompRecemNascido: [false],
      acompCrianca: [false],
      acompDesnutricao: [false],
      acompReabilitacao: [false],
      acompHipertensao: [false],
      acompDiabetes: [false],
      acompAsma: [false],
      acompDpoc: [false],
      acompCancer: [false],
      acompCronicas: [false],
      acompHanseniase: [false],
      acompTuberculose: [false],
      acompRespiratorios: [false],
      acompTabagista: [false],
      acompDomiciliados: [false],
      acompVulnerabilidade: [false],
      acompBolsaFamiliaAcomp: [false],
      acompSaudeMental: [false],
      acompAlcool: [false],
      acompDrogas: [false],
      
      // Controle de Ambientes/Vetores
      controleEducativa: [false],
      controleImovelFoco: [false],
      controleMecanica: [false],
      controleFocal: [false],
      
      // Outros
      outrosEgresso: [false],
      outrosConvite: [false],
      outrosOrientacao: [false],
      outrosGerais: [false],
      
      // Microárea
      foraMicroarea: [false],
      microareaCidadao: ['']
    });
  }

  private loadData(): void {
    if (this.data.visita) {
      // Carregar dados existentes no formulário
      // Implementar quando houver dados reais
    }
  }

  onForaMicroareaChange(event: any): void {
    const foraMicroarea = event.checked;
    const microareaControl = this.visitaForm.get('microareaCidadao');
    
    if (foraMicroarea) {
      microareaControl?.disable();
      microareaControl?.setValue('');
    } else {
      microareaControl?.enable();
    }
  }

  onSubmit(): void {
    if (this.visitaForm.valid) {
      this.isLoading = true;
      
      // Simular chamada de API
      setTimeout(() => {
        console.log('Dados da visita:', this.visitaForm.value);
        this.isLoading = false;
        this.dialogRef.close({ 
          success: true, 
          data: this.visitaForm.value,
          isEdit: this.data.isEdit 
        });
      }, 2000);
    }
  }

  onCancel(): void {
    const hasChanges = this.visitaForm.dirty;
    
    if (hasChanges) {
      const confirmed = confirm('Existem dados não salvos. Deseja realmente fechar? Os dados serão perdidos.');
      if (confirmed) {
        this.dialogRef.close();
      }
    } else {
      this.dialogRef.close();
    }
  }
}
