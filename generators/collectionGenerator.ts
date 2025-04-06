/**
 * Collection generator for Payload CMS
 */
import {
  camelCase,
  toTitleCase,
  type GeneratorResult,
} from "../utils/index.js";
import { generateField, type FieldGeneratorOptions } from "./fieldGenerator.js";

interface AccessArgs {
  req: {
    user?: Record<string, any>;
    [key: string]: any;
  };
  id?: string | number;
  data?: Record<string, any>;
}

type AccessResult = boolean | Record<string, any>;
type AccessFunction = (
  args: AccessArgs,
) => AccessResult | Promise<AccessResult>;

interface CollectionAccess {
  create?: AccessFunction | boolean;
  read?: AccessFunction | boolean;
  update?: AccessFunction | boolean;
  delete?: AccessFunction | boolean;
  admin?: AccessFunction | boolean;
  unlock?: AccessFunction | boolean;
  readVersions?: AccessFunction | boolean;
}

interface ImageSize {
  name: string;
  width: number;
  height?: number;
  position?: "centre" | "center" | "top" | "bottom" | "left" | "right";
  withoutEnlargement?: boolean;
  generateImageName?: (args: {
    height: number;
    sizeName: string;
    extension: string;
    width: number;
  }) => string;
}

interface VersionConfig {
  drafts: boolean;
  maxPerDoc: number;
  max?: number;
  retainDeleted?: boolean;
}

interface UploadConfig {
  staticDir?: string;
  staticURL?: string;
  disableLocalStorage?: boolean;
  adminThumbnail?: string | ((args: { doc: Record<string, any> }) => string);
  imageSizes?: ImageSize[];
  mimeTypes?: string[];
  filesRequiredOnCreate?: boolean;
  filesRequiredOnUpdate?: boolean;
  crop?: boolean;
  focalPoint?: boolean;
  formatOptions?: {
    format: string;
    options: Record<string, any>;
  };
  resizeOptions?: Record<string, any>;
  trimOptions?: Record<string, any>;
  withMetadata?: boolean | ((args: { metadata: any; req: any }) => boolean);
  cacheTags?: boolean;
  handlers?: any[];
  externalFileHeaderFilter?: (
    headers: Record<string, any>,
  ) => Record<string, any>;
  pasteURL?:
    | boolean
    | {
        allowList: Array<{
          hostname: string;
          pathname?: string;
          port?: string;
          protocol?: "http" | "https";
          search?: string;
        }>;
      };
  bulkUpload?: boolean;
  displayPreview?: boolean;
  filenameCompoundIndex?: string[];
  hideFileInputOnCreate?: boolean;
  hideRemoveFile?: boolean;
}

interface EndpointHandler {
  (req: {
    user?: Record<string, any>;
    payload: any;
    [key: string]: any;
  }): Promise<Response>;
}

interface Endpoint {
  path: string;
  method: "get" | "head" | "post" | "put" | "delete" | "connect" | "options";
  handler: string | EndpointHandler;
  root?: boolean;
  custom?: Record<string, any>;
}

interface LockDocumentsConfig {
  duration?: number;
}

export interface CollectionGeneratorOptions {
  slug: string;
  fields?: Array<FieldGeneratorOptions>;

  labels?: {
    singular: string;
    plural: string;
  };
  dbName?: string;

  admin?: AdminConfig;
  disableDuplicate?: boolean;

  access?: CollectionAccess;
  auth?:
    | boolean
    | {
        tokenExpiration?: number;
        verify?:
          | boolean
          | {
              generateEmailHTML?: string;
              generateEmailSubject?: string;
              maxAge?: number;
            };
        maxLoginAttempts?: number;
        lockTime?: number;
        depth?: number;
        cookies?: {
          secure?: boolean;
          sameSite?: boolean | "lax" | "none" | "strict";
          domain?: string;
        };
        forgotPassword?: {
          generateEmailHTML?: string;
          generateEmailSubject?: string;
        };
        loginWithUsername?:
          | boolean
          | {
              allowEmailLogin?: boolean;
              requireEmail?: boolean;
            };
        useAPIKey?: boolean;
        disableLocalStrategy?: boolean;
        removeTokenFromResponses?: boolean;
        strategies?: Array<any>;
      };

  endpoints?: Array<Endpoint> | false;

  hooks?: Array<{
    trigger: string;
    operation?: string;
    collection?: string;
    field?: string;
    code?: string;
  }>;
  versions?: boolean | VersionConfig;

