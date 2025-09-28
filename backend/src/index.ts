import dotenv from 'dotenv';
dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SESSION_SECRET',
  'FRONTEND_URL',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'OPENAI_API_KEY'
];

console.log('[INIT] Validating environment variables...');
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error('[FATAL] Missing required environment variables:', missingEnvVars);
  console.error('[FATAL] Please check your .env file and ensure all required variables are set');
  process.exit(1);
}

console.log('[INIT] Environment validation successful');

import express from 'express';
import cors from 'cors';
import session from 'express-session';
import passport from './config/passport';
import authRoutes from './routes/auth';
import resumeRoutes from './routes/resume';
import path from 'path';

// Process-level error handling
process.on('uncaughtException', (error: Error) => {
  console.error('[FATAL] Uncaught Exception:', error);
  console.error('[FATAL] Stack trace:', error.stack);
  // Give time for logs to be written before exiting
  setTimeout(() => process.exit(1), 1000);
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('[FATAL] Unhandled Promise Rejection:', reason);
  if (reason instanceof Error) {
    console.error('[FATAL] Stack trace:', reason.stack);
  }
});

// Startup timestamp for uptime tracking
const startupTime = new Date();

const app = express();
const port = parseInt(process.env.PORT || '5000', 10);

// Middleware initialization logging
function logMiddlewareInit(name: string) {
  console.log(`[INIT] Initializing middleware: ${name}`);
}

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'https://ats-optimizer.netlify.app',
  process.env.FRONTEND_URL || 'http://localhost:3000'
].filter(Boolean);

console.log('[CONFIG] Allowed CORS origins:', allowedOrigins);

logMiddlewareInit('CORS');
app.use(cors({
    origin: (origin, callback) => {
      console.log('Request origin:', origin);
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      
      // For development, log the rejected origin
      console.log('Rejected origin:', origin);
      console.log('Allowed origins:', allowedOrigins);
      
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400 // 24 hours
}));
logMiddlewareInit('JSON Parser');
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies

logMiddlewareInit('URL Encoded Parser');
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // Parse URL-encoded bodies

logMiddlewareInit('Session');
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
logMiddlewareInit('Passport Initialize');
app.use(passport.initialize());

logMiddlewareInit('Passport Session');
app.use(passport.session());

// Serve static files
logMiddlewareInit('Static Files');
app.use(express.static(path.join(__dirname, 'public')));

// Error handling middleware
const errorHandler = (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('[ERROR] Request failed:', {
    method: req.method,
    url: req.url,
    body: req.body,
    error: err.message,
    stack: err.stack
  });

  // Don't expose stack traces in production
  const error = process.env.NODE_ENV === 'production' ? { message: err.message } : { message: err.message, stack: err.stack };
  
  res.status(err.status || 500).json({
    error,
    timestamp: new Date().toISOString()
  });
};

// Debug route to check registered routes
app.get('/debug/routes', (req, res) => {
  const routes: string[] = [];
  app._router.stack.forEach((middleware: any) => {
    if (middleware.route) { // routes registered directly on the app
      routes.push(`${Object.keys(middleware.route.methods).join(',').toUpperCase()} ${middleware.route.path}`);
    } else if (middleware.name === 'router') { // router middleware
      middleware.handle.stack.forEach((handler: any) => {
        if (handler.route) {
          routes.push(`${Object.keys(handler.route.methods).join(',').toUpperCase()} ${middleware.regexp.toString()}${handler.route.path}`);
        }
      });
    }
  });
  res.json({
    routes,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    allowedOrigins
  });
});

// Routes with error boundary
console.log('[INIT] Setting up routes with error boundaries...');

// Wrap route handlers with error boundary
const withErrorBoundary = (handler: express.RequestHandler): express.RequestHandler => {
  return async (req, res, next) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// Mount API routes first
console.log('[INIT] Mounting API routes...');
app.use('/api/auth', (req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} from ${req.get('origin')}`);
  next();
}, authRoutes);

app.use('/api/resume', (req, res, next) => {
  console.log(`[REQUEST] ${req.method} ${req.url} from ${req.get('origin')}`);
  next();
}, resumeRoutes);

// Apply error handler after all routes
app.use(errorHandler);

console.log('[INIT] Routes and error boundaries initialized successfully');

app.get('/', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'ATS Optimizer Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint with detailed system status
app.get('/health', (req, res) => {
  const uptime = Date.now() - startupTime.getTime();
  const memoryUsage = process.memoryUsage();
  
  res.json({ 
    status: 'healthy', 
    service: 'ats-optimizer-backend',
    version: process.env.npm_package_version || 'unknown',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: {
      ms: uptime,
      formatted: `${Math.floor(uptime / (1000 * 60 * 60))}h ${Math.floor((uptime / (1000 * 60)) % 60)}m ${Math.floor((uptime / 1000) % 60)}s`
    },
    system: {
      platform: process.platform,
      nodeVersion: process.version,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024) + 'MB',
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024) + 'MB',
        rss: Math.round(memoryUsage.rss / 1024 / 1024) + 'MB'
      }
    },
    config: {
      port,
      corsOrigins: allowedOrigins
    }
  });
});

// Test OAuth page
app.get('/test-oauth', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'test.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Backend server is running on port ${port}`);
  console.log(`Health check available at http://0.0.0.0:${port}/`);
  console.log(`Test OAuth at http://0.0.0.0:${port}/test-oauth`);
}); 