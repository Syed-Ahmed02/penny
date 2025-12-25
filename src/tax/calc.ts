import { TaxBracket, TaxYear } from '../types/types';
import { FEDERAL_PERSONAL_TAX_BRACKETS, FEDERAL_CORPORATE_RATES } from '../types/federal';
import { ONTARIO_PERSONAL_TAX_BRACKETS, ONTARIO_CORPORATE_RATES } from '../types/ontario';

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export interface BracketTaxResult {
  tax: number;
  marginalRate: number;
}

export function calculateBracketTax(income: number, brackets: TaxBracket[]): BracketTaxResult {
  let tax = 0;
  let marginalRate = 0;

  for (const bracket of brackets) {
    const upperLimit = bracket.max ?? Infinity;

    if (income > bracket.min) {
      const taxableInBracket = Math.min(income, upperLimit) - bracket.min;
      tax += taxableInBracket * bracket.rate;
      marginalRate = bracket.rate;
    }

    if (income <= upperLimit) {
      break;
    }
  }

  return { tax, marginalRate };
}

export interface PersonalTaxResult {
  type: 'personal';
  province: string;
  tax_year: TaxYear;
  income: number;
  income_formatted: string;
  marginal_rate: number;
  marginal_rate_formatted: string;
  effective_rate: number;
  effective_rate_formatted: string;
  total_tax: number;
  total_tax_formatted: string;
  breakdown: {
    federal_tax: number;
    federal_tax_formatted: string;
    federal_marginal_rate: number;
    federal_marginal_rate_formatted: string;
    provincial_tax: number;
    provincial_tax_formatted: string;
    provincial_marginal_rate: number;
    provincial_marginal_rate_formatted: string;
  };
}

export function calculatePersonalTax(income: number, year: TaxYear, province: string): PersonalTaxResult {
  const federalBrackets = FEDERAL_PERSONAL_TAX_BRACKETS[year];
  const provincialBrackets = ONTARIO_PERSONAL_TAX_BRACKETS[year];

  const federalResult = calculateBracketTax(income, federalBrackets);
  const provincialResult = calculateBracketTax(income, provincialBrackets);

  const totalTax = federalResult.tax + provincialResult.tax;
  const marginalRate = federalResult.marginalRate + provincialResult.marginalRate;
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    type: 'personal',
    province,
    tax_year: year,
    income,
    income_formatted: formatCurrency(income),
    marginal_rate: marginalRate,
    marginal_rate_formatted: formatPercent(marginalRate),
    effective_rate: effectiveRate,
    effective_rate_formatted: formatPercent(effectiveRate),
    total_tax: totalTax,
    total_tax_formatted: formatCurrency(totalTax),
    breakdown: {
      federal_tax: federalResult.tax,
      federal_tax_formatted: formatCurrency(federalResult.tax),
      federal_marginal_rate: federalResult.marginalRate,
      federal_marginal_rate_formatted: formatPercent(federalResult.marginalRate),
      provincial_tax: provincialResult.tax,
      provincial_tax_formatted: formatCurrency(provincialResult.tax),
      provincial_marginal_rate: provincialResult.marginalRate,
      provincial_marginal_rate_formatted: formatPercent(provincialResult.marginalRate),
    },
  };
}

export interface CorporateTaxResult {
  type: 'corporate';
  province: string;
  tax_year: TaxYear;
  income: number;
  income_formatted: string;
  regime: 'small_business' | 'general';
  regime_description: string;
  combined_rate: number;
  combined_rate_formatted: string;
  federal_rate: number;
  federal_rate_formatted: string;
  provincial_rate: number;
  provincial_rate_formatted: string;
  tax_payable: number;
  tax_payable_formatted: string;
  breakdown: {
    federal_tax: number;
    federal_tax_formatted: string;
    provincial_tax: number;
    provincial_tax_formatted: string;
  };
  business_limit: number;
  business_limit_formatted: string;
}

export function calculateCorporateTax(income: number, year: TaxYear, province: string): CorporateTaxResult {
  const federalRates = FEDERAL_CORPORATE_RATES[year];
  const provincialRates = ONTARIO_CORPORATE_RATES[year];

  const isSmallBusiness = income <= provincialRates.business_limit;
  const regime = isSmallBusiness ? 'small_business' : 'general';

  const federalRate = isSmallBusiness ? federalRates.small_business : federalRates.general;
  const provincialRate = isSmallBusiness ? provincialRates.small_business : provincialRates.general;
  const combinedRate = federalRate + provincialRate;

  const federalTax = income * federalRate;
  const provincialTax = income * provincialRate;
  const totalTax = income * combinedRate;

  return {
    type: 'corporate',
    province,
    tax_year: year,
    income,
    income_formatted: formatCurrency(income),
    regime,
    regime_description: isSmallBusiness
      ? `Small Business Deduction applies (income ≤ ${formatCurrency(provincialRates.business_limit)} business limit)`
      : `General corporate rate applies (income > ${formatCurrency(provincialRates.business_limit)} business limit)`,
    combined_rate: combinedRate,
    combined_rate_formatted: formatPercent(combinedRate),
    federal_rate: federalRate,
    federal_rate_formatted: formatPercent(federalRate),
    provincial_rate: provincialRate,
    provincial_rate_formatted: formatPercent(provincialRate),
    tax_payable: totalTax,
    tax_payable_formatted: formatCurrency(totalTax),
    breakdown: {
      federal_tax: federalTax,
      federal_tax_formatted: formatCurrency(federalTax),
      provincial_tax: provincialTax,
      provincial_tax_formatted: formatCurrency(provincialTax),
    },
    business_limit: provincialRates.business_limit,
    business_limit_formatted: formatCurrency(provincialRates.business_limit),
  };
}
