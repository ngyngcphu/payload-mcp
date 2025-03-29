import { ScaffoldOptions, CollectionConfig, GlobalConfig, BlockConfig, FieldConfig } from './types.js';

export const generateEnvFile = (options: ScaffoldOptions): string => {
  const { database, serverUrl } = options;

  return `# Server
PORT=3000
${serverUrl ? `SERVER_URL=${serverUrl}` : '# SERVER_URL=http://localhost:3000'}

# Database
${database === 'mongodb'
      ? 'MONGODB_URI=mongodb://localhost:27017/payload-' + options.projectName
      : 'POSTGRES_URI=postgres://postgres:postgres@localhost:5432/payload-' + options.projectName}

# Payload
PAYLOAD_SECRET=$(openssl rand -base64 32)

# Optional - for S3 upload use:
# S3_BUCKET=
# S3_REGION=
# S3_ACCESS_KEY_ID=
# S3_SECRET_ACCESS_KEY=
# S3_ENDPOINT=
`;
};

export const generateGitignoreFile = (): string => {
  return `# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# production
/dist
/build

# misc
.DS_Store
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

npm-debug.log*
yarn-debug.log*
yarn-error.log*
`;
};

export const generateTsConfigFile = (): string => {
  return `{
  "compilerOptions": {
    "target": "es2020",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "strict": true,
    "outDir": "dist",
    "sourceMap": true,
    "rootDir": "src",
    "jsx": "react-jsx",
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}`;
};

export const generatePackageJson = (options: ScaffoldOptions): string => {
  const { projectName, description, database, typescript } = options;

  const dependencies: Record<string, string> = {
    'payload': 'latest',
    '@payloadcms/admin-bar': 'latest',
    '@payloadcms/live-preview-react': 'latest',
    '@payloadcms/next': 'latest',
    '@payloadcms/payload-cloud': 'latest',
    '@payloadcms/plugin-form-builder': 'latest',
    '@payloadcms/plugin-nested-docs': 'latest',
    '@payloadcms/plugin-redirects': 'latest',
    '@payloadcms/plugin-search': 'latest',
    '@payloadcms/plugin-seo': 'latest',
    '@payloadcms/richtext-lexical': 'latest',
    '@payloadcms/ui': 'latest',
    '@radix-ui/react-checkbox': '^1.0.4',
    '@radix-ui/react-label': '^2.0.2',
    '@radix-ui/react-select': '^2.0.0',
    '@radix-ui/react-slot': '^1.0.2',
    'class-variance-authority': '^0.7.0',
    'clsx': '^2.1.1',
    'cross-env': '^7.0.3',
    'geist': '^1.3.0',
    'graphql': '^16.8.2',
    'lucide-react': '^0.378.0',
    'next': '15.2.3',
    'next-sitemap': '^4.2.3',
    'prism-react-renderer': '^2.3.1',
    'react': '19.0.0',
    'react-dom': '19.0.0',
    'react-hook-form': '7.45.4',
    'sharp': '0.32.6',
    'tailwind-merge': '^2.3.0',
    'tailwindcss-animate': '^1.0.7'
  };

  if (database === 'mongodb') {
    dependencies['@payloadcms/db-mongodb'] = 'latest';
  } else {
    dependencies['@payloadcms/db-postgres'] = 'latest';
  }

  const devDependencies: Record<string, string> = {
    '@eslint/eslintrc': '^3.2.0',
    '@tailwindcss/typography': '^0.5.13',
    'autoprefixer': '^10.4.19',
    'copyfiles': '^2.4.1',
    'eslint': '^9.16.0',
    'eslint-config-next': '15.2.3',
    'postcss': '^8.4.38',
    'prettier': '^3.4.2',
    'tailwindcss': '^3.4.3'
  };

  if (typescript) {
    devDependencies['typescript'] = '5.7.3';
    devDependencies['@types/node'] = '22.5.4';
    devDependencies['@types/react'] = '19.0.12';
    devDependencies['@types/react-dom'] = '19.0.4';
    devDependencies['@types/escape-html'] = '^1.0.2';
  }

  return JSON.stringify(
    {
      name: projectName,
      description: description || `A Payload CMS project`,
      version: '1.0.0',
      license: 'MIT',
      type: 'module',
      scripts: {
        "build": "cross-env NODE_OPTIONS=--no-deprecation next build",
        "postbuild": "next-sitemap --config next-sitemap.config.cjs",
        "dev": "cross-env NODE_OPTIONS=--no-deprecation next dev",
        "dev:prod": "cross-env NODE_OPTIONS=--no-deprecation rm -rf .next && pnpm build && pnpm start",
        "generate:importmap": "cross-env NODE_OPTIONS=--no-deprecation payload generate:importmap",
        "generate:types": "cross-env NODE_OPTIONS=--no-deprecation payload generate:types",
        "ii": "cross-env NODE_OPTIONS=--no-deprecation pnpm --ignore-workspace install",
        "lint": "cross-env NODE_OPTIONS=--no-deprecation next lint",
        "lint:fix": "cross-env NODE_OPTIONS=--no-deprecation next lint --fix",
        "payload": "cross-env NODE_OPTIONS=--no-deprecation payload",
        "reinstall": "cross-env NODE_OPTIONS=--no-deprecation rm -rf node_modules && rm pnpm-lock.yaml && pnpm --ignore-workspace install",
        "start": "cross-env NODE_OPTIONS=--no-deprecation next start"
      },
      dependencies,
      devDependencies,
      engines: {
        node: "^18.20.2 || >=20.9.0"
      },
      "packageManager": "pnpm@10.3.0",
      "pnpm": {
        "onlyBuiltDependencies": [
          "sharp"
        ]
      }
    },
    null,
    2
  );
};