  upload?: boolean | UploadConfig;

  timestamps?: boolean;
  defaultSort?: string | string[];
  defaultPopulate?: Record<string, boolean>;
  indexes?: Array<{
    fields: Record<string, 1 | -1 | "text">;
    options?: Record<string, any>;
  }>;
  forceSelect?: string[];

  lockDocuments?: boolean | LockDocumentsConfig;

  typescript?: {
    interface?: string;
  };
  graphQL?:
    | {
        singularName?: string;
        pluralName?: string;
        fields?: Record<string, any>;
      }
    | false;

  custom?: Record<string, any>;
}

interface AdminHooks {
  beforeOperation?: Array<Function> | Function;
  beforeValidate?: Array<Function> | Function;
  beforeDelete?: Array<Function> | Function;
  beforeChange?: Array<Function> | Function;
  beforeRead?: Array<Function> | Function;
  afterChange?: Array<Function> | Function;
  afterRead?: Array<Function> | Function;
  afterDelete?: Array<Function> | Function;
  afterOperation?: Array<Function> | Function;
  afterError?: Array<Function> | Function;
  beforeLogin?: Array<Function> | Function;
  afterLogin?: Array<Function> | Function;
  afterLogout?: Array<Function> | Function;
  afterRefresh?: Array<Function> | Function;
  afterMe?: Array<Function> | Function;
  afterForgotPassword?: Array<Function> | Function;
  refresh?: Array<Function> | Function;
  me?: Array<Function> | Function;
  [key: string]: Array<Function> | Function | undefined;
}

interface AdminConfig {
  useAsTitle?: string;
  defaultColumns?: string[];
  listSearchableFields?: string[];
  description?: string;
  group?: string | boolean;
  hidden?: boolean | ((user: any) => boolean);
  hooks?: AdminHooks;
  disableCopyToLocale?: boolean;
  hideAPIURL?: boolean;
  enableRichTextLink?: boolean;
  enableRichTextRelationship?: boolean;
  meta?: Record<string, any>;
  preview?: {
    url?: string | ((doc: Record<string, any>) => string);
  };
  livePreview?: boolean;
  components?: Record<string, any>;
  pagination?: Record<string, any>;
  baseListFilter?: Record<string, any>;
}

/**
 * Generate a Payload CMS collection
 * @param options Collection generation options
 * @returns Generated code result
 */
