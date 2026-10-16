import { Component, Input, forwardRef, inject, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { LOCALIDADE_SERVICE } from '../../../services/localidade/localidade-service.token';
import { ILocalidadeService } from '../../../services/localidade/localidade-service.interface';
import { Cidade } from '../../../../types/localidade';

/**
 * Searchable Brazilian city combo that cascades from the selected UF. Set the
 * [uf] input (bound to the estado combo output); when it changes the city list
 * reloads and the current selection is cleared if it no longer belongs to the
 * new UF. ControlValueAccessor value is the city name string.
 */
@Component({
  selector: 'app-cidade-combo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => CidadeComboComponent), multi: true }],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input matInput [matAutocomplete]="autoCidade" [value]="displayValue"
             (input)="onInput($any($event.target).value)"
             (blur)="onTouched()"
             [placeholder]="uf ? placeholder : 'Selecione o estado primeiro'"
             [required]="required" [disabled]="disabled || !uf"
             [attr.aria-label]="label">
      <mat-autocomplete #autoCidade="matAutocomplete" (optionSelected)="onSelect($event.option.value)">
        <mat-option *ngFor="let c of filtrar(filtro)" [value]="c.name">{{ c.name }}</mat-option>
      </mat-autocomplete>
      <mat-icon matSuffix>location_city</mat-icon>
    </mat-form-field>
  `
})
export class CidadeComboComponent implements ControlValueAccessor, OnChanges {
  @Input() label = 'Cidade';
  @Input() placeholder = 'Buscar cidade';
  @Input() required = false;
  @Input() uf = '';

  private readonly service = inject<ILocalidadeService>(LOCALIDADE_SERVICE);
  cidades: Cidade[] = [];
  filtro = '';
  displayValue = '';
  disabled = false;

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['uf']) {
      const prev = changes['uf'].previousValue;
      const curr = changes['uf'].currentValue;
      this.loadCities(curr);
      // Clear the selection when the user actively switches state.
      if (prev !== undefined && prev !== null && prev !== '' && prev !== curr) {
        this.displayValue = '';
        this.filtro = '';
        this.onChange('');
      }
    }
  }

  private loadCities(uf: string): void {
    const key = (uf ?? '').trim().toUpperCase();
    if (!key) { this.cidades = []; return; }
    this.service.listarCidades(key).subscribe({ next: c => this.cidades = c ?? [], error: () => this.cidades = [] });
  }

  filtrar(term: string): Cidade[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) { return this.cidades.slice(0, 50); }
    return this.cidades.filter(c => c.name.toLowerCase().includes(t)).slice(0, 50);
  }

  onInput(v: string): void { this.filtro = v; this.displayValue = v; this.onChange(v); }
  onSelect(name: string): void { this.filtro = name; this.displayValue = name; this.onChange(name); }

  writeValue(value: string): void { this.displayValue = value ?? ''; this.filtro = value ?? ''; }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}