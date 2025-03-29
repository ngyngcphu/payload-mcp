import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { processQuery, FileType } from '../queries/index.js';

export function registerQueryTools(server: McpServer) {
  server.tool(
    'process_query',
    {
      queryString: z.string().describe('The query string to validate and provide suggestions for'),
      fileType: z.enum(['collection', 'field', 'global', 'config']).optional()
        .describe('Optional type of file context'),
    },
    async ({ queryString, fileType }: { queryString: string; fileType?: FileType }) => {
      try {
        const result = await processQuery(queryString, fileType);
        return {
          content: [{ type: 'text', text: JSON.stringify(result) }],
        };
      } catch (error) {
        return {
          content: [{ type: 'text', text: `Query processing error: ${(error as Error).message}` }],
          isError: true,
        };
      }
    }
  );
} 