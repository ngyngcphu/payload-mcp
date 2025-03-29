import {
  ScaffoldOptions,
  ScaffoldError,
  CollectionConfig,
  GlobalConfig,
  BlockConfig,
  FieldConfig,
  PluginConfig
} from './types.js';

const validateProjectName = (projectName: string): ScaffoldError | null => {
  if (!projectName) {
    return {
      code: 'INVALID_PROJECT_NAME',
      message: 'Project name is required',
      suggestion: 'Please provide a valid project name',
    };
  }

  if (!/^[a-z0-9][-a-z0-9._]*$/.test(projectName)) {
    return {
      code: 'INVALID_PROJECT_NAME_FORMAT',
      message: 'Project name contains invalid characters',
      suggestion: 'Project name should follow npm package naming conventions (lowercase, no spaces)',
    };
  }

  return null;
};

const validateDatabase = (database: string): ScaffoldError | null => {
  if (!database) {
    return {
      code: 'INVALID_DATABASE',
      message: 'Database type is required',
      suggestion: 'Please specify either "mongodb" or "postgres"',
    };
  }

  if (database !== 'mongodb' && database !== 'postgres') {
    return {
      code: 'INVALID_DATABASE_TYPE',
      message: `Invalid database type: ${database}`,
      suggestion: 'Database must be either "mongodb" or "postgres"',
    };
  }

  return null;
};

const validateField = (field: FieldConfig): ScaffoldError | null => {
  if (!field.name) {
    return {
      code: 'INVALID_FIELD_NAME',
      message: 'Field name is required',
      suggestion: 'Please provide a name for each field',
    };
  }

  if (!field.type) {
    return {
      code: 'INVALID_FIELD_TYPE',
      message: `Field type is required for field: ${field.name}`,
      suggestion: 'Please specify a valid field type',
    };
  }

  return null;
};

const validateCollection = (collection: CollectionConfig): ScaffoldError | null => {
  if (!collection.slug) {
    return {
      code: 'INVALID_COLLECTION_SLUG',
      message: 'Collection slug is required',
      suggestion: 'Please provide a slug for each collection',
    };
  }

  if (!/^[a-z0-9](-?[a-z0-9])*$/.test(collection.slug)) {
    return {
      code: 'INVALID_COLLECTION_SLUG_FORMAT',
      message: `Invalid collection slug: ${collection.slug}`,
      suggestion: 'Collection slug should be kebab-case (lowercase with hyphens)',
    };
  }

  if (!collection.fields || collection.fields.length === 0) {
    return {
      code: 'MISSING_COLLECTION_FIELDS',
      message: `Collection ${collection.slug} has no fields`,
      suggestion: 'Each collection should have at least one field',
    };
  }

  for (const field of collection.fields) {
    const fieldError = validateField(field);
    if (fieldError) {
      fieldError.field = `collections.${collection.slug}.fields.${field.name}`;
      return fieldError;
    }
  }

  return null;
};

const validateGlobal = (global: GlobalConfig): ScaffoldError | null => {
  if (!global.slug) {
    return {
      code: 'INVALID_GLOBAL_SLUG',
      message: 'Global slug is required',
      suggestion: 'Please provide a slug for each global',
    };
  }

  if (!/^[a-z0-9](-?[a-z0-9])*$/.test(global.slug)) {
    return {
      code: 'INVALID_GLOBAL_SLUG_FORMAT',
      message: `Invalid global slug: ${global.slug}`,
      suggestion: 'Global slug should be kebab-case (lowercase with hyphens)',
    };
  }

  for (const field of global.fields) {
    const fieldError = validateField(field);
    if (fieldError) {
      fieldError.field = `globals.${global.slug}.fields.${field.name}`;
      return fieldError;
    }
  }

  return null;
};

const validateBlock = (block: BlockConfig): ScaffoldError | null => {
  if (!block.slug) {
    return {
      code: 'INVALID_BLOCK_SLUG',
      message: 'Block slug is required',
      suggestion: 'Please provide a slug for each block',
    };
  }

  if (!/^[a-z0-9](-?[a-z0-9])*$/.test(block.slug)) {
    return {
      code: 'INVALID_BLOCK_SLUG_FORMAT',
      message: `Invalid block slug: ${block.slug}`,
      suggestion: 'Block slug should be kebab-case (lowercase with hyphens)',
    };
  }

  for (const field of block.fields) {
    const fieldError = validateField(field);
    if (fieldError) {
      fieldError.field = `blocks.${block.slug}.fields.${field.name}`;
      return fieldError;
    }
  }

  return null;
};

const validatePlugin = (plugin: string | PluginConfig): ScaffoldError | null => {
  if (typeof plugin === 'string') {
    if (!/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(plugin)) {
      return {
        code: 'INVALID_PLUGIN_NAME',
        message: `Invalid plugin name: ${plugin}`,
        suggestion: 'Plugin name should be a valid npm package name',
      };
    }
  } else if (typeof plugin === 'object') {
    if (!plugin.package) {
      return {
        code: 'MISSING_PLUGIN_PACKAGE',
        message: 'Plugin package name is required',
        suggestion: 'Please provide the package name for each plugin object',
      };
    }
  }

  return null;
};

const validateRichTextEditor = (
  editor?: { version: string; features?: string[] }
): ScaffoldError | null => {
  if (!editor) return null;

  if (!editor.version) {
    return {
      code: 'MISSING_RICH_TEXT_VERSION',
      message: 'Rich text editor version is required',
      suggestion: 'Please specify a version for the rich text editor',
    };
  }

  if (!/^\d+\.\d+\.\d+(-[a-zA-Z0-9.]+)?$/.test(editor.version)) {
    return {
      code: 'INVALID_RICH_TEXT_VERSION',
      message: `Invalid rich text editor version: ${editor.version}`,
      suggestion: 'Version should follow semantic versioning (e.g., 0.29.0)',
    };
  }

  return null;
};

export const validateScaffoldOptions = (options: ScaffoldOptions): ScaffoldError[] => {
  const errors: ScaffoldError[] = [];

  const projectNameError = validateProjectName(options.projectName);
  if (projectNameError) errors.push(projectNameError);

  const databaseError = validateDatabase(options.database);
  if (databaseError) errors.push(databaseError);

  if (options.collections) {
    for (const collection of options.collections) {
      const collectionError = validateCollection(collection);
      if (collectionError) errors.push(collectionError);
    }
  }

  if (options.globals) {
    for (const global of options.globals) {
      const globalError = validateGlobal(global);
      if (globalError) errors.push(globalError);
    }
  }

  if (options.blocks) {
    for (const block of options.blocks) {
      const blockError = validateBlock(block);
      if (blockError) errors.push(blockError);
    }
  }

  if (options.plugins) {
    for (const plugin of options.plugins) {
      const pluginError = validatePlugin(plugin);
      if (pluginError) errors.push(pluginError);
    }
  }

  const richTextError = validateRichTextEditor(options.richTextEditor);
  if (richTextError) errors.push(richTextError);

  if (options.compoundIndexes && !options.collections?.some(c => c.indexes?.length)) {
    errors.push({
      code: 'COMPOUND_INDEXES_WITHOUT_INDEXES',
      message: 'Compound indexes feature enabled but no indexes defined',
      suggestion: 'Define indexes in collections or disable the compoundIndexes option',
    });
  }

  return errors;
}; 