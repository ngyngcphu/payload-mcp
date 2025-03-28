import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Application } from 'express';

const server = new McpServer({
    name: "Payload CMS MCP",
    version: "0.1.0"
});

const connections = new Map<string, SSEServerTransport>();

export function setupMcpServer(app: Application) {
    app.get('/sse', async (req, res) => {
        const id = Math.random().toString(36).substring(2, 15);

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');

        const transport = new SSEServerTransport('/messages', res);

        req.on('close', () => {
            connections.delete(id);
        });

        try {
            await server.connect(transport);

            res.write(`data: ${JSON.stringify({ type: "connection_established", id })}\n\n`);
        } catch (error) {
            res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to establish connection" })}\n\n`);
        }
    });

    app.post('/messages', async (req, res) => {
        const sessionId = req.query.sessionId as string;
        const transport = connections.get(sessionId);

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