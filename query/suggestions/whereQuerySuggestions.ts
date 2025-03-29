import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'where' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getWhereQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Filtering in Payload is done through the "where" parameter.',
    docReference: 'https://payloadcms.com/docs/queries/overview'
  });

  suggestions.push({
    type: 'info',
    message: 'Available operators include: equals, not_equals, greater_than, less_than, like, contains, in, not_in, all, exists, near, within, intersects',
  });

  suggestions.push({
    type: 'best-practice',
    message: 'For frequently queried fields, add `index: true` to the field config to improve query performance.',
  });

  suggestions.push({
    type: 'example',
    message: 'Complex queries can use AND/OR logic for more precise filtering:',
    code: `{
  or: [
    {
      color: {
        equals: 'blue',
      },
    },
    {
      and: [
        {
          color: {
            equals: 'white',
          },
        },
        {
          featured: {
            equals: true,
          },
        },
      ],
    },
  ],
}`,
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  if (fileType === 'collection') {
    suggestions.push({
      type: 'best-practice',
      message: 'When querying collections, ensure fields are properly indexed for frequently filtered properties.'
    });
  } else if (fileType === 'field') {
    suggestions.push({
      type: 'info',
      message: 'Different field types support different operators. Number fields support numeric comparisons while text fields support string operations.'
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
        message: 'Local API where query example:',
        code: `const posts = await payload.find({
  collection: 'posts',
  where: {
    color: {
      equals: 'blue',
    },
  },
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API where query example:',
        code: `// With qs-esm for complex queries
const query = {
  color: {
    equals: 'blue',
  },
};

// Using qs-esm to format the query
const stringifiedQuery = stringify(
  { where: query },
  { addQueryPrefix: true }
);

fetch(\`http://localhost:3000/api/posts\${stringifiedQuery}\`)`,
      });

      suggestions.push({
        type: 'best-practice',
        message: 'For complex REST queries, use the qs-esm package to properly format your query string.'
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'example',
        message: 'GraphQL where query example:',
        code: `query {
  Posts(where: { color: { equals: blue } }) {
    docs {
      id
      title
      color
    }
    totalDocs
  }
}`,
      });
      break;
  }

  return suggestions;
} 