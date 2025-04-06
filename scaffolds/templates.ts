import {
  ScaffoldOptions,
  GlobalConfig,
  BlockConfig,
  FieldConfig,
  PluginConfig,
  CollectionConfig,
} from "./types.js";
import { camelToKebabCase } from "../utils/index.js";

function stringifyFunction(
  fn: Function | string | undefined,
  defaultFn: string = "() => {}",
): string {
  if (typeof fn === "function") {
    return fn.toString();
  }
  if (typeof fn === "string") {
    return fn;
  }
  return defaultFn;
}

export const generateEnvFile = (options: ScaffoldOptions): string => {
  const { database, serverUrl, projectName } = options;
  const defaultDbName = camelToKebabCase(projectName);

  const serverUrlValue = serverUrl || `http://localhost:3000`;

  return `# Server Configuration
PORT=3000
# Ensure this matches the URL your frontend will use to fetch data
NEXT_PUBLIC_SERVER_URL=${serverUrlValue}

# Database Configuration - Replace with your actual connection string
${
  database === "mongodb"
    ? `DATABASE_URI=mongodb://127.0.0.1:27017/${defaultDbName}`
    : `DATABASE_URI=postgres://user:pass@localhost:5432/${defaultDbName}`
}
# Payload Configuration
# Generate a strong secret using 'openssl rand -base64 32' or a similar tool
PAYLOAD_SECRET= # IMPORTANT: Set a strong secret key here
PAYLOAD_CONFIG_PATH=dist/payload.config.js # Added for production builds

# Optional: Payload Cloud API Key (if using Payload Cloud)
# PAYLOAD_CLOUD_API_KEY=...

# Optional: Cron Secret (if using scheduled publishing)
# CRON_SECRET=...

# You should commit this file to your repository WITHOUT sensitive information.
# Create a '.env' file in the root for local development overrides.
# DO NOT commit '.env' which contains your actual secrets.
`;
};

export const generateGitignoreFile = (): string => {
  return `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js

# testing
/coverage

# next.js
/.next/
/out/

# production
/build
/dist # Added dist folder

# misc
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# vercel
.vercel

# dotenv environment variables file
.env # Ignore the local env file with secrets!
.env*.local
!.env.example # Do not ignore the example file

# Payload Generated Files
src/payload-types.ts
src/generated-schema.graphql

# Payload Media (if stored locally)
/media
public/media # For the template structure

# IDE config files
.vscode/
.idea/
`;
};

export const generateTsConfigFile = (): string => {
  return `{
  "compilerOptions": {
    /* Strictness */
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,

    "baseUrl": ".",
    "esModuleInterop": true,
    "target": "ES2022",
    "lib": [
      "DOM",
      "DOM.Iterable",
      "ES2022"
    ],
    "allowJs": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noEmit": true,
    "incremental": true,
    "jsx": "preserve",
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "sourceMap": true,
    "isolatedModules": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@payload-config": [
        "./src/payload.config.ts"
      ],
      "react": [
        "./node_modules/@types/react"
      ],
      "@/*": [
        "./src/*"
      ],
    }
  },
  "include": [
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts",
    "redirects.js",
    "next.config.js",
    "next-sitemap.config.cjs"
  ],
  "exclude": [
    "node_modules",
    "dist" // Exclude dist
  ]
}
`;
};

export const generatePackageJson = (options: ScaffoldOptions): string => {
  const { projectName, description, database } = options;

  const dependencies: Record<string, string> = {
    "@payloadcms/admin-bar": "latest",
    "@payloadcms/live-preview-react": "latest",
    "@payloadcms/next": "latest",
    "@payloadcms/payload-cloud": "latest",
    "@payloadcms/plugin-form-builder": "latest",
    "@payloadcms/plugin-nested-docs": "latest",
    "@payloadcms/plugin-redirects": "latest",
    "@payloadcms/plugin-search": "latest",
    "@payloadcms/plugin-seo": "latest",
    "@payloadcms/richtext-lexical": "latest",
    "@payloadcms/ui": "latest",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-slot": "^1.0.2",
    "class-variance-authority": "^0.7.0",
    clsx: "^2.1.1",
    "cross-env": "^7.0.3",
    geist: "^1.3.0",
    graphql: "^16.8.2",
    "lucide-react": "^0.378.0",
    next: "15.2.3",
    "next-sitemap": "^4.2.3",
    payload: "latest",
    "prism-react-renderer": "^2.3.1",
    react: "19.0.0",
    "react-dom": "19.0.0",
    "react-hook-form": "7.45.4",
    sharp: "0.32.6",
    "tailwind-merge": "^2.3.0",
    "tailwindcss-animate": "^1.0.7",
  };

  if (database === "mongodb") {
    dependencies["@payloadcms/db-mongodb"] = "latest";
  } else {
    dependencies["@payloadcms/db-postgres"] = "latest";
  }

  const devDependencies: Record<string, string> = {
    "@eslint/eslintrc": "^3.2.0",
    "@tailwindcss/typography": "^0.5.13",
    "@types/escape-html": "^1.0.2",
    "@types/node": "22.5.4",
    "@types/react": "19.0.12",
    "@types/react-dom": "19.0.4",
    autoprefixer: "^10.4.19",
    copyfiles: "^2.4.1",
    eslint: "^9.16.0",
    "eslint-config-next": "15.2.3",
    postcss: "^8.4.38",
    prettier: "^3.4.2",
    tailwindcss: "^3.4.3",
    typescript: "5.7.3",
  };

  return JSON.stringify(
    {
      name: projectName,
      version: "1.0.0",
      description: description || "Website template for Payload",
      license: "MIT",
      type: "module",
      scripts: {
        build: "cross-env NODE_OPTIONS=--no-deprecation next build",
        postbuild: "next-sitemap --config next-sitemap.config.cjs",
        dev: "cross-env NODE_OPTIONS=--no-deprecation next dev",
        "dev:prod":
          "cross-env NODE_OPTIONS=--no-deprecation rm -rf .next && pnpm build && pnpm start",
        "generate:importmap":
          "cross-env NODE_OPTIONS=--no-deprecation payload generate:importmap",
        "generate:types":
          "cross-env NODE_OPTIONS=--no-deprecation payload generate:types",
        ii: "cross-env NODE_OPTIONS=--no-deprecation pnpm --ignore-workspace install",
        lint: "cross-env NODE_OPTIONS=--no-deprecation next lint",
        "lint:fix": "cross-env NODE_OPTIONS=--no-deprecation next lint --fix",
        payload: "cross-env NODE_OPTIONS=--no-deprecation payload",
        reinstall:
          "cross-env NODE_OPTIONS=--no-deprecation rm -rf node_modules && rm pnpm-lock.yaml && pnpm --ignore-workspace install",
        start: "cross-env NODE_OPTIONS=--no-deprecation next start",
      },
      dependencies,
      devDependencies,
      packageManager: "pnpm@10.3.0",
      engines: {
        node: "^18.20.2 || >=20.9.0",
      },
      pnpm: {
        onlyBuiltDependencies: ["sharp"],
      },
    },
    null,
    2,
  );
};

export const generateReadme = (options: ScaffoldOptions): string => {
  return `# Payload Website Template

