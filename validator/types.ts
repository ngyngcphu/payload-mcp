import { z } from 'zod';

export type ComponentType = 'collection' | 'field' | 'global' | 'config';

export type ValidationSeverity = 'error' | 'warning' | 'info' | 'best-practice';

export interface ValidationIssue {
    message: string;
    severity: ValidationSeverity;
    location?: {
        path?: string;
        line?: number;
        column?: number;
    };
    code?: string;
    suggestion?: string;
    docReference?: string;
}

export interface ValidationResult {
    isValid: boolean;
    componentType: ComponentType;
    issues: ValidationIssue[];
}

export interface ValidationRules {
    syntax: z.ZodType<any>[];
    bestPractices: ValidationRule[];
    security: ValidationRule[];
    performance: ValidationRule[];
}

export interface ValidationRule {
    test: (code: any) => boolean;
    issue: Omit<ValidationIssue, 'location'>;
    fix?: (code: any) => any;
}

export interface ValidatorOptions {
    checkSyntax?: boolean;
    checkBestPractices?: boolean;
    checkSecurity?: boolean;
    checkPerformance?: boolean;
}

export interface ValidateCodeOptions extends ValidatorOptions {
    code: string;
    filePath?: string;
    componentType: ComponentType;
} 