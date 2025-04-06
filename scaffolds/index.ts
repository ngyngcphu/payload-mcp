import path from "path";
import {
  ScaffoldOptions,
  ScaffoldResponse,
  CollectionConfig,
  GlobalConfig,
} from "./types.js";
import { validateScaffoldOptions } from "./validate.js";
import {
  generateEnvFile,
  generateGitignoreFile,
  generatePackageJson,
  generateTsConfigFile,
  generateReadme,
  generatePayloadConfig,
  generateNextConfig,
  generateNextSitemapConfig,
  generateTailwindConfig,
  generatePostcssConfig,
  generateEslintConfig,
  generateComponentsJson,
  generateRedirectsJs,
  generateCollectionTemplate,
  generateGlobalTemplate,
  generateBlockTemplate,
  generateUserCollection,
  generateMediaCollection,
  generateAppFrontendLayout,
  generateGlobalsCSS,
  generateUtilitiesGetGlobals,
  generateAuthenticatedAccess,
  generateAnyoneAccess,
  generateAuthenticatedOrPublishedAccess,
} from "./templates.js";
import { createProjectStructure, generateProjectFiles } from "./fileSystem.js";

const defaultCollections: CollectionConfig[] = [
  {
    slug: "pages",
    fields: [
      { name: "title", type: "text", required: true },
      {
        name: "hero",
        type: "group",
        fields: [],
      },
      {
        name: "layout",
        type: "blocks",
        required: true,
        blocks: [
          { slug: "content", fields: [] },
          { slug: "mediaBlock", fields: [] },
          { slug: "cta", fields: [] },
          { slug: "archive", fields: [] },
        ],
      },
      {
        name: "meta",
        type: "group",
        fields: [
          { name: "title", type: "text" },
          { name: "description", type: "textarea" },
          { name: "image", type: "upload", relationTo: "media" },
        ],
      },
      { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
      { name: "slug", type: "text" },
    ],
    admin: { useAsTitle: "title" },
    versions: {
      drafts: { autosave: { interval: 100 } },
      maxPerDoc: 50,
    },
    access: {
      create: "authenticated",
      read: "authenticatedOrPublished",
      update: "authenticated",
      delete: "authenticated",
    } as any,
    hooks: {},
  },
  {
    slug: "posts",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "heroImage", type: "upload", relationTo: "media" },
      { name: "content", type: "richText", required: true },
      {
        name: "meta",
        type: "group",
        fields: [
          { name: "title", type: "text" },
          { name: "description", type: "textarea" },
          { name: "image", type: "upload", relationTo: "media" },
        ],
      },
      { name: "publishedAt", type: "date", admin: { position: "sidebar" } },
      {
        name: "authors",
        type: "relationship",
        relationTo: "users",
        hasMany: true,
      },
      {
        name: "categories",
        type: "relationship",
        relationTo: "categories",
        hasMany: true,
      },
      {
        name: "relatedPosts",
        type: "relationship",
        relationTo: "posts",
        hasMany: true,
      },
      { name: "slug", type: "text" },
    ],
    admin: { useAsTitle: "title" },
    versions: {
      drafts: { autosave: { interval: 100 } },
      maxPerDoc: 50,
    },
    access: {
      create: "authenticated",
      read: "authenticatedOrPublished",
      update: "authenticated",
      delete: "authenticated",
    } as any,
    hooks: {},
  },
  {
    slug: "categories",
    fields: [
      { name: "title", type: "text", required: true },
      { name: "slug", type: "text" },
    ],
    admin: { useAsTitle: "title" },
    access: {
      create: "authenticated",
      read: "anyone",
      update: "authenticated",
      delete: "authenticated",
    } as any,
  },
];

const defaultGlobals: GlobalConfig[] = [
  {
    slug: "Header",
    fields: [
      {
        name: "navItems",
        type: "array",
        fields: [
          {
            name: "link",
            type: "group",
            fields: [],
          },
        ],
      },
    ],
  },
  {
    slug: "Footer",
    fields: [
      {
        name: "navItems",
        type: "array",
        fields: [
          {
            name: "link",
            type: "group",
            fields: [],
          },
        ],
      },
    ],
  },
];

const defaultPlugins = [
  "@payloadcms/plugin-redirects",
  "@payloadcms/plugin-nested-docs",
  "@payloadcms/plugin-seo",
  "@payloadcms/plugin-form-builder",
  "@payloadcms/plugin-search",
  "@payloadcms/payload-cloud",
];

/**
 * Main scaffold function to generate a complete Payload CMS project based on the website template
 * @param options Configuration options for the scaffold
 * @param outputPath Custom output path (defaults to current directory/options.projectName)
 * @returns ScaffoldResponse with status and details
 */
