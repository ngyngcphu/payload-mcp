/**
 * Plugin generator for Payload CMS
 */
import { type GeneratorResult as BaseGeneratorResult, camelCase, pascalCase, toTitleCase } from '../utils/index.js';

interface GeneratorResult extends BaseGeneratorResult {
    additionalFiles?: Array<{
        fileName: string;
        code: string;
        language: string;
    }>;
}

type PluginFeature = 'collections' | 'globals' | 'fields' | 'hooks' | 'admin' | 'endpoints' | 'components';

type PluginTarget = 'standalone' | 'npm' | 'local';

type OfficialPluginType = 'form-builder' | 'nested-docs' | 'redirects' | 'search' | 'sentry' | 'seo' | 'stripe' | 'multi-tenant' | 'custom';

export interface PluginGeneratorOptions {
    name: string;
    description?: string;
    features?: PluginFeature[];
    target?: PluginTarget;
    officialPluginType?: OfficialPluginType;
    options?: {
        hasOptionsInterface?: boolean;
        properties?: Array<{
            name: string;
            type: string;
            required?: boolean;
            description?: string;
            defaultValue?: string;
        }>;
    };
    collections?: Array<{
        slug: string;
        fields?: string[];
    }>;
    globals?: Array<{
        slug: string;
        fields?: string[];
    }>;
    hooks?: Array<{
        type: 'collection' | 'global' | 'field' | 'beforeChange' | 'afterChange' | 'beforeRead' | 'afterRead';
        description?: string;
    }>;
    adminComponents?: Array<{
        name: string;
        type: 'field' | 'view' | 'nav' | 'meta';
    }>;
    customEndpoints?: Array<{
        path: string;
        method: 'get' | 'post' | 'put' | 'delete';
        description?: string;
    }>;
    additionalFiles?: string[];
    includeDevEnvironment?: boolean;
    includeTests?: boolean;
    includeDocs?: boolean;
}

function validateOptions(options: PluginGeneratorOptions): void {
    if (!options.name) {
        throw new Error('Plugin name is required');
    }

    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(options.name)) {
        throw new Error('Plugin name must be in kebab-case (e.g. my-plugin)');
    }

    if (options.target && !['standalone', 'npm', 'local'].includes(options.target)) {
        throw new Error('Invalid target. Must be one of: standalone, npm, local');
    }

    if (options.officialPluginType && !['form-builder', 'nested-docs', 'redirects', 'search', 'sentry', 'seo', 'stripe', 'multi-tenant', 'custom'].includes(options.officialPluginType)) {
        throw new Error('Invalid official plugin type. Must be one of: form-builder, nested-docs, redirects, search, sentry, seo, stripe, multi-tenant, custom');
    }

    if (options.features) {
        const validFeatures: PluginFeature[] = ['collections', 'globals', 'fields', 'hooks', 'admin', 'endpoints', 'components'];
        options.features.forEach(feature => {
            if (!validFeatures.includes(feature)) {
                throw new Error(`Invalid feature: ${feature}. Must be one of: ${validFeatures.join(', ')}`);
            }
        });
    }
}

function generatePluginFile(options: PluginGeneratorOptions): string {
    const { name, description, features = [] } = options;

    let code = '';

    code += generateImports(features, options);

    if (options.options?.hasOptionsInterface) {
        code += `import { ${pascalCase(name)}PluginOptions } from './types';\n\n`;
    } else {
        code += '\n';
    }

    code += `/**
 * ${description || `${toTitleCase(name)} Plugin for Payload CMS`}
 */\n`;

    code += `const ${camelCase(name)}Plugin = (`;

    if (options.options?.hasOptionsInterface) {
        code += `pluginOptions: ${pascalCase(name)}PluginOptions = {}`;
    }

    code += `) => {\n`;

    code += `  return (incomingConfig: Config): Config => {\n`;
    code += `    const config = { ...incomingConfig };\n\n`;

    if (options.options?.hasOptionsInterface) {
        code += `    // Set default options\n`;
        code += `    const options: ${pascalCase(name)}PluginOptions = {\n`;
        code += `      enabled: true,\n`;

        if (options.options.properties) {
            options.options.properties.forEach(prop => {
                if (prop.defaultValue !== undefined) {
                    code += `      ${prop.name}: ${prop.defaultValue},\n`;
                }
            });
        }

        code += `      ...pluginOptions,\n`;
        code += `    };\n\n`;

        code += `    // Skip if disabled\n`;
        code += `    if (options.enabled === false) return config;\n\n`;
    }

    code += generatePluginBody(features, options);

    code += `    return config;\n`;
    code += `  };\n`;
    code += `};\n\n`;

    code += `export default ${camelCase(name)}Plugin;\n`;

    return code;
}

function generateImports(features: PluginFeature[], options?: PluginGeneratorOptions): string {
    let imports = `import { Config } from 'payload';\n`;

    if (features.includes('collections')) {
        imports += `import { CollectionConfig } from 'payload';\n`;
    }

    if (features.includes('globals')) {
        imports += `import { GlobalConfig } from 'payload';\n`;
    }

    if (features.includes('fields')) {
        imports += `import { Field } from 'payload';\n`;
    }

    if (features.includes('hooks')) {
        imports += `import type { CollectionBeforeChangeHook, CollectionAfterChangeHook } from 'payload';\n`;
    }

    if (features.includes('admin')) {
        imports += `import { AdminViewComponent } from 'payload';\n`;
    }

    if (features.includes('endpoints')) {
        imports += `import { Endpoint } from 'payload';\n`;
    }

    if (options?.officialPluginType) {
        switch (options.officialPluginType) {
            case 'stripe':
                imports += `import Stripe from 'stripe';\n`;
                break;
            case 'sentry':
                imports += `import * as Sentry from '@sentry/nextjs';\n`;
                break;
            case 'form-builder':
                imports += `import { getPaymentTotal } from '@payloadcms/plugin-form-builder';\n`;
                break;
        }
    }

    return imports;
}

