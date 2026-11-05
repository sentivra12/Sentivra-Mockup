/**
 * Environment Variables Configuration
 * 
 * Required variables for production:
 * - VITE_SUPABASE_URL: Your Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Your Supabase anonymous/public key
 */

export const ENV = {
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
  IS_PRODUCTION: import.meta.env.PROD,
  IS_DEVELOPMENT: import.meta.env.DEV,
};

export const isMissingConfig = () => {
  return !ENV.SUPABASE_URL || !ENV.SUPABASE_ANON_KEY;
};

export const getConfigErrorMessage = () => {
  const missing = [];
  if (!ENV.SUPABASE_URL) missing.push('VITE_SUPABASE_URL');
  if (!ENV.SUPABASE_ANON_KEY) missing.push('VITE_SUPABASE_ANON_KEY');
  
  return `Missing environment variables: ${missing.join(', ')}`;
};
