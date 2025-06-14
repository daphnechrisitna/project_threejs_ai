import express from 'express';

import cors from 'cors';

import dalleRoutes from './routes/dalle.routes.js';



const app = express();
app.use(cors({ 
                origin: 'https://shirt-design-omega.vercel.app', // Your Vite frontend
                exposedHeaders: ['Content-Type']}));
app.use(express.json({ limit: '50mb' }));

app.use('/api/v1/dalle', dalleRoutes);

app.get('/', (req, res) => {
    res.status(200).json({ message: "Hello from DALL-E" });
})

app.listen(8080, () => {console.log('Server has started on port 8080')})