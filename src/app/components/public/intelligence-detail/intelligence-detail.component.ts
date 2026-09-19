import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { switchMap } from 'rxjs';
import { PublicHeaderComponent } from '../public-header/public-header.component';
import { PublicFooterComponent } from '../public-footer/public-footer.component';
import { IntelligenceMockService } from '../../../../services/intelligenceMockService';
import {
  IntelligenceItem, IMPACT_STYLES, TYPE_LABELS, ImpactStyle,
} from '../../../../types/intelligence';

@Component({
  selector: 'app-intelligence-detail',
  standalone: true,
  imports: [
    CommonModule, RouterModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule,
    PublicHeaderComponent, PublicFooterComponent,
  ],
  templateUrl: './intelligence-detail.component.html',
  styleUrls: ['./intelligence-detail.component.scss'],
})
export class IntelligenceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private intelligence = inject(IntelligenceMockService);

  isLoading = true;
  item: IntelligenceItem | null = null;
  typeLabel = '';
  impact: ImpactStyle | null = null;

  ngOnInit(): void {
    this.route.paramMap
      .pipe(switchMap((p) => this.intelligence.getIntelligenceItem(p.get('slug') ?? '')))
      .subscribe((item) => {
        this.item = item;
        if (item) {
          this.typeLabel = TYPE_LABELS[item.type];
          this.impact = IMPACT_STYLES[item.impactLevel];
        }
        this.isLoading = false;
      });
  }
}
