export type DatabaseType = "mongodb" | "postgres";
export interface AdminConfig {
  user?: string;
  meta?: {
    titleSuffix?: string;
    favicon?: string;
    ogImage?: string;
  };
  components?: {
    beforeLogin?: string[];
    afterLogin?: string[];
    beforeNavLinks?: string[];
    afterNavLinks?: string[];
    beforeDashboard?: string[];
    afterDashboard?: string[];
    Nav?: string;
    logout?: {
      Button?: string;
    };
    graphics?: {
      Logo?: string;
      Icon?: string;
    };
    views?: Record<
      string,
      | string
      | {
          Component: string;
          path: string;
          exact?: boolean;
        }
    >;
  };
  css?: string;
  dateFormat?: string;
  livePreview?: {
    url?: string | ((doc: any, context: any) => string);
    collections?: string[];
    globals?: string[];
    breakpoints?: {
      name: string;
      label: string;
      width: number;
      height?: number;
    }[];
  };
  inactivityRoute?: string;
  logoutRoute?: string;
  disable?: boolean;
  hideAPIURL?: boolean;
  vite?: Record<string, any>;
  webpack?: (config: any) => any;
}

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "email"
  | "code"
  | "json"
  | "date"
  | "point"
  | "richText"
  | "select"
  | "multiselect"
  | "checkbox"
  | "radio"
  | "relationship"
  | "array"
  | "blocks"
  | "group"
  | "row"
  | "collapsible"
  | "tabs"
  | "upload"
  | "ui";

export interface SelectOptionConfig {
  label: string;
  value: string;
}

export interface BaseFieldAdminOptions {
  description?: string;
  placeholder?: string;
  condition?: (data: any, siblingData: any) => boolean;
  components?: {
    Field?: string;
    Cell?: string;
    Filter?: string;
    Label?: string;
    Error?: string;
    Description?: string;
  };
  width?: string;
  position?: "sidebar";
  readOnly?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  initCollapsed?: boolean;
  style?: Record<string, any>;
  className?: string;
  isSortable?: boolean;
  disableLabel?: boolean;
  autoComplete?: string;
  rtl?: boolean;
}

export interface CodeFieldAdminOptions extends BaseFieldAdminOptions {
  language?: string;
  editorOptions?: Record<string, any>;
}

export interface RichTextFieldAdminOptions extends BaseFieldAdminOptions {
  elements?: string[];
  leaves?: string[];
  upload?: { collections: { [key: string]: { fields: FieldConfig[] } } };
}

export interface RelationshipFieldAdminOptions extends BaseFieldAdminOptions {
  allowCreate?: boolean;
  allowEdit?: boolean;
  sortOptions?: string | Record<string, string>;
}

export interface ArrayFieldAdminOptions extends BaseFieldAdminOptions {
  components?: BaseFieldAdminOptions["components"] & {
    RowLabel?: string;
  };
}

export interface GroupFieldAdminOptions extends BaseFieldAdminOptions {
  hideGutter?: boolean;
}

export interface TabsFieldAdminOptions extends BaseFieldAdminOptions {
  placement?: "left" | "bottom";
}

export interface BlocksFieldAdminOptions extends BaseFieldAdminOptions {
  disableBlockName?: boolean;
}

export interface UIFieldAdminConfig {
  components: {
    Field: string;
    Cell?: string;
  };
  disableListColumn?: boolean;
}

