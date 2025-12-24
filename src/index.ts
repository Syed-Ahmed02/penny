import { initializeOpenAIClient } from './openaiClient';
import { agent } from './agent';
import { getAllDemoScenarios } from './demoScenarios';
import { run } from '@openai/agents';

async function runDemo(queryName: string, query: string): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log(`TEST: ${queryName}`);
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

async function main(): Promise<void> {
  initializeOpenAIClient();

  console.log('\nCanadian Tax & Bookkeeping Assistant - Demo\n');
  console.log('Running test scenarios from the assignment...\n');

  const scenarios = getAllDemoScenarios();

  for (const demo of scenarios) {
    await runDemo(demo.name, demo.query);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log('\n' + '='.repeat(70));
  console.log('Demo complete!');
  console.log('='.repeat(70) + '\n');
}

main();
