import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';

interface ValueChip {
  id: string;
  label: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatIconModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  values: ValueChip[] = [
    { id: 'confianca', label: 'Confiança' },
    { id: 'seguranca', label: 'Segurança' },
    { id: 'inovacao', label: 'Inovação' },
    { id: 'transparencia', label: 'Transparência' },
    { id: 'eficiencia', label: 'Eficiência' },
    { id: 'inteligencia', label: 'Inteligência' },
    { id: 'foco-cliente', label: 'Foco no cliente' },
  ];

  trackById(_: number, item: ValueChip): string { return item.id; }
}
