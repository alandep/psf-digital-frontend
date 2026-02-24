import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { NotificationService } from '../../../../services/notification.service';

interface DialogData {
  cadastro: any;
  viewOnly: boolean;
  cities: string[];
}

@Component({
  selector: 'app-cadastro-domiciliar-edit-dialog',
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
    MatNativeDateModule,
    MatCardModule,
    MatDividerModule
  ],
  template: `
    <div class="dialog-container">
      <mat-dialog-content class="dialog-content">
        <div class="dialog-header">
          <h2>
            <mat-icon>home_work</mat-icon>
            {{data.viewOnly ? 'Visualizar' : 'Editar'}} Cadastro Domiciliar
          </h2>
          <button mat-icon-button [mat-dialog-close]="false">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <mat-tab-group [(selectedIndex)]="selectedTab" class="tabs-container">
          <!-- ABA 1: Cadastro Domicílio -->
          <mat-tab label="Cadastro Domicílio">
            <form [formGroup]="domicilioForm" class="tab-content">
              <div class="form-grid">
                <!-- Primeira linha -->
                <mat-form-field appearance="outline">
                  <mat-label>Nº Cartão SUS do Profissional</mat-label>
                  <input matInput formControlName="cartaoSusProfissional" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cód. CNES Unidade</mat-label>
                  <input matInput formControlName="codigoCNES" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Cód. Equipe (INE)</mat-label>
                  <input matInput formControlName="codigoEquipe" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <!-- Segunda linha -->
                <mat-form-field appearance="outline">
                  <mat-label>Microarea</mat-label>
                  <input matInput formControlName="microarea" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Data</mat-label>
                  <input matInput [matDatepicker]="picker1" 
                         formControlName="data"
                         [readonly]="data.viewOnly">
                  <mat-datepicker-toggle matIconSuffix [for]="picker1" 
                                       [disabled]="data.viewOnly"></mat-datepicker-toggle>
                  <mat-datepicker #picker1></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Imóvel</mat-label>
                  <mat-select formControlName="tipoImovel" [disabled]="data.viewOnly">
                    <mat-option value="casa">Casa</mat-option>
                    <mat-option value="apartamento">Apartamento</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Terceira linha -->
                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Logradouro</mat-label>
                  <mat-select formControlName="tipoLogradouro" [disabled]="data.viewOnly">
                    <mat-option value="rua">Rua</mat-option>
                    <mat-option value="avenida">Avenida</mat-option>
                    <mat-option value="travessa">Travessa</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Outro Logradouro</mat-label>
                  <input matInput formControlName="outroLogradouro" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <!-- Toggle Possui Número -->
                <div class="toggle-field">
                  <label>Domicílio Possui Número?</label>
                  <mat-slide-toggle formControlName="possuiNumero" 
                                  [disabled]="data.viewOnly"
                                  (change)="onPossuiNumeroChange($event)">
                    {{domicilioForm.get('possuiNumero')?.value ? 'Sim' : 'Não'}}
                  </mat-slide-toggle>
                </div>

                <!-- Quarta linha -->
                <mat-form-field appearance="outline" 
                              [class.disabled-field]="!domicilioForm.get('possuiNumero')?.value">
                  <mat-label>Número</mat-label>
                  <input matInput formControlName="numero" 
                         [readonly]="data.viewOnly || !domicilioForm.get('possuiNumero')?.value">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Complemento</mat-label>
                  <input matInput formControlName="complemento" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Ponto de Referência</mat-label>
                  <input matInput formControlName="pontoReferencia" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <!-- Quinta linha -->
                <mat-form-field appearance="outline">
                  <mat-label>Bairro</mat-label>
                  <input matInput formControlName="bairro" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Município</mat-label>
                  <mat-select formControlName="municipio" [disabled]="data.viewOnly">
                    <mat-option *ngFor="let city of data.cities" [value]="city">
                      {{city}}
                    </mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>UF</mat-label>
                  <mat-select formControlName="uf" [disabled]="data.viewOnly">
                    <mat-option value="AC">Acre</mat-option>
                    <mat-option value="AL">Alagoas</mat-option>
                    <mat-option value="AP">Amapá</mat-option>
                    <mat-option value="AM">Amazonas</mat-option>
                    <mat-option value="BA">Bahia</mat-option>
                    <mat-option value="CE">Ceará</mat-option>
                    <mat-option value="DF">Distrito Federal</mat-option>
                    <mat-option value="ES">Espírito Santo</mat-option>
                    <mat-option value="GO">Goiás</mat-option>
                    <mat-option value="MA">Maranhão</mat-option>
                    <mat-option value="MT">Mato Grosso</mat-option>
                    <mat-option value="MS">Mato Grosso do Sul</mat-option>
                    <mat-option value="MG">Minas Gerais</mat-option>
                    <mat-option value="PA">Pará</mat-option>
                    <mat-option value="PB">Paraíba</mat-option>
                    <mat-option value="PR">Paraná</mat-option>
                    <mat-option value="PE">Pernambuco</mat-option>
                    <mat-option value="PI">Piauí</mat-option>
                    <mat-option value="RJ">Rio de Janeiro</mat-option>
                    <mat-option value="RN">Rio Grande do Norte</mat-option>
                    <mat-option value="RS">Rio Grande do Sul</mat-option>
                    <mat-option value="RO">Rondônia</mat-option>
                    <mat-option value="RR">Roraima</mat-option>
                    <mat-option value="SC">Santa Catarina</mat-option>
                    <mat-option value="SP">São Paulo</mat-option>
                    <mat-option value="SE">Sergipe</mat-option>
                    <mat-option value="TO">Tocantins</mat-option>
                  </mat-select>
                </mat-form-field>

                <!-- Sexta linha -->
                <mat-form-field appearance="outline">
                  <mat-label>CEP</mat-label>
                  <input matInput formControlName="cep" 
                         placeholder="00000-000"
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Telefone Residencial</mat-label>
                  <input matInput formControlName="telefoneResidencial" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Telefone de Contato</mat-label>
                  <input matInput formControlName="telefoneContato" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <!-- Toggle Animais -->
                <div class="toggle-field full-width">
                  <label>Animais no Domicílio?</label>
                  <mat-slide-toggle formControlName="possuiAnimais" 
                                  [disabled]="data.viewOnly"
                                  (change)="onPossuiAnimaisChange($event)">
                    {{domicilioForm.get('possuiAnimais')?.value ? 'Sim' : 'Não'}}
                  </mat-slide-toggle>
                </div>

                <!-- Animais (condicional) -->
                <div class="animals-section full-width" 
                     *ngIf="domicilioForm.get('possuiAnimais')?.value">
                  <div class="animals-checkboxes">
                    <mat-checkbox formControlName="temGato" [disabled]="data.viewOnly">
                      Gato
                    </mat-checkbox>
                    <mat-checkbox formControlName="temCachorro" [disabled]="data.viewOnly">
                      Cachorro
                    </mat-checkbox>
                    <mat-checkbox formControlName="temPassaro" [disabled]="data.viewOnly">
                      Pássaro
                    </mat-checkbox>
                    <mat-checkbox formControlName="temOutrosAnimais" [disabled]="data.viewOnly">
                      Outros
                    </mat-checkbox>
                  </div>
                  <mat-form-field appearance="outline" class="quantos-field">
                    <mat-label>Quantos</mat-label>
                    <input matInput type="number" formControlName="quantosAnimais" 
                           [readonly]="data.viewOnly">
                  </mat-form-field>
                </div>

                <!-- Toggle Fora da Microarea -->
                <div class="toggle-field full-width">
                  <label>Cidadão Fora da Microarea?</label>
                  <mat-slide-toggle formControlName="foraMicroarea" 
                                  [disabled]="data.viewOnly"
                                  (change)="onForaMicroareaChange($event)">
                    {{domicilioForm.get('foraMicroarea')?.value ? 'Sim' : 'Não'}}
                  </mat-slide-toggle>
                </div>

                <!-- Microarea do Cidadão (condicional) -->
                <mat-form-field appearance="outline" 
                              [class.disabled-field]="domicilioForm.get('foraMicroarea')?.value"
                              *ngIf="!domicilioForm.get('foraMicroarea')?.value">
                  <mat-label>Microarea do Cidadão</mat-label>
                  <input matInput formControlName="microareaCidadao" 
                         [readonly]="data.viewOnly">
                </mat-form-field>
              </div>

              <div class="form-actions" *ngIf="!data.viewOnly">
                <button mat-raised-button color="accent" (click)="salvarParcial(1)">
                  <mat-icon>save</mat-icon>
                  Salvar Parcial
                </button>
                <button mat-raised-button color="primary" (click)="proximaAba()">
                  Próximo
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-tab>

          <!-- ABA 2: Condições de Moradia -->
          <mat-tab label="Condições de Moradia">
            <form [formGroup]="moradiaForm" class="tab-content">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Situação de Moradia/Posse de Terra</mat-label>
                  <mat-select formControlName="situacaoMoradia" [disabled]="data.viewOnly">
                    <mat-option value="propria">Própria</mat-option>
                    <mat-option value="alugada">Alugada</mat-option>
                    <mat-option value="cedida">Cedida</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="toggle-field">
                  <label>Localização</label>
                  <mat-slide-toggle formControlName="localizacaoUrbana" 
                                  [disabled]="data.viewOnly">
                    {{moradiaForm.get('localizacaoUrbana')?.value ? 'Urbana' : 'Rural'}}
                  </mat-slide-toggle>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Acesso ao Domicílio</mat-label>
                  <mat-select formControlName="tipoAcesso" [disabled]="data.viewOnly">
                    <mat-option value="pavimentado">Pavimentado</mat-option>
                    <mat-option value="terra">Terra</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tipo de Domicílio</mat-label>
                  <mat-select formControlName="tipoDomicilio" [disabled]="data.viewOnly">
                    <mat-option value="casa">Casa</mat-option>
                    <mat-option value="apartamento">Apartamento</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Condição de Posse e Uso da Terra</mat-label>
                  <mat-select formControlName="condicaoTerra" [disabled]="data.viewOnly">
                    <mat-option value="proprietario">Proprietário</mat-option>
                    <mat-option value="arrendatario">Arrendatário</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nº de Moradores</mat-label>
                  <input matInput type="number" formControlName="numeroMoradores" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nº de Cômodos</mat-label>
                  <input matInput type="number" formControlName="numeroComodos" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Material Predominante das Paredes</mat-label>
                  <mat-select formControlName="materialParedes" [disabled]="data.viewOnly">
                    <mat-option value="alvenaria">Alvenaria</mat-option>
                    <mat-option value="madeira">Madeira</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <div class="toggle-field">
                  <label>Disponibilidade de Energia Elétrica</label>
                  <mat-slide-toggle formControlName="energiaEletrica" 
                                  [disabled]="data.viewOnly">
                    {{moradiaForm.get('energiaEletrica')?.value ? 'Sim' : 'Não'}}
                  </mat-slide-toggle>
                </div>

                <mat-form-field appearance="outline">
                  <mat-label>Abastecimento de Água</mat-label>
                  <mat-select formControlName="abastecimentoAgua" [disabled]="data.viewOnly">
                    <mat-option value="rede">Rede Pública</mat-option>
                    <mat-option value="poco">Poço</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Escoamento do Banheiro/Sanitário</mat-label>
                  <mat-select formControlName="escoamentoBanheiro" [disabled]="data.viewOnly">
                    <mat-option value="rede">Rede de Esgoto</mat-option>
                    <mat-option value="fossa">Fossa</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Tratamento de Água</mat-label>
                  <mat-select formControlName="tratamentoAgua" [disabled]="data.viewOnly">
                    <mat-option value="filtrada">Filtrada</mat-option>
                    <mat-option value="fervida">Fervida</mat-option>
                    <mat-option value="nenhum">Nenhum</mat-option>
                  </mat-select>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Destino do Lixo</mat-label>
                  <mat-select formControlName="destinoLixo" [disabled]="data.viewOnly">
                    <mat-option value="coleta">Coleta Pública</mat-option>
                    <mat-option value="queimado">Queimado</mat-option>
                    <mat-option value="outros">Outros</mat-option>
                  </mat-select>
                </mat-form-field>
              </div>

              <div class="form-actions" *ngIf="!data.viewOnly">
                <button mat-raised-button (click)="abaAnterior()">
                  <mat-icon>arrow_back</mat-icon>
                  Voltar
                </button>
                <button mat-raised-button color="accent" (click)="salvarParcial(2)">
                  <mat-icon>save</mat-icon>
                  Salvar Parcial
                </button>
                <button mat-raised-button color="primary" (click)="proximaAba()">
                  Próximo
                  <mat-icon>arrow_forward</mat-icon>
                </button>
              </div>
            </form>
          </mat-tab>

          <!-- ABA 3: Cadastro Responsável Familiar -->
          <mat-tab label="Cadastro Responsável Familiar">
            <form [formGroup]="responsavelForm" class="tab-content">
              <div class="form-grid">
                <mat-form-field appearance="outline">
                  <mat-label>Nº Prontuário Familiar</mat-label>
                  <input matInput formControlName="prontuarioFamiliar" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Nº Cartão SUS do Responsável</mat-label>
                  <input matInput formControlName="cartaoSusResponsavel" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Data de Nascimento do Responsável</mat-label>
                  <input matInput [matDatepicker]="picker2" 
                         formControlName="dataNascimentoResponsavel"
                         [readonly]="data.viewOnly">
                  <mat-datepicker-toggle matIconSuffix [for]="picker2" 
                                       [disabled]="data.viewOnly"></mat-datepicker-toggle>
                  <mat-datepicker #picker2></mat-datepicker>
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Renda Familiar (Sal. Mínimo)</mat-label>
                  <input matInput type="number" step="0.1" 
                         formControlName="rendaFamiliar" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Número de Membros da Família</mat-label>
                  <input matInput type="number" formControlName="numeroMembros" 
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <mat-form-field appearance="outline">
                  <mat-label>Reside desde (Mês/Ano)</mat-label>
                  <input matInput formControlName="resideDesde" 
                         placeholder="MM/AAAA"
                         [readonly]="data.viewOnly">
                </mat-form-field>

                <div class="toggle-field">
                  <label>Família Mudou?</label>
                  <mat-slide-toggle formControlName="familiaMudou" 
                                  [disabled]="data.viewOnly">
                    {{responsavelForm.get('familiaMudou')?.value ? 'Sim' : 'Não'}}
                  </mat-slide-toggle>
                </div>
              </div>

              <div class="form-actions" *ngIf="!data.viewOnly">
                <button mat-raised-button (click)="abaAnterior()">
                  <mat-icon>arrow_back</mat-icon>
                  Voltar
                </button>
                <button mat-raised-button color="primary" (click)="salvarCompleto()">
                  <mat-icon>save</mat-icon>
                  Salvar Cadastro
                </button>
              </div>
            </form>
          </mat-tab>
        </mat-tab-group>
      </mat-dialog-content>
    </div>
  `,
  styles: [`
    .dialog-container {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .dialog-content {
      flex: 1;
      padding: 0 !important;
      margin: 0 !important;
      overflow: hidden;
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 24px;
      border-bottom: 1px solid #e0e0e0;
      background: #f8f9fa;
    }

    .dialog-header h2 {
      display: flex;
      align-items: center;
      gap: 12px;
      margin: 0;
      color: #ff9800;
      font-size: 1.5rem;
      font-weight: 600;
    }

    .tabs-container {
      flex: 1;
      height: calc(100% - 80px);
    }

    .tab-content {
      padding: 24px;
      height: calc(100vh - 250px);
      overflow-y: auto;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }

    .full-width {
      grid-column: 1 / -1;
    }

    .toggle-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .toggle-field label {
      font-weight: 500;
      color: #666;
      font-size: 0.9rem;
    }

    .animals-section {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding: 16px;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      background: #f9f9f9;
    }

    .animals-checkboxes {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .quantos-field {
      max-width: 150px;
    }

    .disabled-field {
      opacity: 0.6;
      pointer-events: none;
    }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 16px;
      padding: 20px 0;
      border-top: 1px solid #e0e0e0;
      margin-top: 20px;
    }

    .form-actions button {
      min-width: 120px;
      height: 44px;
      font-weight: 500;
    }

    /* Responsive */
    @media (max-width: 768px) {
      .form-grid {
        grid-template-columns: 1fr;
        gap: 16px;
      }

      .dialog-header {
        padding: 16px;
      }

      .tab-content {
        padding: 16px;
      }

      .animals-checkboxes {
        flex-direction: column;
        gap: 12px;
      }

      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class CadastroDomiciliarEditDialogComponent implements OnInit {
  domicilioForm!: FormGroup;
  moradiaForm!: FormGroup;
  responsavelForm!: FormGroup;
  selectedTab = 0;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CadastroDomiciliarEditDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.initializeForms();
    this.loadData();
  }

  private initializeForms(): void {
    this.domicilioForm = this.fb.group({
      cartaoSusProfissional: ['', Validators.required],
      codigoCNES: ['', Validators.required],
      codigoEquipe: ['', Validators.required],
      microarea: ['', Validators.required],
      data: [new Date(), Validators.required],
      tipoImovel: ['', Validators.required],
      tipoLogradouro: ['', Validators.required],
      outroLogradouro: [''],
      possuiNumero: [true],
      numero: [''],
      complemento: [''],
      pontoReferencia: [''],
      bairro: ['', Validators.required],
      municipio: ['', Validators.required],
      uf: ['', Validators.required],
      cep: ['', Validators.required],
      telefoneResidencial: [''],
      telefoneContato: [''],
      possuiAnimais: [false],
      temGato: [false],
      temCachorro: [false],
      temPassaro: [false],
      temOutrosAnimais: [false],
      quantosAnimais: [0],
      foraMicroarea: [false],
      microareaCidadao: ['']
    });

    this.moradiaForm = this.fb.group({
      situacaoMoradia: ['', Validators.required],
      localizacaoUrbana: [true],
      tipoAcesso: ['', Validators.required],
      tipoDomicilio: ['', Validators.required],
      condicaoTerra: [''],
      numeroMoradores: [1, [Validators.required, Validators.min(1)]],
      numeroComodos: [1, [Validators.required, Validators.min(1)]],
      materialParedes: ['', Validators.required],
      energiaEletrica: [true],
      abastecimentoAgua: ['', Validators.required],
      escoamentoBanheiro: ['', Validators.required],
      tratamentoAgua: ['', Validators.required],
      destinoLixo: ['', Validators.required]
    });

    this.responsavelForm = this.fb.group({
      prontuarioFamiliar: ['', Validators.required],
      cartaoSusResponsavel: ['', Validators.required],
      dataNascimentoResponsavel: ['', Validators.required],
      rendaFamiliar: [0, [Validators.required, Validators.min(0)]],
      numeroMembros: [1, [Validators.required, Validators.min(1)]],
      resideDesde: ['', Validators.required],
      familiaMudou: [false]
    });
  }

  private loadData(): void {
    if (this.data.cadastro) {
      // Carregar dados existentes nos formulários
      // Aqui você preencheria os forms com os dados do cadastro
    }
  }

  onPossuiNumeroChange(event: any): void {
    const possuiNumero = event.checked;
    const numeroControl = this.domicilioForm.get('numero');
    
    if (possuiNumero) {
      numeroControl?.enable();
    } else {
      numeroControl?.disable();
      numeroControl?.setValue('');
    }
  }

  onPossuiAnimaisChange(event: any): void {
    const possuiAnimais = event.checked;
    if (!possuiAnimais) {
      this.domicilioForm.patchValue({
        temGato: false,
        temCachorro: false,
        temPassaro: false,
        temOutrosAnimais: false,
        quantosAnimais: 0
      });
    }
  }

  onForaMicroareaChange(event: any): void {
    const foraMicroarea = event.checked;
    const microareaControl = this.domicilioForm.get('microareaCidadao');
    
    if (!foraMicroarea) {
      microareaControl?.enable();
    } else {
      microareaControl?.disable();
      microareaControl?.setValue('');
    }
  }

  proximaAba(): void {
    if (this.selectedTab < 2) {
      this.selectedTab++;
    }
  }

  abaAnterior(): void {
    if (this.selectedTab > 0) {
      this.selectedTab--;
    }
  }

  salvarParcial(aba: number): void {
    this.notificationService.showSuccess(`Dados da aba ${aba} salvos parcialmente!`);
  }

  salvarCompleto(): void {
    if (this.isAllFormsValid()) {
      const cadastroCompleto = {
        ...this.domicilioForm.value,
        ...this.moradiaForm.value,
        ...this.responsavelForm.value
      };
      
      this.dialogRef.close(cadastroCompleto);
    } else {
      this.notificationService.showError('Por favor, preencha todos os campos obrigatórios!');
    }
  }

  private isAllFormsValid(): boolean {
    return this.domicilioForm.valid && 
           this.moradiaForm.valid && 
           this.responsavelForm.valid;
  }
}
