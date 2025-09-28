// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ats-optimizer.railway.app';

export const API_ENDPOINTS = {
  // Auth endpoints
  GOOGLE_LOGIN: `${API_BASE_URL}/api/auth/google`,
  LOGOUT: `${API_BASE_URL}/api/auth/logout`,
  ME: `${API_BASE_URL}/api/auth/me`,
  
  // Resume endpoints
  UPLOAD: `${API_BASE_URL}/api/resume/upload`,
  SCAN: `${API_BASE_URL}/api/resume/scan`,
} as const;

export default API_BASE_URL;
