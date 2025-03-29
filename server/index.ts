import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Application } from 'express';
import { registerGeneratorTools, registerQueryTools, registerScaffoldTools, registerValidatorTools } from "../tools/index.js";


const server = new McpServer({
    name: "Payload CMS MCP",
    version: "0.1.0"
});

registerGeneratorTools(server);
registerQueryTools(server);
registerScaffoldTools(server);
registerValidatorTools(server);


const transports: { [sessionId: string]: SSEServerTransport } = {};

export function setupMcpServer(app: Application) {
    app.get('/sse', async (req, res) => {
        const transport = new SSEServerTransport('/messages', res);
        transports[transport.sessionId] = transport;
        req.on('close', () => {
            delete transports[transport.sessionId];
        });
        await server.connect(transport);
    });

    app.post('/messages', async (req, res) => {
        const sessionId = req.query.sessionId as string;
        const transport = transports[sessionId];

        if (!transport) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        try {
            await transport.handlePostMessage(req, res);
        } catch (error) {
            res.status(500).json({ error: 'Internal server error' });
        }
    });
}

export { server as mcpServer }; 