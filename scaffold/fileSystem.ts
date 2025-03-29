import fs from 'fs';
import path from 'path';
import { ScaffoldOptions, CollectionConfig, GlobalConfig, BlockConfig, ScaffoldError } from './types.js';

export const createDirectory = (dirPath: string): ScaffoldError | null => {
    try {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
        return null;
    } catch (error) {
        return {
            code: 'FS_DIR_CREATE_ERROR',
            message: `Failed to create directory: ${dirPath}`,
            suggestion: 'Check file system permissions and path validity',
        };
    }
};

export const writeFile = (filePath: string, contents: string): ScaffoldError | null => {
    try {
        fs.writeFileSync(filePath, contents);
        return null;
    } catch (error) {
        return {
            code: 'FS_FILE_WRITE_ERROR',
            message: `Failed to write file: ${filePath}`,
            suggestion: 'Check file system permissions and path validity',
        };
    }
};

export const copyFile = (source: string, destination: string): ScaffoldError | null => {
    try {
        fs.copyFileSync(source, destination);
        return null;
    } catch (error) {
        return {
            code: 'FS_FILE_COPY_ERROR',
            message: `Failed to copy file from ${source} to ${destination}`,
            suggestion: 'Check file system permissions and path validity',
        };
    }
};

export const createProjectStructure = (
    projectPath: string,
    options: ScaffoldOptions
): { errors: ScaffoldError[]; directories: string[] } => {
    const errors: ScaffoldError[] = [];
    const directories: string[] = [];

    const rootDirError = createDirectory(projectPath);
    if (rootDirError) {
        errors.push(rootDirError);
        return { errors, directories };
    }
    directories.push(projectPath);

    const srcPath = path.join(projectPath, 'src');
    const srcDirError = createDirectory(srcPath);
    if (srcDirError) {
        errors.push(srcDirError);
        return { errors, directories };
    }
    directories.push(srcPath);

    const subdirectories = [
        'collections',
        'globals',
        'blocks',
        'fields',
        'utilities',
        'components',
        'access',
        'styles',
        'hooks',
        'hooks/beforeValidate',
        'hooks/beforeChange',
        'hooks/afterChange',
        'hooks/afterRead',
        'hooks/beforeDelete',
        'hooks/afterDelete',
        'scripts',
        'assets',
    ];

    for (const dir of subdirectories) {
        const dirPath = path.join(srcPath, dir);
        const dirError = createDirectory(dirPath);
        if (dirError) {
            errors.push(dirError);
        } else {
            directories.push(dirPath);
        }
    }

    const mediaPath = path.join(projectPath, 'media');
    const mediaDirError = createDirectory(mediaPath);
    if (mediaDirError) {
        errors.push(mediaDirError);
    } else {
        directories.push(mediaPath);
    }

    const publicPath = path.join(projectPath, 'public');
    const publicDirError = createDirectory(publicPath);
    if (publicDirError) {
        errors.push(publicDirError);
    } else {
        directories.push(publicPath);
    }

    const assetsPath = path.join(publicPath, 'assets');
    const assetsDirError = createDirectory(assetsPath);
    if (assetsDirError) {
        errors.push(assetsDirError);
    } else {
        directories.push(assetsPath);
    }

    const imagesPath = path.join(assetsPath, 'images');
    const imagesDirError = createDirectory(imagesPath);
    if (imagesDirError) {
        errors.push(imagesDirError);
    } else {
        directories.push(imagesPath);
    }

    return { errors, directories };
};

