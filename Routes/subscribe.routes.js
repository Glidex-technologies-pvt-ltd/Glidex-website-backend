import express from 'express';
import { handleSubscription } from '../Controller/subscribe.controller.js';

export function subscribeRoutes (app) {
	app.post('/subscribe', handleSubscription);
}