/**
 * Migration generator for Payload CMS
 */
import { type GeneratorResult } from '../utils/index.js';

type MigrationDirection = 'up' | 'down';

type DatabaseAdapter = 'mongodb' | 'postgres' | 'sqlite';

export interface MigrationGeneratorOptions {
    name?: string;
    dbAdapter: DatabaseAdapter;
    description?: string;
    features?: Array<'schema' | 'data' | 'transaction'>;
    skipEmpty?: boolean;
    forceAcceptWarning?: boolean;
    customImports?: string[];
}

function validateOptions(options: MigrationGeneratorOptions): void {
    if (!options.dbAdapter) {
        throw new Error('Database adapter is required');
    }

    const validAdapters: DatabaseAdapter[] = ['mongodb', 'postgres', 'sqlite'];
    if (!validAdapters.includes(options.dbAdapter)) {
        throw new Error(`Invalid database adapter. Must be one of: ${validAdapters.join(', ')}`);
    }
}

function generateImports(options: MigrationGeneratorOptions): string {
    let imports = '';

    switch (options.dbAdapter) {
        case 'mongodb':
            imports = "import { type MigrateUpArgs, type MigrateDownArgs } from '@payloadcms/db-mongodb';";
            break;
        case 'postgres':
            imports = "import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-postgres';";
            break;
        case 'sqlite':
            imports = "import { type MigrateUpArgs, type MigrateDownArgs, sql } from '@payloadcms/db-sqlite';";
            break;
    }

    if (options.customImports?.length) {
        imports += '\n' + options.customImports.join('\n');
    }

    return imports;
}

function generateMigrationFunction(direction: MigrationDirection, options: MigrationGeneratorOptions): string {
    const functionName = direction === 'up' ? 'up' : 'down';
    const comment = direction === 'up'
        ? 'Perform changes to your database here'
        : 'Revert changes made in the up function';

    let args = '{ payload, req }';
    let additionalArgs = '';

    switch (options.dbAdapter) {
        case 'mongodb':
            args = '{ payload, req, session }';
            additionalArgs = '\n  // Access MongoDB session for transaction support\n  // const result = await collection.find({ session }).toArray();';
            break;
        case 'postgres':
        case 'sqlite':
            args = '{ payload, req, db, sql }';
            additionalArgs = '\n  // Access database directly with SQL\n  // const { rows } = await db.execute(sql`SELECT * FROM your_table`);';
            break;
    }

    return `export async function ${functionName}(${args}: MigrateUpArgs): Promise<void> {
  // ${comment}${additionalArgs}

  try {
    // Your migration code here
    ${generateFeatureCode(direction, options)}
  } catch (error) {
    console.error(\`Migration ${direction} failed:\`, error);
    throw error;
  }
}`;
}

function generateFeatureCode(direction: MigrationDirection, options: MigrationGeneratorOptions): string {
    let code = '';

    if (!options.features?.length) {
        return '// Add your migration logic here';
    }

    if (options.features.includes('schema')) {
        code += `
    // Schema changes
    ${direction === 'up' ? '// Add new fields or modify existing schema' : '// Revert schema changes'}
    ${generateSchemaExample(options.dbAdapter, direction)}`;
    }

    if (options.features.includes('data')) {
        code += `
    
    // Data migration
    ${direction === 'up' ? '// Transform existing data to new format' : '// Revert data transformations'}
    ${generateDataExample(options.dbAdapter, direction)}`;
    }

    if (options.features.includes('transaction')) {
        code += `
    
    // Transaction handling is automatic in Payload migrations
    // Just use the provided req object with Local API calls
    // Example: await payload.update({ collection: 'posts', req, ...})`;
    }

    return code;
}

function generateSchemaExample(adapter: DatabaseAdapter, direction: MigrationDirection): string {
    switch (adapter) {
        case 'mongodb':
            return direction === 'up'
                ? `await payload.db.collections.posts.updateMany({ req }, {
      $set: { newField: 'defaultValue' }
    });`
                : `await payload.db.collections.posts.updateMany({ req }, {
      $unset: { newField: '' }
    });`;

        case 'postgres':
        case 'sqlite':
            return direction === 'up'
                ? `await db.execute(sql\`
      ALTER TABLE posts 
      ADD COLUMN new_field TEXT DEFAULT 'defaultValue'
    \`);`
                : `await db.execute(sql\`
      ALTER TABLE posts 
      DROP COLUMN new_field
    \`);`;
    }
}

function generateDataExample(adapter: DatabaseAdapter, direction: MigrationDirection): string {
    switch (adapter) {
        case 'mongodb':
            return `const docs = await payload.db.collections.posts.find({}).toArray();
    for (const doc of docs) {
      await payload.update({
        collection: 'posts',
        id: doc.id,
        data: {
          // Your data transformation here
        },
        req
      });
    }`;

        case 'postgres':
        case 'sqlite':
            return `const { rows } = await db.execute(sql\`
      SELECT * FROM posts
    \`);
    
    for (const row of rows) {
      await payload.update({
        collection: 'posts',
        id: row.id,
        data: {
          // Your data transformation here
        },
        req
      });
    }`;
    }
}

function generateMigrationFileName(options: MigrationGeneratorOptions): string {
    const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').slice(0, -3);
    const name = options.name ? `-${options.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}` : '';
    return `${timestamp}${name}.ts`;
}

/**
 * Generates a database migration file for Payload CMS
 * 
 * @param options - Configuration options for the migration
 * @returns Generated code result
 * 
 * @example
 * ```typescript
 * // Generate a migration for adding a new field
 * const result = await generateMigration({
 *   name: 'add-status-field',
 *   dbAdapter: 'postgres',
 *   description: 'Adds status field to posts collection',
 *   features: ['schema', 'transaction']
 * });
 * ```
 */
export async function generateMigration(options: MigrationGeneratorOptions): Promise<GeneratorResult> {
    validateOptions(options);

    const imports = generateImports(options);
    const upFunction = generateMigrationFunction('up', options);
    const downFunction = generateMigrationFunction('down', options);

    const code = `${imports}

/**
 * ${options.description || 'Migration file for database changes'}
 * 
 * Generated for: ${options.dbAdapter} adapter
 * Features: ${options.features?.join(', ') || 'none'}
 */

${upFunction}

${downFunction}
`;

    return {
        code,
        fileName: generateMigrationFileName(options),
        language: 'typescript',
    };
}
