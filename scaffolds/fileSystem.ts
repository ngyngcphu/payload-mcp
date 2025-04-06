import fs from "fs";
import path from "path";
import { ScaffoldOptions, ScaffoldError } from "./types.js";

const createDirectory = (dirPath: string): ScaffoldError | null => {
  try {
    if (fs.existsSync(dirPath) && !fs.statSync(dirPath).isDirectory()) {
      return {
        code: "FS_PATH_IS_FILE",
        message: `Path already exists and is a file, cannot create directory: ${dirPath}`,
        suggestion:
          "Please remove the conflicting file or choose a different path.",
      };
    }
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return null;
  } catch (error) {
    return {
      code: "FS_DIR_CREATE_ERROR",
      message: `Failed to create directory: ${dirPath} - ${(error as Error).message}`,
      suggestion: "Check file system permissions and path validity.",
    };
  }
};

const writeFile = (
  filePath: string,
  contents: string,
): ScaffoldError | null => {
  try {
    const dir = path.dirname(filePath);
    const dirError = createDirectory(dir);
    if (dirError) return dirError;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      return {
        code: "FS_PATH_IS_DIRECTORY",
        message: `Path already exists and is a directory, cannot write file: ${filePath}`,
        suggestion:
          "Please remove the conflicting directory or choose a different file name.",
      };
    }

    fs.writeFileSync(filePath, contents);
    return null;
  } catch (error) {
    return {
      code: "FS_FILE_WRITE_ERROR",
      message: `Failed to write file: ${filePath} - ${(error as Error).message}`,
      suggestion: "Check file system permissions and path validity.",
    };
  }
};

export const createProjectStructure = (
  projectPath: string,
  options: ScaffoldOptions,
): { errors: ScaffoldError[]; directories: string[] } => {
  const errors: ScaffoldError[] = [];
  const directoriesCreated: string[] = [];

  const addDir = (relativePath: string) => {
    const fullPath = path.join(projectPath, relativePath);
    const error = createDirectory(fullPath);
    if (error) {
      errors.push(error);
    } else if (!directoriesCreated.includes(fullPath)) {
      directoriesCreated.push(fullPath);
    }
    return !error;
  };

  addDir("");

  addDir("public");
  addDir("public/assets");
  addDir("public/assets/images");
  addDir("src");
  addDir("media");

  if (addDir("src")) {
    addDir("src/app");
    addDir("src/app/(frontend)");
    addDir("src/app/(frontend)/next/seed");
    addDir("src/app/(frontend)/next/preview");
    addDir("src/app/(frontend)/next/exit-preview");
    addDir("src/app/(frontend)/posts");
    addDir("src/app/(frontend)/posts/page/[pageNumber]");
    addDir("src/app/(frontend)/posts/[slug]");
    addDir("src/app/(frontend)/search");
    addDir("src/app/(frontend)/(sitemaps)");
    addDir("src/app/(frontend)/(sitemaps)/posts-sitemap.xml");
    addDir("src/app/(frontend)/(sitemaps)/pages-sitemap.xml");
    addDir("src/app/(frontend)/[slug]");

    addDir("src/app/(payload)");
    addDir("src/app/(payload)/admin");
    addDir("src/app/(payload)/admin/[[...segments]]");
    addDir("src/app/(payload)/api");
    addDir("src/app/(payload)/api/graphql-playground");
    addDir("src/app/(payload)/api/[...slug]");
    addDir("src/app/(payload)/api/graphql");

    addDir("src/access");
    addDir("src/blocks");
    addDir("src/collections");
    if (options.authentication) addDir("src/collections/Users");
    addDir("src/collections/Media");
    addDir("src/collections/Pages");
    addDir("src/collections/Pages/hooks");
    addDir("src/collections/Posts");
    addDir("src/collections/Posts/hooks");
    (options.collections || []).forEach((c) =>
      addDir(`src/collections/${c.slug}`),
    );

    addDir("src/components");
    addDir("src/components/ui");
    addDir("src/components/PayloadRedirects");
    addDir("src/components/AdminBar");

    addDir("src/endpoints");
    addDir("src/endpoints/seed");

    addDir("src/fields");
    addDir("src/fields/slug");

    addDir("src/globals");
    addDir("src/globals/Header");
    addDir("src/globals/Header/hooks");
    addDir("src/globals/Footer");
    addDir("src/globals/Footer/hooks");
    (options.globals || []).forEach((g) => addDir(`src/globals/${g.slug}`));

    addDir("src/heros");

    addDir("src/hooks");

    addDir("src/plugins");

    addDir("src/providers");
    addDir("src/providers/Theme");
    addDir("src/providers/Theme/ThemeSelector");
    addDir("src/providers/Theme/InitTheme");
    addDir("src/providers/HeaderTheme");

    addDir("src/search");

    addDir("src/styles");

    addDir("src/utilities");

    addDir("src/scripts");
    addDir("src/assets");
  }

  if (options.blocks) {
    options.blocks.forEach((block) => {
      const pascalSlug = block.slug
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join("");
      addDir(`src/blocks/${pascalSlug}`);
      if (block.slug === "Form") {
        addDir(`src/blocks/Form/Checkbox`);
        addDir(`src/blocks/Form/Country`);
        addDir(`src/blocks/Form/Email`);
        addDir(`src/blocks/Form/Error`);
        addDir(`src/blocks/Form/Message`);
        addDir(`src/blocks/Form/Number`);
        addDir(`src/blocks/Form/Select`);
        addDir(`src/blocks/Form/State`);
        addDir(`src/blocks/Form/Text`);
        addDir(`src/blocks/Form/Textarea`);
        addDir(`src/blocks/Form/Width`);
      }
    });
  }

  return { errors, directories: directoriesCreated };
};

