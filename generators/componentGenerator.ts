/**
 * Component generator for Payload CMS
 */
import { getDefaultLabel, type GeneratorResult as BaseGeneratorResult, camelToKebabCase, capitalizeFirstLetter } from '../utils/index.js';


interface GeneratorResult extends BaseGeneratorResult {
    additionalFiles?: Array<{
        code: string;
        fileName: string;
        language: string;
    }>;
    outputPath?: string;
}

interface ComponentProp {
    name: string;
    type: string;
    defaultValue?: string;
    required?: boolean;
    description?: string;
}

interface BaseComponentOptions {
    name: string;
    isClientComponent?: boolean;
    props?: ComponentProp[];
    imports?: string[];
    includeStyles?: boolean;
    customStyles?: string;
    outputPath?: string;
}

interface RootComponentOptions extends BaseComponentOptions {
    rootComponentType: 'logo' | 'icon' | 'nav' | 'action' | 'beforeDashboard' | 'afterDashboard' |
    'beforeLogin' | 'afterLogin' | 'beforeNavLinks' | 'afterNavLinks' | 'header' | 'logoutButton';
}

interface CollectionComponentOptions extends BaseComponentOptions {
    collectionComponentType: 'beforeList' | 'afterList' | 'beforeListTable' | 'afterListTable' |
    'saveButton' | 'saveDraftButton' | 'publishButton' | 'previewButton' | 'description' | 'upload';
    collection?: string;
}

interface ViewComponentOptions extends BaseComponentOptions {
    viewType: 'dashboard' | 'account' | 'list' | 'edit' | 'custom';
    viewPath?: string;
    useDefaultTemplate?: boolean;
    entity?: string;
    isDocumentTab?: boolean;
    tabProps?: {
        label?: string;
        href?: string;
    };
}

interface ProviderComponentOptions extends BaseComponentOptions {
    contextValueType?: string;
    includeHook?: boolean;
}

export type ComponentGeneratorOptions =
    | { type: 'root'; options: RootComponentOptions }
    | { type: 'collection'; options: CollectionComponentOptions }
    | { type: 'view'; options: ViewComponentOptions }
    | { type: 'provider'; options: ProviderComponentOptions };

/**
 * Generate a custom component for Payload CMS
 * 
 * @param options Options for generating the component
 * @returns Generated code result with the component code
 */
export async function generateComponent(options: ComponentGeneratorOptions): Promise<GeneratorResult> {
    switch (options.type) {
        case 'root':
            return generateRootComponent(options.options);
        case 'collection':
            return generateCollectionComponent(options.options);
        case 'view':
            return generateViewComponent(options.options);
        case 'provider':
            return generateProviderComponent(options.options);
        default:
            throw new Error(`Unknown component type: ${(options as any).type}`);
    }
}

function generateImports(options: {
    name?: string;
    imports?: string[];
    isClientComponent?: boolean;
    includeStyles?: boolean;
}): string {
    let imports = 'import React';

    if (options.isClientComponent) {
        imports = "'use client'\n" + imports;
    }

    imports += ' from \'react\';\n';

    if (options.imports && options.imports.length > 0) {
        imports += options.imports.join('\n') + '\n';
    }

    if (options.includeStyles) {
        imports += `import './styles.scss';\n`;
    }

    return imports;
}

