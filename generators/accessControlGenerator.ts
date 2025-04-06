/**
 * Access Control generator for Payload CMS
 */
import { type GeneratorResult } from "../utils/index.js";

interface AccessArgs {
  req: {
    user?: Record<string, any>;
    locale?: string;
    [key: string]: any;
  };
  id?: string | number;
  data?: Record<string, any>;
  doc?: Record<string, any>;
  siblingData?: Record<string, any>;
}

type AccessResult = boolean | Record<string, any>;
type AccessFunctionType = (
  args: AccessArgs,
) => AccessResult | Promise<AccessResult>;

interface CollectionAccessOptions {
  create?: AccessFunctionType | boolean | string;
  read?: AccessFunctionType | boolean | string;
  update?: AccessFunctionType | boolean | string;
  delete?: AccessFunctionType | boolean | string;
  admin?: AccessFunctionType | boolean | string;
  unlock?: AccessFunctionType | boolean | string;
  readVersions?: AccessFunctionType | boolean | string;
}

interface GlobalAccessOptions {
  read?: AccessFunctionType | boolean | string;
  update?: AccessFunctionType | boolean | string;
  readVersions?: AccessFunctionType | boolean | string;
}

interface FieldAccessOptions {
  create?: AccessFunctionType | boolean | string;
  read?: AccessFunctionType | boolean | string;
  update?: AccessFunctionType | boolean | string;
}

export interface AccessControlGeneratorOptions {
  collection?: string;
  global?: string;
  field?: string;
  type?: "collection" | "global" | "field";
  operation?:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "admin"
    | "unlock"
    | "readVersions";
  template?:
    | "admin"
    | "authenticated"
    | "public"
    | "owner"
    | "published"
    | "role"
    | "organization"
    | "locale"
    | "conditional";
  options?: {
    ownerField?: string;
    statusField?: string;
    roles?: string[];
    orgField?: string;
    userOrgField?: string;
    locales?: string[];
    condition?: string;
    [key: string]: any;
  };
}

/**
 * Generate a Payload CMS access control function
 * @param options Access control generation options
 * @returns Generated code result
 */
export async function generateAccessControl(
  options: AccessControlGeneratorOptions,
): Promise<GeneratorResult> {
  const {
    collection,
    global,
    field,
    type = collection
      ? "collection"
      : global
        ? "global"
        : field
          ? "field"
          : "collection",
    operation = "read",
    template = "authenticated",
    options: templateOptions = {},
  } = options;

  let code = "";
  let fileName = "";

  const accessFunction = generateAccessTemplate(template, templateOptions);

  if (type === "collection") {
    const accessOptions: CollectionAccessOptions = {};
    accessOptions[operation as keyof CollectionAccessOptions] = accessFunction;
    code = generateCollectionAccess(accessOptions);
    fileName = `${collection || "collection"}-access.ts`;
  } else if (type === "global") {
    const accessOptions: GlobalAccessOptions = {};
    accessOptions[operation as keyof GlobalAccessOptions] = accessFunction;
    code = generateGlobalAccess(accessOptions);
    fileName = `${global || "global"}-access.ts`;
  } else if (type === "field") {
    const accessOptions: FieldAccessOptions = {};
    accessOptions[operation as keyof FieldAccessOptions] = accessFunction;
    code = generateFieldAccess(accessOptions);
    fileName = `${field || "field"}-access.ts`;
  }

  return {
    code,
    language: "typescript",
    fileName,
  };
}

/**
 * Generate collection access control
 *
 * @param options Access control options
 * @param auth Is authentication enabled
 * @param versions Is versioning enabled
 * @returns Generated code as string
 */
function generateCollectionAccess(
  options: CollectionAccessOptions = {},
  auth: boolean = false,
  versions: boolean = false,
): string {
  if (Object.keys(options).length === 0) {
    return "";
  }

  let code = "  access: {\n";

  const crudOperations = ["create", "read", "update", "delete"] as const;
  for (const operation of crudOperations) {
    if (options[operation] !== undefined) {
      const accessValue = options[operation];
      if (accessValue !== undefined) {
        code += formatAccessFunction(operation, accessValue);
      }
    }
  }

  if (auth) {
    if (options.admin !== undefined) {
      code += formatAccessFunction("admin", options.admin);
    }
    if (options.unlock !== undefined) {
      code += formatAccessFunction("unlock", options.unlock);
    }
  }

  if (versions && options.readVersions !== undefined) {
    code += formatAccessFunction("readVersions", options.readVersions);
  }

  code += "  },\n";
  return code;
}

/**
 * Generate global access control
 *
 * @param options Access control options
 * @param versions Is versioning enabled
 * @returns Generated code as string
 */
function generateGlobalAccess(
  options: GlobalAccessOptions = {},
  versions: boolean = false,
): string {
  if (Object.keys(options).length === 0) {
    return "";
  }

  let code = "  access: {\n";

  if (options.read !== undefined) {
    code += formatAccessFunction("read", options.read);
  }
  if (options.update !== undefined) {
    code += formatAccessFunction("update", options.update);
  }

  if (versions && options.readVersions !== undefined) {
    code += formatAccessFunction("readVersions", options.readVersions);
  }

  code += "  },\n";
  return code;
}

/**
 * Generate field access control
 *
 * @param options Access control options
 * @returns Generated code as string
 */
function generateFieldAccess(options: FieldAccessOptions = {}): string {
  if (Object.keys(options).length === 0) {
    return "";
  }

  let code = "access: {\n";

  if (options.create !== undefined) {
    code += formatAccessFunction("create", options.create, 4);
  }
  if (options.read !== undefined) {
    code += formatAccessFunction("read", options.read, 4);
  }
  if (options.update !== undefined) {
    code += formatAccessFunction("update", options.update, 4);
  }

  code += "  },";
  return code;
}

