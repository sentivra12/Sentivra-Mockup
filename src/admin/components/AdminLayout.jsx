import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Settings, FileText, Briefcase, Image, Star,
  HelpCircle, Users, Mail, Globe, Menu, X, LogOut, FolderOpen,
  BookOpen, Grid, ChevronLeft,
} from 'lucide-react';
import { signOut, getCurrentUser } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import Logo from '@/components/ui/Logo';
import { SPMark } from '@/components/ui/Logo';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard',          path: '/admin/dashboard'          },
  { icon: Settings,        label: 'Site Settings',       path: '/admin/settings'           },
  { icon: Globe,           label: 'Hero Section',        path: '/admin/hero'               },
  { icon: BookOpen,        label: 'Page Content',        path: '/admin/page-content'       },
  { icon: Briefcase,       label: 'Services',            path: '/admin/services'           },
  { icon: Grid,            label: 'Service Categories',  path: '/admin/service-categories' },
  { icon: FolderOpen,      label: 'Projects',            path: '/admin/projects'           },
  { icon: Image,           label: 'Mockups',             path: '/admin/mockups'            },
  { icon: Star,            label: 'Testimonials',        path: '/admin/testimonials'       },
  { icon: HelpCircle,      label: 'FAQs',                path: '/admin/faqs'               },
  { icon: Users,           label: 'Client Logos',        path: '/admin/client-logos'       },
  { icon: FileText,        label: 'Blog Posts',          path: '/admin/blog'               },
  { icon: Mail,            label: 'Messages',            path: '/admin/messages'           },
  { icon: Image,           label: 'Media Library',       path: '/admin/media'              },
];

/* Sidebar nav link */
const SidebarLink = ({ item, expanded, onClick }) => (
  <NavLink
    to={item.path}
    onClick={onClick}
    title={!expanded ? item.label : undefined}
    className={({ isActive }) =>
      [
        'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group',
        isActive
          ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white shadow-sm shadow-brand-900/30'
          : 'text-brand-200 hover:bg-brand-800/60 hover:text-white',
      ].join(' ')
    }
  >
    <item.icon className="w-5 h-5 flex-shrink-0" />
    {expanded && <span className="text-sm font-medium truncate">{item.label}</span>}
  </NavLink>
);

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    getCurrentUser()
      .then(u => { if (!u) navigate('/admin/login'); else setUser(u); })
      .catch(() => navigate('/admin/login'));
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await signOut();
      toast({ title: 'Logged out successfully', description: 'See you next time!' });
      navigate('/admin/login');
    } catch (error) {
      toast({ title: 'Logout failed', description: error.message, variant: 'destructive' });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-brand-950 flex items-center justify-center">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
          <SPMark size={48} markColor="#FFFFFF" showBg />
        </motion.div>
      </div>
    );
  }

  /* ── Sidebar inner content (shared between desktop & mobile) ────────── */
  const SidebarContent = ({ expanded, onLinkClick }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-brand-700/50 flex-shrink-0">
        <AnimatePresence mode="wait">
          {expanded ? (
            <motion.div key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <Logo variant="light" size={30} wordmark="Sentivra CMS" />
            </motion.div>
          ) : (
            <motion.div key="mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <SPMark size={30} markColor="#FFFFFF" showBg />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-5 px-3 space-y-1" aria-label="Admin navigation">
        {menuItems.map(item => (
          <SidebarLink key={item.path} item={item} expanded={expanded} onClick={onLinkClick} />
        ))}
      </nav>

      {/* User + logout */}
      <div className="p-4 border-t border-brand-700/50 flex-shrink-0">
        {expanded && (
          <div className="mb-3 px-3">
            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
            <p className="text-xs text-brand-400">Administrator</p>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-brand-300 hover:bg-red-900/30 hover:text-red-300 transition-all"
          aria-label="Logout"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {expanded && <span className="text-sm font-medium">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen bg-brand-50 dark:bg-brand-950 overflow-x-hidden">
      <Helmet>
        <meta name="robots" content="noindex, nofollow" />
        <title>Admin — Sentivra CMS</title>
      </Helmet>

      {/* ── Desktop sidebar ───────────────────────────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className="fixed left-0 top-0 h-full z-30 hidden lg:flex flex-col"
        style={{
          background: 'linear-gradient(180deg, #033830 0%, #02231E 100%)',
          willChange: 'width',
        }}
      >
        <SidebarContent expanded={sidebarOpen} onLinkClick={undefined} />

        {/* Collapse toggle */}
        <button
          onClick={() => setSidebarOpen(o => !o)}
          className="absolute -right-3 top-5 w-6 h-6 rounded-full bg-brand-700 border border-brand-600 flex items-center justify-center hover:bg-brand-600 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <motion.div animate={{ rotate: sidebarOpen ? 0 : 180 }}>
            <ChevronLeft className="w-3 h-3 text-white" />
          </motion.div>
        </button>
      </motion.aside>

      {/* ── Mobile hamburger ─────────────────────────────────────────── */}
      <button
        onClick={() => setMobileMenuOpen(o => !o)}
        className="fixed top-3 left-3 z-50 lg:hidden w-10 h-10 rounded-xl flex items-center justify-center shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
        style={{ background: 'linear-gradient(135deg, #0D9E82, #044D40)' }}
        aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={mobileMenuOpen}
      >
        {mobileMenuOpen ? <X className="w-5 h-5 text-white" /> : <Menu className="w-5 h-5 text-white" />}
      </button>

      {/* ── Mobile drawer ────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-brand-950/80 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'tween', duration: 0.26 }}
              className="fixed left-0 top-0 h-full w-72 z-50 lg:hidden"
              style={{ background: 'linear-gradient(180deg, #033830 0%, #02231E 100%)' }}
            >
              <SidebarContent expanded onLinkClick={() => setMobileMenuOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        className={`min-h-screen transition-all duration-300 ${
          sidebarOpen ? 'lg:ml-[260px]' : 'lg:ml-[72px]'
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
