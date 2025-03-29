export type FileType = 'collection' | 'field' | 'global' | 'config';

export type QueryType =
  | 'where'
  | 'sort'
  | 'select'
  | 'depth'
  | 'pagination'
  | 'populate'
  | 'general';

export type ApiType = 'local' | 'rest' | 'graphql';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
  queryType?: QueryType;
  apiType?: ApiType;
  parsedQuery?: any;
}

export interface Suggestion {
  type: 'error' | 'warning' | 'info' | 'best-practice' | 'example' | 'documentation';
  message: string;
  code?: string;
  docReference?: string;
}

export interface QueryResult {
  success: boolean;
  error?: string;
  queryType?: QueryType;
  apiType?: ApiType;
  suggestions: Suggestion[];
  parsedQuery?: any;
}

export interface FormatResponseInput {
  success: boolean;
  error?: string;
  queryType?: QueryType;
  apiType?: ApiType;
  suggestions: Suggestion[];
  parsedQuery?: any;
} 