function generateInterface(componentName: string, props?: ComponentProp[]): string {
    if (!props || props.length === 0) {
        return '';
    }

    let interfaceCode = `interface ${componentName}Props {\n`;

    props.forEach(prop => {
        interfaceCode += `  /** ${prop.description || 'No description'} */\n`;
        interfaceCode += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};\n`;
    });

    interfaceCode += '}\n\n';

    return interfaceCode;
}

function generateComponentBody(options: BaseComponentOptions): string {
    const { name, props, isClientComponent } = options;
    const componentType = isClientComponent ? 'function' : 'async function';
    const propsType = props && props.length > 0 ? `${name}Props` : 'Record<string, any>';

    let body = `${componentType} ${name}(${props && props.length > 0 ? 'props: ' + propsType : '{ }: ' + propsType}) {\n`;

    if (props && props.length > 0) {
        body += '  const {\n';
        props.forEach(prop => {
            const defaultValue = prop.defaultValue ? ` = ${prop.defaultValue}` : '';
            body += `    ${prop.name}${defaultValue},\n`;
        });
        body += '  } = props;\n\n';
    }

    body += '  return (\n';
    body += `    <div className="${camelToKebabCase(name)}">\n`;
    body += `      <h2>${getDefaultLabel(name)}</h2>\n`;
    body += '      {/* Add your custom component content here */}\n';
    body += '    </div>\n';
    body += '  );\n';
    body += '}\n';

    return body;
}

function generateRootComponent(options: RootComponentOptions): GeneratorResult {
    const { name, rootComponentType, ...baseOptions } = options;

    const imports = baseOptions.imports || [];

    switch (rootComponentType) {
        case 'logo':
        case 'icon':
            imports.push("import { Link } from '@payloadcms/ui';");
            break;
        case 'nav':
            imports.push("import { Link } from '@payloadcms/ui';");
            imports.push("import { useConfig } from '@payloadcms/ui';");
            break;
        case 'logoutButton':
            imports.push("import { Button } from '@payloadcms/ui';");
            break;
        default:
            break;
    }

    let code = generateImports({ ...baseOptions, imports });

    switch (rootComponentType) {
        case 'logo':
            code += `import type { LogoProps } from 'payload';\n\n`;
            break;
        case 'nav':
            code += `import type { NavProps } from 'payload';\n\n`;
            break;
        case 'action':
            code += `import type { ActionProps } from 'payload';\n\n`;
            break;
        case 'logoutButton':
            code += baseOptions.isClientComponent
                ? `import type { LogoutButtonClientProps } from 'payload';\n\n`
                : `import type { LogoutButtonServerProps } from 'payload';\n\n`;
            break;
        default:
            break;
    }

    code += generateInterface(name, baseOptions.props);

    switch (rootComponentType) {
        case 'logo':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}() {\n`;
            code += '  return (\n';
            code += `    <Link href="/admin" className="${camelToKebabCase(name)}">\n`;
            code += '      <img src="/logo.svg" alt="Logo" />\n';
            code += '    </Link>\n';
            code += '  );\n';
            code += '}\n';
            break;

        case 'icon':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}() {\n`;
            code += '  return (\n';
            code += `    <div className="${camelToKebabCase(name)}">\n`;
            code += '      <img src="/icon.svg" alt="Icon" width="25" height="25" />\n';
            code += '    </div>\n';
            code += '  );\n';
            code += '}\n';
            break;

        case 'nav':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(${baseOptions.isClientComponent ? 'props' : '{ user, permissions }'}${baseOptions.isClientComponent ? ': NavProps' : ''}) {\n`;

            if (baseOptions.isClientComponent) {
                code += '  const { config } = useConfig();\n\n';
            }

            code += '  return (\n';
            code += `    <nav className="${camelToKebabCase(name)}">\n`;
            code += '      <ul>\n';
            code += '        <li>\n';
            code += '          <Link href="/admin">Dashboard</Link>\n';
            code += '        </li>\n';
            code += '        <li>\n';
            code += '          <Link href="/admin/collections">Collections</Link>\n';
            code += '        </li>\n';
            code += '      </ul>\n';
            code += '    </nav>\n';
            code += '  );\n';
            code += '}\n';
            break;

        case 'logoutButton':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(${baseOptions.isClientComponent ? 'props: LogoutButtonClientProps' : 'props: LogoutButtonServerProps'}) {\n`;
            code += '  return (\n';
            code += `    <Button className="${camelToKebabCase(name)}" onClick=${Boolean(baseOptions.isClientComponent) ? '={() => window.location.href = "/admin/logout"}' : 'undefined'}>\n`;
            code += '      Logout\n';
            code += '    </Button>\n';
            code += '  );\n';
            code += '}\n';
            break;

        default:
            code += generateComponentBody({ ...baseOptions, name });
    }

    code += `\nexport default ${name};\n`;

    let styleCode = '';
    if (baseOptions.includeStyles) {
        styleCode = baseOptions.customStyles || generateDefaultStyles(name, rootComponentType);
    }

    return {
        code,
        fileName: `${name}.tsx`,
        language: 'typescript',
        additionalFiles: baseOptions.includeStyles
            ? [{ code: styleCode, fileName: 'styles.scss', language: 'scss' }]
            : undefined,
        outputPath: baseOptions.outputPath || `components/${camelToKebabCase(name)}`,
    };
}

function generateCollectionComponent(options: CollectionComponentOptions): GeneratorResult {
    const { name, collectionComponentType, collection, ...baseOptions } = options;

    const imports = baseOptions.imports || [];

    switch (collectionComponentType) {
        case 'saveButton':
        case 'saveDraftButton':
        case 'publishButton':
        case 'previewButton':
            imports.push(`import { ${capitalizeFirstLetter(collectionComponentType)} } from '@payloadcms/ui';`);
            break;
        default:
            break;
    }

    let code = generateImports({ ...baseOptions, imports });

    switch (collectionComponentType) {
        case 'beforeList':
        case 'afterList':
            code += baseOptions.isClientComponent
                ? `import type { BeforeListClientProps } from 'payload';\n\n`
                : `import type { BeforeListServerProps } from 'payload';\n\n`;
            break;
        case 'beforeListTable':
        case 'afterListTable':
            code += baseOptions.isClientComponent
                ? `import type { BeforeListTableClientProps } from 'payload';\n\n`
                : `import type { BeforeListTableServerProps } from 'payload';\n\n`;
            break;
        case 'saveButton':
            code += baseOptions.isClientComponent
                ? `import type { SaveButtonClientProps } from 'payload';\n\n`
                : `import type { SaveButtonServerProps } from 'payload';\n\n`;
            break;
        case 'saveDraftButton':
            code += baseOptions.isClientComponent
                ? `import type { SaveDraftButtonClientProps } from 'payload';\n\n`
                : `import type { SaveDraftButtonServerProps } from 'payload';\n\n`;
            break;
        case 'publishButton':
            code += baseOptions.isClientComponent
                ? `import type { PublishButtonClientProps } from 'payload';\n\n`
                : `import type { PublishButtonServerProps } from 'payload';\n\n`;
            break;
        case 'previewButton':
            code += baseOptions.isClientComponent
                ? `import type { PreviewButtonClientProps } from 'payload';\n\n`
                : `import type { PreviewButtonServerProps } from 'payload';\n\n`;
            break;
        case 'description':
            code += baseOptions.isClientComponent
                ? `import type { ViewDescriptionClientProps } from 'payload';\n\n`
                : `import type { ViewDescriptionServerProps } from 'payload';\n\n`;
            break;
        default:
            break;
    }

    code += generateInterface(name, baseOptions.props);

    const propsType = getPropTypeForCollectionComponent(collectionComponentType, baseOptions.isClientComponent);

    switch (collectionComponentType) {
        case 'saveButton':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <SaveButton label="Save ${collection || 'Document'}" />\n`;
            code += '  );\n';
            code += '}\n';
            break;

        case 'saveDraftButton':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <SaveDraftButton label="Save Draft" />\n`;
            code += '  );\n';
            code += '}\n';
            break;

        case 'publishButton':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <PublishButton label="Publish" />\n`;
            code += '  );\n';
            code += '}\n';
            break;

        case 'previewButton':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <PreviewButton />\n`;
            code += '  );\n';
            code += '}\n';
            break;

        case 'description':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <div className="${camelToKebabCase(name)}">\n`;
            code += `      <p>Custom description for ${collection || 'this collection'}</p>\n`;
            code += '    </div>\n';
            code += '  );\n';
            code += '}\n';
            break;

        case 'upload':
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}() {\n`;
            code += '  return (\n';
            code += `    <div className="${camelToKebabCase(name)}">\n`;
            code += '      <input type="file" />\n';
            code += '      <button type="button">Upload</button>\n';
            code += '    </div>\n';
            code += '  );\n';
            code += '}\n';
            break;

        default:
            code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;
            code += '  return (\n';
            code += `    <div className="${camelToKebabCase(name)}">\n`;
            code += `      <h3>Custom ${collectionComponentType} Component for ${collection || 'Collection'}</h3>\n`;
            code += '      {/* Add your custom component content here */}\n';
            code += '    </div>\n';
            code += '  );\n';
            code += '}\n';
    }

    code += `\nexport default ${name};\n`;

    let styleCode = '';
    if (baseOptions.includeStyles) {
        styleCode = baseOptions.customStyles || generateDefaultStyles(name, collectionComponentType);
    }

    return {
        code,
        fileName: `${name}.tsx`,
        language: 'typescript',
        additionalFiles: baseOptions.includeStyles
            ? [{ code: styleCode, fileName: 'styles.scss', language: 'scss' }]
            : undefined,
        outputPath: baseOptions.outputPath || `components/${camelToKebabCase(name)}`,
    };
}

function generateViewComponent(options: ViewComponentOptions): GeneratorResult {
    const {
        name,
        viewType,
        viewPath,
        useDefaultTemplate,
        entity,
        isDocumentTab,
        tabProps,
        ...baseOptions
    } = options;

    const imports = baseOptions.imports || [];

    if (useDefaultTemplate) {
        imports.push("import { DefaultTemplate } from '@payloadcms/next/templates';");
    }

    imports.push("import { Gutter } from '@payloadcms/ui';");

    let code = generateImports({ ...baseOptions, imports });

    switch (viewType) {
        case 'dashboard':
            code += baseOptions.isClientComponent
                ? `import type { AdminViewClientProps } from 'payload';\n\n`
                : `import type { AdminViewServerProps } from 'payload';\n\n`;
            break;
        case 'account':
            code += baseOptions.isClientComponent
                ? `import type { AdminViewClientProps } from 'payload';\n\n`
                : `import type { AdminViewServerProps } from 'payload';\n\n`;
            break;
        case 'list':
            code += baseOptions.isClientComponent
                ? `import type { ListViewClientProps } from 'payload';\n\n`
                : `import type { ListViewServerProps } from 'payload';\n\n`;
            break;
        case 'edit':
            code += baseOptions.isClientComponent
                ? `import type { DocumentViewClientProps } from 'payload';\n\n`
                : `import type { DocumentViewServerProps } from 'payload';\n\n`;
            break;
        case 'custom':
            code += baseOptions.isClientComponent
                ? `import type { AdminViewClientProps } from 'payload';\n\n`
                : `import type { AdminViewServerProps } from 'payload';\n\n`;
            break;
        default:
            break;
    }

    if (isDocumentTab) {
        code += baseOptions.isClientComponent
            ? `import type { DocumentTabClientProps } from 'payload';\n\n`
            : `import type { DocumentTabServerProps } from 'payload';\n\n`;
    }

    code += generateInterface(name, baseOptions.props);

    const propsType = getPropsTypeForView(viewType, Boolean(baseOptions.isClientComponent), Boolean(isDocumentTab));

    if (useDefaultTemplate) {
        code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}({\n`;
        code += '  initPageResult,\n';
        code += '  params,\n';
        code += '  searchParams,\n';
        code += `}: ${propsType}) {\n`;
        code += '  return (\n';
        code += '    <DefaultTemplate\n';
        code += '      i18n={initPageResult.req.i18n}\n';
        code += '      locale={initPageResult.locale}\n';
        code += '      params={params}\n';
        code += '      payload={initPageResult.req.payload}\n';
        code += '      permissions={initPageResult.permissions}\n';
        code += '      searchParams={searchParams}\n';
        code += '      user={initPageResult.req.user || undefined}\n';
        code += '      visibleEntities={initPageResult.visibleEntities}\n';
        code += '    >\n';
        code += '      <Gutter>\n';
        code += `        <h1>${getViewTitle(viewType, entity)}</h1>\n`;
        code += '        <p>This view uses the Default Template.</p>\n';
        code += '        {/* Add your custom view content here */}\n';
        code += '      </Gutter>\n';
        code += '    </DefaultTemplate>\n';
        code += '  );\n';
        code += '}\n';
    } else {
        code += `export ${baseOptions.isClientComponent ? '' : 'async '}function ${name}(props: ${propsType}) {\n`;

        if (viewType === 'edit') {
            code += '  const { doc } = props;\n\n';
        }

        code += '  return (\n';
        code += '    <Gutter>\n';
        code += `      <h1>${getViewTitle(viewType, entity)}</h1>\n`;

        if (viewType === 'edit') {
            code += '      {doc && (\n';
            code += '        <div>\n';
            code += '          <h2>Document ID: {doc.id}</h2>\n';
            code += '          <pre>{JSON.stringify(doc, null, 2)}</pre>\n';
            code += '        </div>\n';
            code += '      )}\n';
        }

        code += '      {/* Add your custom view content here */}\n';
        code += '    </Gutter>\n';
        code += '  );\n';
        code += '}\n';
    }

    if (isDocumentTab) {
        const tabName = `${name}Tab`;
        const tabPropsType = baseOptions.isClientComponent ? 'DocumentTabClientProps' : 'DocumentTabServerProps';

        code += `\nexport function ${tabName}(props: ${tabPropsType}) {\n`;
        code += '  return (\n';
        code += `    <div className="${camelToKebabCase(tabName)}">\n`;
        code += `      ${tabProps?.label || name}\n`;
        code += '    </div>\n';
        code += '  );\n';
        code += '}\n';
    }

    code += `\nexport default ${name};\n`;

    let styleCode = '';
    if (baseOptions.includeStyles) {
        styleCode = baseOptions.customStyles || generateDefaultStyles(name, viewType);
    }

    return {
        code,
        fileName: `${name}.tsx`,
        language: 'typescript',
        additionalFiles: baseOptions.includeStyles
            ? [{ code: styleCode, fileName: 'styles.scss', language: 'scss' }]
            : undefined,
        outputPath: baseOptions.outputPath || `components/${camelToKebabCase(name)}`,
    };
}

function generateProviderComponent(options: ProviderComponentOptions): GeneratorResult {
    const { name, contextValueType, includeHook, ...baseOptions } = options;

    let code = "'use client'\n";
    code += "import React, { createContext, useContext } from 'react';\n";

    if (baseOptions.imports && baseOptions.imports.length > 0) {
        code += baseOptions.imports.join('\n') + '\n';
    }

    if (baseOptions.includeStyles) {
        code += `import './styles.scss';\n\n`;
    } else {
        code += '\n';
    }

    const valueType = contextValueType || 'any';
    code += `// Create context with a default value\n`;
    code += `const ${name}Context = createContext<${valueType}>(${getDefaultValueForType(valueType)});\n\n`;

    code += `interface ${name}Props {\n`;
    code += '  children: React.ReactNode;\n';

    if (baseOptions.props && baseOptions.props.length > 0) {
        baseOptions.props.forEach(prop => {
            code += `  /** ${prop.description || 'No description'} */\n`;
            code += `  ${prop.name}${prop.required ? '' : '?'}: ${prop.type};\n`;
        });
    }

    code += '}\n\n';

    code += `export function ${name}({ children`;

    if (baseOptions.props && baseOptions.props.length > 0) {
        baseOptions.props.forEach(prop => {
            code += `, ${prop.name}`;
        });
    }

    code += ` }: ${name}Props) {\n`;

    code += '  // Create the context value\n';
    code += '  const contextValue = {\n';

    if (baseOptions.props && baseOptions.props.length > 0) {
        baseOptions.props.forEach(prop => {
            code += `    ${prop.name},\n`;
        });
    } else {
        code += '    // Add your context values here\n';
    }

    code += '  };\n\n';

    code += '  return (\n';
    code += `    <${name}Context.Provider value={contextValue}>\n`;
    code += '      {children}\n';
    code += `    </${name}Context.Provider>\n`;
    code += '  );\n';
    code += '}\n\n';

    if (includeHook) {
        code += `// Custom hook to use the ${name} context\n`;
        code += `export function use${name}() {\n`;
        code += `  const context = useContext(${name}Context);\n`;
        code += '  \n';
        code += '  if (context === undefined) {\n';
        code += `    throw new Error('use${name} must be used within a ${name}');\n`;
        code += '  }\n';
        code += '  \n';
        code += '  return context;\n';
        code += '}\n\n';
    }

    code += `export default ${name};\n`;

    let styleCode = '';
    if (baseOptions.includeStyles) {
        styleCode = baseOptions.customStyles || `// Styles for ${name}\n`;
    }

    return {
        code,
        fileName: `${name}.tsx`,
        language: 'typescript',
        additionalFiles: baseOptions.includeStyles
            ? [{ code: styleCode, fileName: 'styles.scss', language: 'scss' }]
            : undefined,
        outputPath: baseOptions.outputPath || `components/${camelToKebabCase(name)}`,
    };
}

function generateDefaultStyles(componentName: string, componentType: string): string {
    const kebabName = camelToKebabCase(componentName);

    let styles = `// Styles for ${componentName}\n`;
    styles += `@import '~@payloadcms/ui/scss';\n\n`;
    styles += `.${kebabName} {\n`;
    styles += '  padding: var(--base);\n';

    switch (componentType) {
        case 'logo':
        case 'icon':
            styles += '  display: flex;\n';
            styles += '  align-items: center;\n';
            styles += '  justify-content: center;\n';
            break;
        case 'nav':
            styles += '  ul {\n';
            styles += '    list-style: none;\n';
            styles += '    padding: 0;\n';
            styles += '    margin: 0;\n';
            styles += '  }\n\n';
            styles += '  li {\n';
            styles += '    margin-bottom: var(--base);\n';
            styles += '  }\n\n';
            styles += '  a {\n';
            styles += '    color: var(--theme-text);\n';
            styles += '    text-decoration: none;\n';
            styles += '    &:hover {\n';
            styles += '      text-decoration: underline;\n';
            styles += '    }\n';
            styles += '  }\n';
            break;
        case 'dashboard':
        case 'account':
        case 'list':
        case 'edit':
            styles += '  h1 {\n';
            styles += '    margin-top: 0;\n';
            styles += '  }\n\n';
            styles += '  @include mid-break {\n';
            styles += '    padding: calc(var(--base) / 2);\n';
            styles += '  }\n';
            break;
        default:
            styles += '  background-color: var(--theme-elevation-50);\n';
            styles += '  border-radius: var(--style-radius-m);\n';
            styles += '  \n';
            styles += '  @include mid-break {\n';
            styles += '    padding: calc(var(--base) / 2);\n';
            styles += '  }\n';
    }

    styles += '}\n';

    return styles;
}

function getDefaultValueForType(type: string): string {
    switch (type) {
        case 'string':
            return "''";
        case 'number':
            return '0';
        case 'boolean':
            return 'false';
        case 'any[]':
        case 'Array<any>':
            return '[]';
        case 'Record<string, any>':
        case 'object':
            return '{}';
        default:
            return 'undefined';
    }
}

function getViewTitle(viewType: string, entity?: string): string {
    switch (viewType) {
        case 'dashboard':
            return 'Custom Dashboard';
        case 'account':
            return 'Account Settings';
        case 'list':
            return `${entity || 'Collection'} List`;
        case 'edit':
            return `Edit ${entity || 'Document'}`;
        case 'custom':
            return 'Custom View';
        default:
            return 'Custom View';
    }
}

function getPropTypeForCollectionComponent(type: string, isClientComponent?: boolean): string {
    switch (type) {
        case 'beforeList':
        case 'afterList':
            return isClientComponent ? 'BeforeListClientProps' : 'BeforeListServerProps';
        case 'beforeListTable':
        case 'afterListTable':
            return isClientComponent ? 'BeforeListTableClientProps' : 'BeforeListTableServerProps';
        case 'saveButton':
            return isClientComponent ? 'SaveButtonClientProps' : 'SaveButtonServerProps';
        case 'saveDraftButton':
            return isClientComponent ? 'SaveDraftButtonClientProps' : 'SaveDraftButtonServerProps';
        case 'publishButton':
            return isClientComponent ? 'PublishButtonClientProps' : 'PublishButtonServerProps';
        case 'previewButton':
            return isClientComponent ? 'PreviewButtonClientProps' : 'PreviewButtonServerProps';
        case 'description':
            return isClientComponent ? 'ViewDescriptionClientProps' : 'ViewDescriptionServerProps';
        default:
            return 'Record<string, any>';
    }
}

function getPropsTypeForView(viewType: string, isClientComponent?: boolean, isDocumentTab?: boolean): string {
    if (isDocumentTab) {
        return isClientComponent ? 'DocumentTabClientProps' : 'DocumentTabServerProps';
    }

    switch (viewType) {
        case 'dashboard':
        case 'account':
        case 'custom':
            return isClientComponent ? 'AdminViewClientProps' : 'AdminViewServerProps';
        case 'list':
            return isClientComponent ? 'ListViewClientProps' : 'ListViewServerProps';
        case 'edit':
            return isClientComponent ? 'DocumentViewClientProps' : 'DocumentViewServerProps';
        default:
            return isClientComponent ? 'AdminViewClientProps' : 'AdminViewServerProps';
    }
}
