/**
 * Field generator for Payload CMS
 */
import { getDefaultLabel, type GeneratorResult } from '../utils/index.js';

type Where = Record<string, any>;
type FilterOptions = Where | ((args: any) => Where | boolean);

interface BaseAdminOptions {
    description?: string;
    placeholder?: string;
    condition?: string | Function;
    components?: {
        Field?: string;
        Cell?: string;
        Filter?: string;
        Label?: string;
    };
    width?: string;
    style?: Record<string, any>;
    className?: string;
    readOnly?: boolean;
    hidden?: boolean;
    position?: 'sidebar';
    disabled?: boolean;
    isSortable?: boolean;
    initCollapsed?: boolean;
    disableLabel?: boolean;
    autoComplete?: string;
    rtl?: boolean;
}

interface BaseField {
    name: string;
    label?: string;
    required?: boolean;
    unique?: boolean;
    index?: boolean;
    localized?: boolean;
    defaultValue?: any;
    hidden?: boolean;
    validate?: string | Function;
    saveToJWT?: boolean;
    access?: {
        create?: Function | boolean;
        read?: Function | boolean;
        update?: Function | boolean;
    };
    hooks?: {
        beforeValidate?: Array<Function>;
        beforeChange?: Array<Function>;
        afterChange?: Array<Function>;
        afterRead?: Array<Function>;
    };
    admin?: BaseAdminOptions;
    custom?: Record<string, any>;
    virtual?: boolean;
    typescriptSchema?: Record<string, any>;
    graphQL?: {
        complexity?: number;
        [key: string]: any;
    };
}

interface RichTextAdminOptions extends BaseAdminOptions {
    elements?: string[];
    leaves?: string[];
    upload?: {
        collections: {
            [key: string]: {
                fields: Array<Record<string, any>>;
            };
        };
    };
}

interface TextField extends BaseField {
    type: 'text';
    minLength?: number;
    maxLength?: number;
    hasMany?: boolean;
    minRows?: number;
    maxRows?: number;
}

interface TextareaField extends BaseField {
    type: 'textarea';
    minLength?: number;
    maxLength?: number;
}

interface NumberField extends BaseField {
    type: 'number';
    min?: number;
    max?: number;
    hasMany?: boolean;
    minRows?: number;
    maxRows?: number;
}

interface EmailField extends BaseField {
    type: 'email';
}

interface CodeField extends BaseField {
    type: 'code';
    language?: string;
    admin?: BaseAdminOptions & {
        language?: string;
        editorOptions?: Record<string, any>;
    };
}

interface JsonField extends BaseField {
    type: 'json';
    jsonSchema?: {
        uri: string;
        fileMatch: string[];
        schema?: Record<string, any>;
    };
}

interface DateField extends BaseField {
    type: 'date';
    format?: string;
    timeFormat?: string;
    monthsToShow?: number;
}

interface PointField extends BaseField {
    type: 'point';
    label?: string;
}

interface SelectOption {
    label: string;
    value: string;
}

interface SelectField extends BaseField {
    type: 'select';
    options: Array<SelectOption>;
    hasMany?: boolean;
}

interface RadioField extends BaseField {
    type: 'radio';
    options: Array<SelectOption>;
}

interface CheckboxField extends BaseField {
    type: 'checkbox';
}

interface RichTextField extends Omit<BaseField, 'admin'> {
    type: 'richText';
    editor?: Record<string, any>;
    admin?: RichTextAdminOptions;
}

interface RelationshipField extends BaseField {
    type: 'relationship';
    relationTo: string | string[];
    hasMany?: boolean;
    filterOptions?: FilterOptions;
    maxDepth?: number;
    minRows?: number;
    maxRows?: number;
    admin?: BaseAdminOptions & {
        isSortable?: boolean;
        allowCreate?: boolean;
        allowEdit?: boolean;
        sortOptions?: string | Record<string, string>;
    };
}

