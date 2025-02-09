import express from 'express';
import { handleFormSubmission } from '../Controller/form.controller.js';

export function formRoutes (app) {
	app.post('/submit-form', handleFormSubmission);
}