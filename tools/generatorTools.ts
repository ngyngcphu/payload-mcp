import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { 
  getGenerator,
  GeneratorType,
} from '../generators/index.js';

// Register generator tools with the MCP server
export function registerGeneratorTools(server: McpServer) {
  // General template generator
  server.tool(
    'generate_template',
    {
      type: z.enum([
        'collection', 
        'field', 
        'global', 
        'config', 
        'access-control', 
        'hook', 
        'endpoint', 
        'plugin', 
        'block', 
        'migration',
        'component',
        'schema'
      ]),
      options: z.record(z.any()).optional().default({}),
    },
    async ({ type, options }) => {
      try {
        // Map the API type names to the generator type names
        const generatorTypeMap: Record<string, GeneratorType> = {
          'collection': 'collection',
          'field': 'field',
          'global': 'global',
          'config': 'config',
          'access-control': 'accessControl',
          'hook': 'hook',
          'endpoint': 'endpoint',
          'plugin': 'plugin',
          'block': 'block',
          'migration': 'migration',
          'component': 'component',
          'schema': 'schema'
        };
        
        // Get the generator and generate the code
        const generator = await getGenerator(generatorTypeMap[type]);
        
        // Create options object that satisfies the specific generator
        // We're forced to use any here because each generator has different options
        const result = await generator(options as any);
        
        return {
          content: [
            {
              type: 'text',
              text: result.code,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Generation error: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
} 