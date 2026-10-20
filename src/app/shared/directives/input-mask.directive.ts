import { Directive, ElementRef, HostListener, Input, Optional, inject } from '@angular/core';
import { NgControl } from '@angular/forms';

export type MaskType = 'cpf' | 'cnpj' | 'telefone';

/**
 * Lightweight input mask for Brazilian CPF, CNPJ and phone. Formats the visible
 * value as the user types and keeps the bound FormControl in sync with the
 * SAME masked string (so the display never diverges from the model). Digits are
 * capped at the mask length; the backend strips non-digits anyway.
 *
 * Usage: <input appMask="cpf" formControlName="cpf">
 */
@Directive({
  selector: '[appMask]',
  standalone: true
})
export class InputMaskDirective {
  @Input('appMask') maskType: MaskType = 'cpf';

  private el = inject(ElementRef<HTMLInputElement>);
  private ngControl = inject(NgControl, { optional: true });

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const formatted = this.format(input.value);
    input.value = formatted;
    if (this.ngControl && this.ngControl.control) {
      this.ngControl.control.setValue(formatted, { emitEvent: true, emitModelToViewChange: false });
    }
  }

  private format(value: string): string {
    const digits = (value || '').replace(/\D/g, '');
    switch (this.maskType) {
      case 'cpf':
        return this.maskCpf(digits);
      case 'cnpj':
        return this.maskCnpj(digits);
      case 'telefone':
        return this.maskTelefone(digits);
      default:
        return value;
    }
  }

  private maskCpf(d: string): string {
    const s = d.slice(0, 11);
    let out = s;
    if (s.length > 9) {
      out = `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6, 9)}-${s.slice(9)}`;
    } else if (s.length > 6) {
      out = `${s.slice(0, 3)}.${s.slice(3, 6)}.${s.slice(6)}`;
    } else if (s.length > 3) {
      out = `${s.slice(0, 3)}.${s.slice(3)}`;
    }
    return out;
  }

  private maskCnpj(d: string): string {
    const s = d.slice(0, 14);
    let out = s;
    if (s.length > 12) {
      out = `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8, 12)}-${s.slice(12)}`;
    } else if (s.length > 8) {
      out = `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5, 8)}/${s.slice(8)}`;
    } else if (s.length > 5) {
      out = `${s.slice(0, 2)}.${s.slice(2, 5)}.${s.slice(5)}`;
    } else if (s.length > 2) {
      out = `${s.slice(0, 2)}.${s.slice(2)}`;
    }
    return out;
  }

  private maskTelefone(d: string): string {
    const s = d.slice(0, 11);
    if (s.length === 0) {
      return '';
    }
    if (s.length <= 2) {
      return `(${s}`;
    }
    if (s.length <= 6) {
      return `(${s.slice(0, 2)}) ${s.slice(2)}`;
    }
    if (s.length <= 10) {
      // landline / 8-digit: (00) 0000-0000
      return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
    }
    // mobile 9-digit: (00) 00000-0000
    return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
  }
}