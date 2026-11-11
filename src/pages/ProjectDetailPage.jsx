import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, Building2, Briefcase, ExternalLink, Github, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useProjects, useProjectCategories } from '@/hooks/useContent';
import { useTranslation } from '@/i18n/useTranslation';
import { SEO } from '@/components/SEO';
import Container from '@/components/ui/Container';
import Section from '@/components/ui/Section';
import InverseSurface from '@/components/ui/InverseSurface';
import EnhancedProjectCard from '@/components/ui/EnhancedProjectCard';
import { Button } from '@/components/ui/button';

/**
 * ProjectDetailPage - Full case study page for a single project
 * Route: /our-work/:slug
 * 
 * Sections:
 * 1. Hero with breadcrumb & cover image
 * 2. Project facts row (client, industry, year)
 * 3. Overview with long description
 * 4. Technologies used
 * 5. Image gallery (if available)
 * 6. Related projects
 * 7. Final CTA
 */
const ProjectDetailPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t, language } = useTranslation();
  const isRTL = language === 'ar';

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch data
  const { data: projects = [], isLoading } = useProjects();
  const { data: categories = [] } = useProjectCategories();

  // Find the project
  const project = projects.find(p => p.slug === slug && p.is_active);
  
  // Get category info
  const category = categories.find(cat => cat.id === project?.category_id);

  // Parse tech stack
  const parseTechStack = (techData) => {
    if (!techData) return [];
    if (Array.isArray(techData)) return techData;
    try {
      return JSON.parse(techData);
    } catch {
      return [];
    }
  };

  // Parse gallery images
  const parseGallery = (galleryData) => {
    if (!galleryData) return [];
    if (Array.isArray(galleryData)) return galleryData;
    try {
      return JSON.parse(galleryData);
    } catch {
      return [];
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // 404 if project not found
  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center max-w-md px-4">
          <div className="w-20 h-20 rounded-full bg-frost-soft flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-10 h-10 text-text-muted" />
          </div>
          <h1 className="text-3xl font-bold text-primary-deep mb-4">
            {isRTL ? 'المشروع غير موجود' : 'Project Not Found'}
          </h1>
          <p className="text-text-muted mb-8">
            {isRTL 
              ? 'عذراً، لم نتمكن من العثور على المشروع المطلوب.'
              : 'Sorry, we couldn\'t find the project you\'re looking for.'}
          </p>
          <Button onClick={() => navigate('/our-work')} className="bg-primary hover:bg-primary-dark text-white">
            {isRTL ? 'عرض كل المشاريع' : 'View All Projects'}
          </Button>
        </div>
      </div>
    );
  }

  // Project data
  const title = isRTL ? (project.title_ar || project.title) : (project.title_en || project.title);
  const shortDescription = isRTL 
    ? (project.short_description_ar || project.short_description) 
    : (project.short_description_en || project.short_description);
  const longDescription = isRTL 
    ? (project.long_description_ar || project.long_description) 
    : (project.long_description_en || project.long_description);
  
  const techStack = parseTechStack(project.tech_stack);
  const galleryImages = parseGallery(project.gallery_images);
  const categoryName = isRTL ? category?.name_ar : category?.name_en;

  // Related projects (same category, excluding current)
  const relatedProjects = projects
    .filter(p => p.is_active && p.category_id === project.category_id && p.slug !== slug)
    .slice(0, 3);

  // SEO
  const seoTitle = `${title} - Sentivra`;
  const seoDescription = shortDescription || longDescription?.substring(0, 160);

  // Gallery handlers
  const openGallery = (index) => {
    setCurrentImageIndex(index);
    setGalleryOpen(true);
  };

  const closeGallery = () => {
    setGalleryOpen(false);
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <SEO 
        title={seoTitle}
        description={seoDescription}
        type="article"
      />
      <Helmet>
        <title>{seoTitle}</title>
        <meta name="description" content={seoDescription} />
      </Helmet>

      {/* Hero Section */}
      <InverseSurface withGrid className="pt-24 pb-12 md:pt-32 md:pb-16">
        <Container>
          {/* Breadcrumb */}
          <nav 
            className={`flex items-center gap-2 text-sm text-inverse-fg-muted mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
            aria-label="Breadcrumb"
          >
            <Link to="/" className="hover:text-inverse-accent transition-colors">
              {t('nav.home')}
            </Link>
            <span>/</span>
            <Link to="/our-work" className="hover:text-inverse-accent transition-colors">
              {isRTL ? 'أعمالنا' : 'Our Work'}
            </Link>
            <span>/</span>
            <span className="text-inverse-fg font-medium">{title}</span>
          </nav>

          {/* Back Button */}
          <button
            onClick={() => navigate('/our-work')}
            className={`inline-flex items-center gap-2 text-inverse-fg-muted hover:text-inverse-accent transition-colors mb-8 group ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <ArrowLeft className={`w-4 h-4 group-hover:-translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
            <span className="text-sm font-medium">
              {isRTL ? 'العودة للمشاريع' : 'Back to Projects'}
            </span>
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              {/* Category Badge */}
              {categoryName && (
                <div className="mb-4">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-inverse-fg/10 border border-inverse-border-subtle text-inverse-accent text-sm font-semibold backdrop-blur-sm">
                    {categoryName}
                  </span>
                </div>
              )}

              {/* Title */}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-inverse-fg leading-tight mb-6">
                {title}
              </h1>

              {/* Short Description */}
              <p className="text-xl text-inverse-fg-muted leading-relaxed mb-8">
                {shortDescription}
              </p>

              {/* Action Buttons */}
              <div className={`flex flex-wrap gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {project.live_url && (
                  <a 
                    href={project.live_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      size="lg"
                      className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-6 py-5 rounded-lg shadow-lg hover:shadow-xl transition-all"
                    >
                      <ExternalLink className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'عرض المشروع' : 'View Live'}
                    </Button>
                  </a>
                )}
                {project.github_url && (
                  <a 
                    href={project.github_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-block"
                  >
                    <Button 
                      size="lg"
                      variant="outline"
                      className="border-2 border-inverse-border text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-6 py-5 rounded-lg backdrop-blur-sm"
                    >
                      <Github className={`w-5 h-5 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                      {isRTL ? 'الكود المصدري' : 'Source Code'}
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>

            {/* Right: Cover Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-inverse-border-subtle">
                {project.cover_image_url ? (
                  <img
                    src={project.cover_image_url}
                    alt={title}
                    className={`w-full h-full ${project.cover_fit === 'contain' ? 'object-contain' : 'object-cover'}`}
                  />
                ) : (
                  <div className="w-full h-full bg-inverse-fg/10 flex items-center justify-center">
                    <Briefcase className="w-20 h-20 text-inverse-fg-muted" />
                  </div>
                )}
              </div>

              {/* Floating gradient orbs */}
              <motion.div
                animate={{ y: [0, -20, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-inverse-accent/20 blur-3xl"
              />
              <motion.div
                animate={{ y: [0, 20, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -bottom-8 -left-8 w-40 h-40 rounded-full bg-purple-500/20 blur-3xl"
              />
            </motion.div>
          </div>
        </Container>
      </InverseSurface>

      {/* Project Facts Row */}
      {(project.client_name || project.industry || project.project_year) && (
        <Section spacing="md" className="bg-frost-soft/50 border-y border-frost">
          <Container>
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${isRTL ? 'text-right' : ''}`}>
              {project.client_name && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">
                      {isRTL ? 'العميل' : 'Client'}
                    </p>
                    <p className="text-lg font-bold text-primary-deep">
                      {project.client_name}
                    </p>
                  </div>
                </motion.div>
              )}

              {project.industry && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Briefcase className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">
                      {isRTL ? 'الصناعة' : 'Industry'}
                    </p>
                    <p className="text-lg font-bold text-primary-deep">
                      {project.industry}
                    </p>
                  </div>
                </motion.div>
              )}

              {project.project_year && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className={`flex items-start gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-text-muted font-medium mb-1">
                      {isRTL ? 'السنة' : 'Year'}
                    </p>
                    <p className="text-lg font-bold text-primary-deep">
                      {project.project_year}
                    </p>
                  </div>
                </motion.div>
              )}
            </div>
          </Container>
        </Section>
      )}

      {/* Overview Section */}
      {longDescription && (
        <Section spacing="lg" className="bg-color-background">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-6">
                {isRTL ? 'نظرة عامة' : 'Overview'}
              </h2>
              <div className="prose prose-lg max-w-none text-text-muted leading-relaxed">
                <p className="whitespace-pre-line">{longDescription}</p>
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Technologies Section */}
      {techStack.length > 0 && (
        <Section spacing="lg" className="bg-frost-soft/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-8">
                {isRTL ? 'التقنيات المستخدمة' : 'Technologies Used'}
              </h2>
              <div className={`flex flex-wrap gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {techStack.map((tech, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="px-5 py-3 rounded-xl bg-primary/10 border border-primary/20 text-primary font-semibold hover:bg-primary/20 transition-colors"
                  >
                    {tech}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Image Gallery Section */}
      {galleryImages.length > 0 && (
        <Section spacing="lg" className="bg-color-background">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-6xl mx-auto"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-8">
                {isRTL ? 'معرض الصور' : 'Gallery'}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {galleryImages.map((image, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="relative aspect-video rounded-xl overflow-hidden cursor-pointer group shadow-card hover:shadow-dropdown transition-all"
                    onClick={() => openGallery(index)}
                  >
                    <img
                      src={image}
                      alt={`${title} - ${isRTL ? 'صورة' : 'Image'} ${index + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </Container>
        </Section>
      )}

      {/* Gallery Lightbox */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
            onClick={closeGallery}
          >
            {/* Close Button */}
            <button
              onClick={closeGallery}
              className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>

            {/* Navigation Buttons */}
            {galleryImages.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className={`absolute ${isRTL ? 'right-4' : 'left-4'} z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors`}
                >
                  <ChevronLeft className={`w-6 h-6 text-white ${isRTL ? 'rotate-180' : ''}`} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className={`absolute ${isRTL ? 'left-4' : 'right-4'} z-10 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors`}
                >
                  <ChevronRight className={`w-6 h-6 text-white ${isRTL ? 'rotate-180' : ''}`} />
                </button>
              </>
            )}

            {/* Image */}
            <motion.img
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              src={galleryImages[currentImageIndex]}
              alt={`${title} - ${isRTL ? 'صورة' : 'Image'} ${currentImageIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {/* Image Counter */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-white text-sm font-medium">
              {currentImageIndex + 1} / {galleryImages.length}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Related Projects Section */}
      {relatedProjects.length > 0 && (
        <Section spacing="xl" className="bg-frost-soft/50">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-primary-deep mb-4">
                {isRTL ? 'مشاريع ذات صلة' : 'Related Projects'}
              </h2>
              <p className="text-lg text-text-muted">
                {isRTL 
                  ? 'مشاريع أخرى قد تهمك في نفس المجال'
                  : 'Other projects you might be interested in'}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedProjects.map((relatedProject, index) => (
                <Link key={relatedProject.id} to={`/our-work/${relatedProject.slug}`}>
                  <EnhancedProjectCard
                    project={{
                      ...relatedProject,
                      title: isRTL ? (relatedProject.title_ar || relatedProject.title) : (relatedProject.title_en || relatedProject.title),
                      short_description: isRTL 
                        ? (relatedProject.short_description_ar || relatedProject.short_description) 
                        : (relatedProject.short_description_en || relatedProject.short_description),
                      category_name: isRTL 
                        ? categories.find(c => c.id === relatedProject.category_id)?.name_ar
                        : categories.find(c => c.id === relatedProject.category_id)?.name_en
                    }}
                    delay={index * 0.1}
                  />
                </Link>
              ))}
            </div>

            {/* View All Link */}
            <div className="text-center mt-12">
              <Link
                to="/our-work"
                className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all group"
              >
                <span>{isRTL ? 'عرض كل المشاريع' : 'View All Projects'}</span>
                <ExternalLink className={`w-5 h-5 ${isRTL ? 'rotate-180 group-hover:-translate-x-1' : 'group-hover:translate-x-1'} transition-transform`} />
              </Link>
            </div>
          </Container>
        </Section>
      )}

      {/* Final CTA */}
      <InverseSurface withTopGlow className="py-16 md:py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-inverse-fg mb-6">
              {isRTL ? 'لديك مشروع مماثل؟' : 'Have a Similar Project?'}
            </h2>
            <p className="text-xl text-inverse-fg-muted mb-8">
              {isRTL 
                ? 'دعنا نساعدك في تحويل رؤيتك إلى حقيقة. تواصل معنا اليوم لمناقشة مشروعك.'
                : 'Let\'s help you turn your vision into reality. Contact us today to discuss your project.'}
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
              <Link to="/contact">
                <Button 
                  size="lg"
                  className="bg-inverse-accent hover:bg-inverse-accent/90 text-inverse-bg font-semibold px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all"
                >
                  {isRTL ? 'تواصل معنا' : 'Contact Us'}
                  <ExternalLink className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </Link>
              <Link to="/services">
                <Button 
                  size="lg"
                  variant="outline"
                  className="border-2 border-inverse-border text-inverse-fg hover:bg-inverse-fg/10 font-semibold px-8 py-6 rounded-lg backdrop-blur-sm"
                >
                  {isRTL ? 'استكشف خدماتنا' : 'Explore Our Services'}
                  <Briefcase className={`w-5 h-5 ${isRTL ? 'mr-2' : 'ml-2'}`} />
                </Button>
              </Link>
            </div>
          </motion.div>
        </Container>
      </InverseSurface>
    </motion.div>
  );
};

export default ProjectDetailPage;
