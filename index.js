import express from 'express';
import axios from 'axios';
import canvasRoutes from './routes/canvasRoutes.js';
import dotenv from 'dotenv';

dotenv.config();
const app = express();
const PORT = 3000;

app.use('/api/canvas', canvasRoutes);

app.listen(PORT, function () {
    console.log("Listening on PORT: ", PORT);
    if (PORT == 3000) { 
      console.log('Running on local: http://localhost:3000');
    }
});