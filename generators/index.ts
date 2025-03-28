export { generateCollection, type CollectionGeneratorOptions } from './collectionGenerator.js';
export { generateAccessControl, type AccessControlGeneratorOptions } from './accessControlGenerator.js';
export { generateHook, type HookGeneratorOptions } from './hookGenerator.js';
export { generateComponent, type ComponentGeneratorOptions } from './componentGenerator.js';
export { generateMigration, type MigrationGeneratorOptions } from './migrationGenerator.js';
export { generateField, type FieldGeneratorOptions } from './fieldGenerator.js';
export { generateConfig, type ConfigGeneratorOptions } from './configGenerator.js';
export { generateEndpoint, type EndpointGeneratorOptions } from './endpointGenerator.js';
export { generatePlugin, type PluginGeneratorOptions } from './pluginGenerator.js';
export { generateBlock, type BlockGeneratorOptions, type BlockGeneratorMode, type BlockGeneratorConfig } from './blockGenerator.js';

export type GeneratorType =
    | 'collection'
    | 'accessControl'
    | 'hook'
    | 'component'
    | 'migration'
    | 'field'
    | 'config'
    | 'endpoint'
    | 'plugin'
    | 'block'

export function getGenerator(type: GeneratorType) {
    switch (type) {
        case 'collection':
            return import('./collectionGenerator.js').then(m => m.generateCollection);
        case 'accessControl':
            return import('./accessControlGenerator.js').then(m => m.generateAccessControl);
        case 'hook':
            return import('./hookGenerator.js').then(m => m.generateHook);
        case 'component':
            return import('./componentGenerator.js').then(m => m.generateComponent);
        case 'migration':
            return import('./migrationGenerator.js').then(m => m.generateMigration);
        case 'field':
            return import('./fieldGenerator.js').then(m => m.generateField);
        case 'config':
            return import('./configGenerator.js').then(m => m.generateConfig);
        case 'endpoint':
            return import('./endpointGenerator.js').then(m => m.generateEndpoint);
        case 'plugin':
            return import('./pluginGenerator.js').then(m => m.generatePlugin);
        case 'block':
            return import('./blockGenerator.js').then(m => m.generateBlock);
        default:
            throw new Error(`Unknown generator type: ${type}`);
    }
} 