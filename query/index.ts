import { validateQuery } from './validateQuery.js';
import { getQuerySuggestions } from './getQuerySuggestions.js';
import { formatResponse } from './formatResponse.js';
import type { QueryResult, FileType } from './types.js';

/**
 * Process a Payload CMS query string and return validation rules and best practices
 * 
 * @param queryString - The query string to validate and provide suggestions for
 * @param fileType - Optional type of file context: "collection", "field", "global", or "config"
 * @returns Structured response with validation results and recommendations
 */
export async function processQuery(
    queryString: string,
    fileType?: FileType
): Promise<QueryResult> {
    try {
        const validationResult = validateQuery(queryString, fileType);

        if (!validationResult.isValid) {
            return formatResponse({
                success: false,
                error: validationResult.error,
                suggestions: [],
            });
        }

        const suggestions = await getQuerySuggestions(queryString, fileType);

        return formatResponse({
            success: true,
            queryType: validationResult.queryType,
            apiType: validationResult.apiType,
            suggestions,
        });
    } catch (error) {
        return formatResponse({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error occurred',
            suggestions: [],
        });
    }
}

export * from './types.js'; 