export const generateNextSitemapConfig = (): string => {
  return `const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
      },
    ],
    additionalSitemaps: [
      \`\${SITE_URL}/posts-sitemap.xml\`,
      \`\${SITE_URL}/pages-sitemap.xml\`,
    ],
  },
}`;
};

export const generatePayloadConfig = (options: ScaffoldOptions): string => {
  const {
    typescript,
    database,
    collections = [],
    globals = [],
    adminBar,
    routeTransitions,
    devBundleServerPackages,
    i18n,
    email,
    cors,
    rateLimit,
  } = options;

  const extension = typescript ? 'ts' : 'js';
  const collectionsImports = collections.map((collection) =>
    `import ${collection.slug} from './collections/${collection.slug}/index.${extension}';`
  ).join('\n');

  const globalsImports = globals.map((global) =>
    `import ${global.slug} from './globals/${global.slug}.${extension}';`
  ).join('\n');

  return `import path from 'path';
import { fileURLToPath } from 'url';
import { buildConfig } from 'payload';
${database === 'mongodb'
      ? `import { mongooseAdapter } from '@payloadcms/db-mongodb';`
      : `import { postgresAdapter } from '@payloadcms/db-postgres';`}
import { webpackBundler } from '@payloadcms/bundler-webpack';
import { slateEditor } from '@payloadcms/richtext-slate';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
${options.authentication ? `import Users from './collections/Users/index.${extension}';
import Media from './collections/Media.${extension}';` : ''}
${collectionsImports}
${globalsImports}
import { plugins } from './plugins/index.${extension}';

// Needed to recognize dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default buildConfig({
  // Server configuration
  serverURL: process.env.SERVER_URL || 'http://localhost:3000',
  ${cors ? `cors: ${typeof cors === 'boolean' ? cors : JSON.stringify(cors)},` : ''}
  ${rateLimit ? `rateLimit: ${JSON.stringify(rateLimit)},` : ''}
  
  // Admin configuration
  admin: {
    user: 'users',
    bundler: webpackBundler(),
    ${adminBar ? 'components: {\n      beforeNavLinks: ["BeforeDashboard"],\n      afterNavLinks: [],\n      beforeLogin: ["BeforeLogin"],\n      afterLogin: [],\n    },' : ''}
    ${routeTransitions ? 'routes: { useRouteTransitions: true },' : ''}
    meta: {
      titleSuffix: '- ${options.projectName}',
      favicon: '/favicon.ico',
      ogImage: '/website-template-OG.webp',
    },
    css: path.resolve(__dirname, 'app/(payload)/custom.scss'),
  },
  
  // Editor configuration
  editor: {
    lexical: {
      features: {
        tables: true,
        links: true,
        upload: {
          collections: {
            media: {
              fields: [
                {
                  name: 'alt',
                  type: 'text',
                  required: true,
                },
              ],
            },
          },
        },
      },
    },
  },
  
  // Collections
  collections: [
    ${options.authentication ? `Users,
    Media,` : ''}${collections.map(c => c.slug).join(',\n    ')}
  ],
  
  // Globals
  globals: [
    ${globals.map(g => g.slug).join(',\n    ')}
  ],
  
  // Database configuration
  db: ${database === 'mongodb'
      ? 'mongooseAdapter({ url: process.env.MONGODB_URI })'
      : 'postgresAdapter({ pool: { connectionString: process.env.POSTGRES_URI } })'
    },
  
  // Plugins
  plugins,
  
  // Localization
  ${i18n ? `i18n: ${JSON.stringify(i18n)},` : ''}
  
  // Email
  ${email ? `email: ${JSON.stringify(email)},` : ''}
  
  // TypeScript
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  
  // GraphQL
  graphQL: {
    schemaOutputFile: path.resolve(__dirname, 'generated-schema.graphql'),
  },
  
  ${devBundleServerPackages ? 'webpack: { devBundleServerPackages: true },' : ''}
});
`;
};