This is the official [Payload Website Template](https://github.com/payloadcms/payload/blob/main/templates/website). Use it to power websites, blogs, or portfolios from small to enterprise. This repo includes a fully-working backend, enterprise-grade admin panel, and a beautifully designed, production-ready website.

This template is right for you if you are working on:

- A personal or enterprise-grade website, blog, or portfolio
- A content publishing platform with a fully featured publication workflow
- Exploring the capabilities of Payload

Core features:

- [Pre-configured Payload Config](#how-it-works)
- [Authentication](#users-authentication)
- [Access Control](#access-control)
- [Layout Builder](#layout-builder)
- [Draft Preview](#draft-preview)
- [Live Preview](#live-preview)
- [On-demand Revalidation](#on-demand-revalidation)
- [SEO](#seo)
- [Search](#search)
- [Redirects](#redirects)
- [Jobs and Scheduled Publishing](#jobs-and-scheduled-publish)
- [Website](#website)

## Quick Start

To spin up this example locally, follow these steps:

### Clone

If you have not done so already, you need to have standalone copy of this repo on your machine. If you've already cloned this repo, skip to [Development](#development).

#### Method 1 (recommended)

Go to Payload Cloud and [clone this template](https://payloadcms.com/new/clone/website). This will create a new repository on your GitHub account with this template's code which you can then clone to your own machine.

#### Method 2

Use the \`create-payload-app\` CLI to clone this template directly to your machine:

\`\`\`bash
pnpx create-payload-app my-project -t website
\`\`\`

#### Method 3

Use the \`git\` CLI to clone this template directly to your machine:

\`\`\`bash
git clone -n --depth=1 --filter=tree:0 https://github.com/payloadcms/payload my-project && cd my-project && git sparse-checkout set --no-cone templates/website && git checkout && rm -rf .git && git init && git add . && git mv -f templates/website/{.,}* . && git add . && git commit -m "Initial commit"
\`\`\`

### Development

1. First [clone the repo](#clone) if you have not done so already
1. \`cd ${options.projectName} && cp .env.example .env\` to copy the example environment variables
1. \`pnpm install && pnpm dev\` to install dependencies and start the dev server
1. open \`http://localhost:3000\` to open the app in your browser

That's it! Changes made in \`./src\` will be reflected in your app. Follow the on-screen instructions to login and create your first admin user. Then check out [Production](#production) once you're ready to build and serve your app, and [Deployment](#deployment) when you're ready to go live.

## How it works

The Payload config is tailored specifically to the needs of most websites. It is pre-configured in the following ways:

### Collections

See the [Collections](https://payloadcms.com/docs/configuration/collections) docs for details on how to extend this functionality.

- #### Users (Authentication)

  Users are auth-enabled collections that have access to the admin panel and unpublished content. See [Access Control](#access-control) for more details.

  For additional help, see the official [Auth Example](https://github.com/payloadcms/payload/tree/main/examples/auth) or the [Authentication](https://payloadcms.com/docs/authentication/overview#authentication-overview) docs.

- #### Posts

  Posts are used to generate blog posts, news articles, or any other type of content that is published over time. All posts are layout builder enabled so you can generate unique layouts for each post using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Posts are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Pages

  All pages are layout builder enabled so you can generate unique layouts for each page using layout-building blocks, see [Layout Builder](#layout-builder) for more details. Pages are also draft-enabled so you can preview them before publishing them to your website, see [Draft Preview](#draft-preview) for more details.

- #### Media

  This is the uploads enabled collection used by pages, posts, and projects to contain media like images, videos, downloads, and other assets. It features pre-configured sizes, focal point and manual resizing to help you manage your pictures.

- #### Categories

  A taxonomy used to group posts together. Categories can be nested inside of one another, for example "News > Technology". See the official [Payload Nested Docs Plugin](https://payloadcms.com/docs/plugins/nested-docs) for more details.

### Globals

See the [Globals](https://payloadcms.com/docs/configuration/globals) docs for details on how to extend this functionality.

- \`Header\`

  The data required by the header on your front-end like nav links.

- \`Footer\`

  Same as above but for the footer of your site.

## Access control

Basic access control is setup to limit access to various content based based on publishing status.

- \`users\`: Users can access the admin panel and create or edit content.
- \`posts\`: Everyone can access published posts, but only users can create, update, or delete them.
- \`pages\`: Everyone can access published pages, but only users can create, update, or delete them.

For more details on how to extend this functionality, see the [Payload Access Control](https://payloadcms.com/docs/access-control/overview#access-control) docs.

## Layout Builder

Create unique page layouts for any type of content using a powerful layout builder. This template comes pre-configured with the following layout building blocks:

- Hero
- Content
- Media
- Call To Action
- Archive

Each block is fully designed and built into the front-end website that comes with this template. See [Website](#website) for more details.

## Lexical editor

A deep editorial experience that allows complete freedom to focus just on writing content without breaking out of the flow with support for Payload blocks, media, links and other features provided out of the box. See [Lexical](https://payloadcms.com/docs/rich-text/overview) docs.

## Draft Preview

All posts and pages are draft-enabled so you can preview them before publishing them to your website. To do this, these collections use [Versions](https://payloadcms.com/docs/configuration/collections#versions) with \`drafts\` set to \`true\`. This means that when you create a new post, project, or page, it will be saved as a draft and will not be visible on your website until you publish it. This also means that you can preview your draft before publishing it to your website. To do this, we automatically format a custom URL which redirects to your front-end to securely fetch the draft version of your content.

Since the front-end of this template is statically generated, this also means that pages, posts, and projects will need to be regenerated as changes are made to published documents. To do this, we use an \`afterChange\` hook to regenerate the front-end when a document has changed and its \`_status\` is \`published\`.

For more details on how to extend this functionality, see the official [Draft Preview Example](https://github.com/payloadcms/payload/tree/examples/draft-preview).

## Live preview

In addition to draft previews you can also enable live preview to view your end resulting page as you're editing content with full support for SSR rendering. See [Live preview docs](https://payloadcms.com/docs/live-preview/overview) for more details.

## On-demand Revalidation

We've added hooks to collections and globals so that all of your pages, posts, or footer or header, change they will automatically be updated in the frontend via on-demand revalidation supported by Nextjs.

> Note: if an image has been changed, for example it's been cropped, you will need to republish the page it's used on in order to be able to revalidate the Nextjs image cache.

## SEO

This template comes pre-configured with the official [Payload SEO Plugin](https://payloadcms.com/docs/plugins/seo) for complete SEO control from the admin panel. All SEO data is fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Search

This template also pre-configured with the official [Payload Search Plugin](https://payloadcms.com/docs/plugins/search) to showcase how SSR search features can easily be implemented into Next.js with Payload. See [Website](#website) for more details.

## Redirects

If you are migrating an existing site or moving content to a new URL, you can use the \`redirects\` collection to create a proper redirect from old URLs to new ones. This will ensure that proper request status codes are returned to search engines and that your users are not left with a broken link. This template comes pre-configured with the official [Payload Redirects Plugin](https://payloadcms.com/docs/plugins/redirects) for complete redirect control from the admin panel. All redirects are fully integrated into the front-end website that comes with this template. See [Website](#website) for more details.

## Jobs and Scheduled Publish

We have configured [Scheduled Publish](https://payloadcms.com/docs/versions/drafts#scheduled-publish) which uses the [jobs queue](https://payloadcms.com/docs/jobs-queue/jobs) in order to publish or unpublish your content on a scheduled time. The tasks are run on a cron schedule and can also be run as a separate instance if needed.

> Note: When deployed on Vercel, depending on the plan tier, you may be limited to daily cron only.

## Website

This template includes a beautifully designed, production-ready front-end built with the [Next.js App Router](https://nextjs.org), served right alongside your Payload app in a instance. This makes it so that you can deploy both your backend and website where you need it.

Core features:

- [Next.js App Router](https://nextjs.org)
- [TypeScript](https://www.typescriptlang.org)
- [React Hook Form](https://react-hook-form.com)
- [Payload Admin Bar](https://github.com/payloadcms/payload/tree/main/packages/admin-bar)
- [TailwindCSS styling](https://tailwindcss.com/)
- [shadcn/ui components](https://ui.shadcn.com/)
- User Accounts and Authentication
- Fully featured blog
- Publication workflow
- Dark mode
- Pre-made layout building blocks
- SEO
- Search
- Redirects
- Live preview

### Cache

Although Next.js includes a robust set of caching strategies out of the box, Payload Cloud proxies and caches all files through Cloudflare using the [Official Cloud Plugin](https://www.npmjs.com/package/@payloadcms/payload-cloud). This means that Next.js caching is not needed and is disabled by default. If you are hosting your app outside of Payload Cloud, you can easily reenable the Next.js caching mechanisms by removing the \`no-store\` directive from all fetch requests in \`./src/app/_api\` and then removing all instances of \`export const dynamic = 'force-dynamic'\` from pages files, such as \`./src/app/(pages)/[slug]/page.tsx\`. For more details, see the official [Next.js Caching Docs](https://nextjs.org/docs/app/building-your-application/caching).

## Development

To spin up this example locally, follow the [Quick Start](#quick-start). Then [Seed](#seed) the database with a few pages, posts, and projects.

### Working with Postgres

Postgres and other SQL-based databases follow a strict schema for managing your data. In comparison to our MongoDB adapter, this means that there's a few extra steps to working with Postgres.

Note that often times when making big schema changes you can run the risk of losing data if you're not manually migrating it.

#### Local development

Ideally we recommend running a local copy of your database so that schema updates are as fast as possible. By default the Postgres adapter has \`push: true\` for development environments. This will let you add, modify and remove fields and collections without needing to run any data migrations.

If your database is pointed to production you will want to set \`push: false\` otherwise you will risk losing data or having your migrations out of sync.

#### Migrations

[Migrations](https://payloadcms.com/docs/database/migrations) are essentially SQL code versions that keeps track of your schema. When deploy with Postgres you will need to make sure you create and then run your migrations.

Locally create a migration

\`\`\`bash
pnpm payload migrate:create
\`\`\`

This creates the migration files you will need to push alongside with your new configuration.

On the server after building and before running \`pnpm start\` you will want to run your migrations

\`\`\`bash
pnpm payload migrate
\`\`\`

This command will check for any migrations that have not yet been run and try to run them and it will keep a record of migrations that have been run in the database.

### Docker

Alternatively, you can use [Docker](https://www.docker.com) to spin up this template locally. To do so, follow these steps:

1. Follow [steps 1 and 2 from above](#development), the docker-compose file will automatically use the \`.env\` file in your project root
1. Next run \`docker-compose up\`
1. Follow [steps 4 and 5 from above](#development) to login and create your first admin user

That's it! The Docker instance will help you get up and running quickly while also standardizing the development environment across your teams.

### Seed

To seed the database with a few pages, posts, and projects you can click the 'seed database' link from the admin panel.

The seed script will also create a demo user for demonstration purposes only:

- Demo Author
  - Email: \`demo-author@payloadcms.com\`
  - Password: \`password\`

> NOTICE: seeding the database is destructive because it drops your current database to populate a fresh one from the seed template. Only run this command if you are starting a new project or can afford to lose your current data.

## Production

To run Payload in production, you need to build and start the Admin panel. To do so, follow these steps:

1. Invoke the \`next build\` script by running \`pnpm build\` or \`npm run build\` in your project root. This creates a \`.next\` directory with a production-ready admin bundle.
1. Finally run \`pnpm start\` or \`npm run start\` to run Node in production and serve Payload from the \`.build\` directory.
1. When you're ready to go live, see Deployment below for more details.

### Deploying to Payload Cloud

The easiest way to deploy your project is to use [Payload Cloud](https://payloadcms.com/new/import), a one-click hosting solution to deploy production-ready instances of your Payload apps directly from your GitHub repo.

### Deploying to Vercel

This template can also be deployed to Vercel for free. You can get started by choosing the Vercel DB adapter during the setup of the template or by manually installing and configuring it:

\`\`\`bash
pnpm add @payloadcms/db-vercel-postgres
\`\`\`

\`\`\`ts
// payload.config.ts
import { vercelPostgresAdapter } from '@payloadcms/db-vercel-postgres'

export default buildConfig({
  // ...
  db: vercelPostgresAdapter({
    pool: {
      connectionString: process.env.POSTGRES_URL || '',
    },
  }),
  // ...
\`\`\`

We also support Vercel's blob storage:

\`\`\`bash
pnpm add @payloadcms/storage-vercel-blob
\`\`\`

\`\`\`ts
// payload.config.ts
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob'

export default buildConfig({
  // ...
  plugins: [
    vercelBlobStorage({
      collections: {
        [Media.slug]: true,
      },
      token: process.env.BLOB_READ_WRITE_TOKEN || '',
    }),
  ],
  // ...
\`\`\`

There is also a simplified [one click deploy](https://github.com/payloadcms/payload/tree/templates/with-vercel-postgres) to Vercel should you need it.

### Self-hosting

Before deploying your app, you need to:

1. Ensure your app builds and serves in production. See [Production](#production) for more details.
2. You can then deploy Payload as you would any other Node.js or Next.js application either directly on a VPS, DigitalOcean's Apps Platform, via Coolify or more. More guides coming soon.

You can also deploy your app manually, check out the [deployment documentation](https://payloadcms.com/docs/production/deployment) for full details.

## Questions

If you have any issues or questions, reach out to us on [Discord](https://discord.com/invite/payload) or start a [GitHub discussion](https://github.com/payloadcms/payload/discussions).
`;
};

export const generateNextConfig = (): string => {
  return `import { withPayload } from '@payloadcms/next/withPayload'

import redirects from './redirects.js'

const NEXT_PUBLIC_SERVER_URL = process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? \`https://\${process.env.VERCEL_PROJECT_PRODUCTION_URL}\`
  : undefined || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL /* 'https://example.com' */].filter(Boolean).map((item) => {
        const url = new URL(item)

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(':', ''),
        }
      }),
    ],
  },
  reactStrictMode: true,
  redirects,
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
`;
};

export const generateNextSitemapConfig = (): string => {
  return `const SITE_URL =
  process.env.NEXT_PUBLIC_SERVER_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  'https://example.com'

/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: SITE_URL,
  generateRobotsTxt: true,
  exclude: ['/posts-sitemap.xml', '/pages-sitemap.xml', '/*', '/posts/*'],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        disallow: '/admin/*',
      },
    ],
    additionalSitemaps: [\`\${SITE_URL}/pages-sitemap.xml\`, \`\${SITE_URL}/posts-sitemap.xml\`],
  },
}
`;
};

export const generateTailwindConfig = (): string => {
  return `import tailwindcssAnimate from 'tailwindcss-animate'
import typography from '@tailwindcss/typography'

/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  darkMode: ['selector', '[data-theme="dark"]'],
  plugins: [tailwindcssAnimate, typography],
  prefix: '',
  safelist: [
    'lg:col-span-4',
    'lg:col-span-6',
    'lg:col-span-8',
    'lg:col-span-12',
    'border-border',
    'bg-card',
    'border-error',
    'bg-error/30',
    'border-success',
    'bg-success/30',
    'border-warning',
    'bg-warning/30',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        '2xl': '2rem',
        DEFAULT: '1rem',
        lg: '2rem',
        md: '2rem',
        sm: '1rem',
        xl: '2rem',
      },
      screens: {
        '2xl': '86rem',
        lg: '64rem',
        md: '48rem',
        sm: '40rem',
        xl: '80rem',
      },
    },
    extend: {
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        background: 'hsl(var(--background))',
        border: 'hsla(var(--border))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        foreground: 'hsl(var(--foreground))',
        input: 'hsl(var(--input))',
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        ring: 'hsl(var(--ring))',
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        success: 'hsl(var(--success))',
        error: 'hsl(var(--error))',
        warning: 'hsl(var(--warning))',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)'],
        sans: ['var(--font-geist-sans)'],
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      typography: () => ({
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--text)',
              h1: {
                fontWeight: 'normal',
                marginBottom: '0.25em',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      }),
    },
  },
}

export default config
`;
};

export const generatePostcssConfig = (): string => {
  return `const config = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

export default config
`;
};

export const generateEslintConfig = (): string => {
  return `import { dirname } from 'path'
import { fileURLToPath } from 'url'
import { FlatCompat } from '@eslint/eslintrc'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      '@typescript-eslint/ban-ts-comment': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: false,
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          destructuredArrayIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^(_|ignore)',
        },
      ],
    },
  },
  {
    ignores: ['.next/'],
  },
]

export default eslintConfig
`;
};

export const generateComponentsJson = (): string => {
  return `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.mjs",
    "css": "src/app/(frontend)/globals.css",
    "baseColor": "slate",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/utilities/ui"
  }
}`;
};

export const generateRedirectsJs = (): string => {
  return `const redirects = async () => {
  const internetExplorerRedirect = {
    destination: '/ie-incompatible.html',
    has: [
      {
        type: 'header',
        key: 'user-agent',
        value: '(.*Trident.*)', // all ie browsers
      },
    ],
    permanent: false,
    source: '/:path((?!ie-incompatible.html$).*)', // all pages except the incompatibility page
  }

  const redirects = [internetExplorerRedirect]

  // NOTE: you might want to fetch redirects from Payload Cloud here

  return redirects
}

export default redirects
`;
};

export const generatePayloadConfig = (options: ScaffoldOptions): string => {
  const {
    projectName,
    database,
    collections = [],
    globals = [],
    admin,
    plugins = [],
  } = options;
  const authEnabled = options.authentication !== false;

  const collectionImportStatements = collections
    .map(
      (c: CollectionConfig) =>
        `import { ${c.slug.replace(/-/g, "_")}Collection } from './collections/${c.slug}';`,
    )
    .join("\n");

  const globalImportStatements = globals
    .map(
      (g: GlobalConfig) =>
        `import { ${g.slug}Global } from './globals/${g.slug}';`,
    )
    .join("\n");

  const pluginImportsAndVars = plugins.map(
    (plugin: string | PluginConfig, i: number) => {
      const pkgName = typeof plugin === "string" ? plugin : plugin.package;
      const pluginVarName = `${camelToKebabCase(pkgName).replace(/[^a-zA-Z0-9]/g, "")}Plugin${i}`;
      return {
        importStatement: `import ${pluginVarName} from '${pkgName}';`,
        varName: pluginVarName,
        config: typeof plugin === "object" ? plugin.options : undefined,
      };
    },
  );

  const pluginImportStatements = pluginImportsAndVars
    .map((p: { importStatement: string }) => p.importStatement)
    .join("\n");

  const pluginsArrayString = pluginImportsAndVars
    .map(
      (p: { varName: string; config?: Record<string, any> }) =>
        `${p.varName}(${p.config ? JSON.stringify(p.config, null, 2) : ""})`,
    )
    .join(",\n    ");

  const collectionsArray = [
    ...(authEnabled ? ["Users", "Media"] : []),
    ...collections.map(
      (c: CollectionConfig) => `${c.slug.replace(/-/g, "_")}Collection`,
    ),
  ];
  const collectionsArrayString = collectionsArray.join(",\n    ");

  const globalsArray = [
    ...(globals.some((g: GlobalConfig) => g.slug === "Header")
      ? []
      : [{ slug: "Header" }]),
    ...(globals.some((g: GlobalConfig) => g.slug === "Footer")
      ? []
      : [{ slug: "Footer" }]),
    ...globals,
  ].map((g: { slug: string }) => `${g.slug}Global`);
  const globalsArrayString = globalsArray.join(",\n    ");

  return `// storage-adapter-import-placeholder
${database === "postgres" ? `import { postgresAdapter } from '@payloadcms/db-postgres';` : `import { mongooseAdapter } from '@payloadcms/db-mongodb';`}
import sharp from 'sharp'; // sharp-import
import path from 'path';
import { buildConfig, PayloadRequest } from 'payload';
import { fileURLToPath } from 'url';

// Import collections & globals
${authEnabled ? `import { Users } from './collections/Users';\\nimport { Media } from './collections/Media';` : ""}
${collectionImportStatements}
${globalImportStatements}
// Import default globals explicitly if needed
import { Header } from './globals/Header/config'; // Assuming path
import { Footer } from './globals/Footer/config'; // Assuming path

// Import plugins
${pluginImportStatements}

import { defaultLexical } from '@/fields/defaultLexical'; // Assuming path exists
import { getServerSideURL } from './utilities/getURL'; // Assuming path exists

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: ${authEnabled ? `'users'` : "undefined"},
    components: {
      // Defaults from template
      beforeLogin: ['@/components/BeforeLogin'],
      beforeDashboard: ['@/components/BeforeDashboard'],
      // Add more components from options if provided
      ${admin?.components ? JSON.stringify(admin.components, null, 6).replace(/"/g, "'").slice(1, -1) + "," : ""}
    },
    importMap: {
      baseDir: path.resolve(dirname), // Necessary for custom components
    },
    livePreview: { // Default live preview config from template
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 375, height: 667 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
      // url: ({ data, collection, locale, req }) => ..., // Needs implementation based on template utils
    },
    meta: { // Default meta from template
      titleSuffix: '- ${projectName}',
      favicon: '/favicon.ico',
      ogImage: '/website-template-OG.webp',
      // Add more meta from options if provided
      ${admin?.meta ? JSON.stringify(admin.meta, null, 6).replace(/"/g, "'").slice(1, -1) : ""}
    },
    css: path.resolve(dirname, '../src/app/(payload)/custom.scss'), // Path from template structure
  },
  editor: defaultLexical, // Default editor from template
  db: ${
    database === "postgres"
      ? `postgresAdapter({ pool: { connectionString: process.env.DATABASE_URI || '' } })`
      : `mongooseAdapter({ url: process.env.DATABASE_URI || '' })`
  },
  collections: [
    ${collectionsArrayString}
  ],
  cors: [getServerSideURL()].filter(Boolean), // Basic CORS based on template
  globals: [
    Header, // Default Header global
    Footer, // Default Footer global
    ${globals.map((g: GlobalConfig) => `${g.slug}Global`).join(",\n    ")} // Add user-defined globals
  ],
  plugins: [
    ${pluginsArrayString}
    // storage-adapter-placeholder
  ],
  secret: process.env.PAYLOAD_SECRET || 'REPLACE_WITH_STRONG_SECRET', // Added fallback reminder
  sharp,
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  graphQL: {
     schemaOutputFile: path.resolve(dirname, 'generated-schema.graphql'),
  },
  // Optional config from options
  ${options.rateLimit ? `rateLimit: ${JSON.stringify(options.rateLimit, null, 2)},` : ""}
  ${options.i18n ? `localization: ${JSON.stringify(options.i18n, null, 2)},` : ""}
  ${options.email ? `email: ${JSON.stringify(options.email, null, 2)},` : ""}
  // Jobs Queue Config from Template (Basic)
  jobs: {
    access: {
      run: ({ req }: { req: PayloadRequest }): boolean => {
        if (req.user) return true;
        const authHeader = req.headers.get('authorization');
        return authHeader === \`Bearer \${process.env.CRON_SECRET}\`;
      },
    },
    tasks: [], // Add tasks here if needed
  },
});
`;
};

export const generateCollectionTemplate = (
  collection: CollectionConfig,
  options: ScaffoldOptions,
): string => {
  const {
    slug,
    admin,
    access,
    fields,
    timestamps,
    versions,
    auth,
    upload,
    hooks,
    endpoints,
    indexes,
    defaultSort,
    dbName,
    labels,
    forceSelect,
    lockDocuments,
    graphQL,
    custom,
  } = collection;

  let code = `import type { CollectionConfig } from 'payload';\n`;

  const accessImports = new Set<string>();
  if (access) {
    Object.values(access).forEach((val) => {
      if (typeof val === "string" && /^[a-zA-Z0-9_]+$/.test(val)) {
        accessImports.add(val);
      }
    });
  }
  accessImports.forEach((fnName) => {
    code += `import { ${fnName} } from '../access/${fnName}.js'; // Adjust path as needed, Added .js extension\n`;
  });

  let slugSourceField = "title";
  let needsSlugImport = false;
  if (fields.some((f: FieldConfig) => f.name === "slug")) {
    needsSlugImport = true;
    const titleField = fields.find((f: FieldConfig) => f.name === "title");
    if (!titleField) {
      const firstTextField = fields.find(
        (f: FieldConfig) => f.type === "text" && f.name !== "slug",
      );
      if (firstTextField) slugSourceField = firstTextField.name;
    }
    code += `import { slugField } from '@/fields/slug'; // Assuming path from template\n`;
  }

  code += `\nexport const ${slug.replace(/-/g, "_")}Collection: CollectionConfig = {
  slug: '${slug}',
`;

  if (labels) {
    code += `  labels: ${JSON.stringify(labels)},
`;
  } else {
    const singularLabel = slug
      .split("-")
      .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    const pluralLabel = singularLabel.endsWith("y")
      ? singularLabel.slice(0, -1) + "ies"
      : singularLabel + "s";
    code += `  labels: { singular: '${singularLabel}', plural: '${pluralLabel}' },
`;
  }

  if (admin) {
    code += `  admin: {
`;
    if (admin.useAsTitle)
      code += `    useAsTitle: '${admin.useAsTitle}',
`;
    if (admin.defaultColumns)
      code += `    defaultColumns: ${JSON.stringify(admin.defaultColumns)},
`;
    if (admin.listSearchableFields)
      code += `    listSearchableFields: ${JSON.stringify(admin.listSearchableFields)},
`;
    if (admin.description)
      code += `    description: ${typeof admin.description === "function" ? (admin.description as Function).toString() : `'${admin.description}'`},
`;
    if (admin.group)
      code += `    group: ${typeof admin.group === "boolean" ? admin.group : `'${admin.group}'`},
`;
    if (admin.hidden)
      code += `    hidden: ${typeof admin.hidden === "function" ? admin.hidden.toString() : admin.hidden},
`;
    if (admin.disableCopyToLocale)
      code += `    disableCopyToLocale: ${admin.disableCopyToLocale},
`;
    if (admin.hideAPIURL)
      code += `    hideAPIURL: ${admin.hideAPIURL},
`;
    if (admin.preview)
      code += `    preview: ${stringifyFunction(admin.preview)},
`;
    if (admin.livePreview)
      code += `    livePreview: ${JSON.stringify(admin.livePreview, null, 6)},
`;
    if (admin.components)
      code += `    components: ${JSON.stringify(admin.components).replace(/"/g, "'")},
`;
    if (admin.pagination)
      code += `    pagination: ${JSON.stringify(admin.pagination)},
`;
    if (admin.baseListFilter)
      code += `    baseListFilter: ${JSON.stringify(admin.baseListFilter)},
`;
    if (admin.disableDuplicate)
      code += `    disableDuplicate: ${admin.disableDuplicate},
`;
    if (admin.initCollapsed)
      code += `    initCollapsed: ${admin.initCollapsed},
`;
    code += `  },
`;
  }

  if (access) {
    code += `  access: {
`;
    Object.entries(access).forEach(([key, value]) => {
      code += `    ${key}: ${stringifyFunction(value as any, "() => false")},
`;
    });
    code += `  },
`;
  }

  code += `  fields: [
`;
  let slugFieldAdded = false;
  fields.forEach((field: FieldConfig) => {
    if (field.name === "slug" && needsSlugImport) {
      code += `    ...slugField('${slugSourceField}'),
`;
      slugFieldAdded = true;
    } else if (!slugFieldAdded || field.name !== "slugLock") {
      code += `    ${generateFieldConfig(field, 4)},
`;
    }
  });
  code += `  ],
`;

  if (timestamps !== false)
    code += `  timestamps: true,
`;

  if (versions) {
    if (typeof versions === "boolean") {
      code += `  versions: { drafts: { autosave: { interval: 100 }, schedulePublish: true }, maxPerDoc: 50 },
`;
    } else {
      code += `  versions: ${JSON.stringify(versions, null, 2)},
`;
    }
  }

  if (auth) {
    if (typeof auth === "boolean") {
      code += `  auth: true, // Add default auth options if needed
`;
    } else {
      code += `  auth: ${JSON.stringify(auth, null, 2)}, // Stringify detailed auth config
`;
    }
  }

  if (upload) {
    if (typeof upload === "boolean") {
      code += `  upload: { /* Add default upload options if needed */ },
`;
    } else {
      code += `  upload: ${JSON.stringify(
        upload,
        (_key, value) => {
          if (typeof value === "function") return value.toString();
          return value;
        },
        2,
      )},
`;
    }
  }

  if (hooks && Object.keys(hooks).length > 0) {
    code += `  hooks: {
`;
    Object.entries(hooks).forEach(([hookName, hookArray]) => {
      if (Array.isArray(hookArray)) {
        code += `    ${hookName}: [
`;
        hookArray.forEach(
          (hookFn) =>
            (code += `      ${stringifyFunction(hookFn as any)},
`),
        );
        code += `    ],
`;
      }
    });
    code += `  },
`;
  }

  if (endpoints === false) {
    code += `  endpoints: false,
`;
  } else if (endpoints && endpoints.length > 0) {
    code += `  endpoints: [
`;
    endpoints.forEach((endpoint: any) => {
      code += `    {
`;
      code += `      path: '${endpoint.path}',
`;
      code += `      method: '${endpoint.method}',
`;
      code += `      handler: ${stringifyFunction(endpoint.handler as any)},
`;
      if (endpoint.root)
        code += `      root: ${endpoint.root},
`;
      if (endpoint.custom)
        code += `      custom: ${JSON.stringify(endpoint.custom)},
`;
      code += `    },
`;
    });
    code += `  ],
`;
  }

  if (indexes)
    code += `  indexes: ${JSON.stringify(indexes, null, 2)},
`;
  if (defaultSort)
    code += `  defaultSort: '${defaultSort}',
`;
  if (dbName)
    code += `  dbName: '${dbName}',
`;
  if (forceSelect)
    code += `  forceSelect: ${JSON.stringify(forceSelect)},
`;
  if (lockDocuments !== undefined)
    code += `  lockDocuments: ${typeof lockDocuments === "boolean" ? lockDocuments : JSON.stringify(lockDocuments)},
`;
  if (graphQL !== undefined)
    code += `  graphQL: ${typeof graphQL === "boolean" ? graphQL : JSON.stringify(graphQL)},
`;
  if (custom)
    code += `  custom: ${JSON.stringify(custom, null, 2)},
`;

  code = code.replace(/,\\n$/, "\\n");

  code += `};
`;

  return code;
};

export const generateGlobalTemplate = (
  global: GlobalConfig,
  options: ScaffoldOptions,
): string => {
  const {
    slug,
    admin,
    access,
    fields,
    versions,
    hooks,
    endpoints,
    graphQL,
    typescript: tsInterface,
    custom,
    labels,
    dbName,
  } = global;

  let code = `import type { GlobalConfig } from 'payload';
`;

  const accessImports = new Set<string>();
  if (access) {
    Object.values(access).forEach((val) => {
      if (typeof val === "string" && /^[a-zA-Z0-9_]+$/.test(val)) {
        accessImports.add(val);
      }
    });
  }
  accessImports.forEach((fnName) => {
    code += `import { ${fnName} } from '../access/${fnName}.js'; // Adjust path as needed, Added .js extension\n`;
  });

  code += `
export const ${slug}Global: GlobalConfig = {
  slug: '${slug}',
`;

  if (labels) {
    code += `  labels: ${JSON.stringify(labels)},
`;
  }

  if (admin) {
    code += `  admin: {
`;
    if (admin.description)
      code += `    description: ${typeof admin.description === "function" ? (admin.description as Function).toString() : `'${admin.description}'`},
`;
    if (admin.group)
      code += `    group: ${typeof admin.group === "boolean" ? admin.group : `'${admin.group}'`},
`;
    if (admin.hidden)
      code += `    hidden: ${typeof admin.hidden === "function" ? admin.hidden.toString() : admin.hidden},
`;
    if (admin.preview)
      code += `    preview: ${stringifyFunction(admin.preview)},
`;
    if (admin.livePreview)
      code += `    livePreview: ${JSON.stringify(admin.livePreview, null, 6)},
`;
    if (admin.components)
      code += `    components: ${JSON.stringify(admin.components).replace(/"/g, "'")},
`;
    code += `  },
`;
  }

  if (access) {
    code += `  access: {
`;
    Object.entries(access).forEach(([key, value]) => {
      code += `    ${key}: ${stringifyFunction(value as any, "() => false")},
`;
    });
    code += `  },
`;
  }

  code += `  fields: [
`;
  fields.forEach((field: FieldConfig) => {
    code += `    ${generateFieldConfig(field, 4)},
`;
  });
  code += `  ],
`;

  if (versions) {
    if (typeof versions === "boolean") {
      code += `  versions: { drafts: { autosave: { interval: 100 } }, max: 20 },
`;
    } else {
      code += `  versions: ${JSON.stringify(versions, null, 2)},
`;
    }
  }

  if (hooks && Object.keys(hooks).length > 0) {
    code += `  hooks: {
`;
    Object.entries(hooks).forEach(([hookName, hookArray]) => {
      if (Array.isArray(hookArray)) {
        code += `    ${hookName}: [
`;
        hookArray.forEach(
          (hookFn) =>
            (code += `      ${stringifyFunction(hookFn as any)},
`),
        );
        code += `    ],
`;
      }
    });
    code += `  },
`;
  }

  if (endpoints === false) {
    code += `  endpoints: false,
`;
  } else if (endpoints && endpoints.length > 0) {
    code += `  endpoints: [
`;
    endpoints.forEach((endpoint: any) => {
      code += `    {
`;
      code += `      path: '${endpoint.path}',
`;
      code += `      method: '${endpoint.method}',
`;
      code += `      handler: ${stringifyFunction(endpoint.handler as any)},
`;
      if (endpoint.root)
        code += `      root: ${endpoint.root},
`;
      if (endpoint.custom)
        code += `      custom: ${JSON.stringify(endpoint.custom)},
`;
      code += `    },
`;
    });
    code += `  ],
`;
  }

  if (graphQL !== undefined)
    code += `  graphQL: ${typeof graphQL === "boolean" ? graphQL : JSON.stringify(graphQL)},
`;
  if (tsInterface)
    code += `  typescript: ${JSON.stringify(tsInterface)},
`;
  if (custom)
    code += `  custom: ${JSON.stringify(custom, null, 2)},
`;
  if (dbName)
    code += `  dbName: '${dbName}',
`;

  code = code.replace(/,\\n$/, "\\n");

  code += `};
`;

  return code;
};

export const generateBlockTemplate = (
  block: BlockConfig,
  options: ScaffoldOptions,
): { config: string; component?: string } => {
  const { typescript } = options;
  const {
    slug,
    fields,
    imageURL,
    imageAltText,
    labels,
    interfaceName,
    graphQL,
    admin,
    custom,
  } = block;
  const pascalSlug = slug
    .split("-")
    .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");

  const interfaceNameToUse = interfaceName || `${pascalSlug}Block`;

  let configFile = `import type { Block } from 'payload';\n`;
  configFile += `import type { FieldConfig } from '../types';
`;
  configFile += `import { generateFieldConfig } from '../templates'; // Assuming templates.ts contains it


`;

  configFile += `export const ${pascalSlug}: Block = {
  slug: '${slug}',
`;
  if (imageURL)
    configFile += `  imageURL: '${imageURL}',
`;
  if (imageAltText)
    configFile += `  imageAltText: '${imageAltText}',
`;
  if (interfaceNameToUse)
    configFile += `  interfaceName: '${interfaceNameToUse}',
`;

  const singularLabel =
    labels?.singular ||
    slug
      .split("-")
      .map((w: string) => w[0].toUpperCase() + w.slice(1))
      .join(" ");
  const pluralLabel = labels?.plural || singularLabel + "s";
  configFile += `  labels: { singular: '${singularLabel}', plural: '${pluralLabel}' },
`;

  if (graphQL)
    configFile += `  graphQL: ${JSON.stringify(graphQL, null, 2)},
`;
  if (custom)
    configFile += `  custom: ${JSON.stringify(custom, null, 2)},
`;

  if (admin) {
    configFile += `  admin: {
`;
    if (admin.description)
      configFile += `    description: '${admin.description}',
`;
    if (admin.group)
      configFile += `    group: '${admin.group}',
`;
    if (admin.initCollapsed)
      configFile += `    initCollapsed: ${admin.initCollapsed},
`;
    if ((admin as any).components)
      configFile += `    components: ${JSON.stringify((admin as any).components).replace(/"/g, "'")},
`;
    configFile += `  },
`;
  }

  configFile += `  fields: [
`;
  if (Array.isArray(fields) && fields.length > 0) {
    fields.forEach((field: FieldConfig) => {
      configFile += `    ${generateFieldConfig(field, 4)},
`;
    });
  }
  configFile += `  ],
`;

  configFile = configFile.replace(/,\\n$/, "\\n");
  configFile += `};
`;

  let componentFile: string | undefined = undefined;
  componentFile = `import React from 'react';
`;
  if (typescript) {
    componentFile += `import type { ${interfaceNameToUse} } from '@/payload-types'; // Adjust path
`;
    componentFile += `import type { Page } from '@/payload-types'; // Example import if block is used in Page

`;
    componentFile += `// Combine block type with potential parent layout type if needed
`;
    componentFile += `type Props = Extract<Page['layout'][0], { blockType: '${slug}' }> & {
  id?: string;
  className?: string;
  // Add any other props your component might need
}
`;
  } else {
    componentFile += `// type Props = Record<string, any> & { id?: string; className?: string; }
`;
  }

  componentFile += `
export const ${pascalSlug}BlockComponent: React.FC<Props> = (props) => {
`;
  const fieldNames = fields.map((f: FieldConfig) => f.name).join(", ");
  componentFile += `  const { id, className${fieldNames ? ", " + fieldNames : ""} } = props;

`;

  componentFile += `  return (`;
  componentFile += `    <div className={className} id={\`block-\${id}\`}>`;
  componentFile += `      {/* Container usually handled by RenderBlocks */}`;
  componentFile += `      <h2>\${singularLabel} Block (ID: {id})</h2>`;
  componentFile += `      {/* Example: {title && <h3>{title}</h3>} */}`;
  componentFile += `      {/* Example: {richText && <RichText data={richText} />} */}`;
  componentFile += `      {/* <pre>{JSON.stringify({ \${fieldNames} }, null, 2)}</pre> */}`;
  componentFile += `    </div>`;
  componentFile += `  );`;
  componentFile += `};`;

  return {
    config: configFile,
    component: componentFile,
  };
};

export const generateFieldConfig = (
  field: FieldConfig,
  indent: number = 0,
): string => {
  const indentation = " ".repeat(indent);
  let result = `{`;

  result += `\n${indentation}  name: '${field.name}',`;
  result += `\n${indentation}  type: '${field.type}',`;
  if (field.label !== undefined) {
    result += `\n${indentation}  label: ${field.label === false ? "false" : `'${field.label}'`},`;
  }
  if (field.required) result += `\n${indentation}  required: true,`;
  if (field.unique) result += `\n${indentation}  unique: true,`;
  if (field.localized) result += `\n${indentation}  localized: true,`;
  if (field.index) result += `\n${indentation}  index: true,`;
  if (field.saveToJWT) result += `\n${indentation}  saveToJWT: true,`;
  if (field.hidden) result += `\n${indentation}  hidden: true,`;
  if (field.defaultValue !== undefined) {
    const defaultValueString =
      typeof field.defaultValue === "function"
        ? field.defaultValue.toString()
        : JSON.stringify(field.defaultValue);
    result += `\n${indentation}  defaultValue: ${defaultValueString},`;
  }

  switch (field.type) {
    case "text":
    case "textarea":
      if ("minLength" in field && field.minLength !== undefined)
        result += `\n${indentation}  minLength: ${field.minLength},`;
      if ("maxLength" in field && field.maxLength !== undefined)
        result += `\n${indentation}  maxLength: ${field.maxLength},`;
      if ("hasMany" in field && field.hasMany) {
        result += `\n${indentation}  hasMany: true,`;
        if ("minRows" in field && field.minRows !== undefined)
          result += `\n${indentation}  minRows: ${field.minRows},`;
        if ("maxRows" in field && field.maxRows !== undefined)
          result += `\n${indentation}  maxRows: ${field.maxRows},`;
      }
      break;
    case "number":
      if ("min" in field && field.min !== undefined)
        result += `\n${indentation}  min: ${field.min},`;
      if ("max" in field && field.max !== undefined)
        result += `\n${indentation}  max: ${field.max},`;
      if ("hasMany" in field && field.hasMany) {
        result += `\n${indentation}  hasMany: true,`;
        if ("minRows" in field && field.minRows !== undefined)
          result += `\n${indentation}  minRows: ${field.minRows},`;
        if ("maxRows" in field && field.maxRows !== undefined)
          result += `\n${indentation}  maxRows: ${field.maxRows},`;
      }
      break;
    case "select":
      if ("options" in field && field.options) {
        result += `\n${indentation}  options: ${JSON.stringify(field.options, null, 2)},`;
      }
      if ("hasMany" in field && field.hasMany)
        result += `\n${indentation}  hasMany: true,`;
      break;
    case "radio":
      if ("options" in field && field.options) {
        result += `\n${indentation}  options: ${JSON.stringify(field.options, null, 2)},`;
      }
      break;
    case "multiselect" as any:
      if ("options" in field && field.options) {
        result += `\n${indentation}  options: ${JSON.stringify((field as any).options, null, 2)},`;
      }
      if ("hasMany" in field) result += `\n${indentation}  hasMany: true,`;
      break;
    case "relationship":
    case "upload":
      if ("relationTo" in field && field.relationTo) {
        const relationToString = Array.isArray(field.relationTo)
          ? JSON.stringify(field.relationTo)
          : `'${field.relationTo}'`;
        result += `\n${indentation}  relationTo: ${relationToString},`;
      }
      if ("hasMany" in field && field.hasMany) {
        result += `\n${indentation}  hasMany: true,`;
        if ("minRows" in field && field.minRows !== undefined)
          result += `\n${indentation}  minRows: ${field.minRows},`;
        if ("maxRows" in field && field.maxRows !== undefined)
          result += `\n${indentation}  maxRows: ${field.maxRows},`;
      }
      if ("filterOptions" in field && field.filterOptions) {
        result += `\n${indentation}  filterOptions: ${JSON.stringify(field.filterOptions)},`;
      }
      if ("maxDepth" in field && field.maxDepth !== undefined)
        result += `\n${indentation}  maxDepth: ${field.maxDepth},`;
      break;
    case "array":
    case "group":
    case "row":
    case "collapsible":
      if ("fields" in field && field.fields && field.fields.length > 0) {
        result += `\n${indentation}  fields: [`;
        result += field.fields
          .map(
            (subField: FieldConfig) =>
              `\n${indentation}    ${generateFieldConfig(subField, indent + 4)}`,
          )
          .join(",");
        result += `\n${indentation}  ],`;
      }
      if ("labels" in field && field.labels)
        result += `\n${indentation}  labels: ${JSON.stringify(field.labels)},`;
      if ("interfaceName" in field && field.interfaceName)
        result += `\n${indentation}  interfaceName: '${field.interfaceName}',`;
      if ("dbName" in field && field.dbName)
        result += `\n${indentation}  dbName: '${field.dbName}',`;
      if ("minRows" in field && field.minRows !== undefined)
        result += `\n${indentation}  minRows: ${field.minRows},`;
      if ("maxRows" in field && field.maxRows !== undefined)
        result += `\n${indentation}  maxRows: ${field.maxRows},`;
      break;
    case "blocks":
      if ("blocks" in field && field.blocks && field.blocks.length > 0) {
        result += `\n${indentation}  blocks: [ // Assuming blocks are imported vars like 'CtaBlock', 'ContentBlock'`;
        result += field.blocks
          .map(
            (block: BlockConfig) =>
              `\n${indentation}    ${block.slug} // Use block variable name`,
          )
          .join(",");
        result += `\n${indentation}  ],`;
      }
      if ("minRows" in field && field.minRows !== undefined)
        result += `\n${indentation}  minRows: ${field.minRows},`;
      if ("maxRows" in field && field.maxRows !== undefined)
        result += `\n${indentation}  maxRows: ${field.maxRows},`;
      if ("labels" in field && field.labels)
        result += `\n${indentation}  labels: ${JSON.stringify(field.labels)},`;
      break;
    case "tabs":
      if ("tabs" in field && field.tabs && field.tabs.length > 0) {
        result += `\n${indentation}  tabs: [`;
        result += field.tabs
          .map(
            (tab: any) => `\n${indentation}    {
${indentation}      label: '${tab.label}',
${tab.name ? `${indentation}      name: '${tab.name}',\n` : ""}${tab.description ? `${indentation}      description: '${tab.description}',\n` : ""}${tab.interfaceName ? `${indentation}      interfaceName: '${tab.interfaceName}',\n` : ""}${indentation}      fields: [${tab.fields.map((f: FieldConfig) => `\n${indentation}        ${generateFieldConfig(f, indent + 8)}`).join(",")}\n${indentation}      ]
${indentation}    }`,
          )
          .join(",");
        result += `\n${indentation}  ],`;
      }
      break;
    case "richText":
      if ("editor" in field && field.editor)
        result += `\n${indentation}  editor: {}, // Usually defined globally or imported`;
      break;
    case "code":
      if ("language" in field && field.language)
        result += `\n${indentation}  language: '${field.language}',`;
      break;
    case "json":
      if ("jsonSchema" in field && field.jsonSchema)
        result += `\n${indentation}  jsonSchema: ${JSON.stringify(field.jsonSchema, null, 2)},`;
      break;
    case "date":
      break;
    case "point":
      break;
    case "ui":
      break;
    default:
      break;
  }

  if (field.admin && Object.keys(field.admin).length > 0) {
    result += `\n${indentation}  admin: {`;
    const adminEntries = Object.entries(field.admin)
      .filter(
        ([key, value]) =>
          value !== undefined &&
          key !== "components" &&
          !(field.type === "date" && key === "date"),
      )
      .map(([key, value]) => {
        const valueString = stringifyFunction(
          value as any,
          JSON.stringify(value),
        );
        return `\n${indentation}    ${key}: ${valueString},`;
      });
    result += adminEntries.join("");

    if (
      field.admin.components &&
      Object.keys(field.admin.components).length > 0
    ) {
      result += `\n${indentation}    components: ${JSON.stringify(field.admin.components).replace(/"/g, "'")},`;
    }
    if (field.type === "date" && "date" in field.admin && field.admin.date) {
      result += `\n${indentation}    date: ${JSON.stringify(field.admin.date)},`;
    }

    result = result.replace(/,\n( *)}/g, "\n$1}");
    result += `\n${indentation}  },`;
  }

  if (field.access && Object.keys(field.access).length > 0) {
    result += `\n${indentation}  access: {`;
    Object.entries(field.access).forEach(([key, value]) => {
      result += `\n${indentation}    ${key}: ${stringifyFunction(value as any, "() => false")},`;
    });
    result = result.replace(/,\n( *)}/g, "\n$1}");
    result += `\n${indentation}  },`;
  }

  if (field.hooks && Object.keys(field.hooks).length > 0) {
    result += `\n${indentation}  hooks: {`;
    Object.entries(field.hooks).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        result += `\n${indentation}    ${key}: [${value.map((hook) => stringifyFunction(hook as any)).join(", ")}],`;
      }
    });
    result = result.replace(/,\n( *)}/g, "\n$1}");
    result += `\n${indentation}  },`;
  }

  if ("validate" in field && field.validate) {
    result += `\n${indentation}  validate: ${stringifyFunction(field.validate as any, "() => true")},`;
  }

  if ("custom" in field && field.custom)
    result += `\n${indentation}  custom: ${JSON.stringify(field.custom, null, 2)},`;
  if ("graphQL" in field && field.graphQL !== undefined)
    result += `\n${indentation}  graphQL: ${typeof field.graphQL === "boolean" ? field.graphQL : JSON.stringify(field.graphQL)},`;
  if ("typescript" in field && field.typescript)
    result += `\n${indentation}  typescript: ${JSON.stringify(field.typescript)},`;
  if ("virtual" in field && field.virtual)
    result += `\n${indentation}  virtual: true,`;

  result = result.replace(/,\\n( *)}/g, "\\n$1}");
  result += `\n${indentation}}`;
  return result;
};

export const generateUserCollection = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import type { CollectionConfig } from 'payload';\n${typescript ? `import { authenticated } from '../../access/authenticated'; // Assuming path` : ""}\n\nexport const Users: CollectionConfig = {\n  slug: 'users',\n  auth: true,\n  admin: {\n    useAsTitle: 'name', // Changed from email to name\n    defaultColumns: ['name', 'email'],\n  },\n  access: {\n    create: () => true, // Simplified for scaffold, use 'authenticated' import in real template\n    read: () => true,   // Simplified\n    update: () => true, // Simplified\n    delete: () => true, // Simplified\n  },\n  fields: [\n    {\n      name: 'name',\n      type: 'text',\n    },\n    // Default email and password fields are added by auth: true\n  ],\n  timestamps: true,\n};\n`;
};

export const generateMediaCollection = (options: ScaffoldOptions): string => {
  const { typescript } = options;

  return `import type { CollectionConfig } from 'payload';\nimport path from 'path';\n${typescript ? `import { fileURLToPath } from 'url';\\nimport { anyone } from '../access/anyone'; // Assuming path\\nimport { authenticated } from '../access/authenticated'; // Assuming path\\n\\nconst filename = fileURLToPath(import.meta.url);\\nconst dirname = path.dirname(filename);` : ""}\n\nexport const Media: CollectionConfig = {\n  slug: 'media',\n  access: {\n    read: () => true, // Simplified\n    create: () => true, // Simplified\n    update: () => true, // Simplified\n    delete: () => true, // Simplified\n  },\n  upload: {\n    staticDir: ${typescript ? `path.resolve(dirname, '../../public/media')` : `'../public/media'`}, // Adjusted for template structure\n    staticURL: '/media', // Assuming /media is desired public path\n    adminThumbnail: 'thumbnail',\n    focalPoint: true,\n    imageSizes: [\n      // Sizes from template\n      { name: 'thumbnail', width: 300 },\n      { name: 'square', width: 500, height: 500 },\n      { name: 'small', width: 600 },\n      { name: 'medium', width: 900 },\n      { name: 'large', width: 1400 },\n      { name: 'xlarge', width: 1920 },\n      { name: 'og', width: 1200, height: 630, crop: 'center' },\n    ],\n    // mimeTypes: ['image/*', 'video/*'], // Consider adding based on template\n  },\n  fields: [\n    {\n      name: 'alt',\n      type: 'text',\n      // required: true, // Often good practice, but removed for simplicity\n    },\n    {\n      name: 'caption',\n      type: 'richText',\n      // editor configuration can be added here if needed\n    },\n  ],\n};\n`;
};

export const generateAppFrontendLayout = (): string => {
  return `import type { Metadata } from 'next'\n\nimport { cn } from '@/utilities/ui'\nimport { GeistMono } from 'geist/font/mono'\nimport { GeistSans } from 'geist/font/sans'\nimport React from 'react'\n\nimport { AdminBar } from '@/components/AdminBar'\nimport { Footer } from '@/Footer/Component' // Adjust path if needed\nimport { Header } from '@/Header/Component' // Adjust path if needed\nimport { Providers } from '@/providers'\nimport { InitTheme } from '@/providers/Theme/InitTheme' // Adjust path if needed\nimport { mergeOpenGraph } from '@/utilities/mergeOpenGraph'\nimport { draftMode } from 'next/headers'\n\nimport './globals.css'\nimport { getServerSideURL } from '@/utilities/getURL'\n\nexport default async function RootLayout({ children }: { children: React.ReactNode }) {\n  const { isEnabled } = await draftMode()\n\n  return (\n    <html className={cn(GeistSans.variable, GeistMono.variable)} lang=\"en\" suppressHydrationWarning>\n      <head>\n        <InitTheme />\n        <link href=\"/favicon.ico\" rel=\"icon\" sizes=\"32x32\" />\n        <link href=\"/favicon.svg\" rel=\"icon\" type=\"image/svg+xml\" />\n      </head>\n      <body>\n        <Providers>\n          <AdminBar\n            adminBarProps={{\n              preview: isEnabled,\n            }}\n          />\n\n          <Header />\n          <main>{children}</main> {/* Added main wrapper */}\n          <Footer />\n        </Providers>\n      </body>\n    </html>\n  )\n}\n\nexport const metadata: Metadata = {\n  metadataBase: new URL(getServerSideURL()),\n  openGraph: mergeOpenGraph(),\n  twitter: {\n    card: 'summary_large_image',\n    creator: '@payloadcms',\n  },\n}\n`;
};

export const generateAuthenticatedAccess = (
  options: ScaffoldOptions,
): string => {
  const { typescript } = options;
  return `${typescript ? `// Type imports\nimport type { Access } from 'payload';\nimport type { User } from '../../payload-types'; // Adjust path if needed\n` : ""}
/**
 * Determines if the current user is authenticated
 */
const isAuthenticated${typescript ? ": Access<any, User>" : ""} = ({ req: { user } ${typescript ? ": { user?: User }" : ""} }) => {
  // Return true if user is logged in, false if not
  return Boolean(user);
};

export default isAuthenticated;`;
};

export const generateAnyoneAccess = (options: ScaffoldOptions): string => {
  const { typescript } = options;
  return `${typescript ? `// Type imports\nimport type { Access } from 'payload';\n` : ""}
/**
 * Allows access to anyone, regardless of authentication status
 */
const anyone${typescript ? ": Access" : ""} = () => {
  return true;
};

export default anyone;`;
};

export const generateAuthenticatedOrPublishedAccess = (
  options: ScaffoldOptions,
): string => {
  const { typescript } = options;
  return `${typescript ? `// Type imports\nimport type { Access } from 'payload';\nimport type { User } from '../../payload-types'; // Adjust path\n` : ""}
export const authenticatedOrPublished${typescript ? ": Access<any, User>" : ""} = ({ req: { user } ${typescript ? ": { user?: User }" : ""} }) => {
  // Allow logged-in users
  if (user) {
    return true
  }

  // Allow anonymous users to only see published documents
  return {
    _status: {
      equals: 'published',
    },
  }
};

export default authenticatedOrPublished;`;
};

export const generateUtilitiesGetGlobals = (): string => {
  return [
    "import type { Config } from 'src/payload-types'",
    "import configPromise from '@payload-config'",
    "import { getPayload } from 'payload'",
    "import { unstable_cache } from 'next/cache'",
    "",
    "type Global = keyof Config['globals']",
    "",
    "async function getGlobal(slug: Global, depth = 0) {",
    "  const payload = await getPayload({ config: configPromise })",
    "  const global = await payload.findGlobal({ slug, depth })",
    "  return global",
    "}",
    "",
    "export const getCachedGlobal = (slug: Global, depth = 0) =>",
    "  unstable_cache(async () => getGlobal(slug, depth), [slug], {",
    "    tags: [`global_${slug}`],",
    "  })",
  ].join("\n");
};

export const generateGlobalsCSS = (): string => {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-size: unset;
    font-weight: unset;
  }

  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 240 5% 96%; // Adjusted based on dark mode example
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 240 6% 80%; // Adjusted based on dark mode example
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;

    --radius: 0.2rem;

    /* Added status colors from template tailwind */
    --success: 196 52% 74%;
    --warning: 34 89% 85%;
    --error: 10 100% 86%;
  }

  [data-theme="dark"] {
    --background: 0 0% 0%;
    --foreground: 210 40% 98%;

    --card: 0 0% 4%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 0 0% 98%;

    --border: 0, 0%, 15%, 0.8;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;

    /* Added status colors from template tailwind */
    --success: 196 100% 14%;
    --warning: 34 51% 25%;
    --error: 10 39% 43%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground min-h-[100vh] flex flex-col;
  }
}

/* Added from template */
html {
  opacity: 0;
}

html[data-theme='dark'],
html[data-theme='light'] {
  opacity: initial;
}
`;
};
