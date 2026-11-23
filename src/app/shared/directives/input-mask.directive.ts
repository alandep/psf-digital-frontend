import { AfterViewInit, DestroyRef, Directive, ElementRef, HostListener, Input, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { formatCardNumber } from '../payment/card-utils';

export type MaskType = 'cpf' | 'cnpj' | 'telefone' | 'cep' | 'cartao' | 'validade' | 'cvv';

/**
 * Máscara de entrada para CPF, CNPJ, telefone, CEP e dados de cartão.
 *
 * - Formata enquanto o usuário digita e mantém o FormControl com a MESMA string
 *   mascarada exibida (o backend remove os não-dígitos).
 * - Também formata quando o valor é atribuído por código (setValue/patchValue):
 *   escuta `valueChanges` do controle e reescreve o valor formatado com `emitEvent: false`.
 * - Preserva a posição do cursor (conta os dígitos à esquerda do cursor).
 *
 * Tipos: cpf, cnpj, telefone, cep, cartao (4-4-4-4; Amex 4-6-5; Diners 4-6-4),
 * validade (MM/AA) e cvv (até 4 dígitos).
 *
 * Uso: <input appMask="cpf" formControlName="cpf">
 */
@Directive({
  selector: '[appMask]',
  standalone: true
})
export class InputMaskDirective implements AfterViewInit {
  @Input('appMask') maskType: MaskType = 'cpf';

  private readonly el = inject<ElementRef<HTMLInputElement>>(ElementRef);
  private readonly ngControl = inject(NgControl, { optional: true });
  private readonly destroyRef = inject(DestroyRef);

  ngAfterViewInit(): void {
    const control = this.ngControl?.control;
    if (!control) {
      return;
    }
    this.applyProgrammatic(control.value);
    this.ngControl?.valueChanges
      ?.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((value: unknown) => this.applyProgrammatic(value));
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const raw = input.value;
    const caret = input.selectionStart ?? raw.length;
    const digitsBeforeCaret = this.countDigits(raw.slice(0, caret));
    const formatted = this.format(raw);
    input.value = formatted;
    if (caret < raw.length) {
      this.restoreCaret(input, formatted, digitsBeforeCaret);
    }
    this.ngControl?.control?.setValue(formatted, { emitEvent: true, emitModelToViewChange: false });
  }

  /** Reformata valores vindos do modelo (setValue/patchValue/reset). */
  private applyProgrammatic(value: unknown): void {
    if (typeof value !== 'string' && typeof value !== 'number') {
      return;
    }
    const current = String(value);
    const formatted = this.format(current);
    if (formatted !== current) {
      this.ngControl?.control?.setValue(formatted, { emitEvent: false });
    }
    const input = this.el.nativeElement;
    if (input.value !== formatted) {
      input.value = formatted;
    }
  }

  private countDigits(s: string): number {
    return s.replace(/\D/g, '').length;
  }

  private restoreCaret(input: HTMLInputElement, formatted: string, digits: number): void {
    let pos = 0;
    if (digits > 0) {
      let seen = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (/\d/.test(formatted[i])) {
          seen++;
          if (seen === digits) {
            pos = i + 1;
            break;
          }
        }
      }
      if (seen < digits) {
        pos = formatted.length;
      }
    }
    try {
      input.setSelectionRange(pos, pos);
    } catch {
      /* alguns tipos de input não suportam seleção */
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
      case 'cep':
        return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5, 8)}` : digits;
      case 'cartao':
        return formatCardNumber(digits);
      case 'validade':
        return this.maskValidade(digits);
      case 'cvv':
        return digits.slice(0, 4);
      default:
        return value;
    }
  }

  private maskValidade(d: string): string {
    let s = d.slice(0, 4);
    // Mês iniciado com 2-9 vira 02-09.
    if (s.length === 1 && Number(s) > 1) {
      s = `0${s}`;
    }
    return s.length > 2 ? `${s.slice(0, 2)}/${s.slice(2)}` : s;
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
      return `(${s.slice(0, 2)}) ${s.slice(2, 6)}-${s.slice(6)}`;
    }
    return `(${s.slice(0, 2)}) ${s.slice(2, 7)}-${s.slice(7)}`;
  }
}
