/**
 * Config generator for Payload CMS
 */
import { type GeneratorResult } from '../utils/index.js';

interface MongoDBAdapterOptions {
    url: string;
    connectOptions?: Record<string, any>;
}

interface PostgresAdapterOptions {
    url: string;
    enableMigrations?: boolean;
    pool?: {
        min?: number;
        max?: number;
    };
}

interface DatabaseOptions {
    adapter: 'mongodb' | 'postgres';
    adapterOptions: MongoDBAdapterOptions | PostgresAdapterOptions;
}

interface AdminOptions {
    meta?: {
        titleSuffix?: string;
        ogImage?: string;
        favicon?: string;
    };
    avatar?: {
        imageSrc?: string;
        shape?: 'square' | 'circle';
    };
    disable?: boolean;
    components?: {
        beforeLogin?: string[];
        afterLogin?: string[];
        beforeDashboard?: string[];
        afterDashboard?: string[];
        graphics?: {
            Logo?: string;
            Icon?: string;
        };
        Nav?: string;
        logout?: {
            Button?: string;
        };
        views?: Record<string, any>;
    };
    css?: string;
    livePreview?: {
        url?: string;
        breakpoints?: Array<{
            name: string;
            width: number;
            height?: number;
        }>;
    };
}

interface CORSOptions {
    origins?: string[] | string;
    headers?: string[];
}

interface GraphQLOptions {
    disable?: boolean;
    schemaOutputFile?: string;
    maxComplexity?: number;
    disableIntrospection?: boolean;
}

interface LocalizationOptions {
    fallback?: string;
    locales?: string[];
    defaultLocale?: string;
}

interface I18nOptions {
    defaultLanguage?: string;
    languages?: Array<{
        code: string;
        label: string;
    }>;
    resources?: Record<string, Record<string, string>>;
}

interface RouteOptions {
    api?: string;
    admin?: string;
    graphQL?: string;
    graphQLPlayground?: string;
}

interface EmailOptions {
    transport?: {
        host?: string;
        port?: number;
        secure?: boolean;
        auth?: {
            user?: string;
            pass?: string;
        };
    };
    fromName?: string;
    fromAddress?: string;
    templates?: Record<string, string>;
}

interface UploadOptions {
    maxFileSize?: number;
    imageSizes?: Array<{
        name: string;
        width: number;
        height?: number;
        formatOptions?: Record<string, any>;
    }>;
}

interface TypeScriptOptions {
    autoGenerate?: boolean;
    declare?: boolean;
    outputFile?: string;
}

export interface ConfigGeneratorOptions {
    secret?: string;
    database: DatabaseOptions;
    admin?: AdminOptions;
    collections?: string[];
    globals?: string[];
    cors?: CORSOptions | string[] | string;
    graphQL?: GraphQLOptions;
    localization?: LocalizationOptions;
    i18n?: I18nOptions;
    routes?: RouteOptions;
    email?: EmailOptions;
    upload?: UploadOptions;
    typescript?: TypeScriptOptions;
    maxDepth?: number;
    defaultDepth?: number;
    serverURL?: string;
    disableTelemetry?: boolean;
    debug?: boolean;
    outputPath?: string;
    compatibility?: {
        allowLocalizedWithinLocalized?: boolean;
    };
    cookiePrefix?: string;
    customEndpoints?: boolean;
    customHooks?: boolean;
    customBinScripts?: boolean;
}

/**
 * Generate Payload config code
 * 
 * @param options Configuration options for the Payload config
 * @returns Generated code result with the Payload config
 */
export async function generateConfig(options: ConfigGeneratorOptions): Promise<GeneratorResult> {
    const code = generateConfigCode(options);

    return {
        code,
        fileName: 'payload.config.ts',
        language: 'typescript',
    };
}

function generateDatabaseAdapter(options: DatabaseOptions): string {
    let code = '';

    if (options.adapter === 'mongodb') {
        const mongoOptions = options.adapterOptions as MongoDBAdapterOptions;
        code += "import { mongooseAdapter } from '@payloadcms/db-mongodb';\n";

        code += `\n  db: mongooseAdapter({
    url: ${stringOrEnv(mongoOptions.url, 'DATABASE_URI')}`;

        if (mongoOptions.connectOptions) {
            code += `,
    connectOptions: ${JSON.stringify(mongoOptions.connectOptions, null, 2)}`;
        }

        code += `
  }),`;
    } else if (options.adapter === 'postgres') {
        const pgOptions = options.adapterOptions as PostgresAdapterOptions;
        code += "import { postgresAdapter } from '@payloadcms/db-postgres';\n";

        code += `\n  db: postgresAdapter({
    url: ${stringOrEnv(pgOptions.url, 'DATABASE_URI')}`;

        if (pgOptions.enableMigrations) {
            code += `,
    enableMigrations: ${pgOptions.enableMigrations}`;
        }

        if (pgOptions.pool) {
            code += `,
    pool: ${JSON.stringify(pgOptions.pool, null, 2)}`;
        }

        code += `
  }),`;
    }

    return code;
}

