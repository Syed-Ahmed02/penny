import { tool } from '@openai/agents';
import { z } from 'zod';
import { calculatePersonalTax, calculateCorporateTax } from '../tax/calc';

const SUPPORTED_PROVINCES = ['ON'] as const;

export const get_tax_rate = tool({
  name: 'get_tax_rate',
  description: `Calculate the correct marginal or effective tax rate for Personal (Federal + Provincial) or Corporate (Small Business Deduction vs General Rate) tax types.`,
  parameters: z.object({
    type: z.enum(['personal', 'corporate']).describe(
      'Type of tax: "personal" for individual income tax, "corporate" for business tax'
    ),
    province: z.string().describe('Province or territory code (e.g., "ON"). Currently supports: ON (Ontario).'),
    income_amount: z.number().describe('Income amount in CAD dollars'),
    tax_year: z.number().describe('Tax year (2025 or 2026). Use 2025 unless the user specifies otherwise.'),
  }),
  async execute({ type, province, income_amount, tax_year }) {
    if (province.toUpperCase() !== 'ON') {
      return {
        success: false,
        error: `Province "${province}" is not currently supported. Supported provinces: ON. Please ask about a supported province.`,
      };
    }

    if (tax_year !== 2025 && tax_year !== 2026) {
      return {
        success: false,
        error: `Tax year ${tax_year} is not supported. Supported years: 2025, 2026.`,
      };
    }

    if (income_amount < 0) {
      return {
        success: false,
        error: `Invalid income amount: ${income_amount}. Income must be a non-negative number.`,
      };
    }

    if (type === 'personal') {
      return calculatePersonalTax(income_amount, tax_year, 'ON');
    } else {
      return calculateCorporateTax(income_amount, tax_year, 'ON');
    }
  },
});