export const generateProjectFiles = (
    projectPath: string,
    templateContents: Record<string, string>,
    options: ScaffoldOptions
): { errors: ScaffoldError[]; files: string[] } => {
    const errors: ScaffoldError[] = [];
    const files: string[] = [];

    const {
        collections = [],
        globals = [],
        blocks = [],
        authentication = true
    } = options;

    const rootFiles: Record<string, string> = {
        '.env': templateContents.envFile,
        '.gitignore': templateContents.gitignoreFile,
        'package.json': templateContents.packageJson,
        'README.md': templateContents.readme,
    };

    if (options.typescript) {
        rootFiles['tsconfig.json'] = templateContents.tsConfigFile;
    }

    for (const [fileName, content] of Object.entries(rootFiles)) {
        const filePath = path.join(projectPath, fileName);
        const fileError = writeFile(filePath, content);
        if (fileError) {
            errors.push(fileError);
        } else {
            files.push(filePath);
        }
    }

    const extension = options.typescript ? 'ts' : 'js';
    const srcFiles: Record<string, string> = {
        [`server.${extension}`]: templateContents.serverFile,
        [`payload.config.${extension}`]: templateContents.payloadConfig,
    };

    for (const [fileName, content] of Object.entries(srcFiles)) {
        const filePath = path.join(projectPath, 'src', fileName);
        const fileError = writeFile(filePath, content);
        if (fileError) {
            errors.push(fileError);
        } else {
            files.push(filePath);
        }
    }

    const utilityFiles = {
        [`access/isAdmin.${extension}`]: templateContents.adminAccess || '',
        [`utilities/accessControl.${extension}`]: templateContents.accessControlUtil || '',
        [`scripts/seed.${extension}`]: templateContents.seedScript || '',
        [`styles/admin.scss`]: templateContents.adminStyles || '',
    };

    for (const [fileName, content] of Object.entries(utilityFiles)) {
        if (content) {
            const filePath = path.join(projectPath, 'src', fileName);
            const fileError = writeFile(filePath, content);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(filePath);
            }
        }
    }

    for (const collection of collections) {
        const filePath = path.join(projectPath, 'src', 'collections', `${collection.slug}.${extension}`);
        const fileContent = templateContents[`collection_${collection.slug}`];
        if (fileContent) {
            const fileError = writeFile(filePath, fileContent);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(filePath);
            }
        }
    }

    if (authentication) {
        const usersPath = path.join(projectPath, 'src', 'collections', `users.${extension}`);
        const usersContent = templateContents.userCollection;
        if (usersContent && !collections.some(c => c.slug === 'users')) {
            const fileError = writeFile(usersPath, usersContent);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(usersPath);
            }
        }
    }

    const mediaPath = path.join(projectPath, 'src', 'collections', `media.${extension}`);
    const mediaContent = templateContents.mediaCollection;
    if (mediaContent && !collections.some(c => c.slug === 'media')) {
        const fileError = writeFile(mediaPath, mediaContent);
        if (fileError) {
            errors.push(fileError);
        } else {
            files.push(mediaPath);
        }
    }

    for (const global of globals) {
        const filePath = path.join(projectPath, 'src', 'globals', `${global.slug}.${extension}`);
        const fileContent = templateContents[`global_${global.slug}`];
        if (fileContent) {
            const fileError = writeFile(filePath, fileContent);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(filePath);
            }
        }
    }

    for (const block of blocks) {
        const filePath = path.join(projectPath, 'src', 'blocks', `${block.slug}.${extension}`);
        const fileContent = templateContents[`block_${block.slug}`];
        if (fileContent) {
            const fileError = writeFile(filePath, fileContent);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(filePath);
            }
        }
    }

    if (blocks.length > 0) {
        const blocksIndexPath = path.join(projectPath, 'src', 'blocks', `index.${extension}`);
        const blocksIndexContent = templateContents.blocksIndex;
        if (blocksIndexContent) {
            const fileError = writeFile(blocksIndexPath, blocksIndexContent);
            if (fileError) {
                errors.push(fileError);
            } else {
                files.push(blocksIndexPath);
            }
        }
    }

    const placeholderDirs = [
        'hooks/beforeValidate',
        'hooks/beforeChange',
        'hooks/afterChange',
        'hooks/afterRead',
        'hooks/beforeDelete',
        'hooks/afterDelete',
        'components',
        'fields',
    ];

    for (const dir of placeholderDirs) {
        const placeholderPath = path.join(projectPath, 'src', dir, '.gitkeep');
        const fileError = writeFile(placeholderPath, '');
        if (fileError) {
            errors.push(fileError);
        } else {
            files.push(placeholderPath);
        }
    }

    const faviconContent = '';
    const ogImageContent = '';
    
    const faviconPath = path.join(projectPath, 'public', 'assets', 'favicon.ico');
    const ogImagePath = path.join(projectPath, 'public', 'assets', 'og-image.jpg');
    
    const faviconError = writeFile(faviconPath, faviconContent);
    if (faviconError) {
        errors.push(faviconError);
    } else {
        files.push(faviconPath);
    }
    
    const ogImageError = writeFile(ogImagePath, ogImageContent);
    if (ogImageError) {
        errors.push(ogImageError);
    } else {
        files.push(ogImagePath);
    }

    return { errors, files };
}; 