interface ArrayField extends BaseField {
    type: 'array';
    minRows?: number;
    maxRows?: number;
    fields: Array<FieldGeneratorOptions>;
    labels?: {
        singular: string;
        plural: string;
    };
    interfaceName?: string;
    dbName?: string;
    admin?: BaseAdminOptions & {
        components?: BaseAdminOptions['components'] & {
            RowLabel?: string;
        };
        isSortable?: boolean;
    };
}

interface BlockField extends BaseField {
    type: 'blocks';
    minRows?: number;
    maxRows?: number;
    blocks: Array<{
        slug: string;
        imageURL?: string;
        imageAltText?: string;
        interfaceName?: string;
        fields: Array<FieldGeneratorOptions>;
        labels?: {
            singular: string;
            plural: string;
        };
        admin?: {
            description?: string;
            components?: {
                Label?: string;
                Block?: string;
            };
            group?: string;
        };
    }>;
    labels?: {
        singular: string;
        plural: string;
    };
    admin?: BaseAdminOptions & {
        isSortable?: boolean;
        disableBlockName?: boolean;
    };
}

interface GroupField extends BaseField {
    type: 'group';
    fields: Array<FieldGeneratorOptions>;
    interfaceName?: string;
    admin?: BaseAdminOptions & {
        hideGutter?: boolean;
    };
}

interface TabsField extends BaseField {
    type: 'tabs';
    tabs: Array<{
        label: string;
        name?: string;
        description?: string;
        interfaceName?: string;
        fields: Array<FieldGeneratorOptions>;
    }>;
    admin?: BaseAdminOptions & {
        placement?: 'left' | 'bottom';
    };
}

interface RowField extends BaseField {
    type: 'row';
    fields: Array<FieldGeneratorOptions>;
}

interface CollapsibleField extends BaseField {
    type: 'collapsible';
    label: string;
    fields: Array<FieldGeneratorOptions>;
    admin?: BaseAdminOptions & {
        initCollapsed?: boolean;
    };
}

interface UploadField extends BaseField {
    type: 'upload';
    relationTo: string;
    filterOptions?: FilterOptions;
    maxDepth?: number;
    minRows?: number;
    maxRows?: number;
    hasMany?: boolean;
    displayPreview?: boolean;
}

interface UIField extends Omit<BaseField, 'admin'> {
    type: 'ui';
    admin: {
        components: {
            Field: string;
            Cell?: string;
        };
        disableListColumn?: boolean;
    };
}

interface JoinField extends BaseField {
    type: 'join';
    from: string | string[];
    foreignField: string;
    where?: Where;
    defaultValue?: any;
    maxDepth?: number;
    defaultLimit?: number;
    defaultSort?: string;
    admin?: BaseAdminOptions & {
        defaultColumns?: string[];
        allowCreate?: boolean;
    };
}

export type FieldGeneratorOptions =
    | TextField
    | TextareaField
    | NumberField
    | EmailField
    | CodeField
    | JsonField
    | DateField
    | PointField
    | SelectField
    | RadioField
    | CheckboxField
    | RichTextField
    | RelationshipField
    | ArrayField
    | BlockField
    | GroupField
    | TabsField
    | RowField
    | CollapsibleField
    | UploadField
    | UIField
    | JoinField;

/**
 * Generate a Payload CMS field
 * @param options Field generation options
 * @returns Generated code result
 */
