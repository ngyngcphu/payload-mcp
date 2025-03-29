import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { getGenerator, GeneratorType } from '../generators/index.js';

export function registerGeneratorTools(server: McpServer) {
  server.tool(
    'generate_template',
    {
      type: z.enum([
        'collection',
        'field',
        'config',
        'access-control',
        'hook',
        'endpoint',
        'plugin',
        'block',
        'migration',
        'component'
      ]).describe('Type of component to generate'),
      options: z.record(z.any()).optional().default({}).describe('Configuration options for the generator'),
    },
    async ({ type, options }) => {
      try {
        const generatorTypeMap: Record<string, GeneratorType> = {
          'collection': 'collection',
          'field': 'field',
          'config': 'config',
          'access-control': 'accessControl',
          'hook': 'hook',
          'endpoint': 'endpoint',
          'plugin': 'plugin',
          'block': 'block',
          'migration': 'migration',
          'component': 'component',
        };

        if (!generatorTypeMap[type]) {
          return {
            content: [
              {
                type: 'text',
                text: `Unsupported generator type: ${type}`,
              },
            ],
            isError: true,
          };
        }

        const generator = await getGenerator(generatorTypeMap[type]);
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