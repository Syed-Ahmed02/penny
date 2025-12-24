import { TaxBracket, TaxYear, CorporateRates } from "./types";

/**
 * Ontario personal income tax brackets for 2025 and 2026
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/payroll/payroll-deductions-contributions/income-tax/reducing-remuneration-subject-income-tax.html
 */

export const ONTARIO_PERSONAL_TAX_BRACKETS: Record<TaxYear, TaxBracket[]> = {
    2025: [
        { min: 0, max: 52886 , rate: 0.0505 },
        { min: 52886.01, max: 105775, rate: 0.0915 },
        { min: 105775.01, max: 150000, rate: 0.1116 },
        { min: 150000.01, max: 220000, rate: 0.1216 },
        { min: 220000.01, max: null, rate: 0.1316 },
    ],
    2026: [
        { min: 0, max: 53891.00, rate: 0.0505 },
        { min: 53891.01, max: 107785.00, rate: 0.0915 },
        { min: 107785.01, max: 150000.00, rate: 0.1116 },
        { min: 150000.01, max: 220000.00, rate: 0.1216 },
        { min: 220000.01, max: null, rate: 0.1316 },
    ],
}

/**
 * Ontario corporate income tax rates for 2025 and 2026
 * Source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/corporations/corporation-tax-rates.html
 * Ontario general rate: 11.5%, small business rate: 3.2%
 * Small Business Deduction limit: $500,000
 */
export const ONTARIO_CORPORATE_RATES: Record<TaxYear, CorporateRates> = {
    2025: {
        general: 0.115,
        small_business: 0.032,
        business_limit: 500000,
    },
    2026: {
        general: 0.115,
        small_business: 0.032,
        business_limit: 500000,
    },
}