import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  scaffold,
  type ScaffoldOptions,
  type FieldConfig,
  type CollectionConfig,
  type GlobalConfig,
  type BlockConfig,
} from "../scaffolds/index.js";

const baseFieldSchema = z.object({
  name: z.string().describe("The programmatic name of the field (camelCase)."),
  label: z
    .string()
    .optional()
    .describe("A human-readable label for the admin UI."),
  type: z
    .enum([
      "text",
      "textarea",
      "number",
      "email",
      "code",
      "date",
      "point",
      "richText",
      "select",
      "multiselect",
      "checkbox",
      "radio",
      "relationship",
      "array",
      "blocks",
      "group",
      "row",
      "collapsible",
      "tabs",
      "upload",
      "json",
      "ui",
    ])
    .describe("The type of the field."),
  required: z.boolean().optional().describe("Whether the field is required."),
  unique: z
    .boolean()
    .optional()
    .describe("Whether the field value must be unique."),
  localized: z.boolean().optional().describe("Whether the field is localized."),
  admin: z
    .record(z.any())
    .optional()
    .describe("Admin UI specific configuration."),
  defaultValue: z.any().optional().describe("Default value for the field."),
  index: z
    .boolean()
    .optional()
    .describe("Whether to create a database index for this field."),
  saveToJWT: z
    .boolean()
    .optional()
    .describe("Include this field in the JWT payload for authenticated users."),
});

let fieldSchema: z.ZodType<FieldConfig>;
let blockSchema: z.ZodType<BlockConfig>;

blockSchema = z.lazy(() =>
  z
    .object({
      slug: z.string().describe("Unique identifier for the block."),
      fields: z.array(fieldSchema).describe("Fields within the block."),
      labels: z
        .object({
          singular: z.string().optional(),
          plural: z.string().optional(),
        })
        .optional()
        .describe("Custom labels for the block."),
      imageURL: z.string().optional(),
      imageAltText: z.string().optional(),
      interfaceName: z.string().optional(),
      graphQL: z.record(z.any()).optional(),
      admin: z.record(z.any()).optional(),
    })
    .passthrough(),
);

const baseFieldAdminOptionsSchema = z.record(z.any());