function generateAdminConfig(options?: AdminOptions): string {
    if (!options) return '';

    let code = '\n  admin: {';

    if (options.meta) {
        code += `
    meta: {${options.meta.titleSuffix ? `
      titleSuffix: '${options.meta.titleSuffix}',` : ''}${options.meta.ogImage ? `
      ogImage: '${options.meta.ogImage}',` : ''}${options.meta.favicon ? `
      favicon: '${options.meta.favicon}',` : ''}
    },`;
    }

    if (options.avatar) {
        code += `
    avatar: {${options.avatar.imageSrc ? `
      imageSrc: '${options.avatar.imageSrc}',` : ''}${options.avatar.shape ? `
      shape: '${options.avatar.shape}',` : ''}
    },`;
    }

    if (options.disable) {
        code += `
    disable: ${options.disable},`;
    }

    if (options.components) {
        code += '\n    components: {';

        if (options.components.beforeLogin && options.components.beforeLogin.length > 0) {
            code += `
      beforeLogin: [${options.components.beforeLogin.map(c => `'${c}'`).join(', ')}],`;
        }

        if (options.components.afterLogin && options.components.afterLogin.length > 0) {
            code += `
      afterLogin: [${options.components.afterLogin.map(c => `'${c}'`).join(', ')}],`;
        }

        if (options.components.beforeDashboard && options.components.beforeDashboard.length > 0) {
            code += `
      beforeDashboard: [${options.components.beforeDashboard.map(c => `'${c}'`).join(', ')}],`;
        }

        if (options.components.afterDashboard && options.components.afterDashboard.length > 0) {
            code += `
      afterDashboard: [${options.components.afterDashboard.map(c => `'${c}'`).join(', ')}],`;
        }

        if (options.components.graphics) {
            code += `
      graphics: {${options.components.graphics.Logo ? `
        Logo: '${options.components.graphics.Logo}',` : ''}${options.components.graphics.Icon ? `
        Icon: '${options.components.graphics.Icon}',` : ''}
      },`;
        }

        if (options.components.Nav) {
            code += `
      Nav: '${options.components.Nav}',`;
        }

        if (options.components.logout) {
            code += `
      logout: {${options.components.logout.Button ? `
        Button: '${options.components.logout.Button}',` : ''}
      },`;
        }

        if (options.components.views && Object.keys(options.components.views).length > 0) {
            code += `
      views: ${JSON.stringify(options.components.views, null, 6).replace(/"/g, "'")},`;
        }

        code += '\n    },';
    }

    if (options.css) {
        code += `
    css: '${options.css}',`;
    }

    if (options.livePreview) {
        code += `
    livePreview: {${options.livePreview.url ? `
      url: ${stringOrEnv(options.livePreview.url, 'PAYLOAD_PUBLIC_SITE_URL')},` : ''}`;

        if (options.livePreview.breakpoints && options.livePreview.breakpoints.length > 0) {
            code += `
      breakpoints: ${JSON.stringify(options.livePreview.breakpoints, null, 6)},`;
        }

        code += `
    },`;
    }

    code += '\n  },';

    return code;
}

function generateCollectionsConfig(collections?: string[]): string {
    if (!collections || collections.length === 0) return '';

    let code = `\n  collections: [`;

    collections.forEach(collection => {
        code += `\n    ${collection}Collection,`;
    });

    code += `\n  ],`;

    return code;
}

function generateGlobalsConfig(globals?: string[]): string {
    if (!globals || globals.length === 0) return '';

    let code = `\n  globals: [`;

    globals.forEach(global => {
        code += `\n    ${global}Global,`;
    });

    code += `\n  ],`;

    return code;
}

function generateCORSConfig(cors?: CORSOptions | string[] | string): string {
    if (!cors) return '';

    let code = '';

    if (typeof cors === 'string') {
        code += `\n  cors: '${cors}',`;
    } else if (Array.isArray(cors)) {
        code += `\n  cors: ${JSON.stringify(cors, null, 2)},`;
    } else {
        code += `\n  cors: {`;

        if (cors.origins) {
            if (typeof cors.origins === 'string') {
                code += `\n    origins: '${cors.origins}',`;
            } else {
                code += `\n    origins: ${JSON.stringify(cors.origins, null, 2)},`;
            }
        }

        if (cors.headers && cors.headers.length > 0) {
            code += `\n    headers: ${JSON.stringify(cors.headers, null, 2)},`;
        }

        code += `\n  },`;
    }

    return code;
}

