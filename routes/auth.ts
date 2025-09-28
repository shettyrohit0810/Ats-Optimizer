import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Test route to check if auth routes are working
router.get('/test', (req, res) => {
  res.json({ message: 'Auth routes are working!', timestamp: new Date().toISOString() });
});

// Redirect to Google to login
router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

// Google will redirect to this URL after login
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Debug logging
console.log('Frontend URL:', frontendUrl);
console.log('Environment FRONTEND_URL:', process.env.FRONTEND_URL);

router.get('/google/callback', 
  passport.authenticate('google', { 
    successRedirect: `${frontendUrl}/auth-loading`, // Redirect to loading page on success
    failureRedirect: `${frontendUrl}/login-failed` // Redirect on failure
  }),
  (req, res) => {
    // This function is called after successful authentication
    console.log('OAuth callback successful, redirecting to:', `${frontendUrl}/auth-loading`);
    res.redirect(`${frontendUrl}/auth-loading`);
  }
);

// Debug route to check environment variables
router.get('/debug', (req, res) => {
    res.json({
        frontendUrl: process.env.FRONTEND_URL,
        backendUrl: process.env.BACKEND_URL,
        googleClientId: process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set',
        nodeEnv: process.env.NODE_ENV,
        computedFrontendUrl: frontendUrl
    });
});

// Route to check user's login status
router.get('/me', (req, res) => {
    if (req.user) {
        res.json(req.user);
    } else {
        res.status(401).json({ message: 'Not logged in' });
    }
});

// Route for logging out
router.get('/logout', (req, res, next) => {
    req.logout((err) => {
        if (err) { return next(err); }
        res.redirect(`${frontendUrl}/`);
    });
});


export default router; 