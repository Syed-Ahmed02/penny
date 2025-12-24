import { OpenAI } from 'openai';
import { setDefaultOpenAIClient, setTracingDisabled } from '@openai/agents';
import { config } from 'dotenv';

export function initializeOpenAIClient(): void {
  config();

  const customClient = new OpenAI({
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey: process.env.OPENROUTER_API_KEY
  });

  setDefaultOpenAIClient(customClient);
  setTracingDisabled(true);
}
