import passport from 'passport';

// Redirect to Google for authentication
export const googleAuth = (req, res, next) => {
  passport.authenticate('google', { scope: ['profile', 'email'] })(req, res, next);
};

// Handle Google OAuth callback
export const googleAuthCallback = (req, res) => {
  passport.authenticate('google', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
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