function generatePluginBody(features: PluginFeature[], options: PluginGeneratorOptions): string {
    let body = '';

    if (options.officialPluginType && options.officialPluginType !== 'custom') {
        return generateOfficialPluginCode(options);
    }

    if (features.includes('collections')) {
        body += generateCollectionsCode(options);
    }

    if (features.includes('globals')) {
        body += generateGlobalsCode(options);
    }

    if (features.includes('fields')) {
        body += generateFieldsCode(options);
    }

    if (features.includes('hooks')) {
        body += generateHooksCode(options);
    }

    if (features.includes('admin')) {
        body += generateAdminCode(options);
    }

    if (features.includes('endpoints')) {
        body += generateEndpointsCode(options);
    }

    if (features.includes('components')) {
        body += generateComponentsCode(options);
    }

    return body;
}

function generateCollectionsCode(options: PluginGeneratorOptions): string {
    const { collections = [] } = options;

    if (collections.length === 0) {
        return `  // Add or modify collections
  if (Array.isArray(config.collections)) {
    // Example: Modify existing collections
    config.collections = config.collections.map(collection => {
      // Add fields or modify existing collections here
      return {
        ...collection,
        // Example modification
        // fields: [
        //   ...collection.fields || [],
        //   {
        //     name: 'addedByPlugin',
        //     type: 'text',
        //   }
        // ]
      };
    });
    
    // Example: Add new collections
    // config.collections = [
    //   ...config.collections,
    //   {
    //     slug: 'pluginCollection',
    //     fields: [
    //       {
    //         name: 'title',
    //         type: 'text',
    //       }
    //     ]
    //   }
    // ];
  }\n\n`;
    }

    let collectionsCode = `  // Add or modify collections
  if (Array.isArray(config.collections)) {
    // Modify existing collections
    config.collections = config.collections.map(collection => {
      // Process each collection
      return {
        ...collection,
        // Add custom fields or other modifications here
      };
    });
    
    // Add new collections
    config.collections = [
      ...config.collections,\n`;

    collections.forEach(collection => {
        collectionsCode += `      {
        slug: '${collection.slug}',
        fields: [
          ${collection.fields ? collection.fields.map(field => `{
            name: '${field}',
            type: 'text',
          }`).join(',\n          ') : '// Add fields here'}
        ]
      },\n`;
    });

    collectionsCode += `    ];
  }\n\n`;

    return collectionsCode;
}

function generateGlobalsCode(options: PluginGeneratorOptions): string {
    const { globals = [] } = options;

    if (globals.length === 0) {
        return `  // Add or modify globals
  if (Array.isArray(config.globals)) {
    // Example: Modify existing globals
    config.globals = config.globals.map(global => {
      // Add fields or modify existing globals here
      return {
        ...global,
        // Example modification
        // fields: [
        //   ...global.fields || [],
        //   {
        //     name: 'addedByPlugin',
        //     type: 'text',
        //   }
        // ]
      };
    });
    
    // Example: Add new globals
    // config.globals = [
    //   ...config.globals,
    //   {
    //     slug: 'pluginGlobal',
    //     fields: [
    //       {
    //         name: 'title',
    //         type: 'text',
    //       }
    //     ]
    //   }
    // ];
  }\n\n`;
    }

    let globalsCode = `  // Add or modify globals
  if (Array.isArray(config.globals)) {
    // Modify existing globals
    config.globals = config.globals.map(global => {
      // Process each global
      return {
        ...global,
        // Add custom fields or other modifications here
      };
    });
    
    // Add new globals
    config.globals = [
      ...config.globals,\n`;

    globals.forEach(global => {
        globalsCode += `      {
        slug: '${global.slug}',
        fields: [
          ${global.fields ? global.fields.map(field => `{
            name: '${field}',
            type: 'text',
          }`).join(',\n          ') : '// Add fields here'}
        ]
      },\n`;
    });

    globalsCode += `    ];
  }\n\n`;

    return globalsCode;
}

function generateFieldsCode(options: PluginGeneratorOptions): string {
    return `  // Add or modify fields in collections or globals
  if (Array.isArray(config.collections)) {
    config.collections = config.collections.map(collection => {
      // Example: Add a field to a specific collection
      // if (collection.slug === 'target-collection') {
      //   return {
      //     ...collection,
      //     fields: [
      //       ...(collection.fields || []),
      //       {
      //         name: 'pluginField',
      //         type: 'text',
      //         label: 'Plugin Field',
      //       }
      //     ]
      //   };
      // }
      
      return collection;
    });
  }\n\n`;
}

