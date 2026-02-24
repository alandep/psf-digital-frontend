import { Component, inject, Inject, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { CadastroIndividual } from '../cadastro-individual.component';

interface DialogData {
  cadastro: CadastroIndividual | null;
  isEdit: boolean;
}

@Component({
  selector: 'app-cadastro-individual-edit-dialog',
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
    MatTabsModule,
    MatSlideToggleModule,
    MatCheckboxModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  template: `
    <div class="dialog-header">
      <h2 mat-dialog-title>
        <mat-icon>{{data.isEdit ? 'edit' : 'add'}}</mat-icon>
        {{data.isEdit ? 'Editar' : 'Novo'}} Cadastro Individual
      </h2>
      <button mat-icon-button 
              class="close-button" 
              (click)="onCancel()"
              aria-label="Fechar">
        <mat-icon>close</mat-icon>
      </button>
    </div>
    
    <mat-dialog-content class="dialog-content">
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="full-height-tabs">
        
        <!-- Aba 1: Cadastro Individual -->
        <mat-tab label="Cadastro Individual">
          <div class="tab-content">
            <form [formGroup]="cadastroForm" class="form-grid">
              
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
                <input matInput formControlName="microarea" maxlength="50">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data</mat-label>
                <mat-icon matPrefix>calendar_today</mat-icon>
                <input matInput [matDatepicker]="picker1" formControlName="data">
                <mat-datepicker-toggle matSuffix [for]="picker1"></mat-datepicker-toggle>
                <mat-datepicker #picker1></mat-datepicker>
              </mat-form-field>

              <!-- Situação do Cadastro -->
              <div class="toggle-field">
                <label>Situação do Cadastro:</label>
                <mat-slide-toggle formControlName="situacaoCadastro">
                  {{cadastroForm.get('situacaoCadastro')?.value ? 'Liberado' : 'Bloqueado'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="!cadastroForm.get('situacaoCadastro')?.value">
                <mat-label>Motivo Bloqueio</mat-label>
                <mat-icon matPrefix>block</mat-icon>
                <textarea matInput formControlName="motivoBloqueio" rows="3"></textarea>
              </mat-form-field>

              <!-- Inativar Paciente Geral -->
              <div class="toggle-field">
                <label>Inativar Paciente Geral:</label>
                <mat-slide-toggle formControlName="inativarPaciente">
                  {{cadastroForm.get('inativarPaciente')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="cadastroForm.get('inativarPaciente')?.value">
                <mat-label>Motivo Inativação Paciente</mat-label>
                <mat-icon matPrefix>info</mat-icon>
                <textarea matInput formControlName="motivoInativacao" rows="3"></textarea>
              </mat-form-field>

              <!-- Residente no Município -->
              <div class="toggle-field">
                <label>Residente no Município:</label>
                <mat-slide-toggle formControlName="residenteMunicipio">
                  {{cadastroForm.get('residenteMunicipio')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="!cadastroForm.get('residenteMunicipio')?.value">
                <mat-label>Qual Município Residente</mat-label>
                <mat-icon matPrefix>location_city</mat-icon>
                <input matInput formControlName="qualMunicipioResidente">
              </mat-form-field>

              <!-- Funcionário Público -->
              <div class="toggle-field">
                <label>Funcionário Público:</label>
                <mat-slide-toggle formControlName="funcionarioPublico">
                  {{cadastroForm.get('funcionarioPublico')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Possui cobertura PSF -->
              <div class="toggle-field">
                <label>Possui cobertura PSF:</label>
                <mat-slide-toggle formControlName="possuiCoberturaPsf">
                  {{cadastroForm.get('possuiCoberturaPsf')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="cadastroForm.get('possuiCoberturaPsf')?.value">
                <mat-label>PSF Associado</mat-label>
                <mat-icon matPrefix>business</mat-icon>
                <mat-select formControlName="psfAssociado">
                  <mat-option value="psf1">PSF Centro</mat-option>
                  <mat-option value="psf2">PSF Norte</mat-option>
                  <mat-option value="psf3">PSF Sul</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Saída do Cidadão do Cadastro -->
              <div class="toggle-field">
                <label>Saída do Cidadão do Cadastro:</label>
                <mat-slide-toggle formControlName="saidaCidadao">
                  {{cadastroForm.get('saidaCidadao')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="cadastroForm.get('saidaCidadao')?.value">
                <mat-label>Motivo</mat-label>
                <mat-icon matPrefix>info</mat-icon>
                <textarea matInput formControlName="motivoSaida" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="cadastroForm.get('saidaCidadao')?.value">
                <mat-label>Data da Saída</mat-label>
                <mat-icon matPrefix>calendar_today</mat-icon>
                <input matInput [matDatepicker]="picker2" formControlName="dataSaida">
                <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
                <mat-datepicker #picker2></mat-datepicker>
              </mat-form-field>

            </form>
          </div>
        </mat-tab>

        <!-- Aba 2: Identificação do Cidadão -->
        <mat-tab label="Identificação do Cidadão">
          <div class="tab-content">
            <form [formGroup]="identificacaoForm" class="form-grid">
              
              <mat-form-field appearance="outline">
                <mat-label>Nº do Cartão SUS</mat-label>
                <mat-icon matPrefix>credit_card</mat-icon>
                <input matInput formControlName="cartaoSus" maxlength="15">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nome Completo</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="nomeCompleto">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nome Social</mat-label>
                <mat-icon matPrefix>badge</mat-icon>
                <input matInput formControlName="nomeSocial">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data de Nascimento</mat-label>
                <mat-icon matPrefix>cake</mat-icon>
                <input matInput 
                       [matDatepicker]="picker3" 
                       formControlName="dataNascimento"
                       readonly>
                <mat-datepicker-toggle matIconSuffix [for]="picker3"></mat-datepicker-toggle>
                <mat-datepicker #picker3></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>CPF</mat-label>
                <mat-icon matPrefix>assignment_ind</mat-icon>
                <input matInput 
                       formControlName="cpf" 
                       placeholder="000.000.000-00"
                       (input)="onCpfInput($event)"
                       maxlength="14">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>RG</mat-label>
                <mat-icon matPrefix>contact_mail</mat-icon>
                <input matInput formControlName="rg">
              </mat-form-field>

              <!-- Conhece Nome da Mãe -->
              <div class="toggle-field">
                <label>Conhece Nome da Mãe?</label>
                <mat-slide-toggle formControlName="conheceNomeMae">
                  {{identificacaoForm.get('conheceNomeMae')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="identificacaoForm.get('conheceNomeMae')?.value">
                <mat-label>Nome Completo da Mãe</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="nomeCompletoMae">
              </mat-form-field>

              <!-- Conhece Nome do Pai -->
              <div class="toggle-field">
                <label>Conhece Nome do Pai?</label>
                <mat-slide-toggle formControlName="conheceNomePai">
                  {{identificacaoForm.get('conheceNomePai')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="identificacaoForm.get('conheceNomePai')?.value">
                <mat-label>Nome Completo do Pai</mat-label>
                <mat-icon matPrefix>person</mat-icon>
                <input matInput formControlName="nomeCompletoPai">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Telefone Celular</mat-label>
                <mat-icon matPrefix>phone</mat-icon>
                <input matInput 
                       formControlName="telefoneCelular"
                       placeholder="(00) 00000-0000"
                       (input)="onPhoneInput($event)"
                       maxlength="15">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <mat-icon matPrefix>email</mat-icon>
                <input matInput 
                       formControlName="email" 
                       type="email"
                       placeholder="exemplo@email.com">
                <mat-error *ngIf="identificacaoForm.get('email')?.hasError('email')">
                  Digite um email válido
                </mat-error>
              </mat-form-field>

              <!-- Responsável Familiar -->
              <div class="section-title">
                <h3>Responsável Familiar</h3>
              </div>

              <div class="toggle-field">
                <label>É o Responsável?</label>
                <mat-slide-toggle formControlName="eResponsavel">
                  {{identificacaoForm.get('eResponsavel')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline">
                <mat-label>Nº do Cartão SUS (Responsável)</mat-label>
                <mat-icon matPrefix>credit_card</mat-icon>
                <input matInput formControlName="cartaoSusResponsavel">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Data de Nascimento (Responsável)</mat-label>
                <mat-icon matPrefix>cake</mat-icon>
                <input matInput 
                       [matDatepicker]="picker4" 
                       formControlName="dataNascimentoResponsavel"
                       readonly>
                <mat-datepicker-toggle matIconSuffix [for]="picker4"></mat-datepicker-toggle>
                <mat-datepicker #picker4></mat-datepicker>
              </mat-form-field>

            </form>
          </div>
        </mat-tab>

        <!-- Aba 3: Informações Sociodemográficas -->
        <mat-tab label="Informações Sociodemográficas">
          <div class="tab-content">
            <form [formGroup]="sociodemograficoForm" class="form-grid">
              
              <mat-form-field appearance="outline">
                <mat-label>Relação de Parentesco com Responsável Familiar</mat-label>
                <mat-icon matPrefix>family_restroom</mat-icon>
                <mat-select formControlName="relacaoParentesco">
                  <mat-option value="responsavel">Responsável</mat-option>
                  <mat-option value="conjuge">Cônjuge</mat-option>
                  <mat-option value="filho">Filho(a)</mat-option>
                  <mat-option value="pai">Pai</mat-option>
                  <mat-option value="mae">Mãe</mat-option>
                  <mat-option value="outro">Outro</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Ocupação</mat-label>
                <mat-icon matPrefix>work</mat-icon>
                <input matInput formControlName="ocupacao">
              </mat-form-field>

              <!-- Frequenta Escola -->
              <div class="toggle-field">
                <label>Frequenta Escola?</label>
                <mat-slide-toggle formControlName="frequentaEscola">
                  {{sociodemograficoForm.get('frequentaEscola')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Tem Alguma Deficiência -->
              <div class="toggle-field">
                <label>Tem Alguma Deficiência?</label>
                <mat-slide-toggle formControlName="temDeficiencia">
                  {{sociodemograficoForm.get('temDeficiencia')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <div class="checkbox-group" *ngIf="sociodemograficoForm.get('temDeficiencia')?.value">
                <label>Tipo de Deficiência:</label>
                <mat-checkbox formControlName="deficienciaAuditiva">Auditiva</mat-checkbox>
                <mat-checkbox formControlName="deficienciaVisual">Visual</mat-checkbox>
                <mat-checkbox formControlName="deficienciaIntelectual">Intelectual/Cognitiva</mat-checkbox>
                <mat-checkbox formControlName="deficienciaFisica">Física</mat-checkbox>
                <mat-checkbox formControlName="deficienciaOutra">Outra</mat-checkbox>
              </div>

            </form>
          </div>
        </mat-tab>

        <!-- Aba 4: Condições de Saúde -->
        <mat-tab label="Condições de Saúde">
          <div class="tab-content">
            <form [formGroup]="condicoesForm" class="form-grid">
              
              <!-- Está Gestante -->
              <div class="toggle-field">
                <label>Está Gestante?</label>
                <mat-slide-toggle formControlName="estaGestante">
                  {{condicoesForm.get('estaGestante')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="condicoesForm.get('estaGestante')?.value">
                <mat-label>Maternidade de Referência</mat-label>
                <mat-icon matPrefix>local_hospital</mat-icon>
                <input matInput formControlName="maternidadeReferencia">
              </mat-form-field>

              <!-- Está Fumante -->
              <div class="toggle-field">
                <label>Está Fumante?</label>
                <mat-slide-toggle formControlName="estaFumante">
                  {{condicoesForm.get('estaFumante')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Tem Hipertensão -->
              <div class="toggle-field">
                <label>Tem Hipertensão Arterial?</label>
                <mat-slide-toggle formControlName="temHipertensao">
                  {{condicoesForm.get('temHipertensao')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Tem Diabetes -->
              <div class="toggle-field">
                <label>Tem Diabetes?</label>
                <mat-slide-toggle formControlName="temDiabetes">
                  {{condicoesForm.get('temDiabetes')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Faz Uso de Medicamento Contínuo -->
              <div class="toggle-field">
                <label>Faz Uso de Medicamento Contínuo?</label>
                <mat-slide-toggle formControlName="usaMedicamentoContinuo">
                  {{condicoesForm.get('usaMedicamentoContinuo')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="condicoesForm.get('usaMedicamentoContinuo')?.value">
                <mat-label>Qual Medicamento</mat-label>
                <mat-icon matPrefix>medication</mat-icon>
                <textarea matInput formControlName="qualMedicamento" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Outras Condições de Saúde 1</mat-label>
                <mat-icon matPrefix>healing</mat-icon>
                <input matInput formControlName="outrasCondicoes1">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Outras Condições de Saúde 2</mat-label>
                <mat-icon matPrefix>healing</mat-icon>
                <input matInput formControlName="outrasCondicoes2">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Outras Condições de Saúde 3</mat-label>
                <mat-icon matPrefix>healing</mat-icon>
                <input matInput formControlName="outrasCondicoes3">
              </mat-form-field>

            </form>
          </div>
        </mat-tab>

        <!-- Aba 5: Situação de Rua -->
        <mat-tab label="Situação de Rua">
          <div class="tab-content">
            <form [formGroup]="situacaoRuaForm" class="form-grid">
              
              <!-- Está em Situação de Rua -->
              <div class="toggle-field">
                <label>Está em Situação de Rua?</label>
                <mat-slide-toggle formControlName="estaSituacaoRua">
                  {{situacaoRuaForm.get('estaSituacaoRua')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="situacaoRuaForm.get('estaSituacaoRua')?.value">
                <mat-label>Tempo em Situação de Rua</mat-label>
                <mat-icon matPrefix>schedule</mat-icon>
                <input matInput formControlName="tempoSituacaoRua" placeholder="Ex: 2 anos, 6 meses">
              </mat-form-field>

              <!-- Recebe Algum Benefício -->
              <div class="toggle-field">
                <label>Recebe Algum Benefício?</label>
                <mat-slide-toggle formControlName="recebeBeneficio">
                  {{situacaoRuaForm.get('recebeBeneficio')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- Possui Referência Familiar -->
              <div class="toggle-field">
                <label>Possui Referência Familiar?</label>
                <mat-slide-toggle formControlName="possuiReferenciaFamiliar">
                  {{situacaoRuaForm.get('possuiReferenciaFamiliar')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <!-- É Acompanhado Por Outra Instituição -->
              <div class="toggle-field">
                <label>É Acompanhado Por Outra Instituição?</label>
                <mat-slide-toggle formControlName="acompanhadoInstituicao">
                  {{situacaoRuaForm.get('acompanhadoInstituicao')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="situacaoRuaForm.get('acompanhadoInstituicao')?.value">
                <mat-label>Se Sim, Qual</mat-label>
                <mat-icon matPrefix>business</mat-icon>
                <input matInput formControlName="qualInstituicao">
              </mat-form-field>

              <!-- Visita Algum Familiar com Frequência -->
              <div class="toggle-field">
                <label>Visita Algum Familiar com Frequência?</label>
                <mat-slide-toggle formControlName="visitaFamiliar">
                  {{situacaoRuaForm.get('visitaFamiliar')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <mat-form-field appearance="outline" *ngIf="situacaoRuaForm.get('visitaFamiliar')?.value">
                <mat-label>Se Sim, Qual É o Grau de Parentesco</mat-label>
                <mat-icon matPrefix>family_restroom</mat-icon>
                <input matInput formControlName="grauParentesco">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Quantas Vezes Se Alimenta ao Dia</mat-label>
                <mat-icon matPrefix>restaurant</mat-icon>
                <mat-select formControlName="vezesAlimentaDia">
                  <mat-option value="1">1 vez</mat-option>
                  <mat-option value="2">2 vezes</mat-option>
                  <mat-option value="3">3 vezes</mat-option>
                  <mat-option value="4">4 vezes</mat-option>
                  <mat-option value="5">5 ou mais vezes</mat-option>
                </mat-select>
              </mat-form-field>

              <!-- Qual a Origem da Alimentação -->
              <div class="checkbox-group">
                <label>Qual a Origem da Alimentação:</label>
                <mat-checkbox formControlName="origemRestaurantePopular">Restaurante Popular</mat-checkbox>
                <mat-checkbox formControlName="origemDoacaoGrupoReligioso">Doação Grupo Religioso</mat-checkbox>
                <mat-checkbox formControlName="origemDoacaoRestaurante">Doação Restaurante</mat-checkbox>
                <mat-checkbox formControlName="origemDoacaoPopular">Doação de Popular</mat-checkbox>
                <mat-checkbox formControlName="origemOutros">Outros</mat-checkbox>
              </div>

              <!-- Tem acesso a Higiene Pessoal -->
              <div class="toggle-field">
                <label>Tem acesso a Higiene Pessoal?</label>
                <mat-slide-toggle formControlName="acessoHigienePessoal">
                  {{situacaoRuaForm.get('acessoHigienePessoal')?.value ? 'Sim' : 'Não'}}
                </mat-slide-toggle>
              </div>

              <div class="checkbox-group" *ngIf="situacaoRuaForm.get('acessoHigienePessoal')?.value">
                <label>Tipo de Acesso:</label>
                <mat-checkbox formControlName="acessoBanho">Banho</mat-checkbox>
                <mat-checkbox formControlName="acessoSanitario">Acesso ao Sanitário</mat-checkbox>
                <mat-checkbox formControlName="acessoHigieneBucal">Higiene Bucal</mat-checkbox>
                <mat-checkbox formControlName="acessoOutros">Outros</mat-checkbox>
              </div>

            </form>
          </div>
        </mat-tab>

      </mat-tab-group>
    </mat-dialog-content>

    <mat-dialog-actions align="end" class="dialog-actions">
      <button mat-button 
              type="button" 
              (click)="savePartial()"
              class="save-partial-button">
        <mat-icon>save</mat-icon>
        Salvar Parcial
      </button>
      
      <button mat-button 
              type="button" 
              (click)="previousTab()"
              [disabled]="selectedTabIndex === 0"
              class="nav-button">
        <mat-icon>navigate_before</mat-icon>
        Anterior
      </button>
      
      <button mat-button 
              type="button" 
              (click)="nextTab()"
              [disabled]="selectedTabIndex === 4"
              class="nav-button">
        <mat-icon>navigate_next</mat-icon>
        Próximo
      </button>
      
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
      color: #1976d2;
      font-size: 1.5rem;
    }

    .dialog-content {
      padding: 0 !important;
      height: calc(95vh - 180px);
      overflow: hidden;
    }

    .full-height-tabs {
      height: 100%;
    }

    .tab-content {
      padding: 24px;
      height: calc(100% - 48px);
      overflow-y: auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      align-items: start;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .toggle-field label {
      font-weight: 500;
      color: #333;
    }

    .section-title {
      grid-column: 1 / -1;
      margin-top: 24px;
    }

    .section-title h3 {
      color: #1976d2;
      border-bottom: 2px solid #1976d2;
      padding-bottom: 8px;
      margin: 0;
    }

    .checkbox-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #fafafa;
    }

    .checkbox-group label {
      font-weight: 500;
      color: #333;
      margin-bottom: 8px;
    }

    .dialog-actions {
      padding: 24px;
      border-top: 1px solid #e0e0e0;
      gap: 12px;
      flex-wrap: wrap;
    }

    .save-partial-button,
    .nav-button,
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
    }

    .save-button {
      background: #1976d2 !important;
      color: white !important;
    }

    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      
      .dialog-actions {
        flex-direction: column;
      }
      
      .save-partial-button,
      .nav-button,
      .cancel-button,
      .save-button {
        width: 100%;
        justify-content: center;
      }
    }
  `]
})
export class CadastroIndividualEditDialogComponent implements AfterViewInit {
  private fb = inject(FormBuilder);
  
