import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { GatewayCard } from '../../../types/billing-api';
import { onlyDigits } from '../validators/br-document.validators';

/**
 * Utilitários puros de cartão de crédito (bandeira, Luhn, comprimentos, validade)
 * e ValidatorFns de formulário. Sem dependências de DOM: testáveis em unidade.
 *
 * Reutilizável pelas telas de checkout e de assinatura (logadas).
 */

export type CardBrand = 'VISA' | 'MASTERCARD' | 'AMEX' | 'ELO' | 'HIPERCARD' | 'DINERS' | 'DISCOVER';

/** Telefone BR com 10–11 dígitos (erro `telefone`). Reexportado para conveniência. */
export { telefoneValidator } from '../validators/br-document.validators';

export const CARD_BRAND_LABELS: Record<CardBrand, string> = {
  VISA: 'Visa',
  MASTERCARD: 'Mastercard',
  AMEX: 'American Express',
  ELO: 'Elo',
  HIPERCARD: 'Hipercard',
  DINERS: 'Diners Club',
  DISCOVER: 'Discover'
};

/** Faixas (inclusivas) de BIN de 6 dígitos da Elo. */
const ELO_RANGES: ReadonlyArray<readonly [number, number]> = [
  [401178, 401179], [431274, 431274], [438935, 438935], [451416, 451416],
  [457393, 457393], [457631, 457632], [504175, 504175], [506699, 506778],
  [509000, 509999], [627780, 627780], [636297, 636297], [636368, 636368],
  [650031, 650033], [650035, 650051], [650405, 650439], [650485, 650538],
  [650541, 650598], [650700, 650718], [650720, 650727], [650901, 650978],
  [651652, 651679], [655000, 655019], [655021, 655058]
];

function isElo(digits: string): boolean {
  if (digits.length < 6) {
    return false;
  }
  const bin = Number(digits.slice(0, 6));
  return ELO_RANGES.some(([from, to]) => bin >= from && bin <= to);
}

/** Detecta a bandeira pelo BIN. Retorna null se não reconhecida. */
export function detectBrand(number: string | null | undefined): CardBrand | null {
  const d = onlyDigits(number);
  if (!d) {
    return null;
  }
  if (isElo(d)) {
    return 'ELO';
  }
  if (d.startsWith('606282') || d.startsWith('3841')) {
    return 'HIPERCARD';
  }
  if (/^3[47]/.test(d)) {
    return 'AMEX';
  }
  if (/^(30[0-5]|36|38|39)/.test(d)) {
    return 'DINERS';
  }
  if (/^(6011|65|64[4-9])/.test(d)) {
    return 'DISCOVER';
  }
  if (/^5[1-5]/.test(d)) {
    return 'MASTERCARD';
  }
  if (d.length >= 4) {
    const p4 = Number(d.slice(0, 4));
    if (p4 >= 2221 && p4 <= 2720) {
      return 'MASTERCARD';
    }
  }
  if (d.startsWith('4')) {
    return 'VISA';
  }
  return null;
}

/** Algoritmo de Luhn. */
export function luhnValid(number: string | null | undefined): boolean {
  const d = onlyDigits(number);
  if (d.length < 12) {
    return false;
  }
  let sum = 0;
  let double = false;
  for (let i = d.length - 1; i >= 0; i--) {
    let n = d.charCodeAt(i) - 48;
    if (double) {
      n *= 2;
      if (n > 9) {
        n -= 9;
      }
    }
    sum += n;
    double = !double;
  }
  return sum % 10 === 0;
}

/** Comprimentos válidos do número do cartão. Bandeira desconhecida: 13–19. */
export function lengthsFor(brand: CardBrand | null): number[] {
  switch (brand) {
    case 'VISA':
    case 'HIPERCARD':
      return [13, 16, 19];
    case 'MASTERCARD':
    case 'ELO':
    case 'DISCOVER':
      return [16];
    case 'AMEX':
      return [15];
    case 'DINERS':
      return [14];
    default:
      return [13, 14, 15, 16, 17, 18, 19];
  }
}

