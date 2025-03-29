import type { Suggestion, FileType, QueryType, ApiType } from './types.js';

const importWhereQuerySuggestions = () => import('./suggestions/whereQuerySuggestions.js');
const importSortQuerySuggestions = () => import('./suggestions/sortQuerySuggestions.js');
const importSelectQuerySuggestions = () => import('./suggestions/selectQuerySuggestions.js');
const importDepthQuerySuggestions = () => import('./suggestions/depthQuerySuggestions.js');
const importPaginationQuerySuggestions = () => import('./suggestions/paginationQuerySuggestions.js');
const importPopulateQuerySuggestions = () => import('./suggestions/populateQuerySuggestions.js');
const importGeneralQuerySuggestions = () => import('./suggestions/generalQuerySuggestions.js');

/**
 * Get suggestions for a given query string and file type
 * 
 * @param queryString - The query string to analyze
 * @param fileType - Optional file type context
 * @returns Array of suggestions and best practices
 */
export async function getQuerySuggestions(
    queryString: string,
    fileType?: FileType
): Promise<Suggestion[]> {
    try {
        const { queryType, apiType } = detectQueryTypeAndApi(queryString);

        const suggestions = await getSuggestionsByQueryType(queryString, queryType, apiType, fileType);

        if (fileType) {
            const fileTypeSuggestions = getFileTypeSpecificSuggestions(fileType);
            suggestions.push(...fileTypeSuggestions);
        }

        return suggestions;
    } catch (error) {
        return [{
            type: 'error',
            message: error instanceof Error
                ? `Error generating suggestions: ${error.message}`
                : 'Unknown error generating suggestions'
        }];
    }
}

/**
 * Detects the type of query and which API it's targeting
 * 
 * @param queryString - The query string to analyze
 * @returns Query type and API type
 */
function detectQueryTypeAndApi(queryString: string): {
    queryType: QueryType;
    apiType?: ApiType;
} {
    const cleanQuery = queryString.trim();

    if (cleanQuery.startsWith('{') && cleanQuery.endsWith('}')) {
        try {
            const parsedQuery = JSON.parse(cleanQuery);

            if (parsedQuery.where || Object.keys(parsedQuery).some(key =>
                ['equals', 'not_equals', 'in', 'not_in', 'like', 'contains'].includes(key))) {
                return { queryType: 'where', apiType: 'local' };
            }

            if (parsedQuery.sort !== undefined) {
                return { queryType: 'sort', apiType: 'local' };
            }

            if (parsedQuery.select !== undefined) {
                return { queryType: 'select', apiType: 'local' };
            }

            if (parsedQuery.depth !== undefined) {
                return { queryType: 'depth', apiType: 'local' };
            }

            if (parsedQuery.limit !== undefined || parsedQuery.page !== undefined) {
                return { queryType: 'pagination', apiType: 'local' };
            }

            if (parsedQuery.populate !== undefined) {
                return { queryType: 'populate', apiType: 'local' };
            }
        } catch (e) {
        }
    }

    if (cleanQuery.includes('=') || cleanQuery.includes('?') || cleanQuery.includes('&')) {
        const params = new URLSearchParams(
            cleanQuery.startsWith('?') ? cleanQuery.substring(1) : cleanQuery
        );

        if (params.has('where') || cleanQuery.includes('where[')) {
            return { queryType: 'where', apiType: 'rest' };
        }

        if (params.has('sort')) {
            return { queryType: 'sort', apiType: 'rest' };
        }

        if (params.has('select') || cleanQuery.includes('select[')) {
            return { queryType: 'select', apiType: 'rest' };
        }

        if (params.has('depth')) {
            return { queryType: 'depth', apiType: 'rest' };
        }

        if (params.has('limit') || params.has('page')) {
            return { queryType: 'pagination', apiType: 'rest' };
        }

        if (params.has('populate') || cleanQuery.includes('populate[')) {
            return { queryType: 'populate', apiType: 'rest' };
        }

        return { queryType: 'general', apiType: 'rest' };
    }

    if (cleanQuery.includes('{') && cleanQuery.includes('}') &&
        (cleanQuery.includes('query') || cleanQuery.includes('mutation'))) {
        if (cleanQuery.includes('where:')) {
            return { queryType: 'where', apiType: 'graphql' };
        }

        if (cleanQuery.includes('sort:')) {
            return { queryType: 'sort', apiType: 'graphql' };
        }

        return { queryType: 'general', apiType: 'graphql' };
    }

    const lowerQuery = cleanQuery.toLowerCase();

    if (lowerQuery.includes('equals') || lowerQuery.includes('not_equals') ||
        lowerQuery.includes('like') || lowerQuery.includes('contains') ||
        lowerQuery.includes('greater_than') || lowerQuery.includes('less_than')) {
        return { queryType: 'where' };
    }

    if (lowerQuery.includes('sort') || lowerQuery.includes('order')) {
        return { queryType: 'sort' };
    }

    if (lowerQuery.includes('select') || lowerQuery.includes('field')) {
        return { queryType: 'select' };
    }

    if (lowerQuery.includes('depth') || lowerQuery.includes('populate')) {
        return { queryType: 'depth' };
    }

    if (lowerQuery.includes('page') || lowerQuery.includes('limit') ||
        lowerQuery.includes('skip') || lowerQuery.includes('pagination')) {
        return { queryType: 'pagination' };
    }

    return { queryType: 'general' };
}

