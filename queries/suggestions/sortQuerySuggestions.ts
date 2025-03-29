import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'sort' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getSortQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Sorting in Payload allows you to order your documents by a specific field in ascending or descending order.',
    docReference: 'https://payloadcms.com/docs/queries/sort'
  });

  suggestions.push({
    type: 'info',
    message: 'By default, sort is in ascending order. Prefix field names with "-" for descending order.'
  });

  suggestions.push({
    type: 'best-practice',
    message: 'For performance reasons, it is recommended to enable `index: true` for fields that will be sorted upon.',
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  if (fileType === 'collection') {
    suggestions.push({
      type: 'info',
      message: 'Only fields stored in the database can be used for sorting. Virtual fields cannot be used.'
    });
  }

  return suggestions;
}

function getApiSpecificSuggestions(apiType: ApiType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (apiType) {
    case 'local':
      suggestions.push({
        type: 'example',
        message: 'Local API sort example:',
        code: `// Sort by createdAt in descending order
const posts = await payload.find({
  collection: 'posts',
  sort: '-createdAt', 
});

// Sort by multiple fields
const posts = await payload.find({
  collection: 'posts',
  sort: ['priority', '-createdAt'], 
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API sort example:',
        code: `// Sort by createdAt in descending order
fetch('https://localhost:3000/api/posts?sort=-createdAt')

// Sort by multiple fields
fetch('https://localhost:3000/api/posts?sort=priority,-createdAt')`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'example',
        message: 'GraphQL sort example:',
        code: `query {
  Posts(sort: "-createdAt") {
    docs {
      id
      title
    }
  }
}`,
      });
      break;
  }

  return suggestions;
} 