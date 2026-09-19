import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';

interface OnboardingStep {
  id: number;
  label: string;
  icon: string;
  done: boolean;
}

interface ProdutoItem {
  nome: string;
  ncm: string;
}

interface ClienteItem {
  nome: string;
  pais: string;
}

interface UsuarioItem {
  email: string;
  perfil: string;
}

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatProgressBarModule,
  ],
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss'],
})
export class OnboardingComponent {
  readonly dashboardRoute = '/home-logged/dashboards/principal';
  readonly primeiraExportacaoRoute = '/home-logged/exportacoes/pedidos';

  currentStepIndex = 0;

  steps: OnboardingStep[] = [
    { id: 1, label: 'Empresa', icon: 'business', done: false },
    { id: 2, label: 'Dados fiscais', icon: 'receipt_long', done: false },
    { id: 3, label: 'Produtos', icon: 'inventory_2', done: false },
    { id: 4, label: 'Clientes', icon: 'groups', done: false },
    { id: 5, label: 'Usuários', icon: 'manage_accounts', done: false },
    { id: 6, label: 'Primeira exportação', icon: 'local_shipping', done: false },
  ];

  // Etapa 1 — Empresa (mock)
  empresa = {
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Comércio Exterior Portos Brasil LTDA',
    nomeFantasia: 'Portos EIP',
  };

  // Etapa 2 — Dados fiscais
  regimeOptions = ['Simples Nacional', 'Lucro Presumido', 'Lucro Real'];
  radarOptions = ['Expresso', 'Limitado', 'Ilimitado'];
  fiscal = {
    regime: '',
    inscricaoEstadual: '',
    radar: '',
  };

  // Etapa 3 — Produtos
  produtos: ProdutoItem[] = [];
  novoProduto: ProdutoItem = { nome: '', ncm: '' };

  // Etapa 4 — Clientes
  clientes: ClienteItem[] = [];
  novoCliente: ClienteItem = { nome: '', pais: '' };

  // Etapa 5 — Usuários
  perfilOptions = [
    'Administrador',
    'Comex',
    'Financeiro',
    'Logística',
    'Compliance',
    'Operador',
    'Consulta',
  ];
  usuarios: UsuarioItem[] = [];
  novoUsuario: UsuarioItem = { email: '', perfil: '' };

  get currentStep(): OnboardingStep {
    return this.steps[this.currentStepIndex];
  }

  get completedCount(): number {
    return this.steps.filter((s) => s.done).length;
  }

  get progressPercent(): number {
    return Math.round((this.completedCount / this.steps.length) * 100);
  }

  get allDone(): boolean {
    return this.steps.every((s) => s.done);
  }

  stepState(index: number): 'done' | 'current' | 'pending' {
    if (this.steps[index].done) {
      return 'done';
    }
    if (index === this.currentStepIndex) {
      return 'current';
    }
    return 'pending';
  }

  goToStep(index: number): void {
    this.currentStepIndex = index;
  }

  private advance(): void {
    if (this.currentStepIndex < this.steps.length - 1) {
      this.currentStepIndex++;
    }
  }

  concluirEtapa(): void {
    this.steps[this.currentStepIndex].done = true;
    this.advance();
  }

  pularEtapa(): void {
    this.advance();
  }

  adicionarProduto(): void {
    const nome = this.novoProduto.nome.trim();
    const ncm = this.novoProduto.ncm.trim();
    if (!nome) {
      return;
    }
    this.produtos.push({ nome, ncm });
    this.novoProduto = { nome: '', ncm: '' };
  }

  removerProduto(index: number): void {
    this.produtos.splice(index, 1);
  }

  adicionarCliente(): void {
    const nome = this.novoCliente.nome.trim();
    const pais = this.novoCliente.pais.trim();
    if (!nome) {
      return;
    }
    this.clientes.push({ nome, pais });
    this.novoCliente = { nome: '', pais: '' };
  }

  removerCliente(index: number): void {
    this.clientes.splice(index, 1);
  }

  adicionarUsuario(): void {
    const email = this.novoUsuario.email.trim();
    const perfil = this.novoUsuario.perfil;
    if (!email || !perfil) {
      return;
    }
    this.usuarios.push({ email, perfil });
    this.novoUsuario = { email: '', perfil: '' };
  }

  removerUsuario(index: number): void {
    this.usuarios.splice(index, 1);
  }
}
