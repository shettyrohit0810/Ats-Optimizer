import { Router } from 'express';
import passport from 'passport';

const router = Router();

// Redirect to Google to login
router.get('/google', (req, res, next) => {
  console.log('[AUTH] Starting Google OAuth flow');
  console.log('[AUTH] Request headers:', {
    origin: req.get('origin'),
    referer: req.get('referer')
  });
  
  try {
    passport.authenticate('google', {
      scope: ['profile', 'email'],
      prompt: 'select_account',
      accessType: 'offline',
      state: Math.random().toString(36).substring(7) // Add CSRF protection
    })(req, res, next);
  } catch (error) {
    console.error('[AUTH] Error initiating Google OAuth:', error);
    res.redirect(`${frontendUrl}/login-failed?error=oauth_init_failed`);
  }
});

// Google will redirect to this URL after login
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Debug logging
console.log('[AUTH] Frontend URL:', frontendUrl);
console.log('[AUTH] Environment FRONTEND_URL:', process.env.FRONTEND_URL);

router.get('/google/callback', (req, res, next) => {
  console.log('[AUTH] Received callback from Google');
  passport.authenticate('google', (err: any, user: Express.User | false | null, info: any) => {
    if (err) {
      console.error('[AUTH] Error during authentication:', err);
      return res.redirect(`${frontendUrl}/login-failed?error=${encodeURIComponent(err.message)}`);
    }
    
    if (!user) {
      console.error('[AUTH] Authentication failed:', info);
      return res.redirect(`${frontendUrl}/login-failed?error=authentication_failed`);
    }

    req.logIn(user, (err) => {
      if (err) {
        console.error('[AUTH] Error during login:', err);
        return res.redirect(`${frontendUrl}/login-failed?error=login_failed`);
      }
      
      console.log('[AUTH] Authentication successful, redirecting to loading page');
      res.redirect(`${frontendUrl}/auth-loading`);
    });
  })(req, res, next);
});

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