import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { getConfigErrorMessage } from '@/config/env';

const ConfigErrorScreen = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card border border-frost rounded-2xl shadow-lg p-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <AlertTriangle className="w-8 h-8 text-red-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-primary-deep mb-2">
          Configuration Missing
        </h1>
        
        <p className="text-text-muted mb-6">
          {getConfigErrorMessage()}
        </p>
        
        <div className="bg-background border border-frost rounded-lg p-4 text-left text-sm">
          <p className="font-semibold text-text-primary mb-2">Required Environment Variables:</p>
          <ul className="space-y-1 text-text-muted">
            <li>• <code className="text-primary">VITE_SUPABASE_URL</code></li>
            <li>• <code className="text-primary">VITE_SUPABASE_ANON_KEY</code></li>
          </ul>
          
          <p className="mt-4 text-text-muted">
            Please add these variables in your deployment platform (Vercel, Netlify, etc.) 
            and redeploy the application.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConfigErrorScreen;
