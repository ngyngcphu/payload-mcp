import { z } from 'zod';
import { ValidationRule, ValidationRules } from './types.js';

interface Field {
    name?: string;
    type?: string;
    access?: Record<string, any>;
    admin?: {
        elements?: Record<string, any>;
        [key: string]: any;
    };
    [key: string]: any;
}

export const globalSchema = z.object({
    slug: z.string().min(1),
    access: z.object({}).optional(),
    admin: z.object({
        group: z.string().optional(),
        hidden: z.boolean().optional(),
    }).optional(),
    fields: z.array(
        z.object({
            name: z.string().min(1),
            type: z.string().min(1),
        }).and(z.record(z.any()))
    ),
    hooks: z.object({}).optional(),
    versions: z.object({}).optional(),
}).or(z.record(z.any()));

export const globalBestPractices: ValidationRule[] = [
    {
        test: (code) => {
            return !('admin' in code) || !('group' in (code.admin || {}));
        },
        issue: {
            message: 'Global without admin group configuration',
            severity: 'info',
            suggestion: 'Consider adding an admin.group property to organize globals in the admin UI',
            docReference: 'https://payloadcms.com/docs/configuration/globals#admin',
        }
    },
    {
        test: (code) => {
            const fields = code.fields || [];
            return fields.length > 20;
        },
        issue: {
            message: 'Global has a large number of fields',
            severity: 'info',
            suggestion: 'Consider breaking large globals into multiple smaller ones for better maintainability',
            docReference: 'https://payloadcms.com/docs/configuration/globals',
        }
    },
    {
        test: (code) => !code.label && code.slug,
        issue: {
            message: 'Missing label for global',
            severity: 'warning',
            suggestion: 'Add a human-readable label to improve the admin UI',
            docReference: 'https://payloadcms.com/docs/configuration/globals#overview',
        }
    },
];

export const globalSecurity: ValidationRule[] = [
    {
        test: (code) => !code.access,
        issue: {
            message: 'No access control defined for global',
            severity: 'warning',
            suggestion: 'Define access control rules to secure your global data',
            docReference: 'https://payloadcms.com/docs/access-control/overview#global-access-control',
        }
    },
    {
        test: (code) => {
            const accessProps = code.access || {};
            return accessProps.read === true || accessProps.update === true;
        },
        issue: {
            message: 'Using unrestricted access control (set to true)',
            severity: 'error',
            suggestion: 'Replace "true" with proper access control functions for better security',
            docReference: 'https://payloadcms.com/docs/access-control/overview#global-access-control',
        }
    },
    {
        test: (code) => {
            const fields = (code.fields || []) as Field[];
            return fields.some((field: Field) =>
                (field.name?.toLowerCase().includes('api') ||
                    field.name?.toLowerCase().includes('key') ||
                    field.name?.toLowerCase().includes('secret') ||
                    field.name?.toLowerCase().includes('password') ||
                    field.name?.toLowerCase().includes('token')) &&
                !field.access
            );
        },
        issue: {
            message: 'Potentially sensitive fields without specific access control',
            severity: 'warning',
            suggestion: 'Add field-level access control to fields that may contain sensitive data',
            docReference: 'https://payloadcms.com/docs/access-control/fields',
        }
    },
];

export const globalPerformance: ValidationRule[] = [
    {
        test: (code) => {
            const fields = (code.fields || []) as Field[];
            return fields.some((field: Field) => field.type === 'relationship' && !field.hasOwnProperty('index'));
        },
        issue: {
            message: 'Relationship field without index',
            severity: 'warning',
            suggestion: 'Add index: true to relationship fields to improve query performance',
            docReference: 'https://payloadcms.com/docs/fields/relationship#index',
        }
    },
    {
        test: (code) => {
            const fields = (code.fields || []) as Field[];
            return fields.some((field: Field) =>
                field.type === 'richText' &&
                field.admin?.elements &&
                Object.keys(field.admin.elements).length > 10
            );
        },
        issue: {
            message: 'Rich text field with many enabled elements may impact performance',
            severity: 'info',
            suggestion: 'Consider limiting enabled elements in rich text fields to only those needed',
            docReference: 'https://payloadcms.com/docs/fields/rich-text',
        }
    },
];

export const globalValidationRules: ValidationRules = {
    syntax: [globalSchema],
    bestPractices: globalBestPractices,
    security: globalSecurity,
    performance: globalPerformance,
}; 