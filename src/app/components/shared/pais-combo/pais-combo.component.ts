import { Component, Input, forwardRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { PAIS_SERVICE } from '../../../services/pais/pais-service.token';
import { IPaisService } from '../../../services/pais/pais-service.interface';
import { Pais } from '../../../../types/pais';

@Component({
  selector: 'app-pais-combo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PaisComboComponent), multi: true }],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input matInput [matAutocomplete]="autoPais" [value]="displayValue"
             (input)="onInput($any($event.target).value)"
             (blur)="onTouched()"
             [placeholder]="placeholder" [required]="required" [disabled]="disabled"
             [attr.aria-label]="label">
      <mat-autocomplete #autoPais="matAutocomplete" (optionSelected)="onSelect($event.option.value)">
        <mat-option *ngFor="let p of filtrar(filtro)" [value]="p.namePt">
          {{ p.namePt }} <span style="color:#999"> ({{ p.alpha2 }})</span>
        </mat-option>
      </mat-autocomplete>
      <mat-icon matSuffix>public</mat-icon>
    </mat-form-field>
  `
})
export class PaisComboComponent implements ControlValueAccessor, OnInit {
  @Input() label = 'País';
  @Input() placeholder = 'Buscar país';
  @Input() required = false;

  private readonly paisService = inject<IPaisService>(PAIS_SERVICE);
  paises: Pais[] = [];
  filtro = '';
  displayValue = '';
  disabled = false;

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.paisService.listar().subscribe({ next: p => this.paises = p ?? [], error: () => {} });
  }

  filtrar(term: string): Pais[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) { return this.paises.slice(0, 50); }
    return this.paises.filter(p =>
      p.namePt.toLowerCase().includes(t) ||
      p.alpha2.toLowerCase().includes(t) ||
      p.alpha3.toLowerCase().includes(t)
    ).slice(0, 50);
  }

  onInput(v: string): void { this.filtro = v; this.displayValue = v; this.onChange(v); }
  onSelect(namePt: string): void { this.filtro = namePt; this.displayValue = namePt; this.onChange(namePt); }

  // ControlValueAccessor
  writeValue(value: string): void { this.displayValue = value ?? ''; this.filtro = value ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}