export type FieldConfig = {
  name: string;
  label?: string | false;
  type: FieldType;
  required?: boolean;
  unique?: boolean;
  localized?: boolean;
  index?: boolean;
  defaultValue?: any;
  hidden?: boolean;
  saveToJWT?: boolean;
  admin?: BaseFieldAdminOptions;
  access?: {
    create?: (args: any) => boolean | Promise<boolean> | boolean;
    read?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
    update?: (args: any) => boolean | Promise<boolean> | boolean;
    readVersions?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
  };
  hooks?: {
    beforeValidate?: ((args: any) => any)[];
    beforeChange?: ((args: any) => any)[];
    afterChange?: ((args: any) => any)[];
    beforeRead?: ((args: any) => any)[];
    afterRead?: ((args: any) => any)[];
  };
  validate?: (
    value: any,
    options: any,
  ) => string | boolean | Promise<string | boolean>;
  custom?: Record<string, any>;
  graphQL?: Record<string, any> | false;
  typescript?: { interface?: string };
  virtual?: boolean;
} & (
  | {
      type: "text";
      minLength?: number;
      maxLength?: number;
      hasMany?: boolean;
      minRows?: number;
      maxRows?: number;
      admin?: BaseFieldAdminOptions;
    }
  | {
      type: "textarea";
      minLength?: number;
      maxLength?: number;
      admin?: BaseFieldAdminOptions;
    }
  | {
      type: "number";
      min?: number;
      max?: number;
      hasMany?: boolean;
      minRows?: number;
      maxRows?: number;
      admin?: BaseFieldAdminOptions;
    }
  | { type: "email"; admin?: BaseFieldAdminOptions }
  | { type: "code"; language?: string; admin?: CodeFieldAdminOptions }
  | { type: "json"; jsonSchema?: any; admin?: BaseFieldAdminOptions }
  | {
      type: "date";
      format?: string;
      timeFormat?: string;
      monthsToShow?: number;
      admin?: BaseFieldAdminOptions & {
        date?: {
          pickerAppearance?: "dayOnly" | "monthOnly" | "dayAndTime";
          displayFormat?: string;
        };
      };
    }
  | { type: "point"; admin?: BaseFieldAdminOptions }
  | {
      type: "select";
      options: SelectOptionConfig[];
      hasMany?: boolean;
      admin?: BaseFieldAdminOptions;
    }
  | {
      type: "radio";
      options: SelectOptionConfig[];
      admin?: BaseFieldAdminOptions;
    }
  | { type: "checkbox"; admin?: BaseFieldAdminOptions }
  | {
      type: "richText";
      editor?: Record<string, any>;
      admin?: RichTextFieldAdminOptions;
    }
  | {
      type: "relationship";
      relationTo: string | string[];
      hasMany?: boolean;
      filterOptions?:
        | Record<string, any>
        | ((args: any) => Record<string, any> | boolean);
      maxDepth?: number;
      admin?: RelationshipFieldAdminOptions;
    }
  | {
      type: "array";
      fields: FieldConfig[];
      minRows?: number;
      maxRows?: number;
      labels?: { singular: string; plural: string };
      interfaceName?: string;
      dbName?: string;
      admin?: ArrayFieldAdminOptions;
    }
  | {
      type: "blocks";
      blocks: BlockConfig[];
      minRows?: number;
      maxRows?: number;
      labels?: { singular: string; plural: string };
      interfaceName?: string;
      admin?: BlocksFieldAdminOptions;
    }
  | {
      type: "group";
      fields: FieldConfig[];
      interfaceName?: string;
      admin?: GroupFieldAdminOptions;
    }
  | {
      type: "tabs";
      tabs: {
        label: string;
        name?: string;
        description?: string;
        interfaceName?: string;
        fields: FieldConfig[];
      }[];
      admin?: TabsFieldAdminOptions;
    }
  | { type: "row"; fields: FieldConfig[]; admin?: BaseFieldAdminOptions }
  | {
      type: "collapsible";
      label: string;
      fields: FieldConfig[];
      admin?: BaseFieldAdminOptions;
    }
  | {
      type: "upload";
      relationTo: string;
      hasMany?: boolean;
      filterOptions?:
        | Record<string, any>
        | ((args: any) => Record<string, any> | boolean);
      maxDepth?: number;
      admin?: BaseFieldAdminOptions;
    }
  | { type: "ui"; admin: UIFieldAdminConfig }
);

