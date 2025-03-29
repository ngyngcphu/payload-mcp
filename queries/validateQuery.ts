import type { ValidationResult, FileType, QueryType, ApiType } from './types.js';

/**
 * Validates a query string and determines its type
 * 
 * @param queryString - The query string to validate
 * @param fileType - Optional file type context
 * @returns Validation result with query type and parsing information
 */
export function validateQuery(
  queryString: string,
  fileType?: FileType
): ValidationResult {
  if (!queryString || queryString.trim() === '') {
    return {
      isValid: false,
      error: 'Query string cannot be empty',
    };
  }

  if (fileType && !isValidFileType(fileType)) {
    return {
      isValid: false,
      error: `Invalid fileType: ${fileType}. Must be one of: collection, field, global, config`,
    };
  }

  try {
    const { queryType, apiType, isValid, error, parsedQuery } = detectQueryTypeAndApi(queryString);

    if (!isValid) {
      return { isValid, error };
    }

    return {
      isValid: true,
      queryType,
      apiType,
      parsedQuery,
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Failed to parse query',
    };
  }
}

function isValidFileType(fileType: string): boolean {
  return ['collection', 'field', 'global', 'config'].includes(fileType);
}

/**
 * Detects the type of query and which API it's targeting
 * 
 * @param queryString - The query string to analyze
 * @returns Query type, API type, and validation info
 */
function detectQueryTypeAndApi(queryString: string): {
  queryType?: QueryType;
  apiType?: ApiType;
  isValid: boolean;
  error?: string;
  parsedQuery?: any;
} {

  const cleanQuery = queryString.trim();

  if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
    try {
      const parsedQuery = JSON.parse(cleanQuery);
      return analyzeJSONQuery(parsedQuery);
    } catch (e) {
    }
  }

  if (cleanQuery.includes('=') || cleanQuery.includes('?') || cleanQuery.includes('&')) {
    return analyzeURLQuery(cleanQuery);
  }

  if (cleanQuery.includes('{') && cleanQuery.includes('}') &&
    (cleanQuery.includes('query') || cleanQuery.includes('mutation'))) {
    return analyzeGraphQLQuery(cleanQuery);
  }

  return inferQueryTypeFromContent(cleanQuery);
}

function analyzeJSONQuery(parsedQuery: any): {
  queryType?: QueryType;
  apiType?: ApiType;
  isValid: boolean;
  error?: string;
  parsedQuery?: any;
} {
  if (parsedQuery.where || Object.keys(parsedQuery).some(key =>
    ['equals', 'not_equals', 'in', 'not_in', 'like', 'contains'].includes(key))) {
    return {
      queryType: 'where',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  if (parsedQuery.sort !== undefined) {
    return {
      queryType: 'sort',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  if (parsedQuery.select !== undefined) {
    return {
      queryType: 'select',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  if (parsedQuery.depth !== undefined) {
    return {
      queryType: 'depth',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  if (parsedQuery.limit !== undefined || parsedQuery.page !== undefined) {
    return {
      queryType: 'pagination',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  if (parsedQuery.populate !== undefined) {
    return {
      queryType: 'populate',
      apiType: 'local',
      isValid: true,
      parsedQuery,
    };
  }

  return {
    queryType: 'general',
    apiType: 'local',
    isValid: true,
    parsedQuery,
  };
}

function analyzeURLQuery(queryString: string): {
  queryType?: QueryType;
  apiType?: ApiType;
  isValid: boolean;
  error?: string;
  parsedQuery?: any;
} {
  const params = new URLSearchParams(
    queryString.startsWith('?') ? queryString.substring(1) : queryString
  );
  const parsedQuery: Record<string, any> = {};

  for (const [key, value] of params.entries()) {
    parsedQuery[key] = value;
  }

  if (params.has('where') || queryString.includes('where[')) {
    return {
      queryType: 'where',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  if (params.has('sort')) {
    return {
      queryType: 'sort',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  if (params.has('select') || queryString.includes('select[')) {
    return {
      queryType: 'select',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  if (params.has('depth')) {
    return {
      queryType: 'depth',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  if (params.has('limit') || params.has('page')) {
    return {
      queryType: 'pagination',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  if (params.has('populate') || queryString.includes('populate[')) {
    return {
      queryType: 'populate',
      apiType: 'rest',
      isValid: true,
      parsedQuery,
    };
  }

  return {
    queryType: 'general',
    apiType: 'rest',
    isValid: true,
    parsedQuery,
  };
}

function analyzeGraphQLQuery(queryString: string): {
  queryType?: QueryType;
  apiType?: ApiType;
  isValid: boolean;
  error?: string;
  parsedQuery?: string;
} {
  if (!queryString.includes('{') || !queryString.includes('}')) {
    return {
      isValid: false,
      error: 'Invalid GraphQL query format',
      apiType: 'graphql',
    };
  }

  if (queryString.includes('where:')) {
    return {
      queryType: 'where',
      apiType: 'graphql',
      isValid: true,
      parsedQuery: queryString,
    };
  }

  if (queryString.includes('sort:')) {
    return {
      queryType: 'sort',
      apiType: 'graphql',
      isValid: true,
      parsedQuery: queryString,
    };
  }

  return {
    queryType: 'general',
    apiType: 'graphql',
    isValid: true,
    parsedQuery: queryString,
  };
}

function inferQueryTypeFromContent(queryString: string): {
  queryType?: QueryType;
  apiType?: ApiType;
  isValid: boolean;
  error?: string;
} {
  const lowerQuery = queryString.toLowerCase();

  if (lowerQuery.includes('equals') || lowerQuery.includes('not_equals') ||
    lowerQuery.includes('like') || lowerQuery.includes('contains') ||
    lowerQuery.includes('greater_than') || lowerQuery.includes('less_than')) {
    return {
      queryType: 'where',
      isValid: true,
    };
  }

  if (lowerQuery.includes('sort') || lowerQuery.includes('order')) {
    return {
      queryType: 'sort',
      isValid: true,
    };
  }

  if (lowerQuery.includes('select') || lowerQuery.includes('field')) {
    return {
      queryType: 'select',
      isValid: true,
    };
  }

  if (lowerQuery.includes('depth') || lowerQuery.includes('populate')) {
    return {
      queryType: 'depth',
      isValid: true,
    };
  }

  if (lowerQuery.includes('page') || lowerQuery.includes('limit') ||
    lowerQuery.includes('skip') || lowerQuery.includes('pagination')) {
    return {
      queryType: 'pagination',
      isValid: true,
    };
  }

  return {
    queryType: 'general',
    isValid: true,
  };
} 