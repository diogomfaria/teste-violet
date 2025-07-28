export class CpfValidator {
  private static readonly BLACKLIST = [
    '00000000000',
    '11111111111',
    '22222222222',
    '33333333333',
    '44444444444',
    '55555555555',
    '66666666666',
    '77777777777',
    '88888888888',
    '99999999999',
    '12345678909'
  ];

  private static cleanCpf(cpf: string): string {
    return cpf.replace(/[^\d]/g, '');
  }

  private static isValidLength(cpf: string): boolean {
    return cpf.length === 11;
  }

  private static isBlacklisted(cpf: string): boolean {
    return this.BLACKLIST.includes(cpf);
  }

  private static extractDigit(cpf: string): string {
    return cpf.substring(9);
  }

  private static calculateDigit(cpf: string, factor: number): number {
    let total = 0;
    for (const digit of cpf) {
      if (factor > 1) total += parseInt(digit, 10) * factor--;
    }
    const rest = total % 11;
    return (rest < 2) ? 0 : 11 - rest;
  }

  static validate(cpf: string): boolean {
    if (!cpf) return false;
    
    const cleanedCpf = this.cleanCpf(cpf);
    if (!this.isValidLength(cleanedCpf) || this.isBlacklisted(cleanedCpf)) {
      return false;
    }

    const cpfWithoutDigits = cleanedCpf.substring(0, 9);
    const firstDigit = this.calculateDigit(cpfWithoutDigits, 10);
    const secondDigit = this.calculateDigit(cpfWithoutDigits + firstDigit, 11);
    
    const actualDigit = this.extractDigit(cleanedCpf);
    const calculatedDigit = `${firstDigit}${secondDigit}`;
    
    return actualDigit === calculatedDigit;
  }
}
