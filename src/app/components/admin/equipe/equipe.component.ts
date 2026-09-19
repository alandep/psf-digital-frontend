import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';

import { ConvidarDialogComponent, ConvidarResult } from './convidar-dialog/convidar-dialog.component';
import {
  ConfirmarAcaoDialogComponent, ConfirmDialogData
} from '../usuarios/confirmar-acao-dialog/confirmar-acao-dialog.component';

interface TeamMember {
  nome: string;
  email: string;
  perfil: string;
  status: 'Ativo' | 'Convite pendente';
}

@Component({
  selector: 'app-equipe',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule,
    MatTooltipModule, MatSnackBarModule, MatDialogModule
  ],
  templateUrl: './equipe.component.html',
  styleUrls: ['./equipe.component.scss']
})
export class EquipeComponent {
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  cols = ['nome', 'email', 'perfil', 'status', 'actions'];

  members: TeamMember[] = [
    { nome: 'Ana Ribeiro', email: 'ana.ribeiro@empresa.com.br', perfil: 'Administrador', status: 'Ativo' },
    { nome: 'Carlos Mendes', email: 'carlos.mendes@empresa.com.br', perfil: 'Comex', status: 'Ativo' },
    { nome: 'Fernanda Lima', email: 'fernanda.lima@empresa.com.br', perfil: 'Financeiro', status: 'Ativo' },
    { nome: 'João Souza', email: 'joao.souza@empresa.com.br', perfil: 'Logística', status: 'Ativo' },
    { nome: 'Marina Costa', email: 'marina.costa@empresa.com.br', perfil: 'Compliance', status: 'Convite pendente' },
    { nome: 'Rafael Alves', email: 'rafael.alves@empresa.com.br', perfil: 'Operador', status: 'Ativo' }
  ];

  statusColor(status: TeamMember['status']): { color: string; bg: string } {
    return status === 'Ativo'
      ? { color: '#2e7d32', bg: '#e8f5e9' }
      : { color: '#ef6c00', bg: '#fff3e0' };
  }

  convidar(): void {
    const ref = this.dialog.open(ConvidarDialogComponent, {
      width: '460px',
      panelClass: 'assinatura-dialog-panel'
    });
    ref.afterClosed().subscribe((res: ConvidarResult | undefined) => {
      if (res) {
        const nome = res.email.split('@')[0].replace(/[._]/g, ' ')
          .replace(/\b\w/g, (c) => c.toUpperCase());
        this.members = [
          ...this.members,
          { nome, email: res.email, perfil: res.perfil, status: 'Convite pendente' }
        ];
        this.snackBar.open('Convite enviado (mock)', 'Fechar', { duration: 3000 });
      }
    });
  }

  remover(member: TeamMember): void {
    const data: ConfirmDialogData = {
      title: 'Remover usuário',
      message: `Deseja remover ${member.nome} da equipe? Esta ação pode ser desfeita reenviando o convite.`,
      icon: 'person_remove',
      iconColor: '#f44336',
      confirmText: 'Remover',
      confirmColor: 'warn'
    };
    const ref = this.dialog.open(ConfirmarAcaoDialogComponent, {
      width: '420px',
      data
    });
    ref.afterClosed().subscribe((ok) => {
      if (ok) {
        this.members = this.members.filter((m) => m !== member);
        this.snackBar.open('Usuário removido (mock)', 'Fechar', { duration: 3000 });
      }
    });
  }
}