export async function generateCollection(
  options: CollectionGeneratorOptions,
): Promise<GeneratorResult> {
  const {
    slug,
    labels = toTitleCase(slug),
    fields = [],
    auth = false,
    admin = {},
    access = {},
    hooks = [],
    versions = false,
    upload = false,
    endpoints = [],
    timestamps = true,
    lockDocuments = true,
    defaultPopulate,
    defaultSort,
    indexes,
    dbName,
    disableDuplicate,
    typescript,
    graphQL,
    forceSelect,
    custom,
  } = options;

  const labelsObj =
    typeof labels === "string" ? { singular: labels, plural: labels } : labels;

  let code = `import type { CollectionConfig } from 'payload';
  
const ${camelCase(slug)}: CollectionConfig = {
    slug: '${slug}',
    labels: {
        singular: '${labelsObj.singular}',
        plural: '${labelsObj.plural}'
    }`;

  if (dbName) {
    code += `,\n    dbName: '${dbName}'`;
  }

  if (typescript?.interface) {
    code += `,\n    typescript: {
        interface: '${typescript.interface}'
    }`;
  }

  if (graphQL === false) {
    code += `,\n    graphQL: false`;
  } else if (graphQL) {
    code += `,\n    graphQL: ${JSON.stringify(graphQL, null, 2)}`;
  }

  if (custom) {
    code += `,\n    custom: ${JSON.stringify(custom, null, 2)}`;
  }

  if (disableDuplicate) {
    code += `,\n    disableDuplicate: true`;
  }

  if (auth) {
    code += generateAuthConfig(auth);
  }

  code += generateAdminConfig(admin, fields);

  code += generateAccessControl(
    access,
    typeof auth === "boolean" ? auth : Boolean(auth),
    typeof versions === "boolean" ? versions : Boolean(versions),
  );

  if (fields && fields.length > 0) {
    code += ",\n  fields: [\n";
    for (const field of fields) {
      const result = await generateField(field);
      code += result.code + ",\n";
    }
    code += "  ]";
  }

  if (hooks.length > 0) {
    code += ",\n  hooks: {";
    const hooksByTrigger = hooks.reduce(
      (acc, hook) => {
        const { trigger } = hook;
        if (!acc[trigger]) acc[trigger] = [];
        acc[trigger].push(hook);
        return acc;
      },
      {} as Record<string, typeof hooks>,
    );

    Object.entries(hooksByTrigger).forEach(([trigger, hooksForTrigger]) => {
      code += `\n    ${trigger}: [`;
      hooksForTrigger.forEach((hook) => {
        code += `\n      ${hook.code || "async () => { /* Add hook logic */ }"},`;
      });
      code += "\n    ],";
    });
    code += "\n  }";
  }

  if (upload) {
    code += generateUploadConfig(upload);
  }

  if (versions) {
    if (typeof versions === "boolean") {
      code += `,\n    versions: {
        drafts: false,
        maxPerDoc: 100
    }`;
    } else {
      const versionConfig: VersionConfig = {
        drafts: versions.drafts ?? false,
        maxPerDoc: versions.maxPerDoc ?? 100,
      };

      if (versions.max !== undefined) {
        versionConfig.max = versions.max;
      }

      if (versions.retainDeleted !== undefined) {
        versionConfig.retainDeleted = versions.retainDeleted;
      }

      code += `,\n    versions: ${JSON.stringify(versionConfig, null, 2)}`;
    }
  }

  if (endpoints === false) {
    code += ",\n    endpoints: false";
  } else if (endpoints.length > 0) {
    code += ",\n    endpoints: [";
    endpoints.forEach((endpoint) => {
      code += `\n      {
        path: '${endpoint.path}',
        method: '${endpoint.method.toLowerCase()}',
        handler: async (req) => {
          ${endpoint.handler}
          return Response.json({ message: 'success' });
        }
      },`;
    });
    code += "\n    ]";
  }

  if (timestamps === false) code += ",\n    timestamps: false";
  if (lockDocuments === false) {
    code += ",\n    lockDocuments: false";
  } else if (typeof lockDocuments === "object") {
    const lockConfig: LockDocumentsConfig = {};
    if (lockDocuments.duration) {
      lockConfig.duration = lockDocuments.duration;
    }
    code += `,\n    lockDocuments: ${JSON.stringify(lockConfig, null, 2)}`;
  }

  if (defaultPopulate && Object.keys(defaultPopulate).length > 0) {
    code += `,\n    defaultPopulate: ${JSON.stringify(defaultPopulate, null, 2)}`;
  }
  if (defaultSort)
    code += `,\n    defaultSort: ${JSON.stringify(defaultSort, null, 2)}`;
  if (indexes) code += `,\n    indexes: ${JSON.stringify(indexes, null, 2)}`;
  if (forceSelect)
    code += `,\n    forceSelect: ${JSON.stringify(forceSelect, null, 2)}`;

  code += "\n};";
  code += "\n\nexport default " + camelCase(slug) + ";";

  return {
    code,
    language: "typescript",
    fileName: `${slug}.ts`,
  };
}

/**
 * Generate admin configuration
 */