function generateHooksCode(options: PluginGeneratorOptions): string {
    const { hooks = [] } = options;

    if (hooks.length === 0) {
        return `  // Add hooks
  config.hooks = {
    ...(config.hooks || {}),
    // Example: Add a global hook
    // afterError: [
    //   async (err) => {
    //     console.error('Plugin caught error:', err);
    //   }
    // ]
  };\n\n`;
    }

    let hooksCode = `  // Add hooks
  config.hooks = {
    ...(config.hooks || {}),\n`;

    const hookTypes = hooks.map(hook => hook.type);

    [...new Set(hookTypes)].forEach(hookType => {
        hooksCode += `    ${hookType}: [
      ...(config.hooks?.${hookType} || []),
      async (args) => {
        // Your hook logic here
        console.log('${hookType} hook triggered');
      }
    ],\n`;
    });

    hooksCode += `  };\n\n`;

    return hooksCode;
}

function generateAdminCode(options: PluginGeneratorOptions): string {
    return `  // Customize admin UI
  if (!config.admin) config.admin = {};
  
  // Example: Add custom components
  config.admin.components = {
    ...(config.admin.components || {}),
    // Example: Add a custom component
    // views: {
    //   ...(config.admin.components?.views || {}),
    //   Dashboard: {
    //     ...(config.admin.components?.views?.Dashboard || {}),
    //     BeforeContent: [
    //       ...(config.admin.components?.views?.Dashboard?.BeforeContent || []),
    //       // Custom component name (imported separately)
    //     ],
    //   },
    // },
  };\n\n`;
}

function generateEndpointsCode(options: PluginGeneratorOptions): string {
    const { customEndpoints = [] } = options;

    if (customEndpoints.length === 0) {
        return `  // Add custom endpoints
  config.endpoints = [
    ...(config.endpoints || []),
    // Example: Add a custom endpoint
    // {
    //   path: '/api/plugin-endpoint',
    //   method: 'get',
    //   handler: async (req, res) => {
    //     res.status(200).json({ success: true });
    //   },
    // },
  ];\n\n`;
    }

    let endpointsCode = `  // Add custom endpoints
  config.endpoints = [
    ...(config.endpoints || []),\n`;

    customEndpoints.forEach(endpoint => {
        endpointsCode += `    {
      path: '${endpoint.path}',
      method: '${endpoint.method}',
      handler: async (req, res) => {
        ${endpoint.description ? `// ${endpoint.description}` : ''}
        return Response.json({ success: true });
      },
    },\n`;
    });

    endpointsCode += `  ];\n\n`;

    return endpointsCode;
}

function generateComponentsCode(options: PluginGeneratorOptions): string {
    const { adminComponents = [] } = options;

    if (adminComponents.length === 0) {
        return `  // Add custom components
  if (!config.admin) config.admin = {};
  if (!config.admin.components) config.admin.components = {};
  
  // Example: Add before dashboard component
  // config.admin.components.beforeDashboard = [
  //   ...(config.admin.components.beforeDashboard || []),
  //   'BeforeDashboardComponent',
  // ];\n\n`;
    }

    let componentsCode = `  // Add custom components
  if (!config.admin) config.admin = {};
  if (!config.admin.components) config.admin.components = {};\n`;

    const componentsByType = adminComponents.reduce((acc, component) => {
        if (!acc[component.type]) acc[component.type] = [];
        acc[component.type].push(component.name);
        return acc;
    }, {} as Record<string, string[]>);

    Object.entries(componentsByType).forEach(([type, components]) => {
        componentsCode += `
  // Add ${type} components
  config.admin.components.${type} = [
    ...(config.admin.components.${type} || []),
    ${components.map(comp => `'${comp}'`).join(',\n    ')},
  ];\n`;
    });

    return componentsCode + '\n';
}

function generateTypesFile(options: PluginGeneratorOptions): string {
    const { name, options: pluginOptions } = options;

    let code = `import { Config } from 'payload';\n\n`;

    if (pluginOptions?.hasOptionsInterface) {
        code += `export interface ${pascalCase(name)}PluginOptions {\n`;

        code += `  /**
   * Enable or disable the plugin
   * @default true
   */
  enabled?: boolean;\n\n`;

        if (pluginOptions.properties) {
            pluginOptions.properties.forEach(prop => {
                if (prop.description) {
                    code += `  /**\n   * ${prop.description}\n   */\n`;
                }
                code += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};\n\n`;
            });
        }

        code += `}\n\n`;
    }

    code += `export type ${pascalCase(name)}Plugin = (pluginOptions?: ${pascalCase(name)}PluginOptions) => (config: Config) => Config;\n`;

    return code;
}

function generatePackageJson(options: PluginGeneratorOptions): string {
    const { name, description = '', target = 'standalone' } = options;

    const packageJson: any = {
        name: target === 'npm' ? name : `payload-plugin-${name}`,
        description,
        version: '0.1.0',
        main: 'dist/index.js',
        types: 'dist/index.d.ts',
        scripts: {
            build: 'tsc',
            dev: 'tsc -w',
        },
        keywords: ['payload', 'cms', 'plugin', name],
        peerDependencies: {
            payload: '^2.0.0',
        },
        devDependencies: {
            payload: '^2.0.0',
            typescript: '^5.0.0',
        }
    };

    packageJson.license = 'MIT';

    if (target === 'npm') {
        packageJson.repository = {
            type: 'git',
            url: `https://github.com/yourusername/payload-plugin-${name}.git`,
        };
        packageJson.publishConfig = {
            access: 'public',
        };
    }

    if (options.officialPluginType) {
        packageJson.dependencies = packageJson.dependencies || {};

        switch (options.officialPluginType) {
            case 'stripe':
                packageJson.dependencies['stripe'] = '^12.0.0';
                break;
            case 'sentry':
                packageJson.dependencies['@sentry/nextjs'] = '^7.0.0';
                break;
            case 'form-builder':
                break;
            case 'search':
                break;
            case 'seo':
                break;
            case 'multi-tenant':
                break;
            case 'nested-docs':
                break;
            case 'redirects':
                break;
        }
    }

    return JSON.stringify(packageJson, null, 2);
}

