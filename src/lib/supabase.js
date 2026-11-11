import { createClient } from '@supabase/supabase-js';

// =============================================
// GLOBAL FETCH TIMEOUT WRAPPER
// =============================================

/**
 * Wrap native fetch with aggressive timeout to prevent hanging requests
 * This is the LOWEST level timeout - catches ALL Supabase HTTP calls
 */
const createTimeoutFetch = (timeoutMs = 10000) => {
  return (url, options = {}) => {
    return new Promise((resolve, reject) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        reject(new Error(`Network request timed out after ${timeoutMs}ms: ${url}`));
      }, timeoutMs);

      // Log slow requests in dev
      let slowWarningId;
      if (import.meta.env.DEV && timeoutMs > 5000) {
        slowWarningId = setTimeout(() => {
          console.warn(`⚠️ [Slow Network] Request pending for 5s: ${url}`);
        }, 5000);
      }

      fetch(url, {
        ...options,
        signal: controller.signal,
      })
        .then((response) => {
          clearTimeout(timeoutId);
          if (slowWarningId) clearTimeout(slowWarningId);
          resolve(response);
        })
        .catch((error) => {
          clearTimeout(timeoutId);
          if (slowWarningId) clearTimeout(slowWarningId);
          
          // AbortError means our timeout triggered
          if (error.name === 'AbortError') {
            reject(new Error(`Network request timed out after ${timeoutMs}ms: ${url}`));
          } else {
            reject(error);
          }
        });
    });
  };
};

// =============================================
// SUPABASE CLIENT SETUP
// =============================================

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if environment variables are missing
export const isMissingEnv = !supabaseUrl || !supabaseAnonKey;

if (isMissingEnv) {
  console.error('⚠️ Missing Supabase environment variables!');
  console.error('Please create a .env.local file with:');
  console.error('VITE_SUPABASE_URL=your-project-url');
  console.error('VITE_SUPABASE_ANON_KEY=your-anon-key');
  console.error('');
  console.error('Get these values from: https://app.supabase.com/project/_/settings/api');
}

// Create Supabase client with fallback values to prevent crash
// When env vars are missing, the client will be created but API calls will fail gracefully
// Use custom fetch with 10s timeout to prevent hanging
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Don't hang on auth - fail fast
      detectSessionInUrl: false,
    },
    global: {
      fetch: createTimeoutFetch(10000), // 10s timeout for ALL requests
    },
    db: {
      schema: 'public',
    },
    realtime: {
      // Disable realtime to reduce connections
      disabled: true,
    },
  }
);

// Helper function to get public URL for storage files
export const getPublicUrl = (bucket, path) => {
  if (!path) return null;
  
  // If it's already a full URL, return as-is
  if (path.startsWith('http')) return path;
  
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
};

// Helper function to upload file to storage
export const uploadFile = async (bucket, path, file) => {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  return getPublicUrl(bucket, data.path);
};

// Helper function to delete file from storage
export const deleteFile = async (bucket, path) => {
  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }

  return true;
};

// Auth helpers with explicit timeouts
export const getCurrentUser = async () => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('getCurrentUser timed out after 8s')), 8000)
  );
  
  const userPromise = supabase.auth.getUser().then(({ data: { user }, error }) => {
    if (error) throw error;
    return user;
  });
  
  return Promise.race([userPromise, timeoutPromise]);
};

export const signIn = async (email, password) => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Sign in timed out after 15s')), 15000)
  );
  
  const signInPromise = supabase.auth.signInWithPassword({
    email,
    password,
  }).then(({ data, error }) => {
    if (error) throw error;
    return data;
  });
  
  return Promise.race([signInPromise, timeoutPromise]);
};

export const signOut = async () => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Sign out timed out after 8s')), 8000)
  );
  
  const signOutPromise = supabase.auth.signOut().then(({ error }) => {
    if (error) throw error;
  });
  
  return Promise.race([signOutPromise, timeoutPromise]);
};

export const isAuthenticated = async () => {
  try {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('getSession timed out after 8s')), 8000)
    );
    
    const sessionPromise = supabase.auth.getSession().then(({ data: { session } }) => {
      return !!session;
    });
    
    return await Promise.race([sessionPromise, timeoutPromise]);
  } catch (error) {
    console.warn('isAuthenticated check failed:', error.message);
    // On timeout or error, assume not authenticated (fail open for public pages)
    return false;
  }
};

export default supabase;
