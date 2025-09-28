import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import dotenv from 'dotenv';

dotenv.config();

// Get credentials from environment variables
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  throw new Error('Google OAuth credentials not found in environment variables');
}

// Get the backend URL for the callback
const backendUrl = process.env.BACKEND_URL || process.env.RAILWAY_PUBLIC_DOMAIN || 'http://localhost:5000';
const callbackURL = `${backendUrl}/api/auth/google/callback`;

console.log('Google OAuth Config:');
console.log('Client ID:', GOOGLE_CLIENT_ID);
console.log('Callback URL:', callbackURL);

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: callbackURL,
    scope: ['profile', 'email']
  },
  (accessToken, refreshToken, profile, done) => {
    // Here you would typically find or create a user in your database
    console.log('User profile:', profile);
    return done(null, profile);
  }
));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user: any, done) => {
  done(null, user);
});

export default passport; 