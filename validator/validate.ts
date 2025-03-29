import { z } from 'zod';
import {
    ValidationResult,
    ValidationIssue,
    ValidateCodeOptions,
    ComponentType,
    ValidationRules,
    ValidationRule
} from './types.js';
import { collectionValidationRules } from './collectionValidator.js';
import { fieldValidationRules } from './fieldValidator.js';
import { globalValidationRules } from './globalValidator.js';
import { configValidationRules } from './configValidator.js';

function getValidationRules(componentType: ComponentType): ValidationRules {
    switch (componentType) {
        case 'collection':
            return collectionValidationRules;
        case 'field':
            return fieldValidationRules;
        case 'global':
            return globalValidationRules;
        case 'config':
            return configValidationRules;
        default:
            throw new Error(`Unsupported component type: ${componentType}`);
    }
}

function parseCode(code: string): any {
    try {
        if (code.includes('export default') || code.includes('module.exports')) {
            const strippedCode = code
                .replace(/export\s+default\s+/g, 'return ')
                .replace(/module\.exports\s+=\s+/g, 'return ');

            return new Function(`${strippedCode}`)();
        }

        return new Function(`return ${code}`)();
    } catch (error) {
        throw new Error(`Failed to parse code: ${(error as Error).message}`);
    }
}

function validateSyntax(code: any, schemas: z.ZodType<any>[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const schema of schemas) {
        try {
            schema.parse(code);
        } catch (error) {
            if (error instanceof z.ZodError) {
                for (const issue of error.issues) {
                    issues.push({
                        message: `Syntax error: ${issue.message}`,
                        severity: 'error',
                        location: {
                            path: issue.path.join('.'),
                        },
                        suggestion: `Fix the syntax error at ${issue.path.join('.')}`,
                    });
                }
            }
        }
    }

    return issues;
}

function validateRules(code: any, rules: ValidationRule[]): ValidationIssue[] {
    const issues: ValidationIssue[] = [];

    for (const rule of rules) {
        try {
            if (rule.test(code)) {
                issues.push(rule.issue);
            }
        } catch (error) {
            console.error(`Rule validation error: ${(error as Error).message}`);
        }
    }

    return issues;
}

export function validateCode(options: ValidateCodeOptions): ValidationResult {
    const {
        code,
        componentType,
        filePath,
        checkSyntax = true,
        checkBestPractices = true,
        checkSecurity = true,
        checkPerformance = true,
    } = options;

    const issues: ValidationIssue[] = [];
    let parsedCode: any;

    try {
        parsedCode = parseCode(code);
    } catch (error) {
        return {
            isValid: false,
            componentType,
            issues: [{
                message: `Code parsing error: ${(error as Error).message}`,
                severity: 'error',
                location: { path: filePath },
            }],
        };
    }

    const rules = getValidationRules(componentType);

    if (checkSyntax) {
        const syntaxIssues = validateSyntax(parsedCode, rules.syntax);
        issues.push(...syntaxIssues);
    }

    if (checkBestPractices) {
        const bestPracticeIssues = validateRules(parsedCode, rules.bestPractices);
        issues.push(...bestPracticeIssues);
    }

    if (checkSecurity) {
        const securityIssues = validateRules(parsedCode, rules.security);
        issues.push(...securityIssues);
    }

    if (checkPerformance) {
        const performanceIssues = validateRules(parsedCode, rules.performance);
        issues.push(...performanceIssues);
    }

    if (filePath) {
        issues.forEach(issue => {
            if (!issue.location) {
                issue.location = {};
            }
            issue.location.path = filePath;
        });
    }

    const hasErrors = issues.some(issue => issue.severity === 'error');

    return {
        isValid: !hasErrors,
        componentType,
        issues,
    };
} 