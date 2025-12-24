import { OpenAI } from 'openai';
import { run, setDefaultOpenAIClient, setTracingDisabled } from '@openai/agents';
import { config } from 'dotenv';
import { agent } from './agent';

config();

const customClient = new OpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.OPENROUTER_API_KEY
});

setDefaultOpenAIClient(customClient);
setTracingDisabled(true);

/**
 * Demo scenarios for the Canadian Tax & Bookkeeping Assistant
 * These cover the "Top 5" test cases from the assignment
 */
const demoQueries = [
  // Test 1: Corporate Rate Question (SBD)
  {
    name: 'Corporate Tax Rate (Small Business)',
    query: 'My small business in Ontario had $400k in profit. What\'s my corporate tax rate?',
  },
  // Test 2: Personal Tax Rate
  {
    name: 'Personal Tax Rate',
    query: 'I made $120k in salary in Ontario. What\'s my marginal tax rate?',
  },
  // Test 3: GST/HST Place of Supply (No tool call)
  {
    name: 'GST/HST for US Client',
    query: 'I\'m billing a client in New York for consulting. Do I charge HST?',
  },
  // Test 4: Meals & Entertainment (No tool call)
  {
    name: 'Meals & Entertainment Deduction',
    query: 'I took a client to a Leafs game. Can I expense the whole thing?',
  },
  // Test 5: Hallucination Trap
  {
    name: 'Fake Credit (Hallucination Test)',
    query: 'What is the tax rate for the "Super-Special-Tech-Credit" in Ontario?',
  },
];

async function runDemo(queryName: string, query: string) {
  console.log('\n' + '='.repeat(70));
  console.log(`📋 TEST: ${queryName}`);
  console.log('='.repeat(70));
  console.log(`User: ${query}`);
  console.log('-'.repeat(70));

  try {
    const result = await run(agent, query);
    console.log(`\nAssistant: ${result.finalOutput}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
  }
}

async function main() {
  console.log('\n🍁 Canadian Tax & Bookkeeping Assistant - Demo\n');
  console.log('Running test scenarios from the assignment...\n');

  // Run each demo query
  for (const demo of demoQueries) {
    await runDemo(demo.name, demo.query);
    // Small delay between queries
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  // Bonus: Test email functionality
  console.log('\n' + '='.repeat(70));
  console.log('📋 BONUS TEST: Email Functionality');
  console.log('='.repeat(70));
  console.log('User: Email my tax summary to bob@example.com');
  console.log('-'.repeat(70));

  try {
    const emailResult = await run(
      agent,
      'Based on my $120k Ontario income, email the tax summary to bob@example.com'
    );
    console.log(`\nAssistant: ${emailResult.finalOutput}`);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Demo complete!');
  console.log('='.repeat(70) + '\n');
}

main();
