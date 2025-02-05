import express from 'express';
import { handleSubscription } from '../Controller/subscribe.controller.js';

const router = express.Router();

router.post('/', handleSubscription);

export default router;