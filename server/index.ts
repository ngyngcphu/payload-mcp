import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { Application, Request, Response, RequestHandler, Router } from 'express';
import { registerGeneratorTools, registerQueryTools, registerScaffoldTools, registerValidatorTools } from "../tools/index.js";

// Create and configure MCP server
const server = new McpServer({
    name: "Payload CMS MCP",
    version: "0.1.0"
});

// Register all tool categories
registerGeneratorTools(server);
registerQueryTools(server);
registerScaffoldTools(server);
registerValidatorTools(server);

// Store active transports by session ID
const transports: Record<string, SSEServerTransport> = {};

/**
 * Sets up MCP Server routes on the Express application
 */
export function setupMcpServer(app: Application): void {
    // Create a router for MCP-related endpoints
    const router = Router();
    
    // SSE connection endpoint
    router.get('/sse', (req: Request, res: Response) => {
        // Prevent premature timeouts
        req.socket.setTimeout(30 * 60 * 1000); // 30 minutes
        
        // Create SSE transport
        const transport = new SSEServerTransport('/messages', res);
        const sessionId = transport.sessionId;
        transports[sessionId] = transport;
        
        console.log(`New SSE connection: ${sessionId}`);
        
        // Set up connection cleanup
        let isConnected = false;
        
        // Handle client disconnection
        req.on('close', () => {
            delete transports[sessionId];
            console.log(`Client disconnected: ${sessionId}`);
        });
        
        // Connect to MCP server asynchronously
        server.connect(transport)
            .then(() => {
                isConnected = true;
                console.log(`MCP server connected for ${sessionId}`);
            })
            .catch((error) => {
                console.error(`Error connecting transport ${sessionId}:`, error);
                delete transports[sessionId];
                
                // Try to send error if possible
                if (!res.writableEnded) {
                    res.write(`data: ${JSON.stringify({ type: "error", message: "Connection failed" })}\n\n`);
                }
            });
    });
    
    // Message handling endpoint
    router.post('/messages', (req: Request, res: Response) => {
        const sessionId = req.query.sessionId as string;
        
        if (!sessionId) {
            res.status(400).json({ error: 'Missing sessionId parameter' });
            return;
        }
        
        const transport = transports[sessionId];
        
        if (!transport) {
            console.log(`Session not found: ${sessionId}`);
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        
        // Create a promise wrapper to handle the async operation
        transport.handlePostMessage(req, res)
            .then(() => {
                // Success is handled by the transport
            })
            .catch((error) => {
                console.error(`Error handling message for ${sessionId}:`, error);
                
                // Only send error response if headers haven't been sent
                if (!res.headersSent) {
                    res.status(500).json({ 
                        error: 'Internal server error',
                        message: (error as Error).message
                    });
                }
            });
    });
    
    // Mount the router on the app
    app.use(router);
}

export { server as mcpServer }; 