// Cookie preferences dialog (§65). Standalone Angular Material.
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

export interface CookiePrefsData {
  analytics: boolean;
  preferences: boolean;
  marketing: boolean;
}

@Component({
  selector: 'app-cookie-preferences-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
  ],
  templateUrl: './cookie-preferences-dialog.component.html',
  styleUrl: './cookie-preferences-dialog.component.scss',
})
export class CookiePreferencesDialogComponent {
  analytics = false;
  preferences = false;
  marketing = false;

  constructor(
    private dialogRef: MatDialogRef<CookiePreferencesDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: CookiePrefsData | null,
  ) {
    this.analytics = data?.analytics ?? false;
    this.preferences = data?.preferences ?? false;
    this.marketing = data?.marketing ?? false;
  }

  rejectNonEssential(): void {
    this.dialogRef.close({ analytics: false, preferences: false, marketing: false });
  }

  savePreferences(): void {
    this.dialogRef.close({
      analytics: this.analytics,
      preferences: this.preferences,
      marketing: this.marketing,
    });
  }

  acceptAll(): void {
    this.dialogRef.close({ analytics: true, preferences: true, marketing: true });
  }
}