function generateReadme(options: PluginGeneratorOptions): string {
    const { name, description = '', target = 'standalone' } = options;

    const pluginName = target === 'npm' ? name : `payload-plugin-${name}`;
    const displayName = toTitleCase(name.replace(/-/g, ' '));

    let readme = `# ${displayName} Plugin for Payload CMS

${description || `A plugin for Payload CMS that adds ${displayName} functionality.`}

## Installation

\`\`\`bash
npm install ${pluginName}
# or
yarn add ${pluginName}
# or
pnpm add ${pluginName}
\`\`\`

## Usage

In your Payload config, import the plugin and add it to the \`plugins\` array:

\`\`\`typescript
import { buildConfig } from 'payload';
import ${camelCase(name)}Plugin from '${pluginName}';

const config = buildConfig({
  plugins: [
    ${camelCase(name)}Plugin({
      // options here
    }),
  ],
  // rest of your config
});

export default config;
\`\`\`
`;

    if (options.officialPluginType && options.officialPluginType !== 'custom') {
        readme += `\n## Features\n\n`;

        switch (options.officialPluginType) {
            case 'form-builder':
                readme += `- Build completely dynamic forms directly from the Admin Panel
- Render forms on your front-end using your own UI components
- Send dynamic, personalized emails upon form submission
- Display custom confirmation messages or redirects
- Process payments based on form data (optional)
`;
                break;
            case 'nested-docs':
                readme += `- Automatically adds a \`parent\` relationship field to each document
- Allows for parent/child relationships between documents
- Recursively updates all descendants when a parent is changed
- Automatically populates a \`breadcrumbs\` field with ancestors
- Dynamically generate labels and URLs for each breadcrumb
`;
                break;
            case 'redirects':
                readme += `- Adds a \`redirects\` collection to your config
- Includes \`from\` and \`to\` fields for redirection
- Allows \`to\` to be a document reference
- Supports different redirect types (301, 302)
`;
                break;
            case 'search':
                readme += `- Adds an indexed \`search\` collection to your database
- Automatically creates and syncs search records
- Saves only search-critical data that you define
- Query search results using Payload APIs
- Prioritize search results by collection or document
`;
                break;
            case 'sentry':
                readme += `- Automatically captures and logs errors
- Tracks application performance
- Provides comprehensive error insights
- Sends customizable event-triggered notifications
- Groups similar errors for easier management
`;
                break;
            case 'seo':
                readme += `- Adds a \`meta\` field group to enabled collections/globals
- Define custom functions to auto-generate metadata
- Displays hints and indicators for effective meta
- Renders a search engine preview snippet
- Extendable with custom fields like \`og:title\`
`;
                break;
            case 'stripe':
                readme += `- Hides your Stripe credentials when shipping SaaS applications
- Allows restricted keys through Payload access control
- Enables two-way communication between Stripe and Payload
- Proxies the Stripe REST API
- Proxies Stripe webhooks
- Automatically syncs data between the platforms
`;
                break;
            case 'multi-tenant':
                readme += `- Adds a \`tenant\` field to each specified collection
- Adds a tenant selector to the admin panel
- Filters list view results by selected tenant
- Filters relationship fields by selected tenant
- Creates "global" like collections, 1 doc per tenant
- Automatically assigns a tenant to new documents
`;
                break;
        }
    }

    if (options.options?.hasOptionsInterface) {
        readme += `\n## Options\n\n`;

        if (options.options.properties && options.options.properties.length > 0) {
            readme += '| Option | Type | Default | Description |\n';
            readme += '|--------|------|---------|-------------|\n';

            options.options.properties.forEach(prop => {
                readme += `| \`${prop.name}\` | \`${prop.type}\` | ${prop.defaultValue ? `\`${prop.defaultValue}\`` : 'undefined'} | ${prop.description || ''} |\n`;
            });
        }
    }

    readme += `\n## License\n\nMIT\n`;

    return readme;
}

function generateTsConfig(): string {
    const tsConfig = {
        compilerOptions: {
            target: "es5",
            module: "commonjs",
            lib: ["dom", "es6", "es2019"],
            declaration: true,
            outDir: "dist",
            rootDir: "src",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
        },
        include: ["src/**/*.ts"],
        exclude: ["node_modules", "dist", "dev"]
    };

    return JSON.stringify(tsConfig, null, 2);
}

function generateJestConfig(): string {
    return `module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
};
`;
}

function generateDevFiles(options: PluginGeneratorOptions): Record<string, string> {
    const { name } = options;

    const files: Record<string, string> = {};

    files['dev/src/payload.config.ts'] = `import { buildConfig } from 'payload';
import { ${camelCase(name)}Plugin } from '../../src';

const config = buildConfig({
  serverURL: 'http://localhost:3000',
  admin: {
    user: 'users',
  },
  collections: [
    {
      slug: 'users',
      auth: true,
      fields: [],
    },
    // Add additional collections for testing your plugin
  ],
  globals: [
    // Add globals for testing your plugin
  ],
  plugins: [
    ${camelCase(name)}Plugin({
      // Add your plugin options here for testing
    }),
  ],
});

export default config;
`;

    files['dev/package.json'] = JSON.stringify({
        name: `${name}-plugin-dev`,
        version: '0.0.1',
        main: "dist/server.js",
        license: "MIT",
        scripts: {
            dev: "cross-env PAYLOAD_CONFIG_PATH=src/payload.config.ts nodemon",
            build: "tsc",
            serve: "cross-env PAYLOAD_CONFIG_PATH=dist/payload.config.js NODE_ENV=production node dist/server.js"
        },
        dependencies: {
            payload: "^2.0.0",
            express: "^4.18.2"
        },
        devDependencies: {
            "@types/express": "^4.17.17",
            "cross-env": "^7.0.3",
            "nodemon": "^2.0.22",
            "ts-node": "^10.9.1",
            "typescript": "^5.0.4"
        }
    }, null, 2);

    files['dev/src/server.ts'] = `import express from 'express';
import payload from 'payload';
import path from 'path';

// Initialize express
const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Payload
const start = async () => {
  await payload.init({
    secret: 'secret-key',
    express: app,
    onInit: () => {
      payload.logger.info(\`Payload Admin URL: \${payload.getAdminURL()}\`);
    },
  });

  // Add your express middleware here if needed

  app.listen(PORT, async () => {
    payload.logger.info(\`Server listening on port \${PORT}\`);
  });
};

start();
`;

    files['dev/tsconfig.json'] = JSON.stringify({
        compilerOptions: {
            target: "es5",
            module: "commonjs",
            lib: ["dom", "es6", "es2019"],
            outDir: "dist",
            strict: true,
            esModuleInterop: true,
            skipLibCheck: true,
            forceConsistentCasingInFileNames: true
        },
        include: ["src/**/*.ts"],
        exclude: ["node_modules", "dist"]
    }, null, 2);

    return files;
}

function generateTestFiles(options: PluginGeneratorOptions): Record<string, string> {
    const { name } = options;

    const files: Record<string, string> = {};

    files['src/__tests__/plugin.spec.ts'] = `import { buildConfig } from 'payload';
import { ${camelCase(name)}Plugin } from '../index';

describe('${toTitleCase(name)} Plugin', () => {
  it('should initialize the plugin', () => {
    const plugin = ${camelCase(name)}Plugin();
    expect(plugin).toBeDefined();
    
    // Create a base config
    const baseConfig = buildConfig({
      serverURL: 'http://localhost:3000',
      collections: [],
    });
    
    // Apply the plugin to the config
    const modifiedConfig = plugin(baseConfig);
    
    // Test that the plugin properly modifies the config
    expect(modifiedConfig).toBeDefined();
  });
});
`;

    return files;
}

function generatePluginStructure(options: PluginGeneratorOptions): Record<string, string> {
    const { name, target = 'standalone', includeDevEnvironment, includeTests } = options;

    const files: Record<string, string> = {};

    files['src/index.ts'] = generatePluginFile(options);
    files['src/types.ts'] = generateTypesFile(options);

    if (target === 'npm' || target === 'standalone') {
        files['package.json'] = generatePackageJson(options);
        files['README.md'] = generateReadme(options);
        files['tsconfig.json'] = generateTsConfig();

        if (options.includeDocs) {
            files['docs/API.md'] = `# ${toTitleCase(name)} Plugin API\n\nDetailed API documentation for the ${toTitleCase(name)} Plugin.\n`;
        }
    }

    if (includeTests) {
        files['jest.config.js'] = generateJestConfig();

        const testFiles = generateTestFiles(options);
        Object.entries(testFiles).forEach(([path, content]) => {
            files[path] = content;
        });
    }

    if (includeDevEnvironment) {
        const devFiles = generateDevFiles(options);
        Object.entries(devFiles).forEach(([path, content]) => {
            files[path] = content;
        });
    }

    return files;
}

/**
 * Generates a plugin file structure for Payload CMS
 * 
 * @param options - Configuration options for the plugin
 * @returns Generated code result
 * 
 * @example
 * ```typescript
 * // Generate a basic plugin
 * const result = await generatePlugin({
 *   name: 'my-plugin',
 *   description: 'A custom plugin for Payload CMS',
 *   features: ['collections', 'hooks'],
 *   includeDevEnvironment: true,
 * });
 * ```
 */
export async function generatePlugin(options: PluginGeneratorOptions): Promise<GeneratorResult> {
    validateOptions(options);

    const { name } = options;
    const files = generatePluginStructure(options);

    return {
        code: files['src/index.ts'],
        fileName: 'index.ts',
        language: 'typescript',
        additionalFiles: Object.entries(files)
            .filter(([path]) => path !== 'src/index.ts')
            .map(([path, content]) => ({
                fileName: path,
                code: content,
                language: path.endsWith('.ts') || path.endsWith('.js') ? 'typescript' :
                    path.endsWith('.json') ? 'json' :
                        path.endsWith('.md') ? 'markdown' : 'text'
            })),
    };
}

function generateOfficialPluginCode(options: PluginGeneratorOptions): string {
    const { officialPluginType } = options;

    if (!officialPluginType || officialPluginType === 'custom') {
        return '';
    }

    let code = '';

    switch (officialPluginType) {
        case 'form-builder':
            code = generateFormBuilderPlugin(options);
            break;
        case 'nested-docs':
            code = generateNestedDocsPlugin(options);
            break;
        case 'redirects':
            code = generateRedirectsPlugin(options);
            break;
        case 'search':
            code = generateSearchPlugin(options);
            break;
        case 'sentry':
            code = generateSentryPlugin(options);
            break;
        case 'seo':
            code = generateSEOPlugin(options);
            break;
        case 'stripe':
            code = generateStripePlugin(options);
            break;
        case 'multi-tenant':
            code = generateMultiTenantPlugin(options);
            break;
    }

    return code;
}

function generateFormBuilderPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup form builder functionality
  const formFields = {
    text: true,
    textarea: true,
    select: true,
    email: true,
    state: true,
    country: true,
    checkbox: true,
    number: true,
    message: true,
    payment: false,
  };

  // Add forms collection to incoming config
  if (!config.collections) config.collections = [];
  
  // Define default email templates
  const defaultEmailTemplates = {
    confirmation: (submission) => ({
      subject: 'Thank you for your submission',
      html: \`<p>Thank you for contacting us. We will get back to you soon.</p>\`,
    }),
    notification: (submission) => ({
      subject: 'New form submission',
      html: \`<p>You have received a new form submission.</p>\`,
    }),
  };
  
  // Process form submissions
  const processFormSubmission = (formData, submissionData) => {
    // Handle form submission logic here
    return {
      success: true,
      message: 'Form submitted successfully',
    };
  };
  
  // Setup redirect relationships
  const redirectRelationships = ['pages'];

  // Return the modified config
  return config;`;
}

function generateNestedDocsPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup nested docs functionality
  const nestedCollections = ['pages'];
  
  // Add parent field and breadcrumbs to collections
  nestedCollections.forEach(collectionSlug => {
    const collectionConfig = config.collections?.find(
      collection => typeof collection !== 'string' && collection.slug === collectionSlug
    );
    
    if (collectionConfig && typeof collectionConfig !== 'string') {
      // Make sure fields exists
      if (!collectionConfig.fields) collectionConfig.fields = [];
      
      // Add parent relationship field if it doesn't exist
      if (!collectionConfig.fields.find(field => field.name === 'parent')) {
        collectionConfig.fields.push({
          name: 'parent',
          type: 'relationship',
          relationTo: collectionSlug,
          maxDepth: 10,
          admin: {
            position: 'sidebar',
          },
        });
      }
      
      // Add breadcrumbs field if it doesn't exist
      if (!collectionConfig.fields.find(field => field.name === 'breadcrumbs')) {
        collectionConfig.fields.push({
          name: 'breadcrumbs',
          type: 'array',
          admin: {
            readOnly: true,
          },
          fields: [
            {
              name: 'label',
              type: 'text',
            },
            {
              name: 'url',
              type: 'text',
            },
          ],
        });
      }
    }
  });
  
  // Generate URL for breadcrumbs
  const generateURL = (docs) => {
    return docs.reduce((url, doc) => {
      if (doc.slug) return \`\${url}/\${doc.slug}\`;
      return url;
    }, '');
  };
  
  // Generate label for breadcrumbs
  const generateLabel = (_, doc) => {
    return doc.title || doc.name || doc.label || doc.id;
  };

  return config;`;
}

function generateRedirectsPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup redirects functionality
  const redirectsCollections = ['pages'];
  
  // Add redirects collection to incoming config
  if (!config.collections) config.collections = [];
  
  // Create redirects collection if it doesn't exist
  const redirectsCollection = {
    slug: 'redirects',
    admin: {
      useAsTitle: 'from',
      group: 'Content',
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: 'from',
        type: 'text',
        required: true,
        unique: true,
        admin: {
          description: 'The source path (without domain). Example: /old-path',
        },
      },
      {
        name: 'to',
        type: 'relationship',
        relationTo: redirectsCollections,
        required: true,
        admin: {
          description: 'The destination this redirect should point to',
        },
      },
      {
        name: 'type',
        label: 'Redirect Type',
        type: 'select',
        defaultValue: '301',
        options: [
          {
            label: 'Permanent (301)',
            value: '301',
          },
          {
            label: 'Temporary (302)',
            value: '302',
          },
        ],
      },
    ],
  };
  
  // Add redirects collection if it doesn't exist
  if (!config.collections.find(collection => 
    typeof collection !== 'string' && collection.slug === 'redirects')) {
    config.collections.push(redirectsCollection);
  }

  return config;`;
}

function generateSearchPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup search functionality
  const searchableCollections = ['pages', 'posts'];
  
  // Add search collection to incoming config
  if (!config.collections) config.collections = [];
  
  // Define default priorities for search results
  const defaultPriorities = {
    pages: 10,
    posts: 20,
  };
  
  // Process document before syncing to search
  const beforeSync = ({ originalDoc, searchDoc }) => {
    return {
      ...searchDoc,
      // Add additional fields or modify search document
      excerpt: originalDoc?.excerpt || 'No excerpt available',
    };
  };
  
  // Create search collection
  const searchCollection = {
    slug: 'search-results',
    admin: {
      group: 'System',
    },
    access: {
      read: () => true,
    },
    fields: [
      {
        name: 'title',
        type: 'text',
        required: true,
      },
      {
        name: 'collection',
        type: 'text',
        required: true,
      },
      {
        name: 'originalDoc',
        type: 'relationship',
        required: true,
        relationTo: searchableCollections,
      },
      {
        name: 'priority',
        type: 'number',
        defaultValue: 50,
      },
      {
        name: 'excerpt',
        type: 'textarea',
      },
    ],
    hooks: {
      beforeChange: [
        ({ data }) => {
          // Set priority based on collection type
          if (!data.priority && data.collection && defaultPriorities[data.collection]) {
            data.priority = defaultPriorities[data.collection];
          }
          return data;
        }
      ]
    }
  };
  
  // Add search collection if it doesn't exist
  if (!config.collections.find(collection => 
    typeof collection !== 'string' && collection.slug === 'search-results')) {
    config.collections.push(searchCollection);
  }

  return config;`;
}

function generateSentryPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup Sentry integration
  try {
    // This would typically be imported from '@sentry/nextjs'
    // For demonstration purposes, we're creating a mock Sentry instance
    const mockSentry = {
      captureException: (err) => {
        console.error('Sentry would capture:', err);
      },
      captureMessage: (msg) => {
        console.log('Sentry would log:', msg);
      },
      withScope: (callback) => {
        const scope = {
          setTag: () => {},
          setUser: () => {},
          setExtra: () => {},
        };
        callback(scope);
      },
    };
    
    // Error handler middleware
    const errorHandler = (err, req, res, next) => {
      if (err.statusCode >= 500) {
        mockSentry.withScope((scope) => {
          scope.setTag('path', req.path);
          if (req.user) {
            scope.setUser({ id: req.user.id });
          }
          mockSentry.captureException(err);
        });
      }
      next(err);
    };
    
    // Add error handler to Express middleware if it exists
    if (config.express?.middleware) {
      config.express.middleware.push(errorHandler);
    } else if (config.express) {
      config.express.middleware = [errorHandler];
    } else {
      config.express = {
        middleware: [errorHandler],
      };
    }
    
    // Enable additional error tracking
    const captureErrors = [400, 403, 404];
    
  } catch (error) {
    console.error('Error setting up Sentry:', error);
  }

  return config;`;
}

function generateSEOPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup SEO functionality
  const seoEnabledCollections = ['pages', 'posts'];
  
  // Add SEO fields to enabled collections
  seoEnabledCollections.forEach(collectionSlug => {
    const collectionConfig = config.collections?.find(
      collection => typeof collection !== 'string' && collection.slug === collectionSlug
    );
    
    if (collectionConfig && typeof collectionConfig !== 'string') {
      // Make sure fields exists
      if (!collectionConfig.fields) collectionConfig.fields = [];
      
      // Add meta field group if it doesn't exist
      if (!collectionConfig.fields.find(field => field.name === 'meta')) {
        collectionConfig.fields.push({
          name: 'meta',
          type: 'group',
          admin: {
            position: 'sidebar',
          },
          fields: [
            {
              name: 'title',
              type: 'text',
              admin: {
                description: 'Defaults to the document title if left blank',
              },
            },
            {
              name: 'description',
              type: 'textarea',
              admin: {
                description: 'Recommended: 150-160 characters',
              },
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              admin: {
                description: 'Recommended: 1200x630 pixels',
              },
            },
          ],
        });
      }
    }
  });
  
  // Define functions to auto-generate meta
  const generateTitle = ({ doc }) => {
    return \`\${doc.title} | Your Site Name\`;
  };
  
  const generateDescription = ({ doc }) => {
    return doc.excerpt || doc.content?.slice(0, 157) + '...' || '';
  };
  
  const generateURL = ({ doc, collectionSlug }) => {
    return \`https://yoursite.com/\${collectionSlug}/\${doc.slug}\`;
  };

  return config;`;
}

function generateStripePlugin(options: PluginGeneratorOptions): string {
    return `  // Setup Stripe integration
  try {
    // Define Stripe webhook handlers
    const webhookHandlers = {
      'customer.subscription.created': ({ event }) => {
        console.log('New subscription created:', event.data.object.id);
        // Handle subscription creation
      },
      'customer.subscription.updated': ({ event }) => {
        console.log('Subscription updated:', event.data.object.id);
        // Handle subscription update
      },
      'customer.subscription.deleted': ({ event }) => {
        console.log('Subscription cancelled:', event.data.object.id);
        // Handle subscription cancellation
      },
      'checkout.session.completed': ({ event }) => {
        console.log('Checkout completed:', event.data.object.id);
        // Handle successful checkout
      },
    };
    
    // Setup sync between Payload collections and Stripe
    const syncConfig = [
      {
        collection: 'customers',
        stripeResourceType: 'customers',
        fields: [
          {
            fieldPath: 'email',
            stripeProperty: 'email',
          },
          {
            fieldPath: 'name',
            stripeProperty: 'name',
          },
        ],
      },
      {
        collection: 'products',
        stripeResourceType: 'products',
        fields: [
          {
            fieldPath: 'name',
            stripeProperty: 'name',
          },
          {
            fieldPath: 'description',
            stripeProperty: 'description',
          },
          {
            fieldPath: 'active',
            stripeProperty: 'active',
          },
        ],
      },
    ];
    
    // Helper function to create a Stripe customer
    const createStripeCustomer = async (email, name) => {
      // In a real implementation, this would use the Stripe SDK
      console.log(\`Creating Stripe customer for \${name} (\${email})\`);
      return { id: 'cus_' + Math.random().toString(36).substr(2, 9) };
    };
    
    // Add endpoints for Stripe operations
    if (!config.endpoints) config.endpoints = [];
    
    // Create checkout endpoint (example)
    const checkoutEndpoint = {
      path: '/api/create-checkout',
      method: 'post',
      handler: async (req, res) => {
        try {
          const { products, customerEmail } = req.body;
          
          // Create mock checkout session (would use Stripe SDK in real implementation)
          const session = {
            id: 'cs_' + Math.random().toString(36).substr(2, 9),
            url: \`https://checkout.stripe.com/\${Math.random().toString(36).substr(2, 9)}\`,
          };
          
          res.status(200).json({ sessionId: session.id, url: session.url });
        } catch (error) {
          res.status(500).json({ error: error.message });
        }
      },
    };
    
    // Add endpoints if they don't exist
    if (!config.endpoints.find(endpoint => 
      endpoint.path === '/api/create-checkout')) {
      config.endpoints.push(checkoutEndpoint);
    }
    
  } catch (error) {
    console.error('Error setting up Stripe:', error);
  }

  return config;`;
}

function generateMultiTenantPlugin(options: PluginGeneratorOptions): string {
    return `  // Setup multi-tenant functionality
  const tenantEnabledCollections = {
    pages: {},
    posts: {},
    navigation: {
      isGlobal: true
    }
  };
  
  // Add tenants collection to incoming config if it doesn't exist
  if (!config.collections) config.collections = [];
  
  // Create tenants collection if it doesn't exist
  const tenantsCollection = {
    slug: 'tenants',
    admin: {
      useAsTitle: 'name',
      group: 'System',
    },
    access: {
      read: ({ req }) => !!req.user,
      update: ({ req }) => !!req.user?.roles?.includes('admin'),
      delete: ({ req }) => !!req.user?.roles?.includes('admin'),
    },
    fields: [
      {
        name: 'name',
        type: 'text',
        required: true,
      },
      {
        name: 'slug',
        type: 'text',
        required: true,
        unique: true,
        admin: {
          description: 'Unique identifier for the tenant',
        },
      },
      {
        name: 'domain',
        type: 'text',
        admin: {
          description: 'Custom domain for this tenant (optional)',
        },
      },
      {
        name: 'settings',
        type: 'group',
        fields: [
          {
            name: 'logo',
            type: 'upload',
            relationTo: 'media',
          },
          {
            name: 'theme',
            type: 'select',
            options: [
              {
                label: 'Light',
                value: 'light',
              },
              {
                label: 'Dark',
                value: 'dark',
              },
            ],
            defaultValue: 'light',
          },
        ],
      },
    ],
  };
  
  // Add tenants collection if it doesn't exist
  if (!config.collections.find(collection => 
    typeof collection !== 'string' && collection.slug === 'tenants')) {
    config.collections.push(tenantsCollection);
  }
  
  // Add tenant field to enabled collections
  Object.entries(tenantEnabledCollections).forEach(([collectionSlug, collectionOptions]) => {
    const isGlobal = collectionOptions.isGlobal;
    const collectionConfig = config.collections?.find(
      collection => typeof collection !== 'string' && collection.slug === collectionSlug
    );
    
    if (collectionConfig && typeof collectionConfig !== 'string') {
      // Make sure fields exists
      if (!collectionConfig.fields) collectionConfig.fields = [];
      
      // Add tenant relationship field if it doesn't exist
      if (!collectionConfig.fields.find(field => field.name === 'tenant')) {
        collectionConfig.fields.push({
          name: 'tenant',
          type: 'relationship',
          relationTo: 'tenants',
          required: true,
          hasMany: false,
          admin: {
            position: 'sidebar',
            readOnly: true,
            hidden: !isGlobal,
          },
        });
      }
      
      // Add tenant-based access control
      if (!isGlobal) {
        collectionConfig.hooks = {
          ...(collectionConfig.hooks || {}),
          beforeChange: [
            ...(collectionConfig.hooks?.beforeChange || []),
            ({ req, data }) => {
              // Set tenant based on user's selected tenant
              if (req.user?.tenant) {
                data.tenant = req.user.tenant;
              }
              return data;
            },
          ],
        };
        
        collectionConfig.access = {
          ...(collectionConfig.access || {}),
          read: ({ req }) => {
            // Filter by user's tenant
            if (req.user?.roles?.includes('admin')) return true;
            
            if (req.user?.tenant) {
              return {
                tenant: {
                  equals: req.user.tenant,
                },
              };
            }
            
            return false;
          },
        };
      }
    }
  });
  
  // Add tenant array to users collection
  const usersCollection = config.collections?.find(
    collection => typeof collection !== 'string' && collection.slug === 'users'
  );
  
  if (usersCollection && typeof usersCollection !== 'string') {
    // Make sure fields exists
    if (!usersCollection.fields) usersCollection.fields = [];
    
    // Add tenants field if it doesn't exist
    if (!usersCollection.fields.find(field => field.name === 'tenants')) {
      usersCollection.fields.push({
        name: 'tenants',
        type: 'array',
        admin: {
          description: 'The tenants this user has access to',
        },
        fields: [
          {
            name: 'tenant',
            type: 'relationship',
            relationTo: 'tenants',
            required: true,
          },
          {
            name: 'roles',
            type: 'select',
            hasMany: true,
            options: [
              {
                label: 'Editor',
                value: 'editor',
              },
              {
                label: 'Admin',
                value: 'admin',
              },
            ],
          },
        ],
      });
    }
  }

  return config;`;
}