function generateAdminConfig(
  admin: AdminConfig = {},
  fields: CollectionGeneratorOptions["fields"] = [],
): string {
  if (!admin) {
    admin = {};
  }

  const useAsTitle =
    admin.useAsTitle || (fields && fields.length > 0 ? fields[0]?.name : "id");
  const defaultColumns =
    admin.defaultColumns ||
    (fields ? fields.slice(0, 3).map((f) => f.name) : ["id"]);
  const {
    listSearchableFields,
    description,
    group,
    hidden,
    hideAPIURL,
    hooks,
    disableCopyToLocale,
    enableRichTextLink,
    enableRichTextRelationship,
    meta,
    preview,
    livePreview,
    components,
    pagination,
    baseListFilter,
  } = admin;

  let code = "  admin: {\n";
  code += `    useAsTitle: '${useAsTitle}',\n`;

  if (defaultColumns && defaultColumns.length > 0) {
    code += `    defaultColumns: ${JSON.stringify(defaultColumns)},\n`;
  }

  if (listSearchableFields && listSearchableFields.length > 0) {
    code += `    listSearchableFields: ${JSON.stringify(listSearchableFields)},\n`;
  }

  if (description) {
    code += `    description: '${description}',\n`;
  }

  if (group) {
    if (typeof group === "boolean") {
      code += `    group: ${group},\n`;
    } else {
      code += `    group: '${group}',\n`;
    }
  }

  if (hidden) {
    if (typeof hidden === "function") {
      code += `    hidden: ${hidden.toString()},\n`;
    } else {
      code += `    hidden: ${hidden},\n`;
    }
  }

  if (hooks) {
    code += "    hooks: {\n";
    const hookTypes = [
      "beforeOperation",
      "beforeValidate",
      "beforeDelete",
      "beforeChange",
      "beforeRead",
      "afterChange",
      "afterRead",
      "afterDelete",
      "afterOperation",
      "afterError",
      "beforeLogin",
      "afterLogin",
      "afterLogout",
      "afterRefresh",
      "afterMe",
      "afterForgotPassword",
      "refresh",
      "me",
    ] as const;

    hookTypes.forEach((hookType) => {
      const hook = hooks[hookType];
      if (hook) {
        if (Array.isArray(hook)) {
          code += `      ${hookType}: [\n`;
          hook.forEach((hookFn) => {
            if (typeof hookFn === "function") {
              code += `        ${hookFn.toString()},\n`;
            }
          });
          code += "      ],\n";
        } else if (typeof hook === "function") {
          code += `      ${hookType}: ${hook.toString()},\n`;
        }
      }
    });
    code += "    },\n";
  }

  if (disableCopyToLocale) {
    code += `    disableCopyToLocale: ${disableCopyToLocale},\n`;
  }

  if (hideAPIURL) {
    code += `    hideAPIURL: ${hideAPIURL},\n`;
  }

  if (typeof enableRichTextLink === "boolean") {
    code += `    enableRichTextLink: ${enableRichTextLink},\n`;
  }

  if (typeof enableRichTextRelationship === "boolean") {
    code += `    enableRichTextRelationship: ${enableRichTextRelationship},\n`;
  }

  if (meta) {
    code += `    meta: ${JSON.stringify(meta)},\n`;
  }

  if (preview) {
    if (typeof preview.url === "function") {
      code += `    preview: { url: ${preview.url.toString()} },\n`;
    } else if (preview.url) {
      code += `    preview: { url: '${preview.url}' },\n`;
    }
  }

  if (livePreview) {
    code += `    livePreview: ${JSON.stringify(livePreview)},\n`;
  }

  if (components) {
    code += `    components: ${JSON.stringify(components)},\n`;
  }

  if (pagination) {
    code += `    pagination: ${JSON.stringify(pagination)},\n`;
  }

  if (baseListFilter) {
    code += `    baseListFilter: ${JSON.stringify(baseListFilter)},\n`;
  }

  code += "  },\n";
  return code;
}

/**
 * Generate access control configuration
 */
function generateAccessControl(
  access: CollectionAccess = {},
  auth: boolean = false,
  versions: boolean = false,
): string {
  if (Object.keys(access).length === 0) {
    return "";
  }

  let code = "  access: {\n";

  const crudOperations = ["create", "read", "update", "delete"] as const;
  crudOperations.forEach((operation) => {
    const accessValue = access[operation];
    if (accessValue !== undefined) {
      if (typeof accessValue === "boolean") {
        code += `    ${operation}: ${accessValue},\n`;
      } else if (typeof accessValue === "function") {
        code += `    ${operation}: ${accessValue.toString()},\n`;
      }
    }
  });

  if (auth) {
    if (access.admin !== undefined) {
      if (typeof access.admin === "boolean") {
        code += `    admin: ${access.admin},\n`;
      } else if (typeof access.admin === "function") {
        code += `    admin: ${access.admin.toString()},\n`;
      }
    }

    if (access.unlock !== undefined) {
      if (typeof access.unlock === "boolean") {
        code += `    unlock: ${access.unlock},\n`;
      } else if (typeof access.unlock === "function") {
        code += `    unlock: ${access.unlock.toString()},\n`;
      }
    }
  }

  if (versions && access.readVersions !== undefined) {
    if (typeof access.readVersions === "boolean") {
      code += `    readVersions: ${access.readVersions},\n`;
    } else if (typeof access.readVersions === "function") {
      code += `    readVersions: ${access.readVersions.toString()},\n`;
    }
  }

  code += "  },\n";
  return code;
}

