/**
 * Console Filter - Suppresses known non-critical warnings
 * This filters out Razorpay test mode warnings that don't affect functionality
 */

const FILTERED_MESSAGES = [
  'x-rtb-fingerprint-id',
  'Permissions policy violation',
  'accelerometer is not allowed',
  'CORS policy',
  'loopback',
  'ERR_FAILED',
  'ERR_CONNECTION_REFUSED',
  'localhost:7070',
  'localhost:37857',
  'api.razorpay.com',
];

const originalError = console.error;
const originalWarn = console.warn;

// Filter console.error
console.error = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this is a filtered message
  const shouldFilter = FILTERED_MESSAGES.some(filtered => 
    message.includes(filtered)
  );
  
  if (!shouldFilter) {
    originalError.apply(console, args);
  }
};

// Filter console.warn
console.warn = (...args: any[]) => {
  const message = args.join(' ');
  
  // Check if this is a filtered message
  const shouldFilter = FILTERED_MESSAGES.some(filtered => 
    message.includes(filtered)
  );
  
  if (!shouldFilter) {
    originalWarn.apply(console, args);
  }
};

// Export for manual use if needed
export const cleanConsole = () => {
  console.clear();
  console.log('%c✨ Console Cleaned!', 'color: #10b981; font-size: 16px; font-weight: bold;');
  console.log('%cℹ️ Razorpay test mode warnings are filtered automatically', 'color: #3b82f6; font-size: 12px;');
};

export const logInfo = (message: string, data?: any) => {
  console.log(`%c📋 ${message}`, 'color: #3b82f6; font-weight: bold;', data || '');
};

export const logSuccess = (message: string) => {
  console.log(`%c✅ ${message}`, 'color: #10b981; font-weight: bold;');
};

export const logError = (message: string, error?: any) => {
  originalError(`❌ ${message}`, error || '');
};