export const generatePluginsIndex = (): string => {
  return `import redirects from '@payloadcms/plugin-redirects';
import seo from '@payloadcms/plugin-seo';
import nestedDocs from '@payloadcms/plugin-nested-docs';
import formBuilder from '@payloadcms/plugin-form-builder';
import search from '@payloadcms/plugin-search';

export const plugins = [
  redirects({
    collections: ['pages', 'posts'],
  }),
  seo({
    collections: ['pages', 'posts'],
    generateTitle: ({ doc }) => \`\${doc.title} | My Website\`,
    generateDescription: ({ doc }) => doc.excerpt,
  }),
  nestedDocs({
    collections: ['pages'],
    parentFieldSlug: 'parent',
    breadcrumbsFieldSlug: 'breadcrumbs',
  }),
  formBuilder({}),
  search({
    collections: ['pages', 'posts'],
    searchOverrides: {
      fields: [
        {
          name: 'title',
          weight: 10,
        },
        {
          name: 'excerpt',
          weight: 5,
        },
      ],
    },
  }),
];`;
};

export const generateAccessControlUtil = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `${typescript ? '// Type imports\nimport { Access } from \'payload\';' : ''}

/**
 * Utility function to determine if the user has admin access
 */
export const isAdmin${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''} }) => {
  // Return true if user has admin role
  return req.user?.roles?.includes('admin') ?? false;
};

/**
 * Utility function to determine if the user is the owner of a document
 */
export const isAdminOrSelf${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''}, id ${typescript ? ': string' : ''} }) => {
  // Grant access if user has admin role
  if (req.user?.roles?.includes('admin')) return true;

  // If there is a logged in user, and they are trying to edit themselves, let them
  if (req.user?.id === id) return true;

  // Reject everyone else
  return false;
};

/**
 * Utility function to determine if the user has editor access
 */
export const isAdminOrEditor${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''} }) => {
  // Return true if user has admin or editor role
  const userRoles = req.user?.roles || [];
  return userRoles.some(role => ['admin', 'editor'].includes(role));
};

/**
 * Utility function to determine if a document is published or the user has admin access
 */
export const isPublishedOrAdmin${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''}, doc ${typescript ? ': any' : ''} }) => {
  // Grant access if user has admin role
  if (req.user?.roles?.includes('admin')) return true;

  // Check if the document is published
  return doc?.status === 'published';
};
`;
};

export const generateAuthenticatedAccess = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `${typescript ? '// Type imports\nimport { Access } from \'payload\';' : ''}

/**
 * Determines if the current user is authenticated
 */
const isAuthenticated${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''} }) => {
  return Boolean(req.user);
};

export default isAuthenticated;
`;
};

export const generateAnyoneAccess = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `${typescript ? '// Type imports\nimport { Access } from \'payload\';' : ''}

/**
 * Allows access to anyone, regardless of authentication status
 */
const anyone${typescript ? `: Access` : ''} = () => {
  return true;
};

export default anyone;
`;
};

export const generateAuthenticatedOrPublishedAccess = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `${typescript ? '// Type imports\nimport { Access } from \'payload\';' : ''}

/**
 * Allows access if authenticated or if the document is published
 */
const authenticatedOrPublished${typescript ? `: Access` : ''} = ({ req ${typescript ? ': any' : ''}, doc ${typescript ? ': any' : ''} }) => {
  // If user is authenticated, grant access
  if (req.user) return true;
  
  // Otherwise, allow if document is published
  return doc?.status === 'published';
};

export default authenticatedOrPublished;
`;
};

