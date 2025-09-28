import passport from 'passport';
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// Get credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not found in environment variables');
}

// Get the backend URL for the callback
const backendUrl = process.env.BACKEND_URL || 'http://localhost:5000';
const callbackURL = `${backendUrl}/api/auth/google/callback`;

// Log all relevant environment variables for debugging
console.log('[OAUTH] Environment Configuration:');
console.log('[OAUTH] NODE_ENV:', process.env.NODE_ENV);
console.log('[OAUTH] BACKEND_URL:', process.env.BACKEND_URL);
console.log('[OAUTH] FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('[OAUTH] Callback URL:', callbackURL);
console.log('[OAUTH] Google Client ID:', GOOGLE_CLIENT_ID?.substring(0, 8) + '...');

// Validate required URLs
if (!process.env.BACKEND_URL) {
  console.error('[FATAL] BACKEND_URL environment variable is not set');
  process.exit(1);
}

if (!process.env.FRONTEND_URL) {
  console.error('[FATAL] FRONTEND_URL environment variable is not set');
  process.exit(1);
}

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    passReqToCallback: true,
    proxy: true // Add this line to trust the proxy
  },
  async (req: any, accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
    try {
      console.log('[OAUTH] Received profile from Google:', {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        provider: profile.provider
      });

      // Create a sanitized user object
      const user = {
        id: profile.id,
        displayName: profile.displayName,
        email: profile.emails?.[0]?.value,
        provider: profile.provider,
        accessToken // Store the access token for future use
      };

      return done(null, user);
    } catch (error) {
      console.error('[OAUTH] Error processing Google profile:', error);
      return done(error as Error, undefined);
    }
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport; 