export const generateProjectFiles = (
  projectPath: string,
  templateContents: Record<string, string | undefined>,
  options: ScaffoldOptions,
): { errors: ScaffoldError[]; files: string[] } => {
  const errors: ScaffoldError[] = [];
  const filesWritten: string[] = [];
  const {
    collections = [],
    globals = [],
    blocks = [],
    authentication = true,
  } = options;
  const extension = options.typescript ? "ts" : "js";
  const componentExtension = options.typescript ? "tsx" : "jsx";

  const addFile = (
    relativePath: string,
    contentKey: keyof typeof templateContents | string,
    directContent?: string,
  ) => {
    const content = directContent ?? templateContents[contentKey];
    if (content === undefined || content === null) {
      return;
    }
    const fullPath = path.join(projectPath, relativePath);
    const error = writeFile(fullPath, content);
    if (error) {
      errors.push(error);
    } else {
      filesWritten.push(fullPath);
    }
  };

  addFile(".env.example", "envFile");
  addFile(".gitignore", "gitignoreFile");
  addFile("package.json", "packageJson");
  addFile("README.md", "readme");
  addFile("next.config.js", "nextConfig");
  addFile("next-sitemap.config.cjs", "nextSitemapConfig");
  addFile("tailwind.config.mjs", "tailwindConfig");
  addFile("postcss.config.js", "postcssConfig");
  addFile("eslint.config.mjs", "eslintConfig");
  addFile("components.json", "componentsJson");
  addFile("redirects.js", "redirectsJs");
  if (options.typescript) {
    addFile("tsconfig.json", "tsConfigFile");
    addFile(
      "next-env.d.ts",
      "nextEnvDts",
      `/// <reference types="next" />\n/// <reference types="next/image-types/global" />\n\n// NOTE: This file should not be edited\n// see https://nextjs.org/docs/app/api-reference/config/typescript for more information.\n`,
    );
    addFile(
      "src/environment.d.ts",
      "environmentDts",
      `declare global {\n  namespace NodeJS {\n    interface ProcessEnv {\n      PAYLOAD_SECRET: string\n      DATABASE_URI: string\n      NEXT_PUBLIC_SERVER_URL?: string\n      VERCEL_PROJECT_PRODUCTION_URL?: string\n      // Add other environment variables your template needs\n      CRON_SECRET?: string\n      PAYLOAD_SEED_SECRET?: string // Example for protecting seed\n    }\n  }\n}\n\n// If this file has no import/export statements (i.e. is a script)\n// convert it into a module by adding an empty export statement.\nexport {}\n`,
    );
  }

  addFile(`src/payload.config.${extension}`, "payloadConfig");
  addFile(
    `src/payload-types.${extension}`,
    "// This file is automatically generated by Payload.",
  );
  addFile(
    `src/cssVariables.js`,
    `// Keep these in sync with CSS variables in tailwind config\nexport const cssVariables = { breakpoints: { '3xl': 1920, '2xl': 1536, xl: 1280, lg: 1024, md: 768, sm: 640 } };`,
  );

  if (authentication) {
    addFile(`src/collections/Users/index.${extension}`, "userCollection");
    addFile(`src/collections/Media.${extension}`, "mediaCollection");
  }
  collections.forEach((collection) => {
    addFile(
      `src/collections/${collection.slug}.${extension}`,
      `collection_${collection.slug}`,
    );
    if (collection.slug === "Pages") {
      addFile(
        `src/collections/Pages/hooks/revalidatePage.${extension}`,
        "pageRevalidateHook",
      );
    }
    if (collection.slug === "Posts") {
      addFile(
        `src/collections/Posts/hooks/revalidatePost.${extension}`,
        "postRevalidateHook",
      );
      addFile(
        `src/collections/Posts/hooks/populateAuthors.${extension}`,
        "postPopulateAuthorsHook",
      );
    }
  });

  globals.forEach((global) => {
    addFile(
      `src/globals/${global.slug}/config.${extension}`,
      `global_${global.slug}_config`,
    );
    addFile(
      `src/globals/${global.slug}/Component.${componentExtension}`,
      `global_${global.slug}_component`,
    );
    if (global.slug === "Header" || global.slug === "Footer") {
      addFile(
        `src/globals/${global.slug}/hooks/revalidate${global.slug}.${extension}`,
        `global_${global.slug}_revalidateHook`,
      );
      addFile(
        `src/globals/${global.slug}/RowLabel.${componentExtension}`,
        `global_${global.slug}_rowLabel`,
      );
      if (global.slug === "Header") {
        addFile(
          `src/Header/Component.client.${componentExtension}`,
          "headerClientComponent",
        );
        addFile(
          `src/Header/Nav/index.${componentExtension}`,
          "headerNavComponent",
        );
      }
    }
  });

  blocks.forEach((block) => {
    const pascalSlug = block.slug
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
    const blockDir = `src/blocks/${pascalSlug}`;
    addFile(`${blockDir}/config.${extension}`, `block_${block.slug}_config`);
    addFile(
      `${blockDir}/Component.${componentExtension}`,
      `block_${block.slug}_component`,
    );
    if (block.slug === "Form") {
      addFile(`src/blocks/Form/fields.${componentExtension}`, "formFields");
      addFile(
        `src/blocks/Form/Checkbox/index.${componentExtension}`,
        "formCheckbox",
      );
    }
    if (block.slug === "Code") {
      addFile(
        `src/blocks/Code/Component.client.${componentExtension}`,
        "codeClientComponent",
      );
      addFile(
        `src/blocks/Code/CopyButton.${componentExtension}`,
        "codeCopyButton",
      );
    }
  });
  if (blocks.length > 0) {
    addFile(
      `src/blocks/RenderBlocks.${componentExtension}`,
      "renderBlocksComponent",
    );
  }

  addFile(
    `src/app/(frontend)/layout.${componentExtension}`,
    "appFrontendLayout",
  );
  addFile(`src/app/(frontend)/globals.css`, "globalsCSS");
  addFile(
    `src/app/(frontend)/page.${componentExtension}`,
    "appFrontendRootPage",
  );
  addFile(
    `src/app/(frontend)/[slug]/page.${componentExtension}`,
    "appFrontendSlugPage",
  );
  addFile(
    `src/app/(frontend)/[slug]/page.client.${componentExtension}`,
    "appFrontendSlugPageClient",
  );
  addFile(
    `src/app/(frontend)/posts/page.${componentExtension}`,
    "appFrontendPostsPage",
  );
  addFile(
    `src/app/(frontend)/posts/page.client.${componentExtension}`,
    "appFrontendPostsPageClient",
  );
  addFile(
    `src/app/(frontend)/posts/[slug]/page.${componentExtension}`,
    "appFrontendPostSlugPage",
  );
  addFile(
    `src/app/(frontend)/posts/[slug]/page.client.${componentExtension}`,
    "appFrontendPostSlugPageClient",
  );
  addFile(
    `src/app/(frontend)/posts/page/[pageNumber]/page.${componentExtension}`,
    "appFrontendPostsPaginatedPage",
  );
  addFile(
    `src/app/(frontend)/posts/page/[pageNumber]/page.client.${componentExtension}`,
    "appFrontendPostsPaginatedPageClient",
  );
  addFile(
    `src/app/(frontend)/search/page.${componentExtension}`,
    "appFrontendSearchPage",
  );
  addFile(
    `src/app/(frontend)/search/page.client.${componentExtension}`,
    "appFrontendSearchPageClient",
  );
  addFile(
    `src/app/(frontend)/(sitemaps)/posts-sitemap.xml/route.${extension}`,
    "appFrontendPostsSitemap",
  );
  addFile(
    `src/app/(frontend)/(sitemaps)/pages-sitemap.xml/route.${extension}`,
    "appFrontendPagesSitemap",
  );
  addFile(
    `src/app/(frontend)/not-found.${componentExtension}`,
    "appFrontendNotFound",
  );
  addFile(`src/app/(frontend)/next/seed/route.${extension}`, "seedRoute");
  addFile(
    `src/app/(frontend)/next/preview/route.${extension}`,
    "appFrontendPreviewRoute",
  );
  addFile(
    `src/app/(frontend)/next/exit-preview/route.${extension}`,
    "appFrontendExitPreviewRoute",
  );

  addFile(`src/app/(payload)/layout.${componentExtension}`, "appPayloadLayout");
  addFile(
    `src/app/(payload)/admin/[[...segments]]/page.${componentExtension}`,
    "appPayloadAdminPage",
  );
  addFile(
    `src/app/(payload)/admin/[[...segments]]/not-found.${componentExtension}`,
    "appPayloadAdminNotFound",
  );
  addFile(
    `src/app/(payload)/api/[...slug]/route.${extension}`,
    "appPayloadApiRoutes",
  );
  addFile(
    `src/app/(payload)/api/graphql/route.${extension}`,
    "appPayloadApiGraphql",
  );
  addFile(
    `src/app/(payload)/api/graphql-playground/route.${extension}`,
    "appPayloadApiGraphqlPlayground",
  );
  addFile(`src/app/(payload)/custom.scss`, "adminStyles");
  addFile(
    `src/app/(payload)/admin/importMap.js`,
    "importMapPlaceholder",
    "// This file will be automatically generated by Payload CMS during build.",
  );

  addFile(`src/utilities/getGlobals.${extension}`, "utilitiesGetGlobals");
  addFile(`src/utilities/getURL.${extension}`, "utilitiesGetUrl");
  addFile(`src/utilities/ui.${extension}`, "utilitiesUi");
  addFile(`src/access/authenticated.${extension}`, "authenticatedAccess");
  addFile(`src/access/anyone.${extension}`, "anyoneAccess");
  addFile(
    `src/access/authenticatedOrPublished.${extension}`,
    "authenticatedOrPublishedAccess",
  );
  addFile(`src/plugins/index.${extension}`, "pluginsIndex");
  addFile(`src/components/Card/index.tsx`, "cardComponent");
  addFile(`src/providers/Theme/index.tsx`, "themeProvider");
  addFile(`src/hooks/formatSlug.ts`, "formatSlugHook");

  addFile(`public/favicon.ico`, "faviconIco");
  addFile(`public/favicon.svg`, "faviconSvg");
  addFile(`public/website-template-OG.webp`, "ogImageWebp");

  return { errors, files: filesWritten };
};
