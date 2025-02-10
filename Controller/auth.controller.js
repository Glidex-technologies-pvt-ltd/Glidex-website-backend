import passport from 'passport';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Redirect to Google for authentication
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Handle Google OAuth callback
export const googleAuthCallback = (req, res) => {
  passport.authenticate('google', {
    successRedirect: process.env.GLIDEX_PRODUCT_URL,
    failureRedirect: 'https://glidex.co.in/login',
  })(req, res);
};

// Dashboard route after successful login
export const dashboard = (req, res) => {
  res.send('Logged in successfully!');
};

// Logout user
export const logout = (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
};