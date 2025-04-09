import express from 'express';
import { fetchCanvas } from '../controllers/canvasController.js';

const router = express.Router();

router.get('/', fetchCanvas);

export default router;