/**
 * Format an access function for output
 *
 * @param operation The operation name (create, read, etc.)
 * @param access The access function, boolean, or string
 * @param indent Indentation level (number of spaces)
 * @returns Formatted code string
 */
function formatAccessFunction(
  operation: string,
  access: AccessFunctionType | boolean | string,
  indent: number = 2,
): string {
  const indentation = " ".repeat(indent);

  if (typeof access === "boolean") {
    return `${indentation}${operation}: ${access},\n`;
  } else if (typeof access === "string") {
    return `${indentation}${operation}: ${access},\n`;
  } else if (typeof access === "function") {
    return `${indentation}${operation}: ${access.toString()},\n`;
  }

  return "";
}

/**
 * Generate a complete access control function from template
 *
 * @param type The access function type
 * @param templateName The template name to use
 * @param options Custom options for the template
 * @returns Generated function as string
 */
function generateAccessTemplate(
  templateName: string,
  options: Record<string, any> = {},
): string {
  switch (templateName) {
    case "admin":
      return generateAdminOnlyAccess();
    case "authenticated":
      return generateAuthenticatedAccess();
    case "public":
      return generatePublicAccess();
    case "owner":
      return generateOwnerAccess(options.ownerField);
    case "published":
      return generatePublishedAccess(options.statusField);
    case "role":
      return generateRoleBasedAccess(options.roles);
    case "organization":
      return generateOrganizationAccess(options.orgField, options.userOrgField);
    case "locale":
      return generateLocaleBasedAccess(options.locales);
    case "conditional":
      return generateConditionalAccess(options.condition);
    default:
      return `({ req }) => { 
  // Template '${templateName}' not found
  return false; 
}`;
  }
}

/**
 * Admin-only access generator
 * Only users with admin role can perform the operation
 */
function generateAdminOnlyAccess(): string {
  return `({ req: { user } }) => {
  // Only allow if user has admin role
  return user?.roles?.includes('admin') || false;
}`;
}

/**
 * Authenticated users only access generator
 * Any logged-in user can perform the operation
 */
function generateAuthenticatedAccess(): string {
  return `({ req: { user } }) => {
  // Allow any authenticated user
  return Boolean(user);
}`;
}

/**
 * Public access generator
 * Anyone can perform the operation, no authentication required
 */
function generatePublicAccess(): string {
  return `() => {
  // Allow anyone
  return true;
}`;
}

/**
 * Owner access generator
 * Only the owner of a document can perform operations on it
 * Admins can perform operations on all documents
 *
 * @param ownerField The field that contains the owner ID
 */
function generateOwnerAccess(ownerField: string = "createdBy"): string {
  return `({ req: { user }, id }) => {
  // If no user, deny access
  if (!user) return false;

  // Admin override
  if (user.roles?.includes('admin')) return true;

  // If no id available, allow access
  // This handles collection-level access for UI controls
  if (!id) return true;

  // Regular users can only access their own documents
  return {
    ${ownerField}: {
      equals: user.id,
    },
  };
}`;
}

/**
 * Published-only access generator
 * Allows public users to access only published content
 * Authenticated users can access all content
 *
 * @param publishedField The field that indicates published status
 */
function generatePublishedAccess(publishedField: string = "status"): string {
  return `({ req: { user } }) => {
  // Authenticated users can access everything
  if (user) return true;

  // Public users can only see published content
  return {
    ${publishedField}: {
      equals: 'published',
    },
  };
}`;
}

/**
 * Role-based access generator
 * Only users with specified roles can perform the operation
 *
 * @param roles Array of roles that are allowed
 */
function generateRoleBasedAccess(roles: string[] = ["admin"]): string {
  const rolesString = roles.map((role) => `'${role}'`).join(", ");

  return `({ req: { user } }) => {
  // If no user or no roles, deny access
  if (!user || !user.roles) return false;

  // Check if user has any of the required roles
  const allowedRoles = [${rolesString}];
  return user.roles.some(role => allowedRoles.includes(role));
}`;
}

/**
 * Organization-based access generator
 * Restricts access to documents that belong to user's organization
 *
 * @param orgField The field that contains the organization ID
 * @param userOrgField The path to organization ID in user object
 */
function generateOrganizationAccess(
  orgField: string = "organization",
  userOrgField: string = "organization",
): string {
  return `({ req: { user }, id }) => {
  // If no user, deny access
  if (!user) return false;

  // Admin override
  if (user.roles?.includes('admin')) return true;

  // If no user organization, deny access
  if (!user.${userOrgField}) return false;

  // Return constraint to only show docs from user's organization
  return {
    ${orgField}: {
      equals: user.${userOrgField},
    },
  };
}`;
}

/**
 * Locale-based access generator
 * Controls access based on the requested locale
 *
 * @param allowedLocales Array of allowed locales
 */
function generateLocaleBasedAccess(allowedLocales: string[] = ["en"]): string {
  const localesString = allowedLocales
    .map((locale) => `'${locale}'`)
    .join(", ");

  return `({ req }) => {
  // Check if the requested locale is in the allowed list
  const allowedLocales = [${localesString}];
  return allowedLocales.includes(req.locale);
}`;
}

/**
 * Conditional access generator
 * Custom condition for field access
 *
 * @param condition Custom condition code
 */
function generateConditionalAccess(
  condition: string = "return Boolean(user);",
): string {
  return `({ req: { user }, doc, siblingData }) => {
  // Custom condition for field access
  ${condition}
}`;
}
