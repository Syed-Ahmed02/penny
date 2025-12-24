import { Runner } from '@openai/agents';
import type { Agent } from '@openai/agents';

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  yellow: '\x1b[33m',
  green: '\x1b[32m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m',
};

/**
 * Print a trace step with consistent formatting
 */
function printStep(icon: string, label: string, detail?: string): void {
  const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false });
  const prefix = `${colors.dim}[${timestamp}]${colors.reset}`;
  
  if (detail) {
    console.log(`${prefix} ${icon} ${colors.cyan}${label}${colors.reset}: ${detail}`);
  } else {
    console.log(`${prefix} ${icon} ${colors.cyan}${label}${colors.reset}`);
  }
}

/**
 * Truncate long strings for display
 */
function truncate(str: string, maxLen: number = 200): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

/**
 * Safely extract and format tool info from an item
 */
function formatToolInfo(item: any): { name: string; args: string; output: string } {
  const rawItem = item?.rawItem || item;
  let name = 'unknown';
  let args = '';
  let output = '';

  try {
    name = rawItem?.name || rawItem?.type || 'unknown';
    
    if (rawItem?.arguments) {
      const argStr = typeof rawItem.arguments === 'string' 
        ? rawItem.arguments 
        : JSON.stringify(rawItem.arguments);
      args = truncate(argStr);
    }
    
    if (rawItem?.output) {
      const outStr = typeof rawItem.output === 'string'
        ? rawItem.output
        : JSON.stringify(rawItem.output);
      output = truncate(outStr);
    }
  } catch {
    // Ignore formatting errors
  }

  return { name, args, output };
}

// Create a shared runner instance
const runner = new Runner();

/**
 * Run an agent with streaming and print trace events to the console
 * Returns the final output string
 */
export async function runWithTrace(agent: Agent<any, any>, query: string): Promise<string> {
  const stream = await runner.run(agent, query, { stream: true });
  
  let finalOutput = '';
  let hasStartedOutput = false;

  // Process all events from the stream
  for await (const event of stream) {
    // Handle raw model stream events (contains the text deltas)
    if (event.type === 'raw_model_stream_event') {
      const data = event.data as any;
      
      // Look for text delta events
      // The structure can vary - check common patterns
      if (data?.type === 'response.output_text.delta' && data?.delta) {
        if (!hasStartedOutput) {
          process.stdout.write(`\n${colors.green}Assistant:${colors.reset} `);
          hasStartedOutput = true;
        }
        process.stdout.write(data.delta);
        finalOutput += data.delta;
      } else if (data?.type === 'content_block_delta' && data?.delta?.text) {
        if (!hasStartedOutput) {
          process.stdout.write(`\n${colors.green}Assistant:${colors.reset} `);
          hasStartedOutput = true;
        }
        process.stdout.write(data.delta.text);
        finalOutput += data.delta.text;
      } else if (data?.delta?.content) {
        // Another possible format
        if (!hasStartedOutput) {
          process.stdout.write(`\n${colors.green}Assistant:${colors.reset} `);
          hasStartedOutput = true;
        }
        process.stdout.write(data.delta.content);
        finalOutput += data.delta.content;
      }
    }

    // Agent updated events
    if (event.type === 'agent_updated_stream_event') {
      printStep('🤖', `Agent: ${event.agent?.name || 'Unknown'}`);
    }

    // Run item stream events (tool calls, reasoning, etc.)
    if (event.type === 'run_item_stream_event') {
      const { name, item } = event as any;
      
      switch (name) {
        case 'reasoning_item_created':
          printStep('🧠', 'Thinking', 'Processing request...');
          break;
          
        case 'tool_called': {
          const info = formatToolInfo(item);
          printStep('🔧', `Calling tool: ${info.name}`, info.args || undefined);
          break;
        }
        
        case 'tool_output': {
          const info = formatToolInfo(item);
          printStep('✅', `Tool result: ${info.name}`, info.output || undefined);
          break;
        }
        
        case 'message_output_created': {
          // Extract text from message output if we haven't streamed it
          const rawItem = (item as any)?.rawItem;
          if (rawItem?.content) {
            const content = Array.isArray(rawItem.content) 
              ? rawItem.content.map((c: any) => c.text || c.output_text || '').join('')
              : typeof rawItem.content === 'string' ? rawItem.content : '';
            if (content && !finalOutput) {
              if (!hasStartedOutput) {
                process.stdout.write(`\n${colors.green}Assistant:${colors.reset} `);
                hasStartedOutput = true;
              }
              process.stdout.write(content);
              finalOutput = content;
            }
          }
          break;
        }
        
        case 'handoff_requested':
          printStep('🔄', 'Handoff requested');
          break;
          
        case 'handoff_occurred':
          printStep('🔄', 'Handoff completed');
          break;
          
        case 'tool_approval_requested':
          printStep('⏸️', 'Tool approval requested');
          break;
      }
    }
  }

  // Ensure we end on a new line
  if (hasStartedOutput) {
    console.log('\n');
  }
  
  // Wait for completion
  await stream.completed;
  
  return finalOutput;
}
