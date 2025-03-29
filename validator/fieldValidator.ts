import { z } from 'zod';
import { ValidationRule, ValidationRules } from './types.js';

const commonFieldProps = {
  name: z.string().min(1),
  label: z.string().optional(),
  required: z.boolean().optional(),
  unique: z.boolean().optional(),
  index: z.boolean().optional(),
  defaultValue: z.any().optional(),
  access: z.record(z.any()).optional(),
  hooks: z.record(z.any()).optional(),
  admin: z.object({
    description: z.string().optional(),
    condition: z.any().optional(),
    components: z.record(z.any()).optional(),
    width: z.union([z.string(), z.number()]).optional(),
    readOnly: z.boolean().optional(),
    hidden: z.boolean().optional(),
    position: z.string().optional(),
  }).optional(),
  localized: z.boolean().optional(),
};

export const fieldSchema = z.object({
  type: z.string().min(1),
  ...commonFieldProps,
}).and(z.record(z.any()));

const textFieldSchema = z.object({
  type: z.literal('text'),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  ...commonFieldProps,
}).and(z.record(z.any()));

const numberFieldSchema = z.object({
  type: z.literal('number'),
  min: z.number().optional(),
  max: z.number().optional(),
  ...commonFieldProps,
}).and(z.record(z.any()));

const relationshipFieldSchema = z.object({
  type: z.literal('relationship'),
  relationTo: z.union([z.string(), z.array(z.string())]),
  hasMany: z.boolean().optional(),
  filterOptions: z.any().optional(),
  ...commonFieldProps,
}).and(z.record(z.any()));

export const fieldBestPractices: ValidationRule[] = [
  {
    test: (code) => !code.label && code.name,
    issue: {
      message: 'Missing field label',
      severity: 'info',
      suggestion: 'Add a human-readable label to improve admin UI',
      docReference: 'https://payloadcms.com/docs/fields/overview#base-field-types',
    }
  },
  {
    test: (code) => {
      if (!code.admin) return false;
      return !code.admin.description;
    },
    issue: {
      message: 'Missing field description',
      severity: 'info',
      suggestion: 'Consider adding admin.description to provide guidance to content editors',
      docReference: 'https://payloadcms.com/docs/fields/overview#common-field-properties',
    }
  },
  {
    test: (code) => {
      if (code.type !== 'text') return false;
      return !code.hasOwnProperty('minLength') && !code.hasOwnProperty('maxLength');
    },
    issue: {
      message: 'Text field without length constraints',
      severity: 'info',
      suggestion: 'Consider adding minLength and/or maxLength to text fields',
      docReference: 'https://payloadcms.com/docs/fields/text',
    }
  },
];

export const fieldSecurity: ValidationRule[] = [
  {
    test: (code) => {
      if (code.type !== 'text' || !code.hasOwnProperty('validate')) return false;

      if (typeof code.validate === 'function') {
        return true;
      }

      return false;
    },
    issue: {
      message: 'Text field with custom validation may need sanitization',
      severity: 'warning',
      suggestion: 'Ensure text inputs are properly sanitized to prevent XSS attacks',
      docReference: 'https://payloadcms.com/docs/fields/overview#field-level-validation',
    }
  },
  {
    test: (code) => {
      return code.unique === true && !code.access;
    },
    issue: {
      message: 'Unique field without access control',
      severity: 'warning',
      suggestion: 'Add access control to unique fields to prevent enumeration attacks',
      docReference: 'https://payloadcms.com/docs/access-control/fields',
    }
  },
];

export const fieldPerformance: ValidationRule[] = [
  {
    test: (code) => {
      return code.type === 'relationship' && !code.hasOwnProperty('index');
    },
    issue: {
      message: 'Relationship field not indexed',
      severity: 'warning',
      suggestion: 'Add index: true to relationship fields to improve query performance',
      docReference: 'https://payloadcms.com/docs/fields/relationship#index',
    }
  },
  {
    test: (code) => {
      return (code.type === 'text' || code.type === 'number') &&
        code.hasOwnProperty('unique') && code.unique === true &&
        !code.hasOwnProperty('index');
    },
    issue: {
      message: 'Unique field not explicitly indexed',
      severity: 'info',
      suggestion: 'While unique fields are automatically indexed, explicitly setting index: true can make the intent clearer',
      docReference: 'https://payloadcms.com/docs/fields/overview#common-field-properties',
    }
  },
];

export const fieldValidationRules: ValidationRules = {
  syntax: [fieldSchema, textFieldSchema, numberFieldSchema, relationshipFieldSchema],
  bestPractices: fieldBestPractices,
  security: fieldSecurity,
  performance: fieldPerformance,
}; 