/**
 * Hook generator for Payload CMS
 */
import type { GeneratorResult } from '../utils/index.js';

export interface HookGeneratorOptions {
    type: 'beforeValidate' | 'beforeChange' | 'afterChange' | 'beforeRead' | 'afterRead';
    collection?: string;
    global?: string;
    features?: string[];
    description?: string;
}

/**
 * Generate a Payload CMS hook function
 * @param options Hook generation options
 * @returns Generated code result
 */
export async function generateHook(options: HookGeneratorOptions): Promise<GeneratorResult> {
    const {
        type,
        collection,
        global,
        features = [],
        description,
    } = options;

    const resource = collection ? `collection: ${collection}` : global ? `global: ${global}` : 'collection/global';
    let code = '';

    switch (type) {
        case 'beforeValidate':
            code = generateBeforeValidateHook(resource, features, description);
            break;
        case 'beforeChange':
            code = generateBeforeChangeHook(resource, features, description);
            break;
        case 'afterChange':
            code = generateAfterChangeHook(resource, features, description);
            break;
        case 'beforeRead':
            code = generateBeforeReadHook(resource, features, description);
            break;
        case 'afterRead':
            code = generateAfterReadHook(resource, features, description);
            break;
        default:
            throw new Error(`Unsupported hook type: ${type}`);
    }

    return {
        code,
        language: 'typescript',
    };
}

function generateBeforeValidateHook(
    resource: string,
    features: string[],
    description?: string
): string {
    const hookDescription = description || `Hook that runs before validation during update operation for ${resource}`;

    let featuresCode = '';
    if (features.includes('autoSlug')) {
        featuresCode += `
  // Auto-generate slug from title if not provided
  if (data.title && !data.slug) {
    data.slug = data.title.toLowerCase().replace(/\\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }`;
    }

    if (features.includes('formatData')) {
        featuresCode += `
  // Format data before validation
  if (data.email) {
    data.email = data.email.trim().toLowerCase();
  }`;
    }

    return `import type { GlobalBeforeValidateHook } from 'payload'

/**
 * ${hookDescription}
 * 
 * This hook allows you to add or format data before the incoming data is validated server-side.
 */
export const beforeValidate: GlobalBeforeValidateHook = async ({
  data,
  req,
  originalDoc,
  global,
  context,
}) => {${featuresCode}

  // Add your custom validation logic here
  
  // Return the (potentially modified) data
  return data;
};
`;
}

function generateBeforeChangeHook(
    resource: string,
    features: string[],
    description?: string
): string {
    const hookDescription = description || `Hook that runs before change during update operation for ${resource}`;

    let featuresCode = '';
    if (features.includes('timestamp')) {
        featuresCode += `
  // Add timestamps
  const now = new Date();
  data.updatedAt = now;`;
    }

    if (features.includes('setUser')) {
        featuresCode += `
  // Set user reference
  if (req.user) {
    data.updatedBy = req.user.id;
  }`;
    }

    if (features.includes('sanitize')) {
        featuresCode += `
  // Sanitize data before saving
  if (data.htmlContent) {
    // Example sanitization (in real code, use a proper HTML sanitizer)
    data.htmlContent = data.htmlContent.replace(/<script\\b[^<]*(?:(?!<\\/script>)<[^<]*)*<\\/script>/gi, '');
  }`;
    }

    return `import type { GlobalBeforeChangeHook } from 'payload'

/**
 * ${hookDescription}
 * 
 * Runs immediately following validation. At this stage, you can be confident
 * that the data is valid in accordance to your field validations.
 */
export const beforeChange: GlobalBeforeChangeHook = async ({
  data,
  req,
  originalDoc,
  global,
  context,
}) => {${featuresCode}

  // Add your custom logic here
  
  // Optionally modify the shape of data to be saved
  return data;
};
`;
}

function generateAfterChangeHook(
    resource: string,
    features: string[],
    description?: string
): string {
    const hookDescription = description || `Hook that runs after global update for ${resource}`;

    let featuresCode = '';
    if (features.includes('webhook')) {
        featuresCode += `
  // Send webhook notification
  try {
    fetch('https://example.com/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        doc,
        previousDoc,
      }),
    });
  } catch (error) {
    console.error('Webhook notification failed:', error);
  }`;
    }

    if (features.includes('purgeCache')) {
        featuresCode += `
  // Purge cache after update
  try {
    // Example cache purging logic
    console.log('Purging cache for updated global:', global.slug);
    // In a real implementation, you would call your caching service
    // await purgeCache(\`global-\${global.slug}\`);
  } catch (error) {
    console.error('Cache purge failed:', error);
  }`;
    }

    return `import type { GlobalAfterChangeHook } from 'payload'

/**
 * ${hookDescription}
 * 
 * Use this hook to purge caches, sync data to external services, etc.
 */
export const afterChange: GlobalAfterChangeHook = async ({
  doc,
  previousDoc,
  req,
  global,
  context,
}) => {${featuresCode}

  // Add your custom after-change logic here
  console.log(\`Global document updated: \${global.slug}\`);
  
  return doc;
};
`;
}

function generateBeforeReadHook(
    resource: string,
    features: string[],
    description?: string
): string {
    const hookDescription = description || `Hook that runs before read for ${resource}`;

    let featuresCode = '';
    if (features.includes('accessAllLocales')) {
        featuresCode += `
  // Example of accessing all locales before they're flattened
  if (doc.localizedField && typeof doc.localizedField === 'object') {
    // Access specific locale that might be hidden in the final response
    const enValue = doc.localizedField.en;
    const esValue = doc.localizedField.es;
    console.log('All locales:', { en: enValue, es: esValue });
  }`;
    }

    return `import type { GlobalBeforeReadHook } from 'payload'

/**
 * ${hookDescription}
 * 
 * Runs before the global is transformed for output by afterRead.
 * This hook fires before hidden fields are removed and before localized fields are flattened.
 */
export const beforeRead: GlobalBeforeReadHook = async ({
  doc,
  req,
  global,
  context,
}) => {${featuresCode}
  // This hook provides access to all locales and hidden fields via the doc argument
  
  return doc;
};
`;
}

function generateAfterReadHook(
    resource: string,
    features: string[],
    description?: string
): string {
    const hookDescription = description || `Hook that runs after read for ${resource}`;

    let featuresCode = '';
    if (features.includes('computedFields')) {
        featuresCode += `
  // Add computed fields
  doc.displayName = doc.firstName && doc.lastName 
    ? \`\${doc.firstName} \${doc.lastName}\` 
    : doc.name || 'Unknown';`;
    }

    if (features.includes('formatOutput')) {
        featuresCode += `
  // Format output data
  if (doc.publishedDate) {
    doc.formattedDate = new Date(doc.publishedDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }`;
    }

    return `import type { GlobalAfterReadHook } from 'payload'

/**
 * ${hookDescription}
 * 
 * Runs as the last step before a global is returned.
 * At this stage, locales are flattened, protected fields are hidden,
 * and fields that users don't have access to are removed.
 */
export const afterRead: GlobalAfterReadHook = async ({
  doc,
  req,
  findMany,
  global,
  context,
  query,
}) => {${featuresCode}

  // Add your custom after-read logic here
  
  return doc;
};
`;
}