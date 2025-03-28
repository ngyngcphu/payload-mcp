/**
 * Endpoint generator for Payload CMS
 */
import { type GeneratorResult } from '../utils/index.js';

type HTTPMethod = 'get' | 'head' | 'post' | 'put' | 'delete' | 'connect' | 'options';

interface PayloadRequest {
    user?: Record<string, any>;
    payload: any;
    routeParams?: Record<string, any>;
    data?: Record<string, any>;
    file?: any;
    locale?: string;
    fallbackLocale?: string;
    [key: string]: any;
}

interface EndpointResponse {
    data?: any;
    status?: number;
    headers?: Record<string, string>;
}

type EndpointHandler = (req: PayloadRequest) => Promise<Response | EndpointResponse | any>;

export interface EndpointGeneratorOptions {
    path: string;
    method: HTTPMethod;
    handler?: string | EndpointHandler;
    root?: boolean;
    isAuthenticated?: boolean;
    processRequestData?: boolean;
    handleCORS?: boolean;
    description?: string;
    collection?: string;
    global?: string;
    custom?: Record<string, any>;
}

function validateOptions(options: EndpointGeneratorOptions): void {
    if (!options.path) {
        throw new Error('Endpoint path is required');
    }

    if (!options.method) {
        throw new Error('HTTP method is required');
    }

    const validMethods: HTTPMethod[] = ['get', 'head', 'post', 'put', 'delete', 'connect', 'options'];
    if (!validMethods.includes(options.method)) {
        throw new Error(`Invalid HTTP method. Must be one of: ${validMethods.join(', ')}`);
    }
}

function generateHandlerFunction(options: EndpointGeneratorOptions): string {
    if (typeof options.handler === 'string') {
        return options.handler;
    }

    let code = `async (req) => {`;

    if (options.processRequestData) {
        code += `
  await addDataAndFileToRequest(req);
  await addLocalesToRequestFromData(req);`;
    }

    if (options.isAuthenticated) {
        code += `
  // Verify authentication
  if (!req.user) {
    return Response.json({ error: 'forbidden' }, { status: 403${options.handleCORS ? ', headers: headersWithCors({ headers: new Headers(), req })' : ''} });
  }`;
    }

    code += `
  
  try {
    // Your endpoint logic here
    // For example:
    // const result = await yourCustomLogic(req.params.id);
    
    return Response.json({
      success: true,
      message: 'Endpoint successfully executed'
    }${options.handleCORS ? ', { headers: headersWithCors({ headers: new Headers(), req }) }' : ''});
  } catch (error) {
    console.error(\`Error in endpoint ${options.path}:\`, error);
    return Response.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500${options.handleCORS ? ', headers: headersWithCors({ headers: new Headers(), req })' : ''} }
    );
  }`;

    code += `
}`;

    return code;
}

function generateUtilImports(options: EndpointGeneratorOptions): string {
    let imports = '';

    if (options.processRequestData) {
        imports += `
// Include these utility functions in your code:
//
// async function addDataAndFileToRequest(req) {
//   if (!req.data) {
//     try {
//       req.data = await req.json();
//     } catch (err) {
//       req.data = {};
//     }
//   }
//   
//   if (req.file === undefined) {
//     req.file = null;
//   }
// }
//
// function addLocalesToRequestFromData(req) {
//   if (req.data && !req.locale) {
//     req.locale = req.data.locale || 'en';
//   }
//   
//   if (!req.fallbackLocale) {
//     req.fallbackLocale = 'en';
//   }
// }`;
    }

    if (options.handleCORS) {
        imports += `
// Include this utility function in your code:
//
// function headersWithCors({ headers, req }) {
//   headers.set('Access-Control-Allow-Origin', '*');
//   headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//   headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   return headers;
// }`;
    }

    return imports;
}

function generateComment(options: EndpointGeneratorOptions): string {
    const location = options.collection
        ? `collection '${options.collection}'`
        : options.global
            ? `global '${options.global}'`
            : 'API';

    const desc = options.description || `Custom endpoint for ${options.path}`;

    return `/**
 * ${desc}
 * 
 * HTTP Method: ${options.method.toUpperCase()}
 * Path: ${options.path}
 * Location: ${location}
 * Authentication: ${options.isAuthenticated ? 'Required' : 'None'}
 */`;
}

function generateEndpointCode(options: EndpointGeneratorOptions): string {
    validateOptions(options);

    const comment = generateComment(options);
    const handler = generateHandlerFunction(options);
    const utils = generateUtilImports(options);

    let code = `${comment}
const endpoint = {
  path: '${options.path}',
  method: '${options.method}',
  handler: ${handler},`;

    if (options.root) {
        code += `
  root: ${options.root},`;
    }

    if (options.custom && Object.keys(options.custom).length > 0) {
        code += `
  custom: ${JSON.stringify(options.custom, null, 2)},`;
    }

    code += `
};

export default endpoint;${utils}`;

    return code;
}

/**
 * Generates a custom endpoint configuration for Payload CMS
 * 
 * @param options - Configuration options for the endpoint
 * @returns Generated code result
 * 
 * @example
 * ```typescript
 * // Generate a tracking endpoint for orders
 * const result = await generateEndpoint({
 *   path: '/:id/tracking',
 *   method: 'get',
 *   isAuthenticated: true,
 *   processRequestData: true,
 *   collection: 'orders',
 *   description: 'Retrieves tracking information for an order'
 * });
 * ```
 */
export async function generateEndpoint(options: EndpointGeneratorOptions): Promise<GeneratorResult> {
    const code = generateEndpointCode(options);

    const fileName = options.collection
        ? `${options.collection}-${options.path.replace(/\//g, '-').replace(/:/g, '')}-endpoint.ts`
        : options.global
            ? `${options.global}-${options.path.replace(/\//g, '-').replace(/:/g, '')}-endpoint.ts`
            : `custom${options.path.replace(/\//g, '-').replace(/:/g, '')}-endpoint.ts`;

    return {
        code,
        fileName,
        language: 'typescript',
    };
}
