import type { QueryResult, FormatResponseInput } from './types.js';

/**
 * Format the response from the query processor
 * 
 * @param input - The response input data
 * @returns A formatted QueryResult
 */
export function formatResponse(input: FormatResponseInput): QueryResult {
  const suggestions = input.suggestions || [];

  suggestions.forEach(suggestion => {
    if (!suggestion.docReference && suggestion.type === 'documentation') {
      suggestion.docReference = getDefaultDocReference(input.queryType);
    }
  });

  return {
    success: input.success,
    error: input.error,
    queryType: input.queryType,
    apiType: input.apiType,
    suggestions,
    parsedQuery: input.parsedQuery,
  };
}

function getDefaultDocReference(queryType?: string): string {
  switch (queryType) {
    case 'where':
      return 'https://payloadcms.com/docs/queries/overview';
    case 'sort':
      return 'https://payloadcms.com/docs/queries/sort';
    case 'select':
      return 'https://payloadcms.com/docs/queries/select';
    case 'depth':
      return 'https://payloadcms.com/docs/queries/depth';
    case 'pagination':
      return 'https://payloadcms.com/docs/queries/pagination';
    case 'populate':
      return 'https://payloadcms.com/docs/queries/select#populate';
    default:
      return 'https://payloadcms.com/docs/queries/overview';
  }
} 