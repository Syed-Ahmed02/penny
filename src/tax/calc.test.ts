import { describe, it, expect } from 'vitest';
import {
  calculateBracketTax,
  calculatePersonalTax,
  calculateCorporateTax,
  formatCurrency,
  formatPercent,
} from './calc';
import { FEDERAL_PERSONAL_TAX_BRACKETS } from '../types/federal';

describe('formatCurrency', () => {
  it('should format CAD currency correctly', () => {
    expect(formatCurrency(1000)).toBe('$1,000.00');
    expect(formatCurrency(50000)).toBe('$50,000.00');
    expect(formatCurrency(123456.78)).toBe('$123,456.78');
  });

  it('should handle zero', () => {
    expect(formatCurrency(0)).toBe('$0.00');
  });
});

describe('formatPercent', () => {
  it('should format percentages correctly', () => {
    expect(formatPercent(0.15)).toBe('15.00%');
    expect(formatPercent(0.122)).toBe('12.20%');
    expect(formatPercent(0.33)).toBe('33.00%');
  });

  it('should handle zero', () => {
    expect(formatPercent(0)).toBe('0.00%');
  });
});

describe('calculateBracketTax', () => {
  const simpleBrackets = [
    { min: 0, max: 50000, rate: 0.10 },
    { min: 50000, max: 100000, rate: 0.20 },
    { min: 100000, max: null, rate: 0.30 },
  ];

  it('should calculate tax for income in first bracket only', () => {
    const result = calculateBracketTax(30000, simpleBrackets);
    expect(result.tax).toBeCloseTo(3000, 2);
    expect(result.marginalRate).toBe(0.10);
  });

  it('should calculate tax spanning two brackets', () => {
    const result = calculateBracketTax(75000, simpleBrackets);
    expect(result.tax).toBeCloseTo(10000, 2);
    expect(result.marginalRate).toBe(0.20);
  });

  it('should calculate tax spanning all brackets', () => {
    const result = calculateBracketTax(150000, simpleBrackets);
    expect(result.tax).toBeCloseTo(30000, 2);
    expect(result.marginalRate).toBe(0.30);
  });

  it('should handle zero income', () => {
    const result = calculateBracketTax(0, simpleBrackets);
    expect(result.tax).toBe(0);
    expect(result.marginalRate).toBe(0);
  });

  it('should handle income exactly at bracket boundary', () => {
    const result = calculateBracketTax(50000, simpleBrackets);
    expect(result.tax).toBeCloseTo(5000, 2);
    expect(result.marginalRate).toBe(0.10);
  });
});

describe('Federal Tax Bracket Data Regression', () => {
  it('2025 brackets should have correct boundaries', () => {
    const brackets2025 = FEDERAL_PERSONAL_TAX_BRACKETS[2025];
    expect(brackets2025[0].max).toBe(57375);
    expect(brackets2025[1].max).toBe(114750);
    expect(brackets2025[2].max).toBe(177882);
    expect(brackets2025[3].max).toBe(253414);
    expect(brackets2025[4].max).toBeNull();
  });

  it('2026 brackets should have correct boundaries', () => {
    const brackets2026 = FEDERAL_PERSONAL_TAX_BRACKETS[2026];
    expect(brackets2026[0].max).toBe(58523);
    expect(brackets2026[1].max).toBe(117045);
    expect(brackets2026[2].max).toBe(181440);
    expect(brackets2026[3].max).toBe(258482);
    expect(brackets2026[4].max).toBeNull();
  });

  it('2026 bracket 4 should NOT have the typo value 25848200', () => {
    const brackets2026 = FEDERAL_PERSONAL_TAX_BRACKETS[2026];
    expect(brackets2026[3].max).not.toBe(25848200);
  });
});

describe('calculatePersonalTax', () => {
  describe('$120k Ontario 2025 scenario', () => {
    it('should calculate correct tax for $120k income', () => {
      const result = calculatePersonalTax(120000, 2025, 'ON');

      expect(result.type).toBe('personal');
      expect(result.province).toBe('ON');
      expect(result.tax_year).toBe(2025);
      expect(result.income).toBe(120000);

      expect(result.total_tax).toBeGreaterThan(25000);
      expect(result.total_tax).toBeLessThan(35000);

      expect(result.marginal_rate).toBeCloseTo(0.3716, 2);

      expect(result.effective_rate).toBeGreaterThan(0.20);
      expect(result.effective_rate).toBeLessThan(0.35);
    });

    it('should include breakdown with federal and provincial components', () => {
      const result = calculatePersonalTax(120000, 2025, 'ON');

      expect(result.breakdown).toBeDefined();
      expect(result.breakdown.federal_tax).toBeGreaterThan(0);
      expect(result.breakdown.provincial_tax).toBeGreaterThan(0);
      expect(result.breakdown.federal_tax + result.breakdown.provincial_tax).toBeCloseTo(result.total_tax, 2);
    });
  });

  it('should handle zero income', () => {
    const result = calculatePersonalTax(0, 2025, 'ON');
    expect(result.total_tax).toBe(0);
    expect(result.effective_rate).toBe(0);
  });

  it('should work for 2026 tax year', () => {
    const result = calculatePersonalTax(120000, 2026, 'ON');
    expect(result.tax_year).toBe(2026);
    expect(result.total_tax).toBeGreaterThan(0);
  });
});

describe('calculateCorporateTax', () => {
  describe('$400k Ontario 2025 scenario (small business)', () => {
    it('should use small business rates for $400k income', () => {
      const result = calculateCorporateTax(400000, 2025, 'ON');

      expect(result.type).toBe('corporate');
      expect(result.province).toBe('ON');
      expect(result.regime).toBe('small_business');
    });

    it('should calculate ~12.2% combined rate for small business', () => {
      const result = calculateCorporateTax(400000, 2025, 'ON');

      expect(result.combined_rate).toBeCloseTo(0.122, 3);
      expect(result.federal_rate).toBe(0.09);
      expect(result.provincial_rate).toBe(0.032);
    });

    it('should calculate correct tax payable', () => {
      const result = calculateCorporateTax(400000, 2025, 'ON');
      expect(result.tax_payable).toBeCloseTo(48800, 0);
    });
  });

  describe('general corporate rate', () => {
    it('should use general rates for income over $500k', () => {
      const result = calculateCorporateTax(600000, 2025, 'ON');

      expect(result.regime).toBe('general');
      expect(result.combined_rate).toBeCloseTo(0.265, 3);
    });
  });

  it('should use small business rate for income exactly at $500k limit', () => {
    const result = calculateCorporateTax(500000, 2025, 'ON');
    expect(result.regime).toBe('small_business');
  });

  it('should use general rate for income $1 over limit', () => {
    const result = calculateCorporateTax(500001, 2025, 'ON');
    expect(result.regime).toBe('general');
  });
});