export const generateAdminStyles = (): string => {
  return `@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

:root {
  --font-body: 'Inter', sans-serif;
  --font-mono: 'Roboto Mono', monospace;
  
  // Light mode colors
  --theme-elevation-0: #FFFFFF;
  --theme-elevation-50: #F9FAFB;
  --theme-elevation-100: #F3F4F6;
  --theme-elevation-150: #E5E7EB;
  --theme-elevation-200: #D1D5DB;
  --theme-elevation-250: #9CA3AF;
  --theme-elevation-300: #6B7280;
  --theme-elevation-350: #4B5563;
  --theme-elevation-400: #374151;
  --theme-elevation-450: #1F2937;
  --theme-elevation-500: #111827;
  --theme-elevation-550: #0F172A;
  
  --theme-success-50: #ECFDF5;
  --theme-success-100: #D1FAE5;
  --theme-success-500: #10B981;
  --theme-success-700: #047857;
  
  --theme-warning-50: #FFFBEB;
  --theme-warning-100: #FEF3C7;
  --theme-warning-500: #F59E0B;
  --theme-warning-700: #B45309;
  
  --theme-error-50: #FEF2F2;
  --theme-error-100: #FEE2E2;
  --theme-error-500: #EF4444;
  --theme-error-700: #B91C1C;

  --theme-brand-50: #EFF6FF;
  --theme-brand-100: #DBEAFE;
  --theme-brand-500: #3B82F6;
  --theme-brand-700: #1D4ED8;
  
  // Set base colors
  --theme-text: var(--theme-elevation-500);
  --theme-bg: var(--theme-elevation-0);
  
  // Button styles
  --theme-btn-radius: 4px;
  --theme-input-radius: 4px;
}

// Dark mode overrides
html[data-theme='dark'] {
  --theme-text: var(--theme-elevation-50);
  --theme-bg: var(--theme-elevation-450);
}

// General style overrides
.btn {
  font-weight: 500;
}

.field-type {
  margin-bottom: 1.5rem;
}

// Form fields
.field-type.select select,
.field-type.text input,
.field-type.textarea textarea,
.field-type.number input,
.field-type.email input,
.field-type.password input,
.field-type.code .CodeMirror {
  border-radius: var(--theme-input-radius);
}
`;
};

export const generateUserCollection = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import { ${typescript ? 'CollectionConfig' : ''} } from 'payload';

const Users = {
  slug: 'users',
  auth: {
    useAPIKey: true,
  },
  admin: {
    useAsTitle: 'email',
  },
  access: {
    read: () => true,
    create: () => true,
  },
  fields: [
    {
      name: 'roles',
      type: 'select',
      hasMany: true,
      defaultValue: ['editor'],
      options: [
        {
          label: 'Admin',
          value: 'admin',
        },
        {
          label: 'Editor',
          value: 'editor',
        },
      ],
      access: {
        create: ({ req }) => req.user?.roles?.includes('admin'),
        update: ({ req }) => req.user?.roles?.includes('admin'),
      },
    },
    {
      name: 'name',
      type: 'text',
    },
  ],
}

export default Users;
`;
};

export const generateMediaCollection = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import { ${typescript ? 'CollectionConfig' : ''} } from 'payload';
import path from 'path';

const Media = {
  slug: 'media',
  access: {
    read: () => true,
  },
  upload: {
    staticURL: '/media',
    staticDir: path.resolve(__dirname, '../../public/media'),
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        position: 'centre',
      },
      {
        name: 'card',
        width: 768,
        height: 512,
        position: 'centre',
      },
      {
        name: 'feature',
        width: 1280,
        height: 720,
        position: 'centre',
      },
    ],
    mimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/svg+xml'],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
    {
      name: 'caption',
      type: 'richText',
      editor: {
        lexical: {
          features: {
            links: true,
          }
        }
      }
    },
  ],
}

export default Media;
`;
};

