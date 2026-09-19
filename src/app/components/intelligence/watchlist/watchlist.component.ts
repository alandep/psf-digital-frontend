import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import {
  WatchlistMockService,
  TARGET_TYPE_LABELS,
} from '../../../../services/watchlistMockService';
import {
  WatchlistItem,
  WatchlistSuggestion,
  WatchlistTargetType,
} from '../../../../types/watchlist';

interface TypeOption {
  value: WatchlistTargetType;
  label: string;
}

@Component({
  selector: 'app-watchlist',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatTooltipModule,
    MatSnackBarModule,
  ],
  templateUrl: './watchlist.component.html',
  styleUrls: ['./watchlist.component.scss'],
})
export class WatchlistComponent implements OnInit {
  private service = inject(WatchlistMockService);
  private snackBar = inject(MatSnackBar);

  // Stable fields bound in the template (no array-rebuilding getters).
  items: WatchlistItem[] = [];
  suggestions: WatchlistSuggestion[] = [];
  typeOptions: TypeOption[] = [];
  readonly typeLabels = TARGET_TYPE_LABELS;

  isLoading = false;
  newType: WatchlistTargetType = 'COUNTRY';
  newLabel = '';

  ngOnInit(): void {
    this.suggestions = this.service.getSuggestions();
    this.typeOptions = (Object.keys(TARGET_TYPE_LABELS) as WatchlistTargetType[]).map(
      (value) => ({ value, label: TARGET_TYPE_LABELS[value] })
    );
    this.loadWatchlist();
  }

  trackById(_index: number, item: WatchlistItem): string {
    return item.id;
  }

  trackSuggestion(_index: number, s: WatchlistSuggestion): string {
    return s.type + '|' + s.label;
  }

  private loadWatchlist(): void {
    this.isLoading = true;
    this.service.getWatchlist().subscribe((list) => {
      this.items = list;
      this.isLoading = false;
    });
  }

  add(): void {
    const label = this.newLabel.trim();
    if (!label) {
      return;
    }
    this.service.addItem(this.newType, label).subscribe((list) => {
      this.items = list;
      this.newLabel = '';
      this.snackBar.open('Acompanhamento adicionado (mock)', 'Fechar', {
        duration: 3000,
      });
    });
  }

  addSuggestion(s: WatchlistSuggestion): void {
    this.service.addItem(s.type, s.label).subscribe((list) => {
      this.items = list;
      this.snackBar.open('Acompanhamento adicionado (mock)', 'Fechar', {
        duration: 3000,
      });
    });
  }

  toggle(item: WatchlistItem): void {
    this.service.toggleItem(item.id).subscribe((list) => {
      this.items = list;
    });
  }

  remove(item: WatchlistItem): void {
    this.service.removeItem(item.id).subscribe((list) => {
      this.items = list;
      this.snackBar.open('Acompanhamento removido (mock)', 'Fechar', {
        duration: 3000,
      });
    });
  }
}
