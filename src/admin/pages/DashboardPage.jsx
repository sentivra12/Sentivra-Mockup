import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  FolderOpen,
  Image,
  Star,
  Mail,
  TrendingUp,
  Eye,
  FileText,
  Users,
  ArrowUpRight,
} from 'lucide-react';
import { useServices } from '@/hooks/useContent';
import { useProjects } from '@/hooks/useContent';
import { useMockups } from '@/hooks/useContent';
import { useMessages } from '@/hooks/useContent';
import { useTestimonials } from '@/hooks/useContent';

const StatCard = ({ icon: Icon, title, value, change, trend, color, link }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="bg-card border border-border rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
  >
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 rounded-xl bg-gradient-to-br ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      {change && (
        <div
          className={`flex items-center gap-1 text-sm ${
            trend === 'up' ? 'text-green-500' : 'text-red-500'
          }`}
        >
          <TrendingUp
            className={`w-4 h-4 ${trend === 'down' ? 'rotate-180' : ''}`}
          />
          <span>{change}</span>
        </div>
      )}
    </div>
    <h3 className="text-3xl font-bold mb-1">{value}</h3>
    <p className="text-muted-foreground text-sm mb-4">{title}</p>
    {link && (
      <Link
        to={link}
        className="flex items-center gap-1 text-primary text-sm font-medium hover:gap-2 transition-all"
      >
        <span>View all</span>
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    )}
  </motion.div>
);

const QuickAction = ({ icon: Icon, title, description, link, color }) => (
  <Link to={link}>
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-card border border-border rounded-xl p-5 hover:shadow-lg transition-all group"
    >
      <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${color} mb-3`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <h4 className="font-semibold mb-1 group-hover:text-primary transition-colors">
        {title}
      </h4>
      <p className="text-sm text-muted-foreground">{description}</p>
    </motion.div>
  </Link>
);

const RecentItem = ({ title, type, date, status }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center justify-between py-3 px-4 hover:bg-accent rounded-lg transition-colors"
  >
    <div className="flex items-center gap-3">
      <div className="w-2 h-2 rounded-full bg-primary" />
      <div>
        <p className="font-medium text-sm">{title}</p>
        <p className="text-xs text-muted-foreground">{type}</p>
      </div>
    </div>
    <div className="text-right">
      {status && (
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === 'new'
              ? 'bg-green-500/10 text-green-500'
              : status === 'read'
              ? 'bg-blue-500/10 text-blue-500'
              : 'bg-gray-500/10 text-gray-500'
          }`}
        >
          {status}
        </span>
      )}
      <p className="text-xs text-muted-foreground mt-1">{date}</p>
    </div>
  </motion.div>
);

const DashboardPage = () => {
  const { data: services, isLoading: servicesLoading } = useServices();
  const { data: projects, isLoading: projectsLoading } = useProjects();
  const { data: mockups, isLoading: mockupsLoading } = useMockups();
  const { data: messages, isLoading: messagesLoading } = useMessages();
  const { data: testimonials, isLoading: testimonialsLoading } = useTestimonials();

  const stats = [
    {
      icon: Briefcase,
      title: 'Total Services',
      value: servicesLoading ? '...' : services?.length || 0,
      change: null,
      trend: 'up',
      color: 'from-blue-500 to-blue-600',
      link: '/admin/services',
    },
    {
      icon: FolderOpen,
      title: 'Total Projects',
      value: projectsLoading ? '...' : projects?.length || 0,
      change: null,
      trend: 'up',
      color: 'from-purple-500 to-purple-600',
      link: '/admin/projects',
    },
    {
      icon: Image,
      title: 'Total Mockups',
      value: mockupsLoading ? '...' : mockups?.length || 0,
      change: null,
      trend: 'up',
      color: 'from-pink-500 to-pink-600',
      link: '/admin/mockups',
    },
    {
      icon: Mail,
      title: 'New Messages',
      value: messagesLoading
        ? '...'
        : messages?.filter((m) => m.status === 'new').length || 0,
      change: null,
      trend: 'up',
      color: 'from-green-500 to-green-600',
      link: '/admin/messages',
    },
    {
      icon: Star,
      title: 'Testimonials',
      value: testimonialsLoading ? '...' : testimonials?.length || 0,
      change: null,
      trend: 'up',
      color: 'from-yellow-500 to-yellow-600',
      link: '/admin/testimonials',
    },
    {
      icon: Eye,
      title: 'Site Visits',
      value: '2,847',
      change: '+12%',
      trend: 'up',
      color: 'from-indigo-500 to-indigo-600',
      link: null,
    },
  ];

  const quickActions = [
    {
      icon: Briefcase,
      title: 'Add New Service',
      description: 'Create a new service offering',
      link: '/admin/services',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: FolderOpen,
      title: 'Add New Project',
      description: 'Showcase your latest work',
      link: '/admin/projects',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: FileText,
      title: 'Write Blog Post',
      description: 'Share insights and updates',
      link: '/admin/blog',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: Users,
      title: 'Add Client Logo',
      description: 'Feature your trusted clients',
      link: '/admin/client-logos',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const recentMessages = messages
    ?.slice(0, 5)
    .map((msg) => ({
      title: msg.name || msg.email,
      type: `${msg.type} - ${msg.subject || 'No subject'}`,
      date: new Date(msg.created_at).toLocaleDateString(),
      status: msg.status,
    })) || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Welcome back! Here's what's happening with your site.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Last updated:</span>
          <span className="font-medium">{new Date().toLocaleString()}</span>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <QuickAction {...action} />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Recent Messages */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Recent Messages</h2>
          <Link
            to="/admin/messages"
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentMessages.length > 0 ? (
            recentMessages.map((item, index) => (
              <RecentItem key={index} {...item} />
            ))
          ) : (
            <p className="text-muted-foreground text-center py-8">
              No messages yet
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
