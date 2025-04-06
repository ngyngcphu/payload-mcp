import {
  ScaffoldOptions,
  ScaffoldError,
  CollectionConfig,
  GlobalConfig,
  BlockConfig,
  FieldConfig,
  PluginConfig,
} from "./types.js";

const VALID_FIELD_TYPES = new Set([
  "text",
  "textarea",
  "number",
  "email",
  "code",
  "json",
  "date",
  "point",
  "richText",
  "select",
  "multiselect",
  "checkbox",
  "radio",
  "relationship",
  "array",
  "blocks",
  "group",
  "row",
  "collapsible",
  "tabs",
  "upload",
  "ui",
]);

const validateSlug = (
  slug: string | undefined | null,
  entityType: string,
  path: string,
): ScaffoldError | null => {
  if (!slug) {
    return {
      code: `MISSING_${entityType.toUpperCase()}_SLUG`,
      message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} slug is required`,
      suggestion: `Please provide a unique kebab-case slug for the ${entityType} at path: ${path}`,
      field: `${path}.slug`,
    };
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    return {
      code: `INVALID_${entityType.toUpperCase()}_SLUG_FORMAT`,
      message: `Invalid ${entityType} slug: '${slug}'`,
      suggestion: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} slug must be in kebab-case (e.g., 'my-${entityType}') and contain only lowercase letters, numbers, and hyphens.`,
      field: `${path}.slug`,
    };
  }
  return null;
};

const validateName = (
  name: string | undefined | null,
  entityType: string,
  path: string,
): ScaffoldError | null => {
  if (!name) {
    return {
      code: `MISSING_${entityType.toUpperCase()}_NAME`,
      message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} name is required`,
      suggestion: `Please provide a name for the ${entityType} at path: ${path}`,
      field: `${path}.name`,
    };
  }
  if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(name)) {
    return {
      code: `INVALID_${entityType.toUpperCase()}_NAME_FORMAT`,
      message: `Invalid ${entityType} name: '${name}'`,
      suggestion: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} name '${name}' at path ${path} must be a valid JavaScript identifier (e.g., 'fieldName', 'myValue').`,
      field: `${path}.name`,
    };
  }
  return null;
};

