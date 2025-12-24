export interface DemoScenario {
  name: string;
  query: string;
}

export const demoQueries: DemoScenario[] = [
  {
    name: 'Corporate Tax Rate (Small Business)',
    query: 'My small business in Ontario had $400k in profit. What\'s my corporate tax rate?',
  },
  {
    name: 'Personal Tax Rate',
    query: 'I made $120k in salary in Ontario. What\'s my marginal tax rate?',
  },
  {
    name: 'GST/HST for US Client',
    query: 'I\'m billing a client in New York for consulting. Do I charge HST?',
  },
  {
    name: 'Meals & Entertainment Deduction',
    query: 'I took a client to a Leafs game. Can I expense the whole thing?',
  },
  {
    name: 'Fake Credit (Hallucination Test)',
    query: 'What is the tax rate for the "Super-Special-Tech-Credit" in Ontario?',
  },
];

export const emailTestScenario: DemoScenario = {
  name: 'Email Functionality (Bonus)',
  query: 'Based on my $120k Ontario income, email the tax summary to bob@example.com',
};

export function getAllDemoScenarios(): DemoScenario[] {
  return [...demoQueries, emailTestScenario];
}
