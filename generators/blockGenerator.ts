/**
 * Block generator for Payload CMS
 */
import { getDefaultLabel, type GeneratorResult } from '../utils/index.js';
import { generateField, type FieldGeneratorOptions } from './fieldGenerator.js';

interface BlockAdminOptions {
    description?: string;
    components?: {
        Label?: string;
        Block?: string;
    };
    group?: string;
    initCollapsed?: boolean;
}

export interface BlockGeneratorOptions {
    slug: string;
    fields: Array<FieldGeneratorOptions>;
    imageURL?: string;
    imageAltText?: string;
    labels?: {
        singular: string;
        plural: string;
    };
    interfaceName?: string;
    graphQL?: {
        singularName?: string;
    };
    admin?: BlockAdminOptions;
    dbName?: string;
    custom?: Record<string, any>;
    typescriptSchema?: Record<string, any>;
}

interface BlocksFieldOptions {
    name: string;
    label?: string;
    blocks?: BlockGeneratorOptions[];
    blockReferences?: string[];
    minRows?: number;
    maxRows?: number;
    required?: boolean;
    localized?: boolean;
    admin?: {
        description?: string;
        condition?: string | Function;
        initCollapsed?: boolean;
        isSortable?: boolean;
        disableBlockName?: boolean;
        components?: {
            RowLabel?: string;
        };
    };
    lexical?: {
        inLexical?: boolean;
        allowInlineBlocks?: boolean;
    };
}

export type BlockGeneratorMode = 'block' | 'blocksField' | 'globalBlockRegistration';

export interface BlockGeneratorConfig {
    mode: BlockGeneratorMode;
    block?: BlockGeneratorOptions;
    blocksField?: BlocksFieldOptions;
}

/**
 * Generate Payload CMS block-related code
 * @param config Configuration for the block generator
 * @returns Generated code result
 */
export async function generateBlock(config: BlockGeneratorConfig): Promise<GeneratorResult> {
    const { mode } = config;

    switch (mode) {
        case 'block':
            if (!config.block) {
                throw new Error('Block options are required when mode is "block"');
            }
            return generateSingleBlock(config.block);

        case 'blocksField':
            if (!config.blocksField) {
                throw new Error('Blocks field options are required when mode is "blocksField"');
            }
            return generateBlocksField(config.blocksField);

        case 'globalBlockRegistration':
            if (!config.block) {
                throw new Error('Block options are required when mode is "globalBlockRegistration"');
            }
            return generateGlobalBlockRegistration(config.block);

        default:
            throw new Error(`Unknown block generator mode: ${mode}`);
    }
}

async function generateSingleBlock(options: BlockGeneratorOptions): Promise<GeneratorResult> {
    const {
        slug,
        fields,
        imageURL,
        imageAltText,
        labels,
        interfaceName,
        graphQL,
        dbName,
        custom,
        typescriptSchema,
        admin
    } = options;

    const labelsObj = typeof labels === 'string'
        ? { singular: labels, plural: labels }
        : labels || {
            singular: getDefaultLabel(slug),
            plural: getDefaultLabel(slug) + 's'
        };

    let code = `import type { Block } from 'payload';

const ${slug}Block: Block = {
  slug: '${slug}',`;

    if (imageURL) {
        code += `\n  imageURL: '${imageURL}',`;
    }

    if (imageAltText) {
        code += `\n  imageAltText: '${imageAltText}',`;
    }

    if (interfaceName) {
        code += `\n  interfaceName: '${interfaceName}',`;
    }

    if (dbName) {
        code += `\n  dbName: '${dbName}',`;
    }

    code += `\n  labels: {
    singular: '${labelsObj.singular}',
    plural: '${labelsObj.plural}'
  },`;

    if (graphQL) {
        code += `\n  graphQL: ${JSON.stringify(graphQL, null, 2)},`;
    }

    if (custom) {
        code += `\n  custom: ${JSON.stringify(custom, null, 2)},`;
    }

    if (typescriptSchema) {
        code += `\n  typescriptSchema: ${JSON.stringify(typescriptSchema, null, 2)},`;
    }

    if (admin) {
        code += generateBlockAdminConfig(admin);
    }

    code += `\n  fields: [`;

    if (Array.isArray(fields) && fields.length > 0) {
        for (const field of fields) {
            const generatedField = await generateField(field);
            code += `\n    ${generatedField.code},`;
        }
    }

    code += `\n  ]`;

    code += `\n};

export default ${slug}Block;`;

    return {
        code,
        language: 'typescript',
        fileName: `${slug}Block.ts`,
    };
}