export const generateCollectionTemplate = (collection: CollectionConfig, options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import { ${typescript ? 'CollectionConfig' : ''} } from 'payload';
${collection.auth ? "import isAuthenticated from '../../access/authenticated';" : ''}

const ${collection.slug} = {
  slug: '${collection.slug}',
  admin: {
    useAsTitle: '${collection.admin?.useAsTitle || 'title'}',
    ${collection.admin?.defaultColumns ? `defaultColumns: ${JSON.stringify(collection.admin.defaultColumns)},` : ''}
    ${collection.admin?.description ? `description: '${collection.admin.description}',` : ''}
    ${collection.admin?.group ? `group: '${collection.admin.group}',` : ''}
  },
  ${collection.auth ? `auth: ${typeof collection.auth === 'boolean' ? collection.auth : JSON.stringify(collection.auth)},` : ''}
  access: {
    ${collection.access?.read ? `read: ${typeof collection.access.read === 'string' ? collection.access.read : JSON.stringify(collection.access.read)},` : 'read: () => true,'}
    ${collection.access?.create ? `create: ${typeof collection.access.create === 'string' ? collection.access.create : JSON.stringify(collection.access.create)},` : ''}
    ${collection.access?.update ? `update: ${typeof collection.access.update === 'string' ? collection.access.update : JSON.stringify(collection.access.update)},` : ''}
    ${collection.access?.delete ? `delete: ${typeof collection.access.delete === 'string' ? collection.access.delete : JSON.stringify(collection.access.delete)},` : ''}
  },
  fields: [
    ${collection.fields.map(field => generateFieldConfig(field, 4)).join(',\n    ')}
  ],
};

export default ${collection.slug};
`;
};

export const generateGlobalTemplate = (global: GlobalConfig, options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import { ${typescript ? 'GlobalConfig' : ''} } from 'payload';

const ${global.slug} = {
  slug: '${global.slug}',
  access: {
    ${global.access?.read ? `read: ${typeof global.access.read === 'string' ? global.access.read : JSON.stringify(global.access.read)},` : 'read: () => true,'}
    ${global.access?.update ? `update: ${typeof global.access.update === 'string' ? global.access.update : JSON.stringify(global.access.update)},` : ''}
  },
  admin: {
    ${global.admin?.description ? `description: '${global.admin.description}',` : ''}
    ${global.admin?.group ? `group: '${global.admin.group}',` : ''}
  },
  fields: [
    ${global.fields.map(field => generateFieldConfig(field, 4)).join(',\n    ')}
  ],
};

export default ${global.slug};
`;
};

export const generateBlockTemplate = (block: BlockConfig, options: ScaffoldOptions): { config: string; component: string } => {
  const { typescript } = options;

  const configFile = `import { ${typescript ? 'Block' : ''} } from 'payload';

const ${block.slug}Block = {
  slug: '${block.slug}',
  labels: {
    singular: '${block.labels?.singular || block.slug}',
    plural: '${block.labels?.plural || block.slug + 's'}',
  },
  fields: [
    ${block.fields.map(field => generateFieldConfig(field, 4)).join(',\n    ')}
  ],F
};

export default ${block.slug}Block;
`;

  const componentFile = `import React from 'react';
${typescript ? `import { ${block.slug}BlockType } from '../../payload-types';

interface ${block.slug}Props extends ${block.slug}BlockType {
  id?: string;
}` : ''}

const ${block.slug} = (${typescript ? `props: ${block.slug}Props` : 'props'}) => {
  const {
    ${block.fields.map(field => field.name).join(',\n    ')},
  } = props;

  return (
    <div className="${block.slug}">
      {/* Your block component implementation */}
      <h2>This is the ${block.slug} block</h2>
    </div>
  );
};

export default ${block.slug};
`;

  return {
    config: configFile,
    component: componentFile
  };
};

export const generateReadme = (options: ScaffoldOptions): string => {
  const { projectName, description, database } = options;

  return `# ${projectName}

${description || 'A modern Payload CMS project'}

## Features

- Built with [Payload CMS](https://payloadcms.com/) v3.31.0
- ${database === 'mongodb' ? 'MongoDB database with Mongoose adapter' : 'PostgreSQL database'}
- ${options.typescript ? 'TypeScript support' : 'JavaScript'}
- ${options.authentication ? 'Authentication system with roles' : 'No authentication'}
${options.adminBar ? '- Admin bar for quick access' : ''}
${options.routeTransitions ? '- Smooth route transitions' : ''}
${options.richTextEditor ? '- Lexical rich text editor' : ''}

## Project Structure

\`\`\`
src/
├── access/             # Access control functions
├── blocks/             # Block components for the blocks field type
├── collections/        # Collection configurations
├── components/         # Custom React components
├── fields/             # Custom field types
├── globals/            # Global configurations
├── hooks/              # Hooks for collections and globals
├── plugins/            # Plugin configurations
├── utilities/          # Utility functions
├── app/                # Next.js app directory
│   ├── (frontend)      # Frontend routes
│   └── (payload)       # Payload admin routes
├── payload.config.ts   # Main Payload configuration
\`\`\`

## Getting Started

### Development

1. Clone this repository
2. Install dependencies:
   \`\`\`sh
   pnpm install
   \`\`\`
3. Configure environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Update the variables as needed
4. Start the development server:
   \`\`\`sh
   pnpm dev
   \`\`\`

### Environment Variables

- \`PORT\`: Port for the server (default: 3000)
- \`SERVER_URL\`: URL for the server (default: http://localhost:3000)
- ${database === 'mongodb'
      ? '`MONGODB_URI`: MongoDB connection string'
      : '`POSTGRES_URI`: PostgreSQL connection string'}
- \`PAYLOAD_SECRET\`: Secret key for Payload (use a secure random string)

### Production

1. Build the project:
   \`\`\`sh
   pnpm build
   \`\`\`
2. Start the production server:
   \`\`\`sh
   pnpm start
   \`\`\`

## License

[MIT](LICENSE)
`;
};

