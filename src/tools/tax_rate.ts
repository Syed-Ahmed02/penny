import { tool } from '@openai/agents';
import { z } from 'zod';

// Tax rate calculation tool
export const get_tax_rate = tool({
  name: 'get_tax_rate',
  description: 'Calculate the correct marginal or effective tax rate for Personal (Federal + Provincial) or Corporate (Small Business Deduction vs General Rate) tax types. Returns the tax rate as a percentage.',
  parameters: z.object({
    type: z.enum(['personal', 'corporate']).describe('Type of tax: "personal" for individual income tax, "corporate" for business tax'),
    province: z.string().describe('Province or territory (e.g., "Ontario", "BC", "Quebec"). Currently supports basic structure - province-specific rates to be implemented.'),
    income_amount: z.number().describe('Income amount in CAD dollars'),
  }),
  async execute({ type, province, income_amount}) {
    
  },
});




