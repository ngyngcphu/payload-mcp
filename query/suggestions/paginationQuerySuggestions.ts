import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'pagination' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @returns Array of suggestions and best practices
 */
export function getPaginationQuerySuggestions(apiType?: ApiType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Payload queries are equipped with automatic pagination, allowing you to create paginated lists of documents within your app.',
    docReference: 'https://payloadcms.com/docs/queries/pagination'
  });

  suggestions.push({
    type: 'info',
    message: 'Two main controls are available for pagination: `limit` (number of documents per page) and `page` (which page to retrieve).'
  });

  suggestions.push({
    type: 'info',
    message: 'Pagination responses include metadata like totalDocs, limit, totalPages, page, pagingCounter, hasPrevPage, hasNextPage, prevPage, and nextPage.',
  });

  suggestions.push({
    type: 'best-practice',
    message: 'Use pagination to improve performance when working with large collections. Consider reasonable limits based on your UI requirements.',
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  return suggestions;
}

function getApiSpecificSuggestions(apiType: ApiType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (apiType) {
    case 'local':
      suggestions.push({
        type: 'example',
        message: 'Local API pagination example:',
        code: `// Get page 2 with 10 items per page
const posts = await payload.find({
  collection: 'posts',
  limit: 10,
  page: 2,
});

// Disable pagination to get all documents
const allPosts = await payload.find({
  collection: 'posts',
  pagination: false,
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API pagination example:',
        code: `// Get page 2 with 10 items per page
fetch('https://localhost:3000/api/posts?limit=10&page=2')`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'example',
        message: 'GraphQL pagination example:',
        code: `query {
  Posts(limit: 10, page: 2) {
    docs {
      id
      title
    }
    totalDocs
    limit
    totalPages
    page
    pagingCounter
    hasPrevPage
    hasNextPage
    prevPage
    nextPage
  }
}`,
      });
      break;
  }

  return suggestions;
} 