const generateFieldConfig = (field: FieldConfig, indent: number = 0): string => {
  const indentation = ' '.repeat(indent);

  let result = `{
${indentation}  name: '${field.name}',
${indentation}  type: '${field.type}',
${field.label ? `${indentation}  label: '${field.label}',` : ''}
${field.required ? `${indentation}  required: ${field.required},` : ''}
${field.unique ? `${indentation}  unique: ${field.unique},` : ''}`;

  switch (field.type) {
    case 'select':
    case 'multiselect':
      if (field.options && field.options.length > 0) {
        result += `
${indentation}  options: ${JSON.stringify(field.options)},`;
      }
      if (field.hasMany) {
        result += `
${indentation}  hasMany: ${field.hasMany},`;
      }
      break;

    case 'relationship':
      if (field.relationTo) {
        const relationToValue = Array.isArray(field.relationTo)
          ? JSON.stringify(field.relationTo)
          : `'${field.relationTo}'`;
        result += `
${indentation}  relationTo: ${relationToValue},`;
      }
      if (field.hasMany) {
        result += `
${indentation}  hasMany: ${field.hasMany},`;
      }
      break;

    case 'array':
    case 'group':
      if (field.fields && field.fields.length > 0) {
        result += `
${indentation}  fields: [
${field.fields.map(subField => indentation + '    ' + generateFieldConfig(subField, indent + 4)).join(',\n')}
${indentation}  ],`;
      }
      break;

    case 'blocks':
      if (field.blocks && field.blocks.length > 0) {
        result += `
${indentation}  blocks: [
${field.blocks.map(block => `${indentation}    {
${indentation}      slug: '${block.slug}',
${indentation}      fields: [
${block.fields.map(blockField => indentation + '        ' + generateFieldConfig(blockField, indent + 8)).join(',\n')}
${indentation}      ]
${indentation}    }`).join(',\n')}
${indentation}  ],`;
      }
      break;
  }

  if (field.admin) {
    result += `
${indentation}  admin: {`;

    if (field.admin.description) {
      result += `
${indentation}    description: '${field.admin.description}',`;
    }

    if (field.admin.placeholder) {
      result += `
${indentation}    placeholder: '${field.admin.placeholder}',`;
    }

    if (field.admin.condition) {
      result += `
${indentation}    condition: ${typeof field.admin.condition === 'string' ? field.admin.condition : JSON.stringify(field.admin.condition)},`;
    }

    if (field.admin.width) {
      result += `
${indentation}    width: '${field.admin.width}',`;
    }

    if (field.admin.hidden !== undefined) {
      result += `
${indentation}    hidden: ${field.admin.hidden},`;
    }

    if (field.admin.readOnly !== undefined) {
      result += `
${indentation}    readOnly: ${field.admin.readOnly},`;
    }

    result += `
${indentation}  },`;
  }

  result += `
${indentation}}`;

  return result;
};

export const generateServerFile = (): string => {

  return `import path from 'path';
import { fileURLToPath } from 'url';
import { nextApp } from '@payloadcms/next';
import { payload } from 'payload';

// Obtain dirname in ES modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * This file is not needed for the starter template since everything is handled by Next.js App Router
 * It's included as a reference for those who want to set up a custom server
 * For most users, the default Next.js App Router setup is sufficient
 */

/**
 * Example usage:
 * If you need to start Payload without Next.js (e.g., for a headless API):
 * 
 * 1. Initialize Payload
 * await payload.init({
 *   secret: process.env.PAYLOAD_SECRET,
 * });
 * 
 * 2. Start the server
 * const PORT = process.env.PORT || 3000;
 * app.listen(PORT, () => {
 *   console.log(\`Server started on port \${PORT}\`);
 * });
 */
`;
};

