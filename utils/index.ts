/**
 * Generator result interface
 */
export interface GeneratorResult {
    code: string;
    language: 'typescript';
    fileName?: string;
}

/**
 * Convert a string to camelCase
 */
export function camelCase(str: string): string {
    return str
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
            return index === 0 ? word.toLowerCase() : word.toUpperCase();
        })
        .replace(/\s+|-|_/g, '');
}

/**
 * Utility function to convert string to PascalCase
 */
export function pascalCase(str: string): string {
    const camelCaseStr = camelCase(str);
    return camelCaseStr.charAt(0).toUpperCase() + camelCaseStr.slice(1);
}

/**
 * Get default label from name
 */
export function getDefaultLabel(name: string): string {
    return name
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, (str) => str.toUpperCase())
        .replace(/-/g, ' ')
        .replace(/_/g, ' ');
}

/**
 * Convert a string to title case
 */
export function toTitleCase(str: string): string {
    return str
        .replace(/[-_]/g, ' ')
        .replace(/\w\S*/g, (word) =>
            word.charAt(0).toUpperCase() + word.substring(1).toLowerCase());
}

/**
 * Convert camelCase to kebab-case
 */
export function camelToKebabCase(str: string): string {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Capitalize the first letter of a string
 */
export function capitalizeFirstLetter(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}