function generateAuthConfig(auth: CollectionGeneratorOptions["auth"]): string {
  if (!auth) return "";

  if (auth === true) {
    return `
  auth: {
    tokenExpiration: 7200, // 2 hours
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600 * 1000, // 10 minutes
  },`;
  }

  const {
    tokenExpiration = 7200,
    verify = false,
    maxLoginAttempts = 5,
    lockTime = 600 * 1000,
    depth,
    cookies,
    forgotPassword,
    loginWithUsername,
    useAPIKey,
    disableLocalStrategy,
    removeTokenFromResponses,
    strategies,
  } = auth;

  let authConfig = "\n  auth: {";

  authConfig += `\n    tokenExpiration: ${tokenExpiration},`;

  if (typeof verify === "object") {
    authConfig += `\n    verify: {`;
    if (verify.generateEmailHTML)
      authConfig += `\n      generateEmailHTML: ${verify.generateEmailHTML},`;
    if (verify.generateEmailSubject)
      authConfig += `\n      generateEmailSubject: ${verify.generateEmailSubject},`;
    if (verify.maxAge) authConfig += `\n      maxAge: ${verify.maxAge},`;
    authConfig += "\n    },";
  } else {
    authConfig += `\n    verify: ${verify},`;
  }

  if (maxLoginAttempts)
    authConfig += `\n    maxLoginAttempts: ${maxLoginAttempts},`;
  if (lockTime) authConfig += `\n    lockTime: ${lockTime},`;
  if (depth) authConfig += `\n    depth: ${depth},`;

  if (cookies) {
    authConfig += "\n    cookies: {";
    if (typeof cookies.secure !== "undefined")
      authConfig += `\n      secure: ${cookies.secure},`;
    if (cookies.sameSite)
      authConfig += `\n      sameSite: '${cookies.sameSite}',`;
    if (cookies.domain) authConfig += `\n      domain: '${cookies.domain}',`;
    authConfig += "\n    },";
  }

  if (forgotPassword) {
    authConfig += "\n    forgotPassword: {";
    if (forgotPassword.generateEmailHTML)
      authConfig += `\n      generateEmailHTML: ${forgotPassword.generateEmailHTML},`;
    if (forgotPassword.generateEmailSubject)
      authConfig += `\n      generateEmailSubject: ${forgotPassword.generateEmailSubject},`;
    authConfig += "\n    },";
  }

  if (loginWithUsername) {
    if (typeof loginWithUsername === "object") {
      authConfig += "\n    loginWithUsername: {";
      if (typeof loginWithUsername.allowEmailLogin !== "undefined") {
        authConfig += `\n      allowEmailLogin: ${loginWithUsername.allowEmailLogin},`;
      }
      if (typeof loginWithUsername.requireEmail !== "undefined") {
        authConfig += `\n      requireEmail: ${loginWithUsername.requireEmail},`;
      }
      authConfig += "\n    },";
    } else {
      authConfig += `\n    loginWithUsername: ${loginWithUsername},`;
    }
  }

  if (typeof useAPIKey !== "undefined")
    authConfig += `\n    useAPIKey: ${useAPIKey},`;
  if (disableLocalStrategy)
    authConfig += `\n    disableLocalStrategy: ${disableLocalStrategy},`;
  if (removeTokenFromResponses)
    authConfig += `\n    removeTokenFromResponses: ${removeTokenFromResponses},`;

  if (strategies && strategies.length > 0) {
    authConfig += `\n    strategies: ${JSON.stringify(strategies, null, 2)},`;
  }

  authConfig += "\n  },";
  return authConfig;
}

