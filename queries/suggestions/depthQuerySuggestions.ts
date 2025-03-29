import type { Suggestion, FileType, ApiType } from '../types.js';

/**
 * Get suggestions for 'depth' queries
 * 
 * @param apiType - The detected API type (local, rest, graphql)
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export function getDepthQuerySuggestions(apiType?: ApiType, fileType?: FileType): Suggestion[] {
  const suggestions: Suggestion[] = [];

  suggestions.push({
    type: 'documentation',
    message: 'Depth determines how many levels down related documents should be automatically populated when retrieved.',
    docReference: 'https://payloadcms.com/docs/queries/depth'
  });

  suggestions.push({
    type: 'info',
    message: 'A depth of 0 returns only IDs for relationships, while higher values populate those relationships as objects.'
  });

  suggestions.push({
    type: 'best-practice',
    message: 'Keep depth as low as possible for better performance. Deeply nested populations can impact API response times and return excessive data.',
  });

  suggestions.push({
    type: 'info',
    message: 'Depth has no effect in the GraphQL API, as depth is based on the shape of your GraphQL queries.',
  });

  if (apiType) {
    suggestions.push(...getApiSpecificSuggestions(apiType));
  }

  if (fileType === 'collection') {
    suggestions.push({
      type: 'info',
      message: 'Fields like Relationship or Upload can set a maximum depth with the `maxDepth` property, which will limit population depth regardless of the request depth.',
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
        message: 'Local API depth example:',
        code: `// Populate relationships 2 levels deep
const posts = await payload.find({
  collection: 'posts',
  depth: 2,
});`,
      });
      break;

    case 'rest':
      suggestions.push({
        type: 'example',
        message: 'REST API depth example:',
        code: `// Populate relationships 2 levels deep
fetch('https://localhost:3000/api/posts?depth=2')`,
      });
      break;

    case 'graphql':
      suggestions.push({
        type: 'example',
        message: 'GraphQL relationship population example:',
        code: `query {
  Posts {
    docs {
      id
      title
      # Populate the author relationship
      author {
        id
        name
        # Further populate author's posts
        posts {
          id
          title
        }
      }
    }
  }
}`,
      });
      break;
  }

  return suggestions;
} 