import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Strips everything but digits. */
export function onlyDigits(value: string | null | undefined): string {
  return (value ?? '').replace(/\D/g, '');
}

/** Pure CPF check-digit validation (11 digits, not all-equal). */
export function isValidCpf(raw: string | null | undefined): boolean {
  const cpf = onlyDigits(raw);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false;
  }
  const d = cpf.split('').map((c) => +c);
  for (let t = 9; t < 11; t++) {
    let sum = 0;
    for (let i = 0; i < t; i++) {
      sum += d[i] * (t + 1 - i);
    }
    let check = (sum * 10) % 11;
    if (check === 10) {
      check = 0;
    }
    if (check !== d[t]) {
      return false;
    }
  }
  return true;
}

/** Pure CNPJ check-digit validation (14 digits, not all-equal). */
export function isValidCnpj(raw: string | null | undefined): boolean {
  const cnpj = onlyDigits(raw);
  if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }
  const d = cnpj.split('').map((c) => +c);
  const w1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const w2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum1 = 0;
  for (let i = 0; i < 12; i++) {
    sum1 += d[i] * w1[i];
  }
  const c1 = sum1 % 11 < 2 ? 0 : 11 - (sum1 % 11);
  if (c1 !== d[12]) {
    return false;
  }
  let sum2 = 0;
  for (let i = 0; i < 13; i++) {
    sum2 += d[i] * w2[i];
  }
  const c2 = sum2 % 11 < 2 ? 0 : 11 - (sum2 % 11);
  return c2 === d[13];
}

/** Reactive-forms validator: CPF with valid check digits. */
export function cpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (!v) {
      return null; // required is handled separately
    }
    return isValidCpf(v) ? null : { cpf: true };
  };
}

/** Reactive-forms validator: CNPJ with valid check digits. */
export function cnpjValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value;
    if (!v) {
      return null;
    }
    return isValidCnpj(v) ? null : { cnpj: true };
  };
}

/** Brazilian phone: 10 or 11 digits (DDD + number). */
export function telefoneValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = onlyDigits(control.value);
    if (!v) {
      return null; // optional
    }
    return v.length === 10 || v.length === 11 ? null : { telefone: true };
  };
}