import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';
import { AddonPack } from '../../../../../types/saas-billing';

export interface CreditosDialogData {
  addons: AddonPack[];
}

type AiCode = 'AI_PACK' | 'AI_PACK_PLUS';

@Component({
  selector: 'app-creditos-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule, MatRadioModule],
  templateUrl: './creditos-dialog.component.html',
  styleUrls: ['./creditos-dialog.component.scss']
})
export class CreditosDialogComponent {
  dialogRef = inject(MatDialogRef<CreditosDialogComponent>);
  packs: AddonPack[] = [];
  selected: AiCode | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public data: CreditosDialogData) {
    const addons = (data && data.addons) || [];
    this.packs = addons.filter(a => a.code === 'AI_PACK' || a.code === 'AI_PACK_PLUS');
  }

  select(code: AddonPack['code']): void {
    if (code === 'AI_PACK' || code === 'AI_PACK_PLUS') {
      this.selected = code;
    }
  }

  trackByCode(_i: number, p: AddonPack): string {
    return p.code;
  }

  confirm(): void {
    if (this.selected) {
      this.dialogRef.close(this.selected);
    }
  }
}
