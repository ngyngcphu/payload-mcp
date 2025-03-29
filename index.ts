import express from 'express';
import { setupMcpServer } from './server/index.js';

const app = express();
const PORT = 3001;

setupMcpServer(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 