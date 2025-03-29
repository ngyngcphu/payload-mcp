import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { scaffold, ScaffoldOptions } from '../scaffolds/index.js';

export function registerScaffoldTools(server: McpServer) {
  server.tool(
    'scaffold_project',
    {
      projectName: z.string().describe('Name of the project to create'),
      database: z.enum(['mongodb', 'postgres']).describe('Database type to use'),
      typescript: z.boolean().optional().describe('Generate TypeScript project (defaults to true)'),
      authentication: z.boolean().optional().describe('Include authentication (defaults to true)'),
      collections: z.array(z.object({
        slug: z.string(),
        fields: z.array(z.any()).optional(),
      })).optional().describe('Collections to generate'),
      globals: z.array(z.object({
        slug: z.string(),
        fields: z.array(z.any()).optional(),
      })).optional().describe('Globals to generate'),
      blocks: z.array(z.object({
        slug: z.string(),
        fields: z.array(z.any()).optional(),
      })).optional().describe('Blocks to generate'),
      serverUrl: z.string().optional().describe('Server URL for the application'),
      outputPath: z.string().optional().describe('Custom output path (defaults to current directory/projectName)'),
    },
    async (options: any) => {
      try {
        const { outputPath, ...scaffoldOptions } = options;
        const result = await scaffold(scaffoldOptions as ScaffoldOptions, outputPath);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Scaffold error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
} 