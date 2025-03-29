export type DatabaseType = "mongodb" | "postgres";

export interface AdminConfig {
    user?: string;
    meta?: {
        titleSuffix?: string;
        favicon?: string;
        ogImage?: string;
        ogTitle?: string;
        ogDescription?: string;
    };
    components?: {
        beforeLogin?: string;
        afterLogin?: string;
        beforeNavLinks?: string;
        afterNavLinks?: string;
        beforeDashboard?: string;
        afterDashboard?: string;
        listMenuItems?: string[];
        views?: Record<string, string>;
    };
    css?: string;
    disable?: boolean;
    disableBlockName?: boolean;
    inactivityRoute?: string;
    livePreview?: {
        url?: string;
        breakpoints?: {
            name: string;
            width: number;
            height?: number;
        }[];
    };
}

export type FieldType =
    | "text"
    | "textarea"
    | "number"
    | "email"
    | "code"
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
    | "json"
    | "ui"
    | "plugin";

export interface SelectOptionConfig {
    label: string;
    value: string;
}

export interface FieldConfig {
    name: string;
    type: FieldType;
    required?: boolean;
    label?: string;
    unique?: boolean;
    localized?: boolean;
    defaultValue?: any;
    admin?: {
        description?: string;
        condition?: string | Record<string, any>;
        hidden?: boolean;
        width?: string;
        position?: string;
        placeholder?: string;
        readOnly?: boolean;
        components?: Record<string, string>;
        className?: string;
        style?: Record<string, any>;
    };
    access?: {
        read?: string | Record<string, any>;
        create?: string | Record<string, any>;
        update?: string | Record<string, any>;
        delete?: string | Record<string, any>;
    };
    hooks?: {
        beforeValidate?: string[];
        beforeChange?: string[];
        afterChange?: string[];
        afterRead?: string[];
    };
    validate?: string;
    index?: boolean;
    saveToJWT?: boolean;
    options?: SelectOptionConfig[];
    fields?: FieldConfig[];
    relationTo?: string | string[];
    filterOptions?: string | Record<string, any>;
    hasMany?: boolean;
    minRows?: number;
    maxRows?: number;
    blocks?: BlockConfig[];
    tabs?: {
        label: string;
        name?: string;
        description?: string;
        fields: FieldConfig[];
    }[];
    [key: string]: any;
}

export interface IndexConfig {
    fields: string[];
    unique?: boolean;
    sparse?: boolean;
}

export interface CollectionConfig {
    slug: string;
    fields: FieldConfig[];
    admin?: {
        useAsTitle?: string;
        defaultColumns?: string[];
        description?: string;
        listView?: string;
        group?: string;
        pagination?: {
            defaultLimit?: number;
            limits?: number[];
        };
        enableRichTextLink?: boolean;
        enableRichTextRelationship?: boolean;
        hideAPIURL?: boolean;
        disableDuplicate?: boolean;
    };
    hooks?: {
        beforeValidate?: string[];
        beforeChange?: string[];
        afterChange?: string[];
        afterRead?: string[];
        beforeDelete?: string[];
        afterDelete?: string[];
    };
    access?: {
        read?: string | Record<string, any>;
        create?: string | Record<string, any>;
        update?: string | Record<string, any>;
        delete?: string | Record<string, any>;
        admin?: string | Record<string, any>;
        unlock?: string | Record<string, any>;
    };
    auth?: boolean | {
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
            generateEmailHTML?: string;
            generateEmailSubject?: string;
        };
        verify?: {
            generateEmailHTML?: string;
            generateEmailSubject?: string;
        };
    };
    timestamps?: boolean;
    versions?: boolean | {
        drafts?: boolean;
        retainDeleted?: boolean;
        max?: number;
    };
    upload?: {
        staticURL?: string;
        staticDir?: string;
        mimeTypes?: string[];
        filesizeLimits?: {
            max?: number;
            min?: number;
        };
        imageSizes?: {
            name: string;
            width: number;
            height?: number;
            formatOptions?: Record<string, any>;
        }[];
        handlers?: string[];
        resizeOptions?: Record<string, any>;
    };
    endpoints?: {
        path: string;
        method: "get" | "post" | "put" | "patch" | "delete";
        handler: string;
    }[];
    indexes?: IndexConfig[];
}

export interface GlobalConfig {
    slug: string;
    fields: FieldConfig[];
    admin?: {
        description?: string;
        group?: string;
    };
    access?: {
        read?: string | Record<string, any>;
        update?: string | Record<string, any>;
    };
    hooks?: {
        beforeValidate?: string[];
        beforeChange?: string[];
        afterChange?: string[];
        afterRead?: string[];
    };
    endpoints?: {
        path: string;
        method: "get" | "post" | "put" | "patch" | "delete";
        handler: string;
    }[];
    versions?: boolean | {
        drafts?: boolean;
        max?: number;
    };
}

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
        hideFromUI?: boolean;
    };
    interfaceName?: string;
    graphQL?: {
        singularName?: string;
        pluralName?: string;
    };
}

export interface PluginConfig {
    package: string;
    options?: Record<string, any>;
}

export interface RichTextEditorConfig {
    version: string;
    features?: string[];
    lexical?: {
        nodes?: string[];
        plugins?: string[];
        features?: {
            tables?: boolean;
            links?: boolean;
            upload?: boolean;
            list?: boolean;
            indent?: boolean;
            font?: boolean;
            format?: boolean;
            alignment?: boolean;
            relationships?: boolean;
            slash?: boolean;
        };
    };
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
    devBundleServerPackages?: boolean;
    compoundIndexes?: boolean;
    importExportPlugin?: boolean;
    adminBar?: boolean;
    routeTransitions?: boolean;
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
    cors?: string[] | boolean;
    telemetry?: boolean;
    email?: {
        fromName?: string;
        fromAddress?: string;
        transport?: {
            host?: string;
            port?: number;
            secure?: boolean;
            auth?: {
                user?: string;
                pass?: string;
            };

        };

    };
    richTextEditor?: RichTextEditorConfig;
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