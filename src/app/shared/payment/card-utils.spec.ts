import { FormControl } from '@angular/forms';
import {
  cardCvvValidator,
  cardExpiryValidator,
  cardNumberValidator,
  cvvLength,
  detectBrand,
  formatCardNumber,
  isExpiryValid,
  lengthsFor,
  luhnValid,
  toGatewayCard
} from './card-utils';

describe('card-utils', () => {
  describe('luhnValid', () => {
    it('aceita números de teste válidos', () => {
      expect(luhnValid('4111111111111111')).toBeTrue();
      expect(luhnValid('5555555555554444')).toBeTrue();
      expect(luhnValid('378282246310005')).toBeTrue();
    });
    it('rejeita número com dígito alterado', () => {
      expect(luhnValid('4111111111111112')).toBeFalse();
    });
  });

  describe('detectBrand', () => {
    it('detecta bandeiras comuns', () => {
      expect(detectBrand('4111111111111111')).toBe('VISA');
      expect(detectBrand('5555555555554444')).toBe('MASTERCARD');
      expect(detectBrand('2221000000000009')).toBe('MASTERCARD');
      expect(detectBrand('378282246310005')).toBe('AMEX');
      expect(detectBrand('30569309025904')).toBe('DINERS');
      expect(detectBrand('6011111111111117')).toBe('DISCOVER');
      expect(detectBrand('6062825624254001')).toBe('HIPERCARD');
    });
    it('detecta Elo antes de Visa/Discover', () => {
      expect(detectBrand('4011781234567890')).toBe('ELO');
      expect(detectBrand('5067001234567890')).toBe('ELO');
      expect(detectBrand('6500311234567890')).toBe('ELO');
    });
    it('retorna null para vazio ou desconhecido', () => {
      expect(detectBrand('')).toBeNull();
      expect(detectBrand('9999')).toBeNull();
    });
  });

  describe('lengthsFor / cvvLength', () => {
    it('retorna comprimentos por bandeira', () => {
      expect(lengthsFor('AMEX')).toEqual([15]);
      expect(lengthsFor('VISA')).toEqual([13, 16, 19]);
      expect(lengthsFor('DINERS')).toEqual([14]);
    });
    it('CVV tem 4 dígitos só na Amex', () => {
      expect(cvvLength('AMEX')).toBe(4);
      expect(cvvLength('VISA')).toBe(3);
      expect(cvvLength(null)).toBe(3);
    });
  });

  describe('formatCardNumber', () => {
    it('agrupa 4-4-4-4, Amex 4-6-5 e Diners 4-6-4', () => {
      expect(formatCardNumber('4111111111111111')).toBe('4111 1111 1111 1111');
      expect(formatCardNumber('378282246310005')).toBe('3782 822463 10005');
      expect(formatCardNumber('30569309025904')).toBe('3056 930902 5904');
    });
  });

  describe('validade', () => {
    const now = new Date(2026, 5, 15); // jun/2026
    it('aceita mês atual e futuro até 20 anos', () => {
      expect(isExpiryValid('06/26', now)).toBeTrue();
      expect(isExpiryValid('12/30', now)).toBeTrue();
      expect(isExpiryValid('06/46', now)).toBeTrue();
    });
    it('rejeita vencida, mês inválido e além de 20 anos', () => {
      expect(isExpiryValid('05/26', now)).toBeFalse();
      expect(isExpiryValid('13/28', now)).toBeFalse();
      expect(isExpiryValid('00/28', now)).toBeFalse();
      expect(isExpiryValid('07/46', now)).toBeFalse();
      expect(isExpiryValid('1/2', now)).toBeFalse();
    });
  });

  describe('validators', () => {
    it('cardNumberValidator valida Luhn e comprimento', () => {
      const v = cardNumberValidator();
      expect(v(new FormControl('4111 1111 1111 1111'))).toBeNull();
      expect(v(new FormControl('4111 1111 1111 1112'))).toEqual({ cardNumber: true });
      expect(v(new FormControl('3782 822463 1000'))).toEqual({ cardNumber: true });
    });
    it('cardExpiryValidator usa o relógio informado', () => {
      const v = cardExpiryValidator(() => new Date(2026, 5, 1));
      expect(v(new FormControl('06/26'))).toBeNull();
      expect(v(new FormControl('01/20'))).toEqual({ cardExpiry: true });
    });
    it('cardCvvValidator depende da bandeira', () => {
      const amex = cardCvvValidator(() => 'AMEX');
      const visa = cardCvvValidator(() => 'VISA');
      expect(amex(new FormControl('123'))).toEqual({ cardCvv: { length: 4 } });
      expect(amex(new FormControl('1234'))).toBeNull();
      expect(visa(new FormControl('123'))).toBeNull();
      expect(visa(new FormControl('1234'))).toEqual({ cardCvv: { length: 3 } });
    });
  });

  it('toGatewayCard normaliza os campos', () => {
    expect(
      toGatewayCard({ holderName: ' MARIA SILVA ', number: '4111 1111 1111 1111', expiry: '07/29', ccv: '123' })
    ).toEqual({
      holderName: 'MARIA SILVA',
      number: '4111111111111111',
      expiryMonth: '07',
      expiryYear: '2029',
      ccv: '123'
    });
  });
});