export const generateAppPayloadAdminPage = (): string => {
  return `export { Page as default } from '@payloadcms/admin';
export const dynamic = 'force-dynamic';
`;
};

export const generateAppPayloadAdminNotFound = (): string => {
  return `export default function NotFound() {
  return null;
}`;
};

export const generateAppPayloadApiRoute = (): string => {
  return `import { createPayloadClient } from '@payloadcms/next';
import { withAuth } from '@payloadcms/plugin-auth';
import { withCors } from '@payloadcms/plugin-cors';

const { middleware, handler } = createPayloadClient({
  hooks: {
    beforeRequest: [withAuth(), withCors()],
  },
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export { handler as GET, handler as POST, handler as PUT, handler as PATCH, handler as DELETE, middleware as OPTIONS };
`;
};

export const generateAppPayloadLayout = (): string => {
  return `import './custom.scss';

export const dynamic = 'force-dynamic';

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}`;
};

export const generateAppFrontendLayout = (): string => {
  return `import { Inter } from 'next/font/google';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { AdminBar } from '@payloadcms/admin-bar';
import { Providers } from '@/providers';
import { PayloadRedirects } from '@/components/PayloadRedirects';
import { getGlobals } from '@/utilities/getGlobals';
import './globals.css';

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const globals = await getGlobals();

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={\`\${GeistSans.variable} \${GeistMono.variable}\`}>
        <Providers>
          <PayloadRedirects />
          <AdminBar />
          <main>{children}</main>
        </Providers>
      </body>
    </html>
  );
}`;
};

export const generateUtilitiesGetGlobals = (): string => {
  return `import type { Header } from '@/Header/config';
import type { Footer } from '@/Footer/config';
import { getPayload } from 'payload';

export const getGlobals = async (): Promise<{
  header: Header;
  footer: Footer;
}> => {
  const payload = await getPayload();

  const { docs: headerDocs } = await payload.find({
    collection: 'header',
    limit: 1,
  });

  const { docs: footerDocs } = await payload.find({
    collection: 'footer',
    limit: 1,
  });

  const header = headerDocs?.[0] || null;
  const footer = footerDocs?.[0] || null;

  return {
    header,
    footer,
  };
};
`;
};

export const generateSeedRoute = (options: ScaffoldOptions): string => {
  const { authentication } = options;

  return `import { NextResponse } from 'next/server';
import { getPayload } from 'payload';

export async function GET() {
  try {
    const payload = await getPayload();
    
    console.log('Seeding database...');
    
    ${authentication ? `// Create admin user if it doesn't exist
    const { docs: existingAdmins } = await payload.find({
      collection: 'users',
      where: {
        email: {
          equals: 'admin@example.com',
        },
      },
    });
    
    if (existingAdmins.length === 0) {
      try {
        await payload.create({
          collection: 'users',
          data: {
            email: 'admin@example.com',
            password: 'password123',
            roles: ['admin'],
          },
        });
        console.log('Admin user created successfully');
      } catch (error) {
        console.error('Error creating admin user:', error);
      }
    } else {
      console.log('Admin user already exists');
    }` : '// No authentication - skipping user creation'}
    
    // Add your additional seed data here
    
    return NextResponse.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { success: false, message: 'Error seeding database' },
      { status: 500 }
    );
  }
}`;
};

export const generateTailwindConfig = (): string => {
  return `import { type Config } from 'tailwindcss'
import { fontFamily } from 'tailwindcss/defaultTheme'
import typography from '@tailwindcss/typography'
import animate from 'tailwindcss-animate'

export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', ...fontFamily.sans],
        mono: ['var(--font-geist-mono)', ...fontFamily.mono],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      typography: {
        quoteless: {
          css: {
            'blockquote p:first-of-type::before': { content: 'none' },
            'blockquote p:first-of-type::after': { content: 'none' },
          },
        },
      },
    },
  },
  plugins: [typography, animate],
} satisfies Config`;
};