export const scaffold = async (
  options: ScaffoldOptions,
  outputPath?: string,
): Promise<ScaffoldResponse> => {
  const config: ScaffoldOptions = {
    typescript: options.typescript !== false,
    authentication: options.authentication !== false,
    adminBar: options.adminBar !== false,
    ...options,
    collections:
      options.collections && options.collections.length > 0
        ? options.collections
        : defaultCollections,
    globals:
      options.globals && options.globals.length > 0
        ? options.globals
        : defaultGlobals,
    plugins:
      options.plugins && options.plugins.length > 0
        ? options.plugins
        : defaultPlugins,
  };

  const validationErrors = validateScaffoldOptions(config);
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    };
  }

  const projectPath =
    outputPath || path.join(process.cwd(), config.projectName);

  const { errors: structureErrors, directories } = createProjectStructure(
    projectPath,
    config,
  );
  if (structureErrors.length > 0) {
    return {
      success: false,
      errors: structureErrors,
      projectStructure: { root: projectPath, files: [], directories },
    };
  }

  const templateContents: Record<string, string | undefined> = {
    envFile: generateEnvFile(config),
    gitignoreFile: generateGitignoreFile(),
    packageJson: generatePackageJson(config),
    readme: generateReadme(config),
    payloadConfig: generatePayloadConfig(config),
    tsConfigFile: config.typescript ? generateTsConfigFile() : undefined,
    nextConfig: generateNextConfig(),
    nextSitemapConfig: generateNextSitemapConfig(),
    tailwindConfig: generateTailwindConfig(),
    postcssConfig: generatePostcssConfig(),
    eslintConfig: generateEslintConfig(),
    componentsJson: generateComponentsJson(),
    redirectsJs: generateRedirectsJs(),
    userCollection: config.authentication
      ? generateUserCollection(config)
      : undefined,
    mediaCollection: config.authentication
      ? generateMediaCollection(config)
      : undefined,
    appFrontendLayout: generateAppFrontendLayout(),
    globalsCSS: generateGlobalsCSS(),
    appFrontendRootPage: `import PageTemplate, { generateMetadata } from './[slug]/page'\n\nexport default PageTemplate\n\nexport { generateMetadata }\n`,
    utilitiesGetGlobals: generateUtilitiesGetGlobals(),
    authenticatedAccess: generateAuthenticatedAccess(config),
    anyoneAccess: generateAnyoneAccess(config),
    authenticatedOrPublishedAccess:
      generateAuthenticatedOrPublishedAccess(config),
    faviconIco: "",
    faviconSvg: "",
    ogImageWebp: "",
    importMapPlaceholder:
      "// This file will be automatically generated by Payload CMS during build.",
  };

  if (config.collections) {
    for (const collection of config.collections) {
      if (
        config.authentication &&
        (collection.slug === "users" || collection.slug === "media")
      )
        continue;
      templateContents[`collection_${collection.slug}`] =
        generateCollectionTemplate(collection, config);
    }
  }

  if (config.globals) {
    for (const global of config.globals) {
      const isHeader = global.slug === "Header";
      const isFooter = global.slug === "Footer";

      templateContents[`global_${global.slug}_config`] = generateGlobalTemplate(
        global,
        config,
      );

      if (isHeader || isFooter) {
        templateContents[`global_${global.slug}_component`] =
          `// Placeholder for ${global.slug} Component`;
        templateContents[`global_${global.slug}_revalidateHook`] =
          `// Placeholder for ${global.slug} revalidate hook`;
        templateContents[`global_${global.slug}_rowLabel`] =
          `// Placeholder for ${global.slug} RowLabel`;
        if (isHeader) {
          templateContents.headerClientComponent = `// Placeholder for Header Client Component`;
          templateContents.headerNavComponent = `// Placeholder for Header Nav Component`;
        }
      }
    }
  }

  if (config.blocks) {
    for (const block of config.blocks) {
      const blockTemplates = generateBlockTemplate(block, config);
      templateContents[`block_${block.slug}_config`] = blockTemplates.config;
      if (blockTemplates.component) {
        templateContents[`block_${block.slug}_component`] =
          blockTemplates.component;
      }
    }
    templateContents.renderBlocksComponent =
      "// Placeholder for RenderBlocks component";
  }

  const { errors: fileErrors, files } = generateProjectFiles(
    projectPath,
    templateContents,
    config,
  );

  const allErrors = [...structureErrors, ...fileErrors];

  const nextSteps = [
    `cd ${config.projectName}`,
    "cp .env.example .env # IMPORTANT: Fill in your DATABASE_URI and PAYLOAD_SECRET!",
    "pnpm install",
    "pnpm dev",
  ];

  if (config.authentication) {
    nextSteps.push(
      "After server starts, open http://localhost:3000/next/seed in your browser to create an admin user (dev@payloadcms.com / test) and seed content.",
    );
    nextSteps.push(
      "Access the admin panel at http://localhost:3000/admin to login.",
    );
  }

  const serverUrl = config.serverUrl || "http://localhost:3000";

  return {
    success: allErrors.length === 0,
    projectStructure: {
      root: projectPath,
      files,
      directories,
    },
    packageJson: JSON.parse(templateContents.packageJson || "{}"),
    adminUrl: `${serverUrl}/admin`,
    startCommand: "pnpm start",
    devCommand: "pnpm dev",
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: [],
    nextSteps,
  };
};

export * from "./types.js";