export async function generateField(options: FieldGeneratorOptions): Promise<GeneratorResult> {
    const {
        name,
        type,
        label = getDefaultLabel(name),
        required = false,
        unique = false,
        localized = false,
        admin = {},
    } = options;

    let code = `{
    name: '${name}',
    type: '${type}',
    label: '${label}'`;

    if (required) code += ',\n    required: true';
    if (unique) code += ',\n    unique: true';
    if (localized) code += ',\n    localized: true';

    if ('defaultValue' in options && options.defaultValue !== undefined) {
        if (typeof options.defaultValue === 'function') {
            code += `,\n    defaultValue: ${options.defaultValue.toString()}`;
        } else if (typeof options.defaultValue === 'object') {
            code += `,\n    defaultValue: ${JSON.stringify(options.defaultValue, null, 2)}`;
        } else if (typeof options.defaultValue === 'string') {
            code += `,\n    defaultValue: '${options.defaultValue}'`;
        } else {
            code += `,\n    defaultValue: ${options.defaultValue}`;
        }
    }

    if ('index' in options && options.index) {
        code += ',\n    index: true';
    }

    if ('saveToJWT' in options && options.saveToJWT) {
        code += ',\n    saveToJWT: true';
    }

    if ('hidden' in options && options.hidden) {
        code += ',\n    hidden: true';
    }

    if ('validate' in options && options.validate) {
        if (typeof options.validate === 'function') {
            code += `,\n    validate: ${options.validate.toString()}`;
        } else {
            code += `,\n    validate: '${options.validate}'`;
        }
    }

    if ('access' in options && options.access) {
        code += ',\n    access: {';
        Object.entries(options.access).forEach(([key, value]) => {
            if (typeof value === 'function') {
                code += `\n      ${key}: ${value.toString()},`;
            } else {
                code += `\n      ${key}: ${value},`;
            }
        });
        code += '\n    }';
    }

    if ('hooks' in options && options.hooks) {
        code += ',\n    hooks: {';
        Object.entries(options.hooks).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                code += `\n      ${key}: [`;
                value.forEach(hook => {
                    if (typeof hook === 'function') {
                        code += `\n        ${hook.toString()},`;
                    }
                });
                code += '\n      ],';
            }
        });
        code += '\n    }';
    }

    switch (type) {
        case 'text':
        case 'textarea':
            if ('minLength' in options) code += `,\n    minLength: ${options.minLength}`;
            if ('maxLength' in options) code += `,\n    maxLength: ${options.maxLength}`;
            if ('hasMany' in options && options.hasMany) {
                code += `,\n    hasMany: true`;
                if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
                if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            }
            break;

        case 'number':
            if ('min' in options) code += `,\n    min: ${options.min}`;
            if ('max' in options) code += `,\n    max: ${options.max}`;
            if ('hasMany' in options && options.hasMany) {
                code += `,\n    hasMany: true`;
                if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
                if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            }
            break;

        case 'code':
            if ('language' in options) code += `,\n    language: '${options.language}'`;
            break;

        case 'json':
            if ('jsonSchema' in options) {
                code += `,\n    jsonSchema: ${JSON.stringify(options.jsonSchema, null, 2)}`;
            }
            break;

        case 'date':
            if ('format' in options) code += `,\n    format: '${options.format}'`;
            if ('timeFormat' in options) code += `,\n    timeFormat: '${options.timeFormat}'`;
            if ('monthsToShow' in options) code += `,\n    monthsToShow: ${options.monthsToShow}`;
            break;

        case 'select':
        case 'radio':
            if ('options' in options) {
                code += `,\n    options: ${JSON.stringify(options.options, null, 2)}`;
            }
            if ('hasMany' in options && options.hasMany) code += `,\n    hasMany: true`;
            break;

        case 'relationship':
            if ('relationTo' in options) {
                if (Array.isArray(options.relationTo)) {
                    code += `,\n    relationTo: ${JSON.stringify(options.relationTo)}`;
                } else {
                    code += `,\n    relationTo: '${options.relationTo}'`;
                }
            }
            if ('hasMany' in options && options.hasMany) {
                code += `,\n    hasMany: true`;
                if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
                if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            }
            if ('filterOptions' in options) {
                if (typeof options.filterOptions === 'function') {
                    code += `,\n    filterOptions: ${options.filterOptions.toString()}`;
                } else if (typeof options.filterOptions === 'object') {
                    code += `,\n    filterOptions: ${JSON.stringify(options.filterOptions, null, 2)}`;
                } else {
                    code += `,\n    filterOptions: '${options.filterOptions}'`;
                }
            }
            if ('maxDepth' in options) code += `,\n    maxDepth: ${options.maxDepth}`;
            break;

        case 'array':
            if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
            if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            if ('labels' in options) {
                code += `,\n    labels: ${JSON.stringify(options.labels, null, 2)}`;
            }
            if ('interfaceName' in options) {
                code += `,\n    interfaceName: '${options.interfaceName}'`;
            }
            if ('dbName' in options) {
                code += `,\n    dbName: '${options.dbName}'`;
            }
            if ('fields' in options) {
                code += ',\n    fields: [\n';
                options.fields.forEach(field => {
                    code += `      ${JSON.stringify(field, null, 6)},\n`;
                });
                code += '    ]';
            }
            break;

        case 'blocks':
            if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
            if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            if ('labels' in options) {
                code += `,\n    labels: ${JSON.stringify(options.labels, null, 2)}`;
            }
            if ('blocks' in options) {
                code += ',\n    blocks: [\n';
                options.blocks.forEach(block => {
                    code += `      {\n`;
                    code += `        slug: '${block.slug}',\n`;
                    if (block.imageURL) code += `        imageURL: '${block.imageURL}',\n`;
                    if (block.imageAltText) code += `        imageAltText: '${block.imageAltText}',\n`;
                    if (block.interfaceName) code += `        interfaceName: '${block.interfaceName}',\n`;
                    if (block.labels) code += `        labels: ${JSON.stringify(block.labels, null, 8)},\n`;
                    if (block.admin) {
                        code += `        admin: ${JSON.stringify(block.admin, null, 8)},\n`;
                    }
                    code += '        fields: [\n';
                    block.fields.forEach(field => {
                        code += `          ${JSON.stringify(field, null, 10)},\n`;
                    });
                    code += '        ],\n';
                    code += '      },\n';
                });
                code += '    ]';
            }
            break;

        case 'group':
            if ('interfaceName' in options) {
                code += `,\n    interfaceName: '${options.interfaceName}'`;
            }
            if ('fields' in options) {
                code += ',\n    fields: [\n';
                options.fields.forEach(field => {
                    code += `      ${JSON.stringify(field, null, 6)},\n`;
                });
                code += '    ]';
            }
            break;

        case 'tabs':
            if ('tabs' in options) {
                code += ',\n    tabs: [\n';
                options.tabs.forEach(tab => {
                    code += `      {\n`;
                    code += `        label: '${tab.label}',\n`;
                    if (tab.name) code += `        name: '${tab.name}',\n`;
                    if (tab.description) code += `        description: '${tab.description}',\n`;
                    if (tab.interfaceName) code += `        interfaceName: '${tab.interfaceName}',\n`;
                    code += '        fields: [\n';
                    tab.fields.forEach(field => {
                        code += `          ${JSON.stringify(field, null, 10)},\n`;
                    });
                    code += '        ],\n';
                    code += '      },\n';
                });
                code += '    ]';
            }
            break;

        case 'row':
        case 'collapsible':
            if ('fields' in options) {
                code += ',\n    fields: [\n';
                options.fields.forEach(field => {
                    code += `      ${JSON.stringify(field, null, 6)},\n`;
                });
                code += '    ]';
            }
            break;

        case 'upload':
            if ('relationTo' in options) code += `,\n    relationTo: '${options.relationTo}'`;
            if ('hasMany' in options && options.hasMany) {
                code += `,\n    hasMany: true`;
                if ('minRows' in options) code += `,\n    minRows: ${options.minRows}`;
                if ('maxRows' in options) code += `,\n    maxRows: ${options.maxRows}`;
            }
            if ('filterOptions' in options) {
                if (typeof options.filterOptions === 'function') {
                    code += `,\n    filterOptions: ${options.filterOptions.toString()}`;
                } else if (typeof options.filterOptions === 'object') {
                    code += `,\n    filterOptions: ${JSON.stringify(options.filterOptions, null, 2)}`;
                } else {
                    code += `,\n    filterOptions: '${options.filterOptions}'`;
                }
            }
            if ('maxDepth' in options) code += `,\n    maxDepth: ${options.maxDepth}`;
            if ('displayPreview' in options) code += `,\n    displayPreview: ${options.displayPreview}`;
            break;

        case 'richText':
            if ('editor' in options) {
                code += `,\n    editor: ${JSON.stringify(options.editor, null, 2)}`;
            }
            if ('admin' in options && options.admin) {
                const richTextAdmin = options.admin as RichTextAdminOptions;
                if (richTextAdmin?.elements) {
                    code += `,\n    elements: ${JSON.stringify(richTextAdmin.elements, null, 2)}`;
                }
                if (richTextAdmin?.leaves) {
                    code += `,\n    leaves: ${JSON.stringify(richTextAdmin.leaves, null, 2)}`;
                }
                if (richTextAdmin?.upload) {
                    code += `,\n    upload: ${JSON.stringify(richTextAdmin.upload, null, 2)}`;
                }
            }
            break;

        case 'join':
            if ('from' in options) {
                if (Array.isArray(options.from)) {
                    code += `,\n    from: ${JSON.stringify(options.from)}`;
                } else {
                    code += `,\n    from: '${options.from}'`;
                }
            }
            if ('foreignField' in options) code += `,\n    foreignField: '${options.foreignField}'`;
            if ('where' in options) code += `,\n    where: ${JSON.stringify(options.where, null, 2)}`;
            if ('defaultValue' in options) code += `,\n    defaultValue: ${JSON.stringify(options.defaultValue, null, 2)}`;
            if ('maxDepth' in options) code += `,\n    maxDepth: ${options.maxDepth}`;
            if ('defaultLimit' in options) code += `,\n    defaultLimit: ${options.defaultLimit}`;
            if ('defaultSort' in options) code += `,\n    defaultSort: '${options.defaultSort}'`;
            break;
    }

    if (type === 'ui') {
        const uiAdmin = admin as UIField['admin'];
        code += ',\n    admin: {';
        if (uiAdmin.components) {
            code += `\n      components: ${JSON.stringify(uiAdmin.components, null, 2)},`;
        }
        if ('disableListColumn' in uiAdmin && uiAdmin.disableListColumn) {
            code += '\n      disableListColumn: true,';
        }
        code += '\n    }';
    } else if (Object.keys(admin).length > 0) {
        const baseAdmin = admin as BaseAdminOptions;
        code += ',\n    admin: {';

        if (baseAdmin?.description) {
            code += `\n      description: '${baseAdmin.description}',`;
        }
        if (baseAdmin?.placeholder) {
            code += `\n      placeholder: '${baseAdmin.placeholder}',`;
        }
        if (baseAdmin?.condition) {
            if (typeof baseAdmin.condition === 'function') {
                code += `\n      condition: ${baseAdmin.condition.toString()},`;
            } else {
                code += `\n      condition: '${baseAdmin.condition}',`;
            }
        }
        if (baseAdmin?.components) {
            code += `\n      components: ${JSON.stringify(baseAdmin.components, null, 2)},`;
        }
        if (baseAdmin?.width) {
            code += `\n      width: '${baseAdmin.width}',`;
        }
        if (baseAdmin?.style) {
            code += `\n      style: ${JSON.stringify(baseAdmin.style, null, 2)},`;
        }
        if (baseAdmin?.className) {
            code += `\n      className: '${baseAdmin.className}',`;
        }
        if (baseAdmin?.readOnly) {
            code += '\n      readOnly: true,';
        }
        if (baseAdmin?.hidden) {
            code += '\n      hidden: true,';
        }
        if (baseAdmin?.position === 'sidebar') {
            code += "\n      position: 'sidebar',";
        }
        if (baseAdmin?.disabled) {
            code += '\n      disabled: true,';
        }
        if (baseAdmin?.isSortable !== undefined) {
            code += `\n      isSortable: ${baseAdmin.isSortable},`;
        }
        if (baseAdmin?.initCollapsed !== undefined) {
            code += `\n      initCollapsed: ${baseAdmin.initCollapsed},`;
        }
        if (baseAdmin?.disableLabel) {
            code += '\n      disableLabel: true,';
        }
        if (baseAdmin?.autoComplete) {
            code += `\n      autoComplete: '${baseAdmin.autoComplete}',`;
        }
        if (baseAdmin?.rtl) {
            code += '\n      rtl: true,';
        }

        switch (type) {
            case 'code':
                const codeAdmin = admin as CodeField['admin'];
                if (codeAdmin?.language) {
                    code += `\n      language: '${codeAdmin.language}',`;
                }
                if (codeAdmin?.editorOptions) {
                    code += `\n      editorOptions: ${JSON.stringify(codeAdmin.editorOptions, null, 2)},`;
                }
                break;

            case 'relationship':
                const relationshipAdmin = admin as RelationshipField['admin'];
                if (relationshipAdmin?.allowCreate !== undefined) {
                    code += `\n      allowCreate: ${relationshipAdmin.allowCreate},`;
                }
                if (relationshipAdmin?.allowEdit !== undefined) {
                    code += `\n      allowEdit: ${relationshipAdmin.allowEdit},`;
                }
                if (relationshipAdmin?.sortOptions) {
                    if (typeof relationshipAdmin.sortOptions === 'string') {
                        code += `\n      sortOptions: '${relationshipAdmin.sortOptions}',`;
                    } else {
                        code += `\n      sortOptions: ${JSON.stringify(relationshipAdmin.sortOptions, null, 2)},`;
                    }
                }
                break;

            case 'blocks':
                const blocksAdmin = admin as BlockField['admin'];
                if (blocksAdmin?.disableBlockName !== undefined) {
                    code += `\n      disableBlockName: ${blocksAdmin.disableBlockName},`;
                }
                break;

            case 'group':
                const groupAdmin = admin as GroupField['admin'];
                if (groupAdmin?.hideGutter !== undefined) {
                    code += `\n      hideGutter: ${groupAdmin.hideGutter},`;
                }
                break;

            case 'tabs':
                const tabsAdmin = admin as TabsField['admin'];
                if (tabsAdmin?.placement) {
                    code += `\n      placement: '${tabsAdmin.placement}',`;
                }
                break;

            case 'join':
                const joinAdmin = admin as JoinField['admin'];
                if (joinAdmin?.defaultColumns) {
                    code += `\n      defaultColumns: ${JSON.stringify(joinAdmin.defaultColumns, null, 2)},`;
                }
                if (joinAdmin?.allowCreate !== undefined) {
                    code += `\n      allowCreate: ${joinAdmin.allowCreate},`;
                }
                break;
        }

        code += '\n    }';
    }

    if ('custom' in options && options.custom) {
        code += `,\n    custom: ${JSON.stringify(options.custom, null, 2)}`;
    }

    if ('typescriptSchema' in options && options.typescriptSchema) {
        code += `,\n    typescriptSchema: ${JSON.stringify(options.typescriptSchema, null, 2)}`;
    }

    if ('graphQL' in options && options.graphQL) {
        code += `,\n    graphQL: ${JSON.stringify(options.graphQL, null, 2)}`;
    }

    if ('virtual' in options && options.virtual) {
        code += ',\n    virtual: true';
    }

    code += '\n}';

    return {
        code,
        language: 'typescript',
        fileName: `${name}Field.ts`,
    };
}