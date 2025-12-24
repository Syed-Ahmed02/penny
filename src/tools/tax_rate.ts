import { tool } from '@openai/agents';
import { z } from 'zod';
import { TaxBracket, TaxYear } from '../types/types';
import { FEDERAL_PERSONAL_TAX_BRACKETS, FEDERAL_CORPORATE_RATES } from '../types/federal';
import { ONTARIO_PERSONAL_TAX_BRACKETS, ONTARIO_CORPORATE_RATES } from '../types/ontario';

const SUPPORTED_PROVINCES = ['ON'] as const;

function calculateBracketTax(income: number, brackets: TaxBracket[]): { tax: number; marginalRate: number } {
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

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatPercent(rate: number): string {
  return `${(rate * 100).toFixed(2)}%`;
}

export const get_tax_rate = tool({
  name: 'get_tax_rate',
  description: `Calculate the correct marginal or effective tax rate for Personal (Federal + Provincial) or Corporate (Small Business Deduction vs General Rate) tax types. 
  
USE THIS TOOL when asked about:
- Tax brackets, rates, or calculations for personal income
- Corporate tax rates, small business deduction rates
- "What's my tax rate on $X income?"
- "How much tax do I owe?"

DO NOT use this tool for:
- GST/HST questions (answer from general knowledge)
- Meals and entertainment deductions (answer from general knowledge)
- Tax credits you don't recognize (ask for clarification instead)`,
  parameters: z.object({
    type: z.enum(['personal', 'corporate']).describe('Type of tax: "personal" for individual income tax, "corporate" for business tax'),
    province: z.string().describe('Province or territory code (e.g., "ON"). Currently supports: ON (Ontario).'),
    income_amount: z.number().describe('Income amount in CAD dollars'),
    tax_year: z.number().describe('Tax year (2025 or 2026). Use 2025 unless the user specifies otherwise.'),
  }),
  async execute({ type, province, income_amount, tax_year }) {
    const normalizedProvince = province.toUpperCase();
    if (!SUPPORTED_PROVINCES.includes(normalizedProvince as typeof SUPPORTED_PROVINCES[number])) {
      return {
        success: false,
        error: `Province "${province}" is not currently supported. Supported provinces: ${SUPPORTED_PROVINCES.join(', ')}. Please ask about a supported province.`,
      };
    }

    if (tax_year !== 2025 && tax_year !== 2026) {
      return {
        success: false,
        error: `Tax year ${tax_year} is not supported. Supported years: 2025, 2026.`,
      };
    }

    if (isNaN(income_amount) || income_amount < 0) {
      return {
        success: false,
        error: `Invalid income amount: ${income_amount}. Income must be a non-negative number.`,
      };
    }

    const year = tax_year as TaxYear;

    if (type === 'personal') {
      return calculatePersonalTax(income_amount, year, normalizedProvince);
    } else {
      return calculateCorporateTax(income_amount, year, normalizedProvince);
    }
  },
});

function calculatePersonalTax(income: number, year: TaxYear, province: string) {
  const federalBrackets = FEDERAL_PERSONAL_TAX_BRACKETS[year];
  const provincialBrackets = ONTARIO_PERSONAL_TAX_BRACKETS[year];

  const federalResult = calculateBracketTax(income, federalBrackets);
  const provincialResult = calculateBracketTax(income, provincialBrackets);

  const totalTax = federalResult.tax + provincialResult.tax;
  const marginalRate = federalResult.marginalRate + provincialResult.marginalRate;
  const effectiveRate = income > 0 ? totalTax / income : 0;

  return {
    success: true,
    type: 'personal',
    province,
    tax_year: year,
    income: income,
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

function calculateCorporateTax(income: number, year: TaxYear, province: string) {
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
    success: true,
    type: 'corporate',
    province,
    tax_year: year,
    income: income,
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
