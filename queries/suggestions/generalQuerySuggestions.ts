import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for general queries that don't match a specific type
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getGeneralQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Payload provides a querying language for filtering and searching through documents within a Collection.',
    docReference: 'https://payloadcms.com/docs/queries/overview'
  });

  suggestions.push({
    type: 'info',
    message: 'Common query parameters: where (filtering), sort (ordering), select (field selection), depth (relationship population), limit/page (pagination), populate (relationship field selection).'
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  } else {
    suggestions.push({
      type: 'info',
      message: 'Payload provides three APIs for querying your data: Local API (direct-to-database), REST API (HTTP endpoints), and GraphQL.',
    });
  }

  if (fileType) {
    suggestions.push(...getFileTypeSpecificSuggestions(fileType));
  }

  return suggestions;
}

function getApiSpecificSuggestions(apiType: ApiType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (apiType) {
    case 'local':
      suggestions.push({
        type: 'info',
        message: 'The Local API gives you the ability to execute operations directly within Node, without server latency or network speed concerns.',
        docReference: 'https://payloadcms.com/docs/local-api/overview'
      });

      suggestions.push({
        type: 'example',
        message: 'Local API example:',
        code: `const posts = await payload.find({
  collection: 'posts',
  where: {
    status: {
      equals: 'published',
    },
  },
  sort: '-createdAt',
  limit: 10,
  depth: 1,
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'info',
        message: 'The REST API is a fully functional HTTP client for interacting with your Documents in a RESTful manner.',
        docReference: 'https://payloadcms.com/docs/rest-api/overview'
      });

      suggestions.push({
        type: 'example',
        message: 'REST API example:',
        code: `// Using qs-esm for complex queries
import { stringify } from 'qs-esm'

const query = {
  where: {
    status: {
      equals: 'published',
    },
  },
  sort: '-createdAt',
  limit: 10,
  depth: 1,
};

const stringifiedQuery = stringify(query, { addQueryPrefix: true });
fetch(\`http://localhost:3000/api/posts\${stringifiedQuery}\`)`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'info',
        message: 'The GraphQL API allows you to request exactly the data you need in a single query.',
        docReference: 'https://payloadcms.com/docs/graphql/overview'
      });

      suggestions.push({
        type: 'example',
        message: 'GraphQL query example:',
        code: `query {
  Posts(
    where: { status: { equals: published } }
    sort: "-createdAt" 
    limit: 10
  ) {
    docs {
      id
      title
      content
      author {
        id
        name
      }
    }
    totalDocs
  }
}`,
      });
      break;
  }

  return suggestions;
}

function getFileTypeSpecificSuggestions(fileType: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  switch (fileType) {
    case 'collection':
      suggestions.push({
        type: 'info',
        message: 'Collections represent the primary data structure in Payload. Ensure queries target fields defined in your collection config.',
        docReference: 'https://payloadcms.com/configuration/collections'
      });
      break;

    case 'field':
      suggestions.push({
        type: 'info',
        message: 'Different field types support different query operations. Be sure to use compatible operators for the field type.',
        docReference: 'https://payloadcms.com/fields/overview'
      });
      break;

    case 'global':
      suggestions.push({
        type: 'info',
        message: 'Globals are singleton documents and have simplified operations compared to collections. They support only find and update operations.',
        docReference: 'https://payloadcms.com/configuration/globals'
      });
      break;

    case 'config':
      suggestions.push({
        type: 'info',
        message: 'Payload config defines how your CMS works. When working with config, ensure your query patterns align with the config structure.',
        docReference: 'https://payloadcms.com/configuration/overview'
      });
      break;
  }

  return suggestions;
} 