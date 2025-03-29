import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerValidatorTools } from '../validator/index.js';

/**
 * Register all validator tools with the MCP server
 * 
 * @param server The MCP server instance
 */
export function registerAllValidatorTools(server: McpServer): void {
  registerValidatorTools(server);
} 