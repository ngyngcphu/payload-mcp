import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'select' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getSelectQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Select allows you to specify which fields you want to retrieve from the API, which can speed up the Payload API and reduce the amount of JSON returned.',
    docReference: 'https://payloadcms.com/docs/queries/select'
  });

  suggestions.push({
    type: 'info',
    message: 'There are two modes for select: "include" (true) and "exclude" (false). Include mode specifies which fields to include, while exclude mode specifies which fields to exclude.'
  });

  suggestions.push({
    type: 'best-practice',
    message: 'Use select to improve API performance by retrieving only the fields you need, especially when working with large documents.',
  });

  suggestions.push({
    type: 'warning',
    message: 'When using select, your hooks may not receive the full document. Use the `forceSelect` collection config property to ensure certain fields are always selected.',
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  if (fileType === 'collection') {
    suggestions.push({
      type: 'info',
      message: 'For collections with relationships, consider using `defaultPopulate` to specify which fields to select when populating related documents.',
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
        message: 'Local API select example (include mode):',
        code: `// Include specific fields
const posts = await payload.find({
  collection: 'posts',
  select: {
    text: true,
    group: {
      number: true,
    },
    array: true,
  },
});

// Exclude specific fields
const posts = await payload.find({
  collection: 'posts',
  select: {
    array: false,
    group: {
      number: false,
    },
  },
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API select example:',
        code: `// Using qs-esm for complex select objects
import { stringify } from 'qs-esm'

const select = {
  text: true,
  group: {
    number: true,
  },
};

const stringifiedQuery = stringify(
  { select },
  { addQueryPrefix: true }
);

fetch(\`http://localhost:3000/api/posts\${stringifiedQuery}\`)

// Or as a raw URL query string:
// https://localhost:3000/api/posts?select[color]=true&select[group][number]=true`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'info',
        message: 'In GraphQL, field selection is part of the query structure itself, so there is no need for a separate select parameter.',
      });

      suggestions.push({
        type: 'example',
        message: 'GraphQL field selection example:',
        code: `query {
  Posts {
    docs {
      id
      title
      # Only these fields will be returned
    }
  }
}`,
      });
      break;
  }

  return suggestions;
} 