function generateGraphQLConfig(graphQL?: GraphQLOptions): string {
    if (!graphQL) return '';

    let code = `\n  graphQL: {`;

    if (graphQL.disable) {
        code += `\n    disable: ${graphQL.disable},`;
    }

    if (graphQL.schemaOutputFile) {
        code += `\n    schemaOutputFile: '${graphQL.schemaOutputFile}',`;
    }

    if (graphQL.maxComplexity) {
        code += `\n    maxComplexity: ${graphQL.maxComplexity},`;
    }

    if (graphQL.disableIntrospection) {
        code += `\n    disableIntrospection: ${graphQL.disableIntrospection},`;
    }

    code += `\n  },`;

    return code;
}

function generateLocalizationConfig(localization?: LocalizationOptions): string {
    if (!localization) return '';

    let code = `\n  localization: {`;

    if (localization.fallback) {
        code += `\n    fallback: '${localization.fallback}',`;
    }

    if (localization.locales && localization.locales.length > 0) {
        code += `\n    locales: ${JSON.stringify(localization.locales, null, 4)},`;
    }

    if (localization.defaultLocale) {
        code += `\n    defaultLocale: '${localization.defaultLocale}',`;
    }

    code += `\n  },`;

    return code;
}

function generateI18nConfig(i18n?: I18nOptions): string {
    if (!i18n) return '';

    let code = `\n  i18n: {`;

    if (i18n.defaultLanguage) {
        code += `\n    defaultLanguage: '${i18n.defaultLanguage}',`;
    }

    if (i18n.languages && i18n.languages.length > 0) {
        code += `\n    languages: ${JSON.stringify(i18n.languages, null, 4)},`;
    }

    if (i18n.resources) {
        code += `\n    resources: ${JSON.stringify(i18n.resources, null, 4)},`;
    }

    code += `\n  },`;

    return code;
}

function generateRoutesConfig(routes?: RouteOptions): string {
    if (!routes) return '';

    let code = `\n  routes: {`;

    if (routes.api) {
        code += `\n    api: '${routes.api}',`;
    }

    if (routes.admin) {
        code += `\n    admin: '${routes.admin}',`;
    }

    if (routes.graphQL) {
        code += `\n    graphQL: '${routes.graphQL}',`;
    }

    if (routes.graphQLPlayground) {
        code += `\n    graphQLPlayground: '${routes.graphQLPlayground}',`;
    }

    code += `\n  },`;

    return code;
}

function generateEmailConfig(email?: EmailOptions): string {
    if (!email) return '';

    let code = `\n  email: {`;

    if (email.transport) {
        code += `\n    transport: ${JSON.stringify(email.transport, null, 4).replace(/"user": ".*?"/, '"user": process.env.SMTP_USER').replace(/"pass": ".*?"/, '"pass": process.env.SMTP_PASS')},`;
    }

    if (email.fromName) {
        code += `\n    fromName: '${email.fromName}',`;
    }

    if (email.fromAddress) {
        code += `\n    fromAddress: ${stringOrEnv(email.fromAddress, 'EMAIL_FROM')},`;
    }

    if (email.templates) {
        code += `\n    templates: ${JSON.stringify(email.templates, null, 4)},`;
    }

    code += `\n  },`;

    return code;
}

function generateUploadConfig(upload?: UploadOptions): string {
    if (!upload) return '';

    let code = `\n  upload: {`;

    if (upload.maxFileSize) {
        code += `\n    maxFileSize: ${upload.maxFileSize},`;
    }

    if (upload.imageSizes && upload.imageSizes.length > 0) {
        code += `\n    imageSizes: ${JSON.stringify(upload.imageSizes, null, 4)},`;
    }

    code += `\n  },`;

    return code;
}

function generateTypeScriptConfig(typescript?: TypeScriptOptions): string {
    if (!typescript) return '';

    let code = `\n  typescript: {`;

    if (typescript.autoGenerate !== undefined) {
        code += `\n    autoGenerate: ${typescript.autoGenerate},`;
    }

    if (typescript.declare !== undefined) {
        code += `\n    declare: ${typescript.declare},`;
    }

    if (typescript.outputFile) {
        code += `\n    outputFile: '${typescript.outputFile}',`;
    }

    code += `\n  },`;

    return code;
}

