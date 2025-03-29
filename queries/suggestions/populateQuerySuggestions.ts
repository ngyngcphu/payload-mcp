import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'populate' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getPopulateQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'The populate parameter allows you to override the defaultPopulate setting for a collection, specifying which fields to select when populating related documents.',
    docReference: 'https://payloadcms.com/docs/queries/select#populate'
  });

  suggestions.push({
    type: 'info',
    message: 'The populate parameter works in conjunction with the defaultPopulate collection config property, allowing you to override it when needed.'
  });

  suggestions.push({
    type: 'best-practice',
    message: 'Use populate to minimize the amount of data returned when working with relationships, selecting only the fields you need.',
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  if (fileType === 'collection') {
    suggestions.push({
      type: 'info',
      message: 'When defining a collection with relationships, use the defaultPopulate property to specify which fields to select by default when populating from other documents.',
      code: `export const Pages: CollectionConfig<'pages'> = {
  slug: 'pages',
  // Specify default fields to select when other docs relate to this collection
  defaultPopulate: {
    slug: true,
  },
  // ... other collection config
}`,
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
        message: 'Local API populate example:',
        code: `// Override the defaultPopulate for the pages relationship
const posts = await payload.find({
  collection: 'posts',
  populate: {
    // Select only 'text' from populated docs in the "pages" collection
    pages: {
      text: true,
    },
  },
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API populate example:',
        code: `// Using qs-esm for complex populate objects
import { stringify } from 'qs-esm'

const populate = {
  pages: {
    text: true,
  },
};

const stringifiedQuery = stringify(
  { populate },
  { addQueryPrefix: true }
);

fetch(\`http://localhost:3000/api/posts\${stringifiedQuery}\`)

// Or as a raw URL query string:
// https://localhost:3000/api/posts?populate[pages][text]=true`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'info',
        message: 'In GraphQL, relationship population is controlled by the structure of your query, not by a populate parameter.',
      });

      suggestions.push({
        type: 'example',
        message: 'GraphQL relationship population example:',
        code: `query {
  Posts {
    docs {
      id
      title
      // Only select id and title from author relationship
      author {
        id
        name
      }
    }
  }
}`,
      });
      break;
  }

  return suggestions;
} 