const textFieldSchema = baseFieldSchema.extend({
  type: z.literal("text"),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  hasMany: z.boolean().optional(),
  minRows: z.number().optional(),
  maxRows: z.number().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const textareaFieldSchema = baseFieldSchema.extend({
  type: z.literal("textarea"),
  minLength: z.number().optional(),
  maxLength: z.number().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const numberFieldSchema = baseFieldSchema.extend({
  type: z.literal("number"),
  min: z.number().optional(),
  max: z.number().optional(),
  hasMany: z.boolean().optional(),
  minRows: z.number().optional(),
  maxRows: z.number().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const emailFieldSchema = baseFieldSchema.extend({
  type: z.literal("email"),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const codeFieldSchema = baseFieldSchema.extend({
  type: z.literal("code"),
  language: z.string().optional(),
  admin: z.record(z.any()).optional(),
});

const jsonFieldSchema = baseFieldSchema.extend({
  type: z.literal("json"),
  jsonSchema: z.any().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const dateFieldSchema = baseFieldSchema.extend({
  type: z.literal("date"),
  format: z.string().optional(),
  timeFormat: z.string().optional(),
  monthsToShow: z.number().optional(),
  admin: z
    .object({
      date: z
        .object({
          pickerAppearance: z
            .enum(["dayOnly", "monthOnly", "dayAndTime"])
            .optional(),
          displayFormat: z.string().optional(),
        })
        .optional(),
    })
    .passthrough()
    .optional(),
});

const pointFieldSchema = baseFieldSchema.extend({
  type: z.literal("point"),
  admin: baseFieldAdminOptionsSchema.optional(),
  hidden: z.boolean().optional(),
});

const selectOptionSchema = z.object({ label: z.string(), value: z.string() });

const selectFieldSchema = baseFieldSchema.extend({
  type: z.literal("select"),
  options: z.array(selectOptionSchema),
  hasMany: z.boolean().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const radioFieldSchema = baseFieldSchema.extend({
  type: z.literal("radio"),
  options: z.array(selectOptionSchema),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const checkboxFieldSchema = baseFieldSchema.extend({
  type: z.literal("checkbox"),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const richTextFieldSchema = baseFieldSchema.extend({
  type: z.literal("richText"),
  editor: z.record(z.any()).optional(),
  admin: z.record(z.any()).optional(),
});

const relationshipFieldSchema = baseFieldSchema.extend({
  type: z.literal("relationship"),
  relationTo: z.union([z.string(), z.array(z.string())]),
  hasMany: z.boolean().optional(),
  filterOptions: z.any().optional(),
  maxDepth: z.number().optional(),
  admin: z.record(z.any()).optional(),
});

const arrayFieldSchema = baseFieldSchema.extend({
  type: z.literal("array"),
  fields: z.lazy(() => z.array(fieldSchema)),
  minRows: z.number().optional(),
  maxRows: z.number().optional(),
  labels: z.object({ singular: z.string(), plural: z.string() }).optional(),
  interfaceName: z.string().optional(),
  dbName: z.string().optional(),
  admin: z.record(z.any()).optional(),
});

const blocksFieldSchema = baseFieldSchema.extend({
  type: z.literal("blocks"),
  blocks: z.lazy(() => z.array(blockSchema)),
  minRows: z.number().optional(),
  maxRows: z.number().optional(),
  labels: z.object({ singular: z.string(), plural: z.string() }).optional(),
  interfaceName: z.string().optional(),
  admin: z.record(z.any()).optional(),
});

const groupFieldSchema = baseFieldSchema.extend({
  type: z.literal("group"),
  fields: z.lazy(() => z.array(fieldSchema)),
  interfaceName: z.string().optional(),
  admin: z.record(z.any()).optional(),
});

const tabsFieldSchema = baseFieldSchema.extend({
  type: z.literal("tabs"),
  tabs: z.array(
    z.object({
      label: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      interfaceName: z.string().optional(),
      fields: z.lazy(() => z.array(fieldSchema)),
    }),
  ),
  admin: z.record(z.any()).optional(),
});

const rowFieldSchema = baseFieldSchema.extend({
  type: z.literal("row"),
  fields: z.lazy(() => z.array(fieldSchema)),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const collapsibleFieldSchema = baseFieldSchema.extend({
  type: z.literal("collapsible"),
  label: z.string(),
  fields: z.lazy(() => z.array(fieldSchema)),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const uploadFieldSchema = baseFieldSchema.extend({
  type: z.literal("upload"),
  relationTo: z.string(),
  hasMany: z.boolean().optional(),
  filterOptions: z.any().optional(),
  maxDepth: z.number().optional(),
  admin: baseFieldAdminOptionsSchema.optional(),
});

const uiFieldSchema = baseFieldSchema.extend({
  type: z.literal("ui"),
  admin: z.object({
    components: z.object({
      Field: z.string(),
      Cell: z.string().optional(),
    }),
    disableListColumn: z.boolean().optional(),
  }),
});

fieldSchema = z.lazy(() =>
  z
    .discriminatedUnion("type", [
      textFieldSchema,
      textareaFieldSchema,
      numberFieldSchema,
      emailFieldSchema,
      codeFieldSchema,
      jsonFieldSchema,
      dateFieldSchema,
      pointFieldSchema,
      selectFieldSchema,
      radioFieldSchema,
      checkboxFieldSchema,
      richTextFieldSchema,
      relationshipFieldSchema,
      arrayFieldSchema,
      blocksFieldSchema,
      groupFieldSchema,
      tabsFieldSchema,
      rowFieldSchema,
      collapsibleFieldSchema,
      uploadFieldSchema,
      uiFieldSchema,
    ])
    .and(
      z.object({
        access: z.record(z.any()).optional(),
        hooks: z.record(z.array(z.any())).optional(),
        validate: z.any().optional(),
        custom: z.record(z.any()).optional(),
        graphQL: z.record(z.any()).optional(),
        typescript: z.object({ interface: z.string().optional() }).optional(),
        virtual: z.boolean().optional(),
        hidden: z.boolean().optional(),
      }),
    ),
);

const imageSizeSchema = z.object({
  name: z.string(),
  width: z.number(),
  height: z.number().optional(),
  position: z.string().optional(),
});

const uploadConfigSchema = z
  .object({
    staticURL: z.string().optional(),
    staticDir: z.string().optional(),
    mimeTypes: z.array(z.string()).optional(),
    filesizeLimits: z
      .object({
        max: z.number().optional(),
        min: z.number().optional(),
      })
      .optional(),
    imageSizes: z.array(imageSizeSchema).optional(),
    handlers: z.array(z.string()).optional(),
    resizeOptions: z.record(z.any()).optional(),
  })
  .passthrough();

const collectionSchema: z.ZodType<CollectionConfig> = z
  .object({
    slug: z
      .string()
      .regex(
        /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
        "Collection slug must be kebab-case.",
      )
      .describe("Unique identifier for the collection (kebab-case)."),
    fields: z
      .array(fieldSchema)
      .min(1, "Each collection must have at least one field.")
      .describe("Fields for the collection."),
    admin: z
      .record(z.any())
      .optional()
      .describe("Admin UI configuration for the collection."),
    access: z
      .record(z.any())
      .optional()
      .describe("Access control configuration."),
    auth: z
      .union([z.boolean(), z.record(z.any())])
      .optional()
      .describe("Authentication configuration."),
    timestamps: z
      .boolean()
      .optional()
      .describe(
        "Enable/disable automatic timestamp fields (createdAt, updatedAt).",
      ),
    versions: z
      .union([z.boolean(), z.record(z.any())])
      .optional()
      .describe("Versioning configuration."),
    upload: uploadConfigSchema
      .optional()
      .describe(
        "Upload configuration (for media collections). Omit this property to disable uploads.",
      ),
  })
  .passthrough();

const globalSchema: z.ZodType<GlobalConfig> = z
  .object({
    slug: z
      .string()
      .regex(
        /^[a-zA-Z0-9]+(?:[A-Z][a-z0-9]*)*$/,
        "Global slug should be PascalCase or camelCase.",
      )
      .describe(
        "Unique identifier for the global (PascalCase or camelCase recommended).",
      ),
    fields: z.array(fieldSchema).describe("Fields for the global."),
    admin: z
      .record(z.any())
      .optional()
      .describe("Admin UI configuration for the global."),
    access: z
      .record(z.any())
      .optional()
      .describe("Access control configuration."),
    versions: z
      .union([z.boolean(), z.record(z.any())])
      .optional()
      .describe("Versioning configuration."),
  })
  .passthrough();

export function registerScaffoldTools(server: McpServer) {
  server.tool(
    "scaffold_project",
    {
      projectName: z
        .string()
        .min(1, "Project name is required.")
        .regex(
          /^[a-z0-9][-a-z0-9._]*$/,
          "Invalid project name format. Use lowercase letters, numbers, hyphens, dots, or underscores.",
        )
        .describe(
          "Name of the project to create (npm package naming conventions).",
        ),
      database: z
        .enum(["mongodb", "postgres"])
        .describe("Database type to use."),
      typescript: z
        .boolean()
        .optional()
        .default(true)
        .describe("Generate TypeScript project."),
      authentication: z
        .boolean()
        .optional()
        .default(true)
        .describe(
          "Include authentication (Users collection and basic access control).",
        ),
      collections: z
        .array(collectionSchema)
        .optional()
        .describe("Collections to generate."),
      globals: z
        .array(globalSchema)
        .optional()
        .describe("Globals to generate."),
      blocks: z
        .array(blockSchema)
        .optional()
        .describe("Reusable block definitions for Block fields."),
      serverUrl: z
        .string()
        .url()
        .optional()
        .describe(
          "Server URL for the application (e.g., http://localhost:3000).",
        ),
      outputPath: z
        .string()
        .optional()
        .describe(
          "Custom output path (defaults to current directory/projectName).",
        ),
      description: z
        .string()
        .optional()
        .describe("Project description for package.json and README."),
      adminBar: z
        .boolean()
        .optional()
        .default(true)
        .describe("Include Payload Admin Bar."),
      plugins: z
        .array(
          z.union([
            z.string(),
            z.object({
              package: z.string(),
              options: z.record(z.any()).optional(),
            }),
          ]),
        )
        .optional()
        .default([
          "@payloadcms/plugin-redirects",
          "@payloadcms/plugin-nested-docs",
          "@payloadcms/plugin-seo",
          "@payloadcms/plugin-form-builder",
          "@payloadcms/plugin-search",
          "@payloadcms/payload-cloud",
        ])
        .describe(
          "Payload plugins to include (e.g., @payloadcms/plugin-seo). Provide package name or object with options.",
        ),
    },
    async (options: ScaffoldOptions & { outputPath?: string }) => {
      try {
        const { outputPath, ...scaffoldOptions } = options;

        const result = await scaffold(scaffoldOptions, outputPath);

        if (!result.success) {
          return {
            content: [
              {
                type: "text",
                text: `Scaffold error:\n${result.errors?.map((e) => `- ${e.field ? `(${e.field}) ` : ""}${e.message}${e.suggestion ? ` Suggestion: ${e.suggestion}` : ""}`).join("\n") ?? "Unknown scaffolding error"}`,
              },
            ],
            isError: true,
          };
        }

        const successResponse = {
          success: result.success,
          projectPath: result.projectStructure?.root,
          adminUrl: result.adminUrl,
          devCommand: result.devCommand,
          nextSteps: result.nextSteps,
        };

        return {
          content: [
            {
              type: "text",
              text: `Project '${options.projectName}' scaffolded successfully!\n\nAdmin URL: ${successResponse.adminUrl}\nRun Command: ${successResponse.devCommand}\n\nNext Steps:\n${successResponse.nextSteps?.join("\n")}`,
            },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Scaffold tool internal error: ${(error as Error).message}`,
            },
          ],
          isError: true,
        };
      }
    },
  );
}
