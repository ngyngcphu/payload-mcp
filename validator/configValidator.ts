import { z } from 'zod';
import { ValidationRule, ValidationRules } from './types.js';

interface Collection {
    slug: string;
    auth?: boolean | Record<string, any>;
    access?: Record<string, any>;
    [key: string]: any;
}

interface Global {
    slug: string;
    [key: string]: any;
}

export const configSchema = z.object({
    admin: z.object({
        user: z.string().optional(),
        meta: z.object({}).optional(),
        components: z.record(z.any()).optional(),
        css: z.string().optional(),
        dateFormat: z.string().optional(),
        webpack: z.function().optional(),
    }).optional(),
    collections: z.array(z.object({
        slug: z.string().min(1),
    }).and(z.record(z.any()))),
    globals: z.array(z.object({
        slug: z.string().min(1),
    }).and(z.record(z.any()))).optional(),
    graphQL: z.object({}).or(z.boolean()).optional(),
    cors: z.string().or(z.array(z.string())).or(z.boolean()).optional(),
    csrf: z.object({}).or(z.boolean()).optional(),
    routes: z.object({
        admin: z.string().optional(),
        api: z.string().optional(),
        graphQL: z.string().optional(),
        graphQLPlayground: z.string().optional(),
    }).optional(),
    upload: z.object({}).optional(),
    email: z.object({}).optional(),
    express: z.object({}).or(z.function()).optional(),
    hooks: z.object({}).optional(),
    localization: z.object({}).optional(),
    rateLimit: z.object({}).optional(),
    serverURL: z.string().optional(),
    telemetry: z.boolean().optional(),
    typescript: z.object({}).or(z.boolean()).optional(),
}).and(z.record(z.any()));

export const configBestPractices: ValidationRule[] = [
    {
        test: (code) => !code.serverURL,
        issue: {
            message: 'Missing serverURL configuration',
            severity: 'warning',
            suggestion: 'Set serverURL to ensure proper URLs for media and API endpoints',
            docReference: 'https://payloadcms.com/docs/configuration/overview#server-url',
        }
    },
    {
        test: (code) => {
            const collections = (code.collections || []) as Collection[];
            const hasDuplicateSlugs = collections.some((collection: Collection, index: number) =>
                collections.findIndex((c: Collection) => c.slug === collection.slug) !== index
            );
            return hasDuplicateSlugs;
        },
        issue: {
            message: 'Duplicate collection slugs detected',
            severity: 'error',
            suggestion: 'Ensure all collection slugs are unique',
            docReference: 'https://payloadcms.com/docs/configuration/collections',
        }
    },
    {
        test: (code) => {
            const globals = (code.globals || []) as Global[];
            const hasDuplicateSlugs = globals.some((global: Global, index: number) =>
                globals.findIndex((g: Global) => g.slug === global.slug) !== index
            );
            return hasDuplicateSlugs;
        },
        issue: {
            message: 'Duplicate global slugs detected',
            severity: 'error',
            suggestion: 'Ensure all global slugs are unique',
            docReference: 'https://payloadcms.com/docs/configuration/globals',
        }
    },
    {
        test: (code) => !code.admin,
        issue: {
            message: 'No admin configuration specified',
            severity: 'info',
            suggestion: 'Consider configuring the admin panel for better user experience',
            docReference: 'https://payloadcms.com/docs/admin/overview',
        }
    },
];

export const configSecurity: ValidationRule[] = [
    {
        test: (code) => code.csrf === false,
        issue: {
            message: 'CSRF protection is disabled',
            severity: 'error',
            suggestion: 'Enable CSRF protection to prevent cross-site request forgery attacks',
            docReference: 'https://payloadcms.com/docs/authentication/overview#csrf-protection',
        }
    },
    {
        test: (code) => code.cors === '*' || (Array.isArray(code.cors) && code.cors.includes('*')),
        issue: {
            message: 'CORS is set to allow all origins (*)',
            severity: 'warning',
            suggestion: 'Specify allowed origins explicitly instead of using wildcard (*)',
            docReference: 'https://payloadcms.com/docs/production/preventing-abuse#cors',
        }
    },
    {
        test: (code) => !code.rateLimit,
        issue: {
            message: 'Rate limiting is not configured',
            severity: 'warning',
            suggestion: 'Configure rate limiting to prevent brute force and DoS attacks',
            docReference: 'https://payloadcms.com/docs/production/preventing-abuse#rate-limiting',
        }
    },
    {
        test: (code) => {
            const collections = (code.collections || []) as Collection[];
            const userCollection = collections.find((collection: Collection) => collection.auth);
            return Boolean(userCollection && !userCollection.access);
        },
        issue: {
            message: 'Auth collection without access control',
            severity: 'error',
            suggestion: 'Add access control to collections with authentication',
            docReference: 'https://payloadcms.com/docs/access-control/collections',
        }
    },
];

export const configPerformance: ValidationRule[] = [
    {
        test: (code) => {
            const collections = (code.collections || []) as Collection[];
            return collections.length > 50;
        },
        issue: {
            message: 'Large number of collections may impact performance',
            severity: 'info',
            suggestion: 'Consider if some collections can be consolidated or if architecture needs refactoring',
            docReference: 'https://payloadcms.com/docs/configuration/overview',
        }
    },
    {
        test: (code) => {
            const hooks = code.hooks || {};
            const hookCount = Object.values(hooks).reduce((count: number, hookArray: any) => {
                return count + (Array.isArray(hookArray) ? hookArray.length : 0);
            }, 0);
            return hookCount > 10;
        },
        issue: {
            message: 'Large number of global hooks may impact performance',
            severity: 'info',
            suggestion: 'Consider optimizing or consolidating global hooks',
            docReference: 'https://payloadcms.com/docs/hooks/overview',
        }
    },
    {
        test: (code) => code.graphQL === true && !code.graphQL?.depth,
        issue: {
            message: 'GraphQL enabled without depth limit',
            severity: 'warning',
            suggestion: 'Set a GraphQL depth limit to prevent expensive nested queries',
            docReference: 'https://payloadcms.com/docs/graphql/overview#depth-limiting',
        }
    },
];

export const configValidationRules: ValidationRules = {
    syntax: [configSchema],
    bestPractices: configBestPractices,
    security: configSecurity,
    performance: configPerformance,
}; 