export interface IndexConfig {
  fields: Record<string, 1 | -1 | "text" | "2dsphere">;
  options?: {
    name?: string;
    unique?: boolean;
    sparse?: boolean;
    background?: boolean;
    [key: string]: any;
  };
}

export interface CollectionConfig {
  slug: string;
  fields: FieldConfig[];
  admin?: {
    useAsTitle?: string;
    defaultColumns?: string[];
    listSearchableFields?: string[];
    description?: string;
    group?: string | boolean;
    hidden?: boolean | ((args: { user: any }) => boolean);
    hooks?: { [key: string]: Function[] };
    disableCopyToLocale?: boolean;
    hideAPIURL?: boolean;
    enableRichTextLink?: boolean;
    enableRichTextRelationship?: boolean;
    meta?: Record<string, any>;
    preview?: (
      doc: any,
      options: { token: string },
    ) => string | Promise<string> | null;
    livePreview?: AdminConfig["livePreview"];
    components?: Record<string, any>;
    pagination?: {
      defaultLimit?: number;
      limits?: number[];
    };
    baseListFilter?: Record<string, any>;
    disableDuplicate?: boolean;
    initCollapsed?: boolean;
  };
  hooks?: {
    beforeOperation?: ((args: any) => any)[];
    beforeValidate?: ((args: any) => any)[];
    beforeChange?: ((args: any) => any)[];
    afterChange?: ((args: any) => any)[];
    beforeRead?: ((args: any) => any)[];
    afterRead?: ((args: any) => any)[];
    beforeDelete?: ((args: any) => any)[];
    afterDelete?: ((args: any) => any)[];
    beforeLogin?: ((args: any) => any)[];
    afterLogin?: ((args: any) => any)[];
    afterLogout?: ((args: any) => any)[];
    afterMe?: ((args: any) => any)[];
    afterRefresh?: ((args: any) => any)[];
    afterForgotPassword?: ((args: any) => any)[];
  };
  access?: {
    create?: (args: any) => boolean | Promise<boolean> | boolean;
    read?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
    update?: (args: any) => boolean | Promise<boolean> | boolean;
    delete?: (args: any) => boolean | Promise<boolean> | boolean;
    admin?: (args: any) => boolean | Promise<boolean> | boolean;
    unlock?: (args: any) => boolean | Promise<boolean> | boolean;
    readVersions?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
  };
  auth?:
    | boolean
    | {
        tokenExpiration?: number;
        maxLoginAttempts?: number;
        lockTime?: number;
        useAPIKey?: boolean;
        depth?: number;
        cookies?: {
          secure?: boolean;
          sameSite?: "lax" | "none" | "strict";
          domain?: string;
        };
        forgotPassword?: {
          generateEmailHTML?: (args: any) => string | Promise<string>;
          generateEmailSubject?: (args: any) => string | Promise<string>;
        };
        verify?:
          | boolean
          | {
              generateEmailHTML?: (args: any) => string | Promise<string>;
              generateEmailSubject?: (args: any) => string | Promise<string>;
              expiration?: number;
            };
        disableLocalStrategy?: boolean;
        removeTokenFromResponses?: boolean;
        strategies?: { name: string; strategy: (payload: any) => any }[];
        forgotPasswordExpiration?: number;
        maxResetPasswordAttempts?: number;
        resetPasswordLockTime?: number;
      };
  timestamps?: boolean;
  versions?:
    | boolean
    | {
        drafts?:
          | boolean
          | { autosave?: boolean | { interval?: number }; validate?: boolean };
        maxPerDoc?: number;
        retainDeleted?: boolean;
      };
  upload?:
    | boolean
    | {
        staticURL?: string;
        staticDir?: string;
        mimeTypes?: string[];
        filesize?: number;
        adminThumbnail?: string | ((args: any) => string);
        imageSizes?: {
          name: string;
          width: number;
          height?: number;
          position?: string;
          formatOptions?: { format: string; options: any };
          withoutEnlargement?: boolean;
          fit?: string;
        }[];
        handlers?: any[];
        resizeOptions?: { width?: number; height?: number; fit?: string };
        formatOptions?: { format: string; options: any };
        crop?: boolean | string[];
        focalPoint?: boolean;
        disableLocalStorage?: boolean;
        staticOptions?: Record<string, string>;
      };
  endpoints?:
    | {
        path: string;
        method: "get" | "post" | "put" | "patch" | "delete";
        handler: (req: any, res: any, next: any) => void | any;
      }[]
    | false;
  indexes?: IndexConfig[];
  dbName?: string;
  defaultSort?: string;
  graphQL?: Record<string, any> | false;
  typescript?: { interface?: string };
  custom?: Record<string, any>;
  labels?: { singular: string; plural: string };
  forceSelect?: string[];
  lockDocuments?: boolean | { duration?: number };
}

