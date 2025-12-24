import * as readline from 'readline/promises';
import { stdin as input, stdout as output } from 'process';
import { initializeOpenAIClient } from './openaiClient';
import { agent } from './agent';
import { getAllDemoScenarios, type DemoScenario } from './demoScenarios';
import { runWithTrace } from './streamTracePrinter';

const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
};

const DIVIDER = '═'.repeat(70);
const THIN_DIVIDER = '─'.repeat(70);

function printHeader(): void {
  console.clear();
  console.log(`\n${colors.green}${DIVIDER}${colors.reset}`);
  console.log(`${colors.bold}${colors.green}  Canadian Tax & Bookkeeping Assistant - Interactive CLI${colors.reset}`);
  console.log(`${colors.green}${DIVIDER}${colors.reset}\n`);
}

function printMenu(): void {
  console.log(`${colors.cyan}What would you like to do?${colors.reset}\n`);
  console.log(`  ${colors.bold}1${colors.reset}) Run all test cases (Top 5 + Email)`);
  console.log(`  ${colors.bold}2${colors.reset}) Ask a custom question`);
  console.log(`  ${colors.bold}3${colors.reset}) Exit\n`);
}

async function runTestCase(scenario: DemoScenario, index: number, total: number): Promise<void> {
  console.log(`\n${colors.magenta}${DIVIDER}${colors.reset}`);
  console.log(`${colors.bold}TEST ${index}/${total}: ${scenario.name}${colors.reset}`);
  console.log(`${colors.magenta}${DIVIDER}${colors.reset}`);
  console.log(`${colors.dim}User: ${scenario.query}${colors.reset}`);
  console.log(`${colors.dim}${THIN_DIVIDER}${colors.reset}`);

  await runWithTrace(agent, scenario.query);
}

async function runAllTests(): Promise<void> {
  const scenarios = getAllDemoScenarios();
  
  console.log(`\n${colors.cyan}Running ${scenarios.length} test scenarios...${colors.reset}`);
  
  for (let i = 0; i < scenarios.length; i++) {
    await runTestCase(scenarios[i], i + 1, scenarios.length);
    
    if (i < scenarios.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  console.log(`\n${colors.green}${DIVIDER}${colors.reset}`);
  console.log(`${colors.bold}${colors.green}All test cases completed!${colors.reset}`);
  console.log(`${colors.green}${DIVIDER}${colors.reset}\n`);
}

async function askCustomQuestion(rl: readline.Interface): Promise<void> {
  console.log(`\n${colors.cyan}Enter your question (or 'back' to return to menu):${colors.reset}`);
  
  const question = await rl.question(`${colors.bold}> ${colors.reset}`);
  
  if (question.toLowerCase() === 'back' || question.trim() === '') {
    return;
  }
  
  console.log(`\n${colors.dim}${THIN_DIVIDER}${colors.reset}`);
  
  await runWithTrace(agent, question);
  
  console.log();
}

async function main(): Promise<void> {
  initializeOpenAIClient();
  
  const rl = readline.createInterface({ input, output });
  
  printHeader();
  
  let running = true;
  
  while (running) {
    printMenu();
    
    const choice = await rl.question(`${colors.bold}Enter your choice (1-3): ${colors.reset}`);
    
    switch (choice.trim()) {
      case '1':
        await runAllTests();
        break;
        
      case '2':
        await askCustomQuestion(rl);
        break;
        
      case '3':
        running = false;
        console.log(`\n${colors.green}Goodbye!${colors.reset}\n`);
        break;
        
      default:
        console.log(`\n${colors.yellow}Invalid choice. Please enter 1, 2, or 3.${colors.reset}\n`);
    }
  }
  
  rl.close();
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
