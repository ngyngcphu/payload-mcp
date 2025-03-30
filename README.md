# Payload MCP

A powerful Model Context Protocol (MCP) server for Payload CMS that enables AI assistants to help you develop, manage, and extend your Payload CMS projects.

## Overview

Payload MCP (Model Context Protocol) is a specialized server that connects AI assistants to your Payload CMS development workflow. It provides a set of tools for generating code, validating components, scaffolding projects, and performing specialized queries - all accessible to AI agents through the standardized Model Context Protocol.

This project implements an MCP server that can be run locally to provide AI assistants with capabilities specifically tailored for Payload CMS development, making it easier to:

- Generate boilerplate code for collections, fields, access control, and more
- Validate your Payload CMS components
- Scaffold new Payload CMS projects
- Query and analyze your existing codebase

## Features

- **Code Generation**: Create collections, fields, config files, access control rules, hooks, endpoints, plugins, blocks, migrations, and components with the right structure and best practices
- **Validation**: Validate your Payload CMS components to ensure they follow best practices and will work correctly
- **Scaffolding**: Set up new Payload CMS projects with the right file structure and dependencies
- **Specialized Queries**: Get recommendations and insights for your Payload CMS codebase
- **MCP Compliant**: Works with any AI assistant that supports the Model Context Protocol
- **Local-first**: Run entirely on your local machine for privacy and security

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or Bun (recommended)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/payload-mcp.git
   cd payload-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   # or with Bun (recommended)
   bun install
   ```

3. Start the server:
   ```bash
   npm start
   # or with Bun
   bun run start
   ```

The server will start on port 3001 by default. You can now connect your AI assistant to the MCP server by configuring it to use the endpoint: `http://localhost:3001/`.

## Tool Reference

Payload MCP provides four categories of tools:

### Generator Tools

Generate boilerplate code for Payload CMS components:

| Tool | Description |
|------|-------------|
| `collection` | Generate a Payload collection with fields, hooks, and access control |
| `field` | Generate a field configuration for collections |
| `config` | Generate a Payload configuration file |
| `access-control` | Generate access control functions |
| `hook` | Generate before/after hooks for collections |
| `endpoint` | Generate custom API endpoints |
| `plugin` | Generate a Payload plugin |
| `block` | Generate a block for the Payload block field type |
| `migration` | Generate a database migration |
| `component` | Generate a React component for the admin panel |

### Query Tools

Tools for querying and analyzing your Payload CMS codebase:

| Tool | Description |
|------|-------------|
| `validate_query` | Validate and format Payload queries |
| `get_query_suggestions` | Get suggestions for Payload queries based on your collections |
| `format_response` | Format the response from a Payload query |

### Scaffold Tools

Tools for scaffolding new Payload CMS projects:

| Tool | Description |
|------|-------------|
| `create_project` | Create a new Payload CMS project with recommended structure |
| `add_feature` | Add a feature to an existing Payload CMS project |
| `setup_authentication` | Configure authentication for a Payload CMS project |
| `setup_deployment` | Configure deployment settings for various platforms |

### Validator Tools

Tools for validating your Payload CMS components:

| Tool | Description |
|------|-------------|
| `validate_collection` | Validate a collection configuration |
| `validate_field` | Validate a field configuration |
| `validate_access_control` | Validate access control rules |
| `validate_hook` | Validate a hook implementation |

## Example Usage

### Generating a Collection

```typescript
// Example: Generate a simple blog post collection
const options = {
  name: "Post",
  slug: "posts",
  fields: [
    { name: "title", type: "text", required: true },
    { name: "content", type: "richText" },
    { name: "status", type: "select", options: ["draft", "published"] }
  ],
  timestamps: true,
  auth: false
};

// The AI would use the generate_template tool with these options
// Result would be a complete collection configuration file
```

### Validating a Query

```typescript
// Example: Validate a query for the posts collection
const query = {
  where: {
    status: {
      equals: "published"
    },
    createdAt: {
      greater_than: "2023-01-01"
    }
  },
  sort: "-createdAt",
  limit: 10
};

// The AI would use the validate_query tool with this query
// Result would indicate if the query is valid and properly formatted
```

### Scaffolding a New Project

```typescript
// Example: Create a new Payload CMS project for a blog
const options = {
  name: "My Blog",
  collections: ["posts", "categories", "authors"],
  authentication: true,
  admin: {
    customization: true
  },
  database: "mongodb"
};

// The AI would use the create_project tool with these options
// Result would be instructions for setting up a complete project
```

## Configuration

Payload MCP can be configured by modifying the following files:

- `package.json`: Update the `name`, `version`, and other metadata
- `index.ts`: Change the default port (3001) if needed
- `server/index.ts`: Configure server options such as the MCP server name

## Example Workflow

A typical workflow using Payload MCP might look like this:

1. **Start the MCP Server**:
   ```bash
   npm start
   ```

2. **Connect Your AI Assistant**:
   Configure your AI assistant to use the MCP server at `http://localhost:3001/`

3. **Request Generation**:
   Ask your AI assistant to generate a new collection for your Payload CMS project

4. **Review & Integrate**:
   Review the generated code and integrate it into your Payload CMS project

5. **Validate**:
   Use the validation tools to ensure your implementation is correct

6. **Iterate**:
   Continue developing with the help of your AI assistant and the MCP tools

## Tips and Best Practices

- **Start with Scaffolding**: For new projects, use the scaffolding tools to set up a well-structured project
- **Validate Frequently**: Use the validation tools to catch issues early in your development process
- **Combine Tools**: Most complex tasks require multiple tools - for example, generating a collection and then validating it
- **Review Generated Code**: Always review generated code before integrating it into your project
- **Keep the Server Running**: Leave the MCP server running during your development session so your AI assistant can access it
- **Use with Git**: Commit your changes frequently so you can easily track and revert changes if needed

## Future Plans

- Cloud-hosted version at mcp.so (coming soon)
- Additional generators for more Payload CMS component types
- Integration with popular IDEs
- Support for GraphQL query generation and validation
- Performance optimizations for large Payload CMS projects

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please file an issue on the GitHub repository.
