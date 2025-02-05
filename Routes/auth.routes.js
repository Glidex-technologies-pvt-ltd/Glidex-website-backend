import { googleAuth, googleAuthCallback, dashboard, logout } from '../Controller/auth.controller.js';

export function authRoutes(app) {
    app.get('/auth/google', googleAuth);
    app.get('/auth/google/callback', googleAuthCallback);
    app.get('/dashboard', dashboard);
    app.get('/logout', logout);
}
