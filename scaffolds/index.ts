import path from 'path';
import { ScaffoldOptions, ScaffoldResponse } from './types.js';
import { validateScaffoldOptions } from './validate.js';
import {
  generateEnvFile,
  generateGitignoreFile,
  generatePackageJson,
  generateTsConfigFile,
  generateServerFile,
  generatePayloadConfig,
  generateCollectionTemplate,
  generateGlobalTemplate,
  generateBlockTemplate,
  generateReadme,
  generateAccessControlUtil,
  generateAdminStyles,
  generateUserCollection,
  generateMediaCollection,
  generateBlocksIndex,
  generateNextSitemapConfig,
  generatePluginsIndex,
  generateAuthenticatedAccess,
  generateAnyoneAccess,
  generateAuthenticatedOrPublishedAccess,
  generateTailwindConfig,
  generateGlobalsCSS,
  generateComponentsJson,
  generateAppPayloadAdminPage,
  generateAppPayloadAdminNotFound,
  generateAppPayloadApiRoute,
  generateAppPayloadLayout,
  generateAppFrontendLayout,
  generateUtilitiesGetGlobals,
  generateSeedRoute
} from './templates.js';
import {
  createProjectStructure,
  generateProjectFiles
} from './fileSystem.js';

/**
 * Main scaffold function to generate a complete Payload CMS project
 * @param options Configuration options for the scaffold
 * @param outputPath Custom output path (defaults to current directory/options.projectName)
 * @returns ScaffoldResponse with status and details
 */
export const scaffold = async (
  options: ScaffoldOptions,
  outputPath?: string
): Promise<ScaffoldResponse> => {
  const config: ScaffoldOptions = {
    ...options,
    typescript: options.typescript !== false,
    authentication: options.authentication !== false,
  };

  const validationErrors = validateScaffoldOptions(config);
  if (validationErrors.length > 0) {
    return {
      success: false,
      errors: validationErrors,
    };
  }

  const projectPath = outputPath || path.join(process.cwd(), config.projectName);

  const { errors: structureErrors, directories } = createProjectStructure(projectPath, config);
  if (structureErrors.length > 0) {
    return {
      success: false,
      errors: structureErrors,
    };
  }

  const templateContents: Record<string, string> = {
    envFile: generateEnvFile(config),
    gitignoreFile: generateGitignoreFile(),
    packageJson: generatePackageJson(config),
    readme: generateReadme(config),
    serverFile: generateServerFile(),
    payloadConfig: generatePayloadConfig(config),
    accessControlUtil: generateAccessControlUtil(config),
    adminStyles: generateAdminStyles(),
    seedRoute: generateSeedRoute(config),
    authenticatedAccess: generateAuthenticatedAccess(config),
    anyoneAccess: generateAnyoneAccess(config),
    authenticatedOrPublishedAccess: generateAuthenticatedOrPublishedAccess(config),
    pluginsIndex: generatePluginsIndex(),
    nextSitemapConfig: generateNextSitemapConfig(),
    tailwindConfig: generateTailwindConfig(),
    globalsCSS: generateGlobalsCSS(),
    componentsJson: generateComponentsJson(),
    appPayloadAdminPage: generateAppPayloadAdminPage(),
    appPayloadAdminNotFound: generateAppPayloadAdminNotFound(),
    appPayloadApiRoute: generateAppPayloadApiRoute(),
    appPayloadLayout: generateAppPayloadLayout(),
    appFrontendLayout: generateAppFrontendLayout(),
    utilitiesGetGlobals: generateUtilitiesGetGlobals()
  };

  if (config.authentication) {
    templateContents.userCollection = generateUserCollection(config);
    templateContents.mediaCollection = generateMediaCollection(config);
  }

  if (config.typescript) {
    templateContents.tsConfigFile = generateTsConfigFile();
  }

  if (config.collections) {
    for (const collection of config.collections) {
      templateContents[`collection_${collection.slug}`] = generateCollectionTemplate(collection, config);
    }
  }

  if (config.globals) {
    for (const global of config.globals) {
      templateContents[`global_${global.slug}`] = generateGlobalTemplate(global, config);
    }
  }

  if (config.blocks) {
    for (const block of config.blocks) {
      const blockTemplates = generateBlockTemplate(block, config);
      templateContents[`block_${block.slug}_config`] = blockTemplates.config;
      templateContents[`block_${block.slug}_component`] = blockTemplates.component;
    }

    templateContents.blocksIndex = generateBlocksIndex(config.blocks);
  }

  const { errors: fileErrors, files } = generateProjectFiles(
    projectPath,
    templateContents,
    config
  );

  const allErrors = [...structureErrors, ...fileErrors];

  const nextSteps = [
    `cd ${config.projectName}`,
    'pnpm install',
    'pnpm dev',
  ];

  if (config.authentication) {
    nextSteps.push('Visit /next/seed in the browser to create an admin user');
    nextSteps.push('Access the admin panel at /admin to login');
  }

  const serverUrl = config.serverUrl || 'http://localhost:3000';

  return {
    success: allErrors.length === 0,
    projectStructure: {
      root: projectPath,
      files,
      directories,
    },
    packageJson: JSON.parse(templateContents.packageJson),
    adminUrl: `${serverUrl}/admin`,
    startCommand: 'pnpm start',
    devCommand: 'pnpm dev',
    errors: allErrors.length > 0 ? allErrors : undefined,
    warnings: [],
    nextSteps,
  };
};

export * from './types.js';