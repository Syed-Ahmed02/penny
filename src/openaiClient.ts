import { OpenAI } from 'openai';
import { setDefaultOpenAIClient, setTracingDisabled } from '@openai/agents';
import { config } from 'dotenv';

export function initializeOpenAIClient(): void {
  config();

  const apiKey = process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENROUTER_API_KEY 
    ? 'https://openrouter.ai/api/v1'
    : undefined;

  const customClient = new OpenAI({
    apiKey,
    ...(baseURL && { baseURL }),
  });

  setDefaultOpenAIClient(customClient);
  setTracingDisabled(true);
}
