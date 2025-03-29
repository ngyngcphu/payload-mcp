import { z } from 'zod';
import { ValidationRule, ValidationRules } from './types.js';

interface Field {
  name: string;
  type: string;
  index?: boolean;
  [key: string]: unknown;
}

export const collectionSchema = z.object({
  slug: z.string().min(1),
  access: z.object({}).optional(),
  admin: z.object({
    useAsTitle: z.string().optional(),
    defaultColumns: z.array(z.string()).optional(),
    group: z.string().optional(),
  }).optional(),
  fields: z.array(
    z.object({
      name: z.string().min(1),
      type: z.string().min(1),
    }).and(z.record(z.any()))
  ),
  hooks: z.object({}).optional(),
  endpoints: z.array(z.any()).optional(),
  versions: z.object({}).optional(),
}).or(z.record(z.any()));

export const collectionBestPractices: ValidationRule[] = [
  {
    test: (code) => !('useAsTitle' in (code.admin || {})),
    issue: {
      message: 'Missing useAsTitle in admin config',
      severity: 'warning',
      suggestion: 'Add a useAsTitle property to determine which field to use as the title in the admin panel',
      docReference: 'https://payloadcms.com/docs/configuration/collections#admin',
    }
  },
  {
    test: (code) => !('defaultColumns' in (code.admin || {})),
    issue: {
      message: 'Missing defaultColumns in admin config',
      severity: 'info',
      suggestion: 'Consider adding defaultColumns to customize the collection list view',
      docReference: 'https://payloadcms.com/docs/configuration/collections#admin',
    }
  },
  {
    test: (code) => !code.timestamps,
    issue: {
      message: 'No timestamps configuration specified',
      severity: 'info',
      suggestion: 'Consider enabling timestamps to track when documents are created and updated',
      docReference: 'https://payloadcms.com/docs/configuration/collections#timestamps',
    }
  },
];

export const collectionSecurity: ValidationRule[] = [
  {
    test: (code) => !code.access,
    issue: {
      message: 'No access control defined for collection',
      severity: 'warning',
      suggestion: 'Define access control rules to secure your collection',
      docReference: 'https://payloadcms.com/docs/access-control/overview',
    }
  },
  {
    test: (code) => {
      const accessProps = code.access || {};
      return accessProps.read === true || accessProps.create === true || accessProps.update === true || accessProps.delete === true;
    },
    issue: {
      message: 'Using unrestricted access control (set to true)',
      severity: 'error',
      suggestion: 'Replace "true" with proper access control functions for better security',
      docReference: 'https://payloadcms.com/docs/access-control/overview#collection-access-control',
    }
  },
];

export const collectionPerformance: ValidationRule[] = [
  {
    test: (code) => {
      const fields = code.fields || [];
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
      const hooks = code.hooks || {};
      return Object.values(hooks).some(hookArray =>
        Array.isArray(hookArray) && hookArray.length > 3
      );
    },
    issue: {
      message: 'Multiple hooks on the same operation might impact performance',
      severity: 'info',
      suggestion: 'Consider combining related hooks or optimizing their implementation',
      docReference: 'https://payloadcms.com/docs/hooks/overview',
    }
  },
];

export const collectionValidationRules: ValidationRules = {
  syntax: [collectionSchema],
  bestPractices: collectionBestPractices,
  security: collectionSecurity,
  performance: collectionPerformance,
}; 