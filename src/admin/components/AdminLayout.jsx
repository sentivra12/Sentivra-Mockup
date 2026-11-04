import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Settings,
  FileText,
  Briefcase,
  Image,
  Star,
  HelpCircle,
  Users,
  Mail,
  Globe,
  Menu,
  X,
  LogOut,
  Sparkles,
  FolderOpen,
} from 'lucide-react';
import { signOut, getCurrentUser } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          navigate('/admin/login');
        } else {
          setUser(currentUser);
        }
      } catch (error) {
        navigate('/admin/login');
      }
    };

    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({
        title: 'Logged out successfully',
        description: 'See you next time!',
      });
      navigate('/admin/login');
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Settings, label: 'Site Settings', path: '/admin/settings' },
    { icon: Globe, label: 'Hero Section', path: '/admin/hero' },
    { icon: Briefcase, label: 'Services', path: '/admin/services' },
    { icon: FolderOpen, label: 'Projects', path: '/admin/projects' },
    { icon: Image, label: 'Mockups', path: '/admin/mockups' },
    { icon: Star, label: 'Testimonials', path: '/admin/testimonials' },
    { icon: HelpCircle, label: 'FAQs', path: '/admin/faqs' },
    { icon: Users, label: 'Client Logos', path: '/admin/client-logos' },
    { icon: FileText, label: 'Blog Posts', path: '/admin/blog' },
    { icon: Mail, label: 'Messages', path: '/admin/messages' },
    { icon: Image, label: 'Media Library', path: '/admin/media' },
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        >
          <Sparkles className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Sidebar - Desktop */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 280 : 80 }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border z-30 hidden lg:block"
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <AnimatePresence mode="wait">
              {sidebarOpen ? (
                <motion.div
                  key="logo-expanded"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="font-bold text-lg">Sentivra CMS</span>
                </motion.div>
              ) : (
                <motion.div
                  key="logo-collapsed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center"
                >
                  <Sparkles className="w-5 h-5 text-white" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-6 px-3">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group ${
                      isActive
                        ? 'bg-gradient-to-r from-primary to-secondary text-white'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{item.label}</span>
                  )}
                </NavLink>
              ))}
            </div>
          </nav>

          {/* User & Logout */}
          <div className="p-4 border-t border-border">
            {sidebarOpen ? (
              <div className="mb-3 px-3">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrator</p>
              </div>
            ) : null}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut className="w-5 h-5" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>

        {/* Toggle Button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="absolute -right-3 top-6 w-6 h-6 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent transition-colors"
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <X className="w-3 h-3" />
          </motion.div>
        </button>
      </motion.aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 bg-card border border-border rounded-xl flex items-center justify-center shadow-lg"
      >
        {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              className="fixed left-0 top-0 h-full w-72 bg-card border-r border-border z-50 lg:hidden"
            >
              <div className="flex flex-col h-full">
                <div className="h-16 flex items-center px-6 border-b border-border">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-bold text-lg">Sentivra CMS</span>
                  </div>
                </div>
                <nav className="flex-1 overflow-y-auto py-6 px-3">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                            isActive
                              ? 'bg-gradient-to-r from-primary to-secondary text-white'
                              : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                          }`
                        }
                      >
                        <item.icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{item.label}</span>
                      </NavLink>
                    ))}
                  </div>
                </nav>
                <div className="p-4 border-t border-border">
                  <div className="mb-3 px-3">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Administrator</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[280px]' : 'lg:ml-[80px]'
        }`}
      >
        <div className="p-4 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
