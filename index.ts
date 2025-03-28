import express from 'express';
import { setupMcpServer } from './server/index.js';

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

setupMcpServer(app);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 