function generateUploadConfig(
  upload: CollectionGeneratorOptions["upload"],
): string {
  if (!upload) return "";

  if (upload === true) {
    return `
  upload: {
    staticDir: '../uploads',
    staticURL: '/uploads',
    mimeTypes: ['image/*'],
    filesRequiredOnCreate: true,
    crop: true,
    focalPoint: true,
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
        height: 1024,
        position: 'centre',
      }
    ],
    adminThumbnail: 'thumbnail',
  },`;
  }

  const {
    staticDir = "../uploads",
    staticURL = "/uploads",
    disableLocalStorage,
    adminThumbnail,
    imageSizes,
    mimeTypes,
    filesRequiredOnCreate,
    filesRequiredOnUpdate,
    crop,
    focalPoint,
    formatOptions,
    resizeOptions,
    trimOptions,
    withMetadata,
    cacheTags,
    handlers,
    externalFileHeaderFilter,
    pasteURL,
    bulkUpload,
    displayPreview,
    filenameCompoundIndex,
    hideFileInputOnCreate,
    hideRemoveFile,
  } = upload;

  let uploadConfig = "\n  upload: {";

  uploadConfig += `\n    staticDir: '${staticDir}',`;
  uploadConfig += `\n    staticURL: '${staticURL}',`;

  if (adminThumbnail) {
    if (typeof adminThumbnail === "string") {
      uploadConfig += `\n    adminThumbnail: '${adminThumbnail}',`;
    } else {
      uploadConfig += `\n    adminThumbnail: ${adminThumbnail.toString()},`;
    }
  }

  if (imageSizes && imageSizes.length > 0) {
    uploadConfig += "\n    imageSizes: [";
    imageSizes.forEach((size) => {
      uploadConfig += "\n      {";
      uploadConfig += `\n        name: '${size.name}',`;
      uploadConfig += `\n        width: ${size.width},`;
      if (size.height) uploadConfig += `\n        height: ${size.height},`;
      if (size.position)
        uploadConfig += `\n        position: '${size.position}',`;
      if (typeof size.withoutEnlargement !== "undefined") {
        uploadConfig += `\n        withoutEnlargement: ${size.withoutEnlargement},`;
      }
      if (size.generateImageName) {
        uploadConfig += `\n        generateImageName: ${size.generateImageName.toString()},`;
      }
      uploadConfig += "\n      },";
    });
    uploadConfig += "\n    ],";
  }

  if (mimeTypes && mimeTypes.length > 0) {
    uploadConfig += `\n    mimeTypes: ${JSON.stringify(mimeTypes)},`;
  }

  if (typeof filesRequiredOnCreate !== "undefined") {
    uploadConfig += `\n    filesRequiredOnCreate: ${filesRequiredOnCreate},`;
  }
  if (typeof filesRequiredOnUpdate !== "undefined") {
    uploadConfig += `\n    filesRequiredOnUpdate: ${filesRequiredOnUpdate},`;
  }

  if (typeof crop !== "undefined") uploadConfig += `\n    crop: ${crop},`;
  if (typeof focalPoint !== "undefined")
    uploadConfig += `\n    focalPoint: ${focalPoint},`;
  if (formatOptions)
    uploadConfig += `\n    formatOptions: ${JSON.stringify(formatOptions)},`;
  if (resizeOptions)
    uploadConfig += `\n    resizeOptions: ${JSON.stringify(resizeOptions)},`;
  if (trimOptions)
    uploadConfig += `\n    trimOptions: ${JSON.stringify(trimOptions)},`;

  if (typeof disableLocalStorage !== "undefined") {
    uploadConfig += `\n    disableLocalStorage: ${disableLocalStorage},`;
  }
  if (typeof withMetadata !== "undefined") {
    if (typeof withMetadata === "function") {
      uploadConfig += `\n    withMetadata: ${withMetadata.toString()},`;
    } else {
      uploadConfig += `\n    withMetadata: ${withMetadata},`;
    }
  }
  if (typeof cacheTags !== "undefined")
    uploadConfig += `\n    cacheTags: ${cacheTags},`;

  if (handlers && handlers.length > 0) {
    uploadConfig += `\n    handlers: ${JSON.stringify(handlers)},`;
  }
  if (externalFileHeaderFilter) {
    uploadConfig += `\n    externalFileHeaderFilter: ${externalFileHeaderFilter.toString()},`;
  }

  if (typeof pasteURL !== "undefined") {
    if (typeof pasteURL === "boolean") {
      uploadConfig += `\n    pasteURL: ${pasteURL},`;
    } else {
      uploadConfig += `\n    pasteURL: ${JSON.stringify(pasteURL)},`;
    }
  }

  if (typeof bulkUpload !== "undefined")
    uploadConfig += `\n    bulkUpload: ${bulkUpload},`;
  if (typeof displayPreview !== "undefined")
    uploadConfig += `\n    displayPreview: ${displayPreview},`;
  if (filenameCompoundIndex) {
    uploadConfig += `\n    filenameCompoundIndex: ${JSON.stringify(filenameCompoundIndex)},`;
  }
  if (typeof hideFileInputOnCreate !== "undefined") {
    uploadConfig += `\n    hideFileInputOnCreate: ${hideFileInputOnCreate},`;
  }
  if (typeof hideRemoveFile !== "undefined") {
    uploadConfig += `\n    hideRemoveFile: ${hideRemoveFile},`;
  }

  uploadConfig += "\n  },";
  return uploadConfig;
}
