import { Component, Input, Output, EventEmitter, forwardRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { LOCALIDADE_SERVICE } from '../../../services/localidade/localidade-service.token';
import { ILocalidadeService } from '../../../services/localidade/localidade-service.interface';
import { Estado } from '../../../../types/localidade';

/**
 * Searchable Brazilian state (UF) combo. ControlValueAccessor whose value is the
 * UF code (e.g. "SP"). Emits ufChange so a dependent city combo can cascade.
 */
@Component({
  selector: 'app-estado-combo',
  standalone: true,
  imports: [CommonModule, MatFormFieldModule, MatInputModule, MatAutocompleteModule, MatIconModule],
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => EstadoComboComponent), multi: true }],
  template: `
    <mat-form-field appearance="outline" class="full-width">
      <mat-label>{{ label }}</mat-label>
      <input matInput [matAutocomplete]="autoEstado" [value]="displayValue"
             (input)="onInput($any($event.target).value)"
             (blur)="onTouched()"
             [placeholder]="placeholder" [required]="required" [disabled]="disabled"
             [attr.aria-label]="label">
      <mat-autocomplete #autoEstado="matAutocomplete" (optionSelected)="onSelect($event.option.value)">
        <mat-option *ngFor="let e of filtrar(filtro)" [value]="e.uf">
          {{ e.name }} <span style="color:#999"> ({{ e.uf }})</span>
        </mat-option>
      </mat-autocomplete>
      <mat-icon matSuffix>map</mat-icon>
    </mat-form-field>
  `
})
export class EstadoComboComponent implements ControlValueAccessor, OnInit {
  @Input() label = 'Estado';
  @Input() placeholder = 'Buscar estado';
  @Input() required = false;
  @Output() ufChange = new EventEmitter<string>();

  private readonly service = inject<ILocalidadeService>(LOCALIDADE_SERVICE);
  estados: Estado[] = [];
  filtro = '';
  displayValue = '';
  disabled = false;

  private onChange: (v: string) => void = () => {};
  onTouched: () => void = () => {};

  ngOnInit(): void {
    this.service.listarEstados().subscribe({ next: e => { this.estados = e ?? []; this.syncDisplay(); }, error: () => {} });
  }

  filtrar(term: string): Estado[] {
    const t = (term ?? '').trim().toLowerCase();
    if (!t) { return this.estados; }
    return this.estados.filter(e => e.name.toLowerCase().includes(t) || e.uf.toLowerCase().includes(t));
  }

  onInput(v: string): void { this.filtro = v; this.displayValue = v; }
  onSelect(uf: string): void {
    const est = this.estados.find(e => e.uf === uf);
    this.displayValue = est ? est.name : uf;
    this.filtro = this.displayValue;
    this.onChange(uf);
    this.ufChange.emit(uf);
  }

  private syncDisplay(): void {
    const est = this.estados.find(e => e.uf === this.currentUf);
    if (est) { this.displayValue = est.name; this.filtro = est.name; }
  }
  private currentUf = '';

  writeValue(value: string): void { this.currentUf = value ?? ''; this.displayValue = value ?? ''; this.filtro = value ?? ''; this.syncDisplay(); }
  registerOnChange(fn: (v: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  setDisabledState(isDisabled: boolean): void { this.disabled = isDisabled; }
}