  selectedTabIndex = 0;
  isLoading = false;

  cadastroForm!: FormGroup;
  identificacaoForm!: FormGroup;
  sociodemograficoForm!: FormGroup;
  condicoesForm!: FormGroup;
  situacaoRuaForm!: FormGroup;

  constructor(
    private dialogRef: MatDialogRef<CadastroIndividualEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {
    this.initializeForms();
  }

  private initializeForms(): void {
    // Formulário da primeira aba
    this.cadastroForm = this.fb.group({
      cartaoSusProfissional: [''],
      codigoCnes: [''],
      codigoEquipe: [''],
      microarea: [''],
      data: [new Date()],
      situacaoCadastro: [true],
      motivoBloqueio: [''],
      inativarPaciente: [false],
      motivoInativacao: [''],
      residenteMunicipio: [true],
      qualMunicipioResidente: [''],
      funcionarioPublico: [false],
      possuiCoberturaPsf: [false],
      psfAssociado: [''],
      saidaCidadao: [false],
      motivoSaida: [''],
      dataSaida: ['']
    });

    // Formulário da segunda aba (atualizado com validação de email)
    this.identificacaoForm = this.fb.group({
      cartaoSus: [this.data.cadastro?.cartaoSus || ''],
      nomeCompleto: [this.data.cadastro?.nome || ''],
      nomeSocial: [''],
      dataNascimento: [this.data.cadastro?.dataNascimento || ''],
      cpf: [''],
      rg: [''],
      conheceNomeMae: [true],
      nomeCompletoMae: [''],
      conheceNomePai: [false],
      nomeCompletoPai: [''],
      telefoneCelular: [''],
      email: ['', [Validators.email]],
      eResponsavel: [false],
      cartaoSusResponsavel: [''],
      dataNascimentoResponsavel: ['']
    });

    // Formulário da terceira aba
    this.sociodemograficoForm = this.fb.group({
      relacaoParentesco: [''],
      ocupacao: [''],
      frequentaEscola: [false],
      temDeficiencia: [false],
      deficienciaAuditiva: [false],
      deficienciaVisual: [false],
      deficienciaIntelectual: [false],
      deficienciaFisica: [false],
      deficienciaOutra: [false]
    });

    // Formulário da quarta aba
    this.condicoesForm = this.fb.group({
      estaGestante: [false],
      maternidadeReferencia: [''],
      estaFumante: [false],
      temHipertensao: [false],
      temDiabetes: [false],
      usaMedicamentoContinuo: [false],
      qualMedicamento: [''],
      outrasCondicoes1: [''],
      outrasCondicoes2: [''],
      outrasCondicoes3: ['']
    });

    // Formulário da quinta aba - Situação de Rua
    this.situacaoRuaForm = this.fb.group({
      estaSituacaoRua: [false],
      tempoSituacaoRua: [''],
      recebeBeneficio: [false],
      possuiReferenciaFamiliar: [false],
      acompanhadoInstituicao: [false],
      qualInstituicao: [''],
      visitaFamiliar: [false],
      grauParentesco: [''],
      vezesAlimentaDia: [''],
      origemRestaurantePopular: [false],
      origemDoacaoGrupoReligioso: [false],
      origemDoacaoRestaurante: [false],
      origemDoacaoPopular: [false],
      origemOutros: [false],
      acessoHigienePessoal: [false],
      acessoBanho: [false],
      acessoSanitario: [false],
      acessoHigieneBucal: [false],
      acessoOutros: [false]
    });
  }

  ngAfterViewInit(): void {
    // Lifecycle hook necessário para resolver referências de template
  }

  nextTab(): void {
    if (this.selectedTabIndex < 4) {
      this.selectedTabIndex++;
    }
  }

  previousTab(): void {
    if (this.selectedTabIndex > 0) {
      this.selectedTabIndex--;
    }
  }

  // Método para aplicar máscara no CPF
  onCpfInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d)/, '$1.$2');
      value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    
    this.identificacaoForm.get('cpf')?.setValue(value);
  }

  // Método para aplicar máscara no telefone celular
  onPhoneInput(event: any): void {
    let value = event.target.value.replace(/\D/g, '');
    
    if (value.length <= 11) {
      value = value.replace(/(\d{2})(\d)/, '($1) $2');
      value = value.replace(/(\d{5})(\d)/, '$1-$2');
    }
    
    this.identificacaoForm.get('telefoneCelular')?.setValue(value);
  }

  savePartial(): void {
    console.log('Salvamento parcial realizado');
    // Implementar lógica de salvamento parcial
  }

  onSubmit(): void {
    this.isLoading = true;
    
    // Simular chamada de API
    setTimeout(() => {
      const allData = {
        cadastro: this.cadastroForm.value,
        identificacao: this.identificacaoForm.value,
        sociodemografico: this.sociodemograficoForm.value,
        condicoes: this.condicoesForm.value,
        situacaoRua: this.situacaoRuaForm.value
      };
      
      console.log('Dados completos do cadastro:', allData);
      this.isLoading = false;
      this.dialogRef.close({ 
        success: true, 
        data: allData,
        isEdit: this.data.isEdit 
      });
    }, 2000);
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
