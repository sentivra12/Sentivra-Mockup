import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, LogIn } from 'lucide-react';
import { signIn } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await signIn(formData.email, formData.password);
      toast({
        title: 'Welcome back!',
        description: 'You have successfully logged in.',
      });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Login failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-card border border-frost rounded-2xl shadow-lg shadow-primary/10 p-8">
          {/* Logo & Title */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-primary-strong rounded-2xl mb-4"
            >
              <span className="text-3xl font-bold text-white">S</span>
            </motion.div>
            <h1 className="text-3xl font-bold text-primary-deep">
              Sentivra <span className="text-primary">CMS</span>
            </h1>
            <p className="text-text-muted mt-2">
              Sign in to manage your content
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full ps-11 pe-4 py-3 bg-background border border-frost rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  placeholder="admin@sentivra.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full ps-11 pe-4 py-3 bg-background border border-frost rounded-xl text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary/50 focus-visible:ring-2 focus-visible:ring-primary/50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-3 px-4 bg-primary-strong text-white font-medium rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark hover:shadow-xl hover:shadow-primary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-strong focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:bg-primary-strong disabled:hover:shadow-lg flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                  >
                    <LogIn className="w-5 h-5" />
                  </motion.div>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="w-5 h-5" />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Footer - removed non-functional links */}
          <div className="mt-6 text-center text-sm text-text-muted">
            <p>Need help? Contact your administrator</p>
          </div>
        </div>

        {/* Security Note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-text-muted mt-6"
        >
          🔒 Your connection is secure and encrypted
        </motion.p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
