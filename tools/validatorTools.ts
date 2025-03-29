import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { validateCode, ComponentType } from '../validator/index.js';

export function registerValidatorTools(server: McpServer) {
    server.tool(
        'validate_code',
        {
            code: z.string().describe('The code to validate'),
            componentType: z.enum(['collection', 'field', 'global', 'config']).describe('Type of component being validated'),
            filePath: z.string().optional().describe('Optional file path for better error reporting'),
            checkSyntax: z.boolean().optional().default(true).describe('Check syntax validity'),
            checkBestPractices: z.boolean().optional().default(true).describe('Check best practices'),
            checkSecurity: z.boolean().optional().default(true).describe('Check security issues'),
            checkPerformance: z.boolean().optional().default(true).describe('Check performance issues'),
        },
        (options: {
            code: string;
            componentType: string;
            filePath?: string;
            checkSyntax?: boolean;
            checkBestPractices?: boolean;
            checkSecurity?: boolean;
            checkPerformance?: boolean;
        }) => {
            try {
                const result = validateCode({
                    ...options,
                    componentType: options.componentType as ComponentType
                });
                return {
                    content: [{ type: 'text', text: JSON.stringify(result) }],
                };
            } catch (error) {
                return {
                    content: [{ type: 'text', text: `Validation error: ${(error as Error).message}` }],
                    isError: true,
                };
            }
        }
    );
} 