const validateFieldsRecursive = (
  fields: FieldConfig[] | undefined | null,
  parentPath: string,
): ScaffoldError[] => {
  const errors: ScaffoldError[] = [];
  if (!fields || !Array.isArray(fields)) {
    return errors;
  }

  const fieldNames = new Set<string>();

  fields.forEach((field, index) => {
    if (typeof field !== "object" || field === null) {
      errors.push({
        code: "INVALID_FIELD_DEFINITION",
        message: `Field definition at path ${parentPath}[${index}] must be an object.`,
        field: `${parentPath}[${index}]`,
      });
      return;
    }

    const currentPath = `${parentPath}[${index}]`;
    const fieldName = field.name;

    const nameError = validateName(fieldName, "field", currentPath);
    if (nameError) {
      errors.push(nameError);
    } else if (fieldName && fieldNames.has(fieldName)) {
      errors.push({
        code: "DUPLICATE_FIELD_NAME",
        message: `Duplicate field name '${fieldName}' found within the same level at path: ${parentPath}`,
        suggestion: `Field names must be unique within their parent structure (collection, global, group, array, block, tab).`,
        field: `${currentPath}.name`,
      });
    } else if (fieldName) {
      fieldNames.add(fieldName);
    }

    if (!field.type) {
      errors.push({
        code: "MISSING_FIELD_TYPE",
        message: `Field type is required for field '${fieldName || `at index ${index}`}'`,
        suggestion: "Please specify a valid field type.",
        field: `${currentPath}.type`,
      });
    } else if (!VALID_FIELD_TYPES.has(field.type)) {
      errors.push({
        code: "INVALID_FIELD_TYPE",
        message: `Invalid field type '${field.type}' for field '${fieldName}'`,
        suggestion: `Type must be one of: ${[...VALID_FIELD_TYPES].join(", ")}`,
        field: `${currentPath}.type`,
      });
      return;
    }

    switch (field.type) {
      case "array":
      case "group":
      case "row":
      case "collapsible":
        if (field.fields) {
          errors.push(
            ...validateFieldsRecursive(field.fields, `${currentPath}.fields`),
          );
        } else {
          if (["group", "row", "collapsible"].includes(field.type)) {
            errors.push({
              code: "MISSING_SUBFIELDS",
              message: `Field type '${field.type}' requires a 'fields' array for field '${fieldName}'`,
              field: `${currentPath}.fields`,
            });
          }
        }
        break;
      case "blocks":
        if (!field.blocks || !Array.isArray(field.blocks)) {
          errors.push({
            code: "MISSING_BLOCKS_ARRAY",
            message: `Field type 'blocks' requires a 'blocks' array for field '${fieldName}'`,
            field: `${currentPath}.blocks`,
          });
        } else {
          const blockSlugs = new Set<string>();
          field.blocks.forEach((block, blockIndex) => {
            if (typeof block !== "object" || block === null) {
              errors.push({
                code: "INVALID_BLOCK_DEFINITION",
                message: `Block definition at ${currentPath}.blocks[${blockIndex}] must be an object.`,
                field: `${currentPath}.blocks[${blockIndex}]`,
              });
              return;
            }
            const blockPath = `${currentPath}.blocks[${blockIndex}]`;
            const blockSlugError = validateSlug(block.slug, "block", blockPath);
            if (blockSlugError) {
              errors.push(blockSlugError);
            } else if (blockSlugs.has(block.slug)) {
              errors.push({
                code: "DUPLICATE_BLOCK_SLUG",
                message: `Duplicate block slug '${block.slug}' in blocks field '${fieldName}'`,
                field: `${blockPath}.slug`,
              });
            } else {
              blockSlugs.add(block.slug);
            }

            errors.push(
              ...validateFieldsRecursive(block.fields, `${blockPath}.fields`),
            );
          });
        }
        break;
      case "tabs":
        if (!field.tabs || !Array.isArray(field.tabs)) {
          errors.push({
            code: "MISSING_TABS_ARRAY",
            message: `Field type 'tabs' requires a 'tabs' array for field '${fieldName}'`,
            field: `${currentPath}.tabs`,
          });
        } else {
          field.tabs.forEach((tab, tabIndex) => {
            if (typeof tab !== "object" || tab === null) {
              errors.push({
                code: "INVALID_TAB_DEFINITION",
                message: `Tab definition at ${currentPath}.tabs[${tabIndex}] must be an object.`,
                field: `${currentPath}.tabs[${tabIndex}]`,
              });
              return;
            }
            const tabPath = `${currentPath}.tabs[${tabIndex}]`;
            if (!tab.label && !tab.name) {
              errors.push({
                code: "MISSING_TAB_LABEL_OR_NAME",
                message: `Tab requires a 'label' or 'name' at path: ${tabPath}`,
                field: `${tabPath}`,
              });
            }
            errors.push(
              ...validateFieldsRecursive(tab.fields, `${tabPath}.fields`),
            );
          });
        }
        break;
      case "select":
      case "radio":
        if (
          !field.options ||
          !Array.isArray(field.options) ||
          field.options.length === 0
        ) {
          errors.push({
            code: "MISSING_FIELD_OPTIONS",
            message: `Field type '${field.type}' requires a non-empty 'options' array for field '${fieldName}'`,
            field: `${currentPath}.options`,
          });
        } else {
          field.options.forEach((option, optionIndex) => {
            if (
              typeof option !== "object" ||
              option === null ||
              typeof option.label !== "string" ||
              typeof option.value !== "string"
            ) {
              errors.push({
                code: "INVALID_FIELD_OPTION",
                message: `Invalid option at path: ${currentPath}.options[${optionIndex}]. Options must be objects with 'label' and 'value' strings.`,
                field: `${currentPath}.options[${optionIndex}]`,
              });
            }
          });
        }
        break;
      case "relationship":
      case "upload":
        if (
          !field.relationTo ||
          (typeof field.relationTo !== "string" &&
            !Array.isArray(field.relationTo))
        ) {
          errors.push({
            code: "MISSING_OR_INVALID_RELATIONTO",
            message: `Field type '${field.type}' requires 'relationTo' property (string or array of strings) for field '${fieldName}'`,
            field: `${currentPath}.relationTo`,
          });
        }
        break;
    }
  });

  return errors;
};