export const generateGlobalsCSS = (): string => {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
 
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 240 10% 3.9%;
 
    --card: 0 0% 100%;
    --card-foreground: 240 10% 3.9%;
 
    --popover: 0 0% 100%;
    --popover-foreground: 240 10% 3.9%;
 
    --primary: 240 5.9% 10%;
    --primary-foreground: 0 0% 98%;
 
    --secondary: 240 4.8% 95.9%;
    --secondary-foreground: 240 5.9% 10%;
 
    --muted: 240 4.8% 95.9%;
    --muted-foreground: 240 3.8% 46.1%;
 
    --accent: 240 4.8% 95.9%;
    --accent-foreground: 240 5.9% 10%;
 
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 0 0% 98%;
 
    --border: 240 5.9% 90%;
    --input: 240 5.9% 90%;
    --ring: 240 10% 3.9%;
 
    --radius: 0.5rem;
  }
 
  [data-theme="dark"] {
    --background: 240 10% 3.9%;
    --foreground: 0 0% 98%;
 
    --card: 240 10% 3.9%;
    --card-foreground: 0 0% 98%;
 
    --popover: 240 10% 3.9%;
    --popover-foreground: 0 0% 98%;
 
    --primary: 0 0% 98%;
    --primary-foreground: 240 5.9% 10%;
 
    --secondary: 240 3.7% 15.9%;
    --secondary-foreground: 0 0% 98%;
 
    --muted: 240 3.7% 15.9%;
    --muted-foreground: 240 5% 64.9%;
 
    --accent: 240 3.7% 15.9%;
    --accent-foreground: 0 0% 98%;
 
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;
 
    --border: 240 3.7% 15.9%;
    --input: 240 3.7% 15.9%;
    --ring: 240 4.9% 83.9%;
  }
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
  .rich-text {
    @apply prose dark:prose-invert lg:prose-lg prose-quoteless prose-p:my-2 prose-h1:my-4 prose-h2:my-4 prose-h3:my-4 max-w-none;
  }
  .rich-text h1 {
    @apply text-3xl font-bold;
  }
  .rich-text h2 {
    @apply text-2xl font-bold;
  }
  .rich-text h3 {
    @apply text-xl font-bold;
  }
  .rich-text a {
    @apply text-primary underline;
  }
  .rich-text ul {
    @apply list-disc pl-6;
  }
  .rich-text ol {
    @apply list-decimal pl-6;
  }
  .rich-text blockquote {
    @apply border-l-4 border-primary pl-4 italic;
  }
  .rich-text code {
    @apply bg-muted p-1 rounded text-sm;
  }
  .rich-text pre {
    @apply bg-muted p-3 rounded;
  }
  .rich-text pre code {
    @apply bg-transparent p-0 text-sm;
  }
  .rich-text table {
    @apply w-full border-collapse;
  }
  .rich-text th {
    @apply border border-border p-2 bg-muted;
  }
  .rich-text td {
    @apply border border-border p-2;
  }
}

@layer components {
  .container-sm {
    @apply w-full max-w-4xl mx-auto px-4 sm:px-6;
  }
  .container-md {
    @apply w-full max-w-5xl mx-auto px-4 sm:px-6;
  }
  .container-lg {
    @apply w-full max-w-6xl mx-auto px-4 sm:px-6;
  }
  .container-xl {
    @apply w-full max-w-7xl mx-auto px-4 sm:px-6;
  }
}`;
};

export const generateComponentsJson = (): string => {
  return `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/app/(frontend)/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utilities/ui"
  }
}`;
};

export const generateBlocksIndex = (blocks: BlockConfig[]): string => {
  const blockImports = blocks.map(block =>
    `import ${block.slug} from './${block.slug}/Component';`
  ).join('\n');

  return `import React from 'react';
${blockImports}

// Types for blocks
export type BlocksType = {
  blockType: string;
  id: string;
  [key: string]: any;
};

// Maps blockType to the appropriate component
const blockComponentMap = {
  ${blocks.map(block => `'${block.slug}': ${block.slug}`).join(',\n  ')}
};

// Props for RenderBlocks
export type RenderBlocksProps = {
  blocks: BlocksType[];
  className?: string;
};

// Component to render blocks
const RenderBlocks: React.FC<RenderBlocksProps> = ({ blocks, className }) => {
  return (
    <div className={className}>
      {blocks?.map((block, i) => {
        const Block = blockComponentMap[block.blockType];

        if (Block) {
          return <Block key={block.id || i} {...block} />;
        }

        return null;
      })}
    </div>
  );
};

export default RenderBlocks;
`;
}