/** Tamanho do CVV (4 para Amex, 3 nas demais). */
export function cvvLength(brand: CardBrand | null): number {
  return brand === 'AMEX' ? 4 : 3;
}

/** Máximo de dígitos aceitos na digitação do número. */
export function maxCardDigits(brand: CardBrand | null): number {
  return Math.max(...lengthsFor(brand));
}

/** Agrupa o número em blocos (4-4-4-4; Amex 4-6-5; Diners 4-6-4). */
export function formatCardNumber(value: string | null | undefined): string {
  const brand = detectBrand(value);
  const d = onlyDigits(value).slice(0, maxCardDigits(brand));
  const groups = brand === 'AMEX' ? [4, 6, 5] : brand === 'DINERS' ? [4, 6, 4] : [4, 4, 4, 4, 3];
  const parts: string[] = [];
  let pos = 0;
  for (const size of groups) {
    if (pos >= d.length) {
      break;
    }
    parts.push(d.slice(pos, pos + size));
    pos += size;
  }
  return parts.join(' ');
}

export interface ParsedExpiry {
  month: number;
  /** Ano com 4 dígitos. */
  year: number;
}

/** Interpreta "MM/AA" (ano 20AA). Retorna null se o formato for inválido. */
export function parseExpiry(value: string | null | undefined): ParsedExpiry | null {
  const m = /^(\d{2})\s*\/\s*(\d{2})$/.exec((value ?? '').trim());
  if (!m) {
    return null;
  }
  return { month: Number(m[1]), year: 2000 + Number(m[2]) };
}

/** Validade: mês 01–12, não vencida (vale até o fim do mês) e até +20 anos. */
export function isExpiryValid(value: string | null | undefined, now: Date = new Date()): boolean {
  const e = parseExpiry(value);
  if (!e || e.month < 1 || e.month > 12) {
    return false;
  }
  const nowIdx = now.getFullYear() * 12 + now.getMonth();
  const expIdx = e.year * 12 + (e.month - 1);
  return expIdx >= nowIdx && expIdx <= nowIdx + 20 * 12;
}

/** Número do cartão: bandeira reconhecida opcional, comprimento por bandeira e Luhn. Erro: `cardNumber`. */
export function cardNumberValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string | null;
    if (!raw) {
      return null; // required é tratado à parte
    }
    const digits = onlyDigits(raw);
    const lengths = lengthsFor(detectBrand(digits));
    return lengths.includes(digits.length) && luhnValid(digits) ? null : { cardNumber: true };
  };
}

/** Validade MM/AA. Erro: `cardExpiry`. */
export function cardExpiryValidator(now: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string | null;
    if (!raw) {
      return null;
    }
    return isExpiryValid(raw, now()) ? null : { cardExpiry: true };
  };
}

/** CVV com 3 dígitos (4 na Amex), conforme a bandeira atual. Erro: `cardCvv` com `{ length }`. */
export function cardCvvValidator(getBrand: () => CardBrand | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string | null;
    if (!raw) {
      return null;
    }
    const expected = cvvLength(getBrand());
    return /^\d+$/.test(raw) && raw.length === expected ? null : { cardCvv: { length: expected } };
  };
}

/** CEP com 8 dígitos. Erro: `cep`. */
export function cepValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = control.value as string | null;
    if (!raw) {
      return null;
    }
    return onlyDigits(raw).length === 8 ? null : { cep: true };
  };
}

/** Valores do formulário de cartão (campos mascarados). */
export interface CardFormValue {
  holderName: string;
  number: string;
  expiry: string;
  ccv: string;
}

/** Converte o formulário mascarado para o formato do gateway (contrato `pagamento.cartao`). */
export function toGatewayCard(form: CardFormValue): GatewayCard {
  const exp = parseExpiry(form.expiry);
  return {
    holderName: form.holderName.trim(),
    number: onlyDigits(form.number),
    expiryMonth: exp ? String(exp.month).padStart(2, '0') : '',
    expiryYear: exp ? String(exp.year) : '',
    ccv: onlyDigits(form.ccv)
  };
}
