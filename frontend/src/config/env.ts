// Environment configuration
export const config = {
  // API Configuration - uses environment variables with fallbacks
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  WS_BASE_URL: import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8080/api/ws',
  
  // Environment detection
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // Get the appropriate base URL based on environment
  getApiBaseUrl: () => {
    return config.API_BASE_URL;
  },
  
  getWsBaseUrl: () => {
    return config.WS_BASE_URL;
  }
}; 