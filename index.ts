import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';

console.log('Auth routes imported:', authRoutes);
console.log('Resume routes imported:', resumeRoutes);
import path from 'path';

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

console.log('=== ATS Optimizer Backend Starting ===');
console.log('Port:', port);
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'Set' : 'Not set');
console.log('OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? 'Set' : 'Not set');

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies
app.use(session({
    secret: process.env.SESSION_SECRET || 'temporary_hard_coded_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      httpOnly: true,
      sameSite: 'lax', // Needed for cross-site requests
      secure: process.env.NODE_ENV === 'production' // Only use secure in production
    }
}));
app.use(passport.initialize());
app.use(passport.session());

// Test route before API routes
app.get('/test-simple', (req, res) => {
  console.log('Test simple route hit!');
  res.json({ message: 'Simple test route works!', timestamp: new Date().toISOString() });
});

// Serve static files (moved after routes to avoid conflicts)
app.use(express.static(path.join(__dirname, 'public')));

// Routes
console.log('Mounting auth routes at /api/auth');
app.use('/api/auth', authRoutes);
console.log('Auth routes mounted successfully');

console.log('Mounting resume routes at /api/resume');
app.use('/api/resume', resumeRoutes);
console.log('Resume routes mounted successfully');

// Debug route to check if routes are working
app.get('/api/test', (req, res) => {
  res.json({ 
    message: 'API routes are working!', 
    timestamp: new Date().toISOString(),
    routes: ['/api/auth/test', '/api/auth/google', '/api/auth/me', '/api/resume/upload', '/api/resume/scan']
  });
});

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ATS Optimizer Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'ats-optimizer-backend',
    timestamp: new Date().toISOString()
  });
});

// Simple test route right after health
app.get('/test-basic', (req, res) => {
  console.log('Test basic route hit!');
  res.json({ 
    message: 'Basic test route works!', 
    timestamp: new Date().toISOString() 
  });
});

// Test OAuth page
app.get('/test-oauth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

// Remove catch-all route for now to avoid conflicts

app.listen(port, '0.0.0.0', () => {
  console.log('=== ATS Optimizer Backend Started Successfully ===');
  console.log(`Backend server is running on port ${port}`);
  console.log(`Health check available at http://0.0.0.0:${port}/health`);
  console.log(`Test OAuth at http://0.0.0.0:${port}/test-oauth`);
  console.log(`API test at http://0.0.0.0:${port}/api/test`);
  console.log(`Auth test at http://0.0.0.0:${port}/api/auth/test`);
  console.log(`Simple test at http://0.0.0.0:${port}/test-simple`);
  console.log('=== Ready to accept requests ===');
}); 