export const validateScaffoldOptions = (
  options: ScaffoldOptions,
): ScaffoldError[] => {
  const errors: ScaffoldError[] = [];

  if (!options.projectName) {
    errors.push({
      code: "MISSING_PROJECT_NAME",
      message: "Project name is required",
      field: "projectName",
    });
  } else if (!/^[a-z0-9][-a-z0-9._]*$/.test(options.projectName)) {
    errors.push({
      code: "INVALID_PROJECT_NAME_FORMAT",
      message: "Project name contains invalid characters",
      suggestion:
        "Project name should follow npm package naming conventions (lowercase, no special chars except -, _, .).",
      field: "projectName",
    });
  }

  if (!options.database) {
    errors.push({
      code: "MISSING_DATABASE_TYPE",
      message: "Database type is required",
      field: "database",
    });
  } else if (
    options.database !== "mongodb" &&
    options.database !== "postgres"
  ) {
    errors.push({
      code: "INVALID_DATABASE_TYPE",
      message: `Invalid database type: '${options.database}'`,
      suggestion: 'Database must be either "mongodb" or "postgres".',
      field: "database",
    });
  }

  const collectionSlugs = new Set<string>();
  if (options.collections) {
    if (!Array.isArray(options.collections)) {
      errors.push({
        code: "INVALID_COLLECTIONS_FORMAT",
        message: "`collections` must be an array.",
        field: "collections",
      });
    } else {
      options.collections.forEach((collection: CollectionConfig, index) => {
        if (typeof collection !== "object" || collection === null) {
          errors.push({
            code: "INVALID_COLLECTION_DEFINITION",
            message: `Collection definition at index ${index} must be an object.`,
            field: `collections[${index}]`,
          });
          return;
        }
        const path = `collections[${index}]`;
        const slugError = validateSlug(collection.slug, "collection", path);
        if (slugError) {
          errors.push(slugError);
        } else if (collectionSlugs.has(collection.slug)) {
          errors.push({
            code: "DUPLICATE_COLLECTION_SLUG",
            message: `Duplicate collection slug '${collection.slug}' found.`,
            field: `${path}.slug`,
          });
        } else {
          collectionSlugs.add(collection.slug);
        }
        errors.push(
          ...validateFieldsRecursive(collection.fields, `${path}.fields`),
        );
      });
    }
  }

  const globalSlugs = new Set<string>();
  if (options.globals) {
    if (!Array.isArray(options.globals)) {
      errors.push({
        code: "INVALID_GLOBALS_FORMAT",
        message: "`globals` must be an array.",
        field: "globals",
      });
    } else {
      options.globals.forEach((global: GlobalConfig, index) => {
        if (typeof global !== "object" || global === null) {
          errors.push({
            code: "INVALID_GLOBAL_DEFINITION",
            message: `Global definition at index ${index} must be an object.`,
            field: `globals[${index}]`,
          });
          return;
        }
        const path = `globals[${index}]`;
        if (!global.slug) {
          errors.push({
            code: "MISSING_GLOBAL_SLUG",
            message: "Global slug is required",
            field: `${path}.slug`,
          });
        } else if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(global.slug)) {
          errors.push({
            code: "INVALID_GLOBAL_SLUG_FORMAT",
            message: `Invalid global slug '${global.slug}'. Should be PascalCase or camelCase.`,
            field: `${path}.slug`,
          });
        } else if (globalSlugs.has(global.slug)) {
          errors.push({
            code: "DUPLICATE_GLOBAL_SLUG",
            message: `Duplicate global slug '${global.slug}' found.`,
            field: `${path}.slug`,
          });
        } else {
          globalSlugs.add(global.slug);
        }
        errors.push(
          ...validateFieldsRecursive(global.fields, `${path}.fields`),
        );
      });
    }
  }

  const blockSlugs = new Set<string>();
  if (options.blocks) {
    if (!Array.isArray(options.blocks)) {
      errors.push({
        code: "INVALID_BLOCKS_FORMAT",
        message: "`blocks` must be an array.",
        field: "blocks",
      });
    } else {
      options.blocks.forEach((block: BlockConfig, index) => {
        if (typeof block !== "object" || block === null) {
          errors.push({
            code: "INVALID_BLOCK_DEFINITION",
            message: `Block definition at index ${index} must be an object.`,
            field: `blocks[${index}]`,
          });
          return;
        }
        const path = `blocks[${index}]`;
        const slugError = validateSlug(block.slug, "block", path);
        if (slugError) {
          errors.push(slugError);
        } else if (blockSlugs.has(block.slug)) {
          errors.push({
            code: "DUPLICATE_BLOCK_SLUG",
            message: `Duplicate block slug '${block.slug}' defined in top-level blocks array.`,
            field: `${path}.slug`,
          });
        } else {
          blockSlugs.add(block.slug);
        }
        errors.push(...validateFieldsRecursive(block.fields, `${path}.fields`));
      });
    }
  }

  if (options.plugins) {
    if (!Array.isArray(options.plugins)) {
      errors.push({
        code: "INVALID_PLUGINS_FORMAT",
        message: "`plugins` must be an array.",
        field: "plugins",
      });
    } else {
      options.plugins.forEach((plugin: string | PluginConfig, index) => {
        const path = `plugins[${index}]`;
        if (typeof plugin === "string") {
          if (
            !/^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(
              plugin,
            )
          ) {
            errors.push({
              code: "INVALID_PLUGIN_NAME_FORMAT",
              message: `Invalid plugin name format: '${plugin}'`,
              suggestion:
                "Plugin name should be a valid npm package name (e.g., '@payloadcms/plugin-seo', 'my-plugin').",
              field: path,
            });
          }
        } else if (typeof plugin === "object" && plugin !== null) {
          if (!plugin.package || typeof plugin.package !== "string") {
            errors.push({
              code: "MISSING_PLUGIN_PACKAGE",
              message:
                "Plugin object requires a valid string 'package' property.",
              field: `${path}.package`,
            });
          }
        } else {
          errors.push({
            code: "INVALID_PLUGIN_TYPE",
            message:
              "Plugin entry must be a string (package name) or an object ({ package, options }).",
            field: path,
          });
        }
      });
    }
  }

  if (options.serverUrl && !/^https?:\/\//.test(options.serverUrl)) {
    errors.push({
      code: "INVALID_SERVER_URL",
      message: `Invalid server URL: '${options.serverUrl}'`,
      suggestion: "Server URL should start with http:// or https://",
      field: "serverUrl",
    });
  }

  if (
    options.authentication &&
    !options.collections?.some((c) => c.slug === "users")
  ) {
    errors.push({
      code: "MISSING_AUTH_COLLECTION",
      message:
        "Authentication is enabled but no collection with slug 'users' was provided.",
      field: "collections",
    });
  }

  return errors;
};