async function getSuggestionsByQueryType(
    queryString: string,
    queryType: QueryType,
    apiType?: ApiType,
    fileType?: FileType
): Promise<Suggestion[]> {
    switch (queryType) {
        case 'where': {
            const { getWhereQuerySuggestions } = await importWhereQuerySuggestions();
            return getWhereQuerySuggestions(apiType, fileType);
        }
        case 'sort': {
            const { getSortQuerySuggestions } = await importSortQuerySuggestions();
            return getSortQuerySuggestions(apiType, fileType);
        }
        case 'select': {
            const { getSelectQuerySuggestions } = await importSelectQuerySuggestions();
            return getSelectQuerySuggestions(apiType, fileType);
        }
        case 'depth': {
            const { getDepthQuerySuggestions } = await importDepthQuerySuggestions();
            return getDepthQuerySuggestions(apiType, fileType);
        }
        case 'pagination': {
            const { getPaginationQuerySuggestions } = await importPaginationQuerySuggestions();
            return getPaginationQuerySuggestions(apiType);
        }
        case 'populate': {
            const { getPopulateQuerySuggestions } = await importPopulateQuerySuggestions();
            return getPopulateQuerySuggestions(apiType, fileType);
        }
        case 'general':
        default: {
            const { getGeneralQuerySuggestions } = await importGeneralQuerySuggestions();
            return getGeneralQuerySuggestions(apiType, fileType);
        }
    }
}

function getFileTypeSpecificSuggestions(fileType: FileType): Suggestion[] {
    const suggestions: Suggestion[] = [];

    switch (fileType) {
        case 'collection':
            suggestions.push({
                type: 'info',
                message: 'For collections, ensure that any fields being queried are properly defined in your collection config.',
                docReference: 'https://payloadcms.com/configuration/collections'
            });
            break;

        case 'field':
            suggestions.push({
                type: 'info',
                message: 'For field queries, ensure that the field type supports the operators you\'re using.',
                docReference: 'https://payloadcms.com/fields/overview'
            });
            break;

        case 'global':
            suggestions.push({
                type: 'info',
                message: 'When querying globals, remember that they are singleton documents and don\'t support the same operations as collections.',
                docReference: 'https://payloadcms.com/configuration/globals'
            });
            break;

        case 'config':
            suggestions.push({
                type: 'info',
                message: 'When working with Payload configuration, ensure your query operations align with the Payload config structure.',
                docReference: 'https://payloadcms.com/configuration/overview'
            });
            break;
    }

    return suggestions;
} 