function generateCompatibilityConfig(compatibility?: { allowLocalizedWithinLocalized?: boolean }): string {
    if (!compatibility) return '';

    let code = `\n  compatibility: {`;

    if (compatibility.allowLocalizedWithinLocalized !== undefined) {
        code += `\n    allowLocalizedWithinLocalized: ${compatibility.allowLocalizedWithinLocalized},`;
    }

    code += `\n  },`;

    return code;
}

function generateCustomEndpointsConfig(includeCustomEndpoints?: boolean): string {
    if (!includeCustomEndpoints) return '';

    return `\n  endpoints: [
    // Add your custom endpoints here
    {
      path: '/api/custom-endpoint',
      method: 'get',
      handler: async (req, res) => {
        res.status(200).json({ message: 'Custom endpoint is working!' });
      },
    },
  ],`;
}

function generateCustomHooksConfig(includeCustomHooks?: boolean): string {
    if (!includeCustomHooks) return '';

    return `\n  hooks: {
    // Add your custom hooks here
    afterError: [(err) => {
      console.error('Global error handler:', err);
    }],
  },`;
}

function generateCustomBinScriptsConfig(includeCustomBinScripts?: boolean): string {
    if (!includeCustomBinScripts) return '';

    return `\n  bin: [
    {
      key: 'seed',
      scriptPath: path.resolve(__dirname, 'scripts/seed.ts'),
    },
  ],`;
}

function generateImports(options: ConfigGeneratorOptions): string {
    let imports = "import { buildConfig } from 'payload';\n";

    if (options.customBinScripts) {
        imports += "import path from 'path';\n";
        imports += "import { fileURLToPath } from 'url';\n";
        imports += "const __dirname = path.dirname(fileURLToPath(import.meta.url));\n";
    }

    if (options.collections && options.collections.length > 0) {
        options.collections.forEach(collection => {
            imports += `import { ${collection}Collection } from './collections/${collection}.js';\n`;
        });
    }

    if (options.globals && options.globals.length > 0) {
        options.globals.forEach(global => {
            imports += `import { ${global}Global } from './globals/${global}.js';\n`;
        });
    }

    imports += generateDatabaseAdapter(options.database);

    if (options.upload && options.upload.imageSizes) {
        imports += "import sharp from 'sharp';\n";
    }

    return imports;
}

function generateConfigCode(options: ConfigGeneratorOptions): string {
    let code = generateImports(options) + '\n';

    code += 'export default buildConfig({';

    code += `\n  secret: ${stringOrEnv(options.secret || 'a-very-secure-secret', 'PAYLOAD_SECRET')},`;

    if (options.serverURL) {
        code += `\n  serverURL: ${stringOrEnv(options.serverURL, 'PAYLOAD_PUBLIC_SERVER_URL')},`;
    }

    code += generateAdminConfig(options.admin);
    code += generateCollectionsConfig(options.collections);
    code += generateGlobalsConfig(options.globals);
    code += generateCORSConfig(options.cors);
    code += generateGraphQLConfig(options.graphQL);
    code += generateLocalizationConfig(options.localization);
    code += generateI18nConfig(options.i18n);
    code += generateRoutesConfig(options.routes);
    code += generateEmailConfig(options.email);
    code += generateUploadConfig(options.upload);
    code += generateTypeScriptConfig(options.typescript);
    code += generateCompatibilityConfig(options.compatibility);
    code += generateCustomEndpointsConfig(options.customEndpoints);
    code += generateCustomHooksConfig(options.customHooks);
    code += generateCustomBinScriptsConfig(options.customBinScripts);

    if (options.maxDepth) {
        code += `\n  maxDepth: ${options.maxDepth},`;
    }

    if (options.defaultDepth) {
        code += `\n  defaultDepth: ${options.defaultDepth},`;
    }

    if (options.cookiePrefix) {
        code += `\n  cookiePrefix: '${options.cookiePrefix}',`;
    }

    if (options.upload && options.upload.imageSizes) {
        code += '\n  sharp,';
    }

    if (options.debug) {
        code += `\n  debug: ${options.debug},`;
    }

    if (options.disableTelemetry) {
        code += `\n  telemetry: false,`;
    }

    code += '\n});\n';

    return code;
}

function stringOrEnv(value: string | undefined, envVarName: string): string {
    if (!value) {
        return `process.env.${envVarName}`;
    }

    if (value.includes('process.env.') || value.includes('${')) {
        return value;
    }

    return `process.env.${envVarName} || '${value}'`;
}
