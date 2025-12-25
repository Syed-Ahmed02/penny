import { tool } from '@openai/agents';
import { z } from 'zod';

function generateMockMessageId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  return `mock-${timestamp}-${random}`;
}

export const send_email = tool({
  name: 'send_email',
  description: `Send an email to a user with a summary of the conversation or tax calculation results.`,
  parameters: z.object({
    to_address: z.string().email().describe('The recipient email address (must be a valid email format)'),
    subject: z.string().describe('The email subject line'),
    body: z.string().describe('The email body content, formatted as a clean professional message'),
  }),
  async execute({ to_address, subject, body }) {
    const messageId = generateMockMessageId();
    
    console.log('\n' + '='.repeat(60));
    console.log('MOCK EMAIL SENT');
    console.log('='.repeat(60));
    console.log(`To: ${to_address}`);
    console.log(`Subject: ${subject}`);
    console.log('-'.repeat(60));
    console.log(body);
    console.log('='.repeat(60));
    console.log(`Message ID: ${messageId}`);
    console.log('='.repeat(60) + '\n');

    return {
      success: true,
      message_id: messageId,
      to_address,
      subject,
      message: `Email successfully sent to ${to_address}`,
    };
  },
});