export interface GlobalConfig {
  slug: string;
  fields: FieldConfig[];
  admin?: {
    description?: string;
    group?: string | boolean;
    hidden?: boolean | ((args: { user: any }) => boolean);
    preview?: (
      doc: any,
      options: { token: string },
    ) => string | Promise<string> | null;
    livePreview?: AdminConfig["livePreview"];
    components?: Record<string, any>;
  };
  access?: {
    read?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
    update?: (args: any) => boolean | Promise<boolean> | boolean;
    readVersions?: (
      args: any,
    ) => boolean | Promise<boolean> | boolean | Record<string, any>;
  };
  hooks?: {
    beforeValidate?: ((args: any) => any)[];
    beforeChange?: ((args: any) => any)[];
    afterChange?: ((args: any) => any)[];
    beforeRead?: ((args: any) => any)[];
    afterRead?: ((args: any) => any)[];
  };
  endpoints?: CollectionConfig["endpoints"];
  versions?:
    | boolean
    | {
        drafts?:
          | boolean
          | { autosave?: boolean | { interval?: number }; validate?: boolean };
        max?: number;
      };
  graphQL?: CollectionConfig["graphQL"];
  typescript?: CollectionConfig["typescript"];
  custom?: CollectionConfig["custom"];
  labels?: CollectionConfig["labels"];
  dbName?: string;
}

// More detailed BlockConfig matching FieldConfig structure
export interface BlockConfig {
  slug: string;
  fields: FieldConfig[];
  imageURL?: string;
  imageAltText?: string;
  labels?: {
    singular?: string;
    plural?: string;
  };
  admin?: {
    description?: string;
    group?: string;
    initCollapsed?: boolean;
  };
  interfaceName?: string;
  graphQL?: {
    singularName?: string;
  };
  custom?: Record<string, any>;
}

export interface PluginConfig {
  package: string;
  options?: Record<string, any>;
}

export interface ScaffoldOptions {
  projectName: string;
  database: DatabaseType;
  description?: string;
  serverUrl?: string;
  authentication?: boolean;
  admin?: AdminConfig;
  collections?: CollectionConfig[];
  globals?: GlobalConfig[];
  blocks?: BlockConfig[];
  plugins?: (string | PluginConfig)[];
  typescript?: boolean;
  adminBar?: boolean;
  i18n?: {
    locales?: string[];
    defaultLocale?: string;
    fallback?: boolean;
  };
  rateLimit?: {
    window?: number;
    max?: number;
    trustProxy?: boolean;
    skip?: string | ((req: any) => boolean);
  };
  cors?: string[] | string | boolean;
  telemetry?: boolean;
  email?: {
    fromName?: string;
    fromAddress?: string;
    transportOptions?: Record<string, any>;
  };
}

export interface ScaffoldError {
  code: string;
  message: string;
  field?: string;
  suggestion?: string;
}

export interface ScaffoldResponse {
  success: boolean;
  projectStructure?: {
    root: string;
    files: string[];
    directories: string[];
  };
  packageJson?: object;
  adminUrl?: string;
  startCommand?: string;
  devCommand?: string;
  errors?: ScaffoldError[];
  warnings?: string[];
  nextSteps?: string[];
}
