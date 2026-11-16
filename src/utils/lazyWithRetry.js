/**
 * Lazy import with retry for stale chunk errors
 * 
 * Wraps React.lazy() to retry failed dynamic imports up to 2 times
 * with exponential backoff. If all retries fail and it's a chunk error,
 * triggers ONE guarded hard reload.
 */

const RELOAD_KEY = '__chunkErrorReload';
const MAX_RETRIES = 2;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const isChunkError = (error) => {
  return error?.message?.includes('Failed to fetch') || 
         error?.message?.includes('Importing a module script failed') ||
         error?.message?.includes('dynamically imported module') ||
         error?.name === 'ChunkLoadError';
};

const attemptHardReload = () => {
  // Guard against reload loops
  const lastReload = sessionStorage.getItem(RELOAD_KEY);
  const now = Date.now();
  
  // Allow reload if more than 10 seconds have passed
  if (!lastReload || now - parseInt(lastReload, 10) > 10000) {
    console.warn('[lazyWithRetry] Chunk error detected, performing guarded hard reload');
    sessionStorage.setItem(RELOAD_KEY, now.toString());
    window.location.reload();
    return true;
  }
  
  console.error('[lazyWithRetry] Reload loop detected, not reloading again');
  return false;
};

export function lazyWithRetry(importFunc) {
  return async () => {
    let lastError;
    
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        // Try the import
        const module = await importFunc();
        
        // Success - clear any old reload flag
        if (attempt > 0) {
          console.info(`[lazyWithRetry] Import succeeded after ${attempt} ${attempt === 1 ? 'retry' : 'retries'}`);
        }
        sessionStorage.removeItem(RELOAD_KEY);
        
        return module;
      } catch (error) {
        lastError = error;
        
        // If not a chunk error, fail immediately
        if (!isChunkError(error)) {
          throw error;
        }
        
        // If this was the last attempt, try hard reload
        if (attempt === MAX_RETRIES) {
          if (attemptHardReload()) {
            // Reload initiated, wait forever (page will reload)
            await new Promise(() => {});
          } else {
            // Reload loop detected, throw error
            throw error;
          }
        }
        
        // Otherwise, wait and retry
        const delay = Math.min(1000 * Math.pow(2, attempt), 3000);
        console.warn(`[lazyWithRetry] Chunk error on attempt ${attempt + 1}, retrying in ${delay}ms...`);
        await sleep(delay);
      }
    }
    
    throw lastError;
  };
}
