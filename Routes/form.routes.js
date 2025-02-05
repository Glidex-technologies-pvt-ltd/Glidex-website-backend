import express from 'express';
import { handleFormSubmission } from '../Controller/form.controller.js';

const router = express.Router();

router.post('/submit-form', handleFormSubmission);

export default router;