async function generateBlocksField(options: BlocksFieldOptions): Promise<GeneratorResult> {
    const {
        name,
        label = getDefaultLabel(name),
        blocks = [],
        blockReferences = [],
        minRows,
        maxRows,
        required = false,
        localized = false,
        admin = {},
        lexical = {}
    } = options;

    const isLexicalBlock = lexical.inLexical === true;
    const hasBlocks = blocks.length > 0;
    const hasBlockReferences = blockReferences.length > 0;

    if (!hasBlocks && !hasBlockReferences) {
        throw new Error('Either blocks or blockReferences must be provided');
    }

    let code = `import type { Field } from 'payload';
`;

    if (hasBlocks) {
        code += blocks.map(block => `import ${block.slug}Block from './${block.slug}Block';`).join('\n') + '\n\n';
    }

    if (isLexicalBlock) {
        code += `import { lexicalEditor, BlocksFeature } from '@payloadcms/richtext-lexical';\n\n`;
    }

    code += `const ${name}Field: Field = {
  name: '${name}',
  type: '${isLexicalBlock ? 'richText' : 'blocks'}',
  label: '${label}',`;

    if (required) {
        code += `\n  required: true,`;
    }

    if (localized) {
        code += `\n  localized: true,`;
    }

    if (!isLexicalBlock) {
        if (typeof minRows === 'number') {
            code += `\n  minRows: ${minRows},`;
        }

        if (typeof maxRows === 'number') {
            code += `\n  maxRows: ${maxRows},`;
        }

        if (Object.keys(admin).length > 0) {
            code += `\n  admin: {`;

            if (admin.description) {
                code += `\n    description: '${admin.description}',`;
            }

            if (admin.condition) {
                if (typeof admin.condition === 'function') {
                    code += `\n    condition: ${admin.condition.toString()},`;
                } else {
                    code += `\n    condition: '${admin.condition}',`;
                }
            }

            if (typeof admin.initCollapsed !== 'undefined') {
                code += `\n    initCollapsed: ${admin.initCollapsed},`;
            }

            if (typeof admin.isSortable !== 'undefined') {
                code += `\n    isSortable: ${admin.isSortable},`;
            }

            if (typeof admin.disableBlockName !== 'undefined') {
                code += `\n    disableBlockName: ${admin.disableBlockName},`;
            }

            if (admin.components?.RowLabel) {
                code += `\n    components: {
      RowLabel: ${admin.components.RowLabel},
    },`;
            }

            code += `\n  },`;
        }

        if (hasBlocks || hasBlockReferences) {
            if (hasBlockReferences) {
                code += `\n  blockReferences: [${blockReferences.map(ref => `'${ref}'`).join(', ')}],`;
                code += `\n  blocks: [], // Required to be empty when using blockReferences`;
            } else {
                code += `\n  blocks: [${blocks.map(block => `\n    ${block.slug}Block,`).join('')}
  ],`;
            }
        }
    } else {
        code += `\n  editor: lexicalEditor({
    features: [
      BlocksFeature({
        blocks: [${hasBlockReferences
                ? blockReferences.map(ref => `'${ref}'`).join(', ')
                : blocks.map(block => `${block.slug}Block`).join(', ')
            }],${lexical.allowInlineBlocks ? `\n        allowInlineBlocks: true,` : ''}
      }),
    ],
  }),`;

        if (Object.keys(admin).length > 0) {
            code += `\n  admin: {`;

            if (admin.description) {
                code += `\n    description: '${admin.description}',`;
            }

            if (admin.condition) {
                if (typeof admin.condition === 'function') {
                    code += `\n    condition: ${admin.condition.toString()},`;
                } else {
                    code += `\n    condition: '${admin.condition}',`;
                }
            }

            code += `\n  },`;
        }
    }

    code += `\n};

export default ${name}Field;`;

    if (hasBlocks) {
        for (const blockConfig of blocks) {
            await generateSingleBlock(blockConfig);
        }
    }

    return {
        code,
        language: 'typescript',
        fileName: `${name}Field.ts`,
    };
}

async function generateGlobalBlockRegistration(blockOptions: BlockGeneratorOptions): Promise<GeneratorResult> {
    const { slug } = blockOptions;

    await generateSingleBlock(blockOptions);

    const code = `import { buildConfig } from 'payload';
import ${slug}Block from './${slug}Block';

/**
 * Add this to your Payload config to register the ${slug} block globally
 * This allows it to be referenced by blockReferences in multiple collections
 */
export default buildConfig({
  // ... other config options
  blocks: [
    ${slug}Block,
    // ... other global blocks
  ],
  // ... rest of your config
});`;

    return {
        code,
        language: 'typescript',
        fileName: `${slug}BlockRegistration.ts`,
    };
}

/**
 * Generate admin configuration for the block
 * @param admin Admin options for the block
 * @returns Generated admin configuration code
 */
function generateBlockAdminConfig(admin: BlockAdminOptions): string {
    let code = `\n  admin: {`;

    if (admin.description) {
        code += `\n    description: '${admin.description}',`;
    }

    if (admin.components) {
        code += `\n    components: {`;
        if (admin.components.Label) {
            code += `\n      Label: ${admin.components.Label},`;
        }
        if (admin.components.Block) {
            code += `\n      Block: ${admin.components.Block},`;
        }
        code += `\n    },`;
    }

    if (admin.group) {
        code += `\n    group: '${admin.group}',`;
    }

    if (typeof admin.initCollapsed !== 'undefined') {
        code += `\n    initCollapsed: ${admin.initCollapsed},`;
    }

    code += `\n  },`;
    return code;
}
