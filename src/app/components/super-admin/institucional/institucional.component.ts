import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { PublicSettingsMockService } from '../../../../services/publicSettingsMockService';
import { OfficialLinkAdmin, PublicSettings } from '../../../../types/public-settings';

@Component({
  selector: 'app-institucional',
  standalone: true,
  imports: [
    CommonModule, ReactiveFormsModule, MatCardModule, MatButtonModule, MatIconModule,
    MatFormFieldModule, MatInputModule, MatTableModule, MatSlideToggleModule,
    MatSnackBarModule, MatProgressBarModule,
  ],
  templateUrl: './institucional.component.html',
  styleUrls: ['./institucional.component.scss'],
})
export class InstitucionalComponent implements OnInit {
  private settingsService = inject(PublicSettingsMockService);
  private fb = inject(FormBuilder);
  private snackBar = inject(MatSnackBar);

  isLoading = false;
  form: FormGroup = this.fb.group({
    companyLegalName: [''],
    companyCnpj: [''],
    companyAddress: [''],
    mission: [''],
    vision: [''],
    values: [''],
    supportEmail: [''],
    commercialEmail: [''],
    phone: [''],
  });

  displayedColumns = ['category', 'name', 'url', 'country', 'displayOrder', 'active'];
  links: OfficialLinkAdmin[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.settingsService.getSettings().subscribe((s) => {
      this.form.patchValue(s);
    });
    this.settingsService.getOfficialLinks().subscribe((links) => {
      this.links = links;
      this.isLoading = false;
    });
  }

  trackByLinkId(_: number, row: OfficialLinkAdmin): string {
    return row.id;
  }

  salvar(): void {
    this.isLoading = true;
    const value = this.form.value as PublicSettings;
    this.settingsService.saveSettings(value).subscribe(() => {
      this.isLoading = false;
      this.snackBar.open('Configurações salvas (mock)', 'Fechar', { duration: 3000 });
    });
  }

  toggleLink(row: OfficialLinkAdmin): void {
    this.isLoading = true;
    this.settingsService.toggleLink(row.id).subscribe((links) => {
      this.links = links;
      this.isLoading = false;
      const updated = links.find((l) => l.id === row.id);
      const label = updated?.active ? 'ativado' : 'desativado';
      this.snackBar.open(`Link "${row.name}" ${label} (mock)`, 'Fechar', { duration: 3000 });
    });
  }
}
