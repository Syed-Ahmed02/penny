import { TaxBracket, TaxYear } from "./types";

/**
 * Federal personal income tax brackets for 2025 and 2026
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/income-tax/reducing-remuneration-subject-income-tax.html
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/individuals/frequently-asked-questions-individuals/canadian-income-tax-rates-individuals-current-previous-years.html
 */
export const FEDERAL_PERSONAL_TAX_BRACKETS: Record<TaxYear, TaxBracket[]> ={
    2025:[
        { min: 0, max: 57375 , rate: 0.145 },
        { min: 57375, max: 114750, rate: 0.205 },
        { min: 114750.01, max: 177882, rate: 0.26 },
        { min: 177882.01 , max: 253414, rate: 0.29 },
        { min: 253414.01, max: null, rate: 0.33 },
    ],
    2026:[
        { min: 0, max: 58523.00 , rate: 0.14 },
        { min: 58523.01, max: 117045.00, rate: 0.205 },
        { min: 117045.01, max: 181440, rate: 0.26 },
        { min: 181440.01 , max: 258482, rate: 0.29 },
        { min: 258482.01, max: null, rate: 0.33 },
    ]
}

/**
 * Federal corporate income tax rates for 2025 and 2026
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-tax-rates.html
 */

export const FEDERAL_CORPORATE_RATES: Record<TaxYear, { general: number; small_business: number }> = {
    2025: {
      general: 0.15, 
      small_business: 0.09, 
    },
    2026: {
      general: 0.15,
      small_business: 0.09,
    },
  };