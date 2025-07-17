import express from 'express';
import { getCurrentJam } from '../controllers/jamController';

const router = express.Router();

router.get('/current', getCurrentJam);

export default router;