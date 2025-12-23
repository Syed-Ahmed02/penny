import { OpenAI } from 'openai';
import { Agent, run, setDefaultOpenAIClient,setTracingDisabled } from '@openai/agents';
import { config } from 'dotenv';
import { agent } from './src/agent';
config({quiet:true});

const customClient = new OpenAI({ 
    baseURL: 'https://openrouter.ai/api/v1',
    apiKey:process.env.OPENROUTER_API_KEY
});

setDefaultOpenAIClient(customClient);
setTracingDisabled(true);





async function main() {
    const result = await run(agent, 'When did sharks first appear?');
    console.log(result.finalOutput);
}

main();
