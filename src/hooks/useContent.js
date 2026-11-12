import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../lib/api';

// =============================================
// SITE SETTINGS
// =============================================

export const useSiteSettings = () => {
  return useQuery({
    queryKey: ['siteSettings'],
    queryFn: api.fetchSiteSettings,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateSiteSettings = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateSiteSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['siteSettings'] });
    },
  });
};

// =============================================
// HERO
// =============================================

export const useHero = () => {
  return useQuery({
    queryKey: ['hero'],
    queryFn: api.fetchHero,
    staleTime: 5 * 60 * 1000,
  });
};

export const useUpdateHero = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updateHero,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hero'] });
    },
  });
};

// =============================================
// SERVICES
// =============================================

export const useServices = (category = null) => {
  return useQuery({
    queryKey: ['services', category],
    queryFn: () => api.fetchServices(category),
    staleTime: 5 * 60 * 1000,
  });
};

export const useServiceBySlug = (slug) => {
  return useQuery({
    queryKey: ['service', slug],
    queryFn: () => api.fetchServiceBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateService(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteService,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

// =============================================
// PROJECTS
// =============================================

export const useProjects = (category = null, featured = false) => {
  return useQuery({
    queryKey: ['projects', category, featured],
    queryFn: () => api.fetchProjects(category, featured),
    staleTime: 5 * 60 * 1000,
  });
};

export const useProjectBySlug = (slug) => {
  return useQuery({
    queryKey: ['project', slug],
    queryFn: () => api.fetchProjectBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateProject(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

export const useDeleteProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// =============================================
// MOCKUPS
// =============================================

export const useMockups = (category = null) => {
  return useQuery({
    queryKey: ['mockups', category],
    queryFn: () => api.fetchMockups(category),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMockup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMockup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockups'] });
    },
  });
};

export const useUpdateMockup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateMockup(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockups'] });
    },
  });
};

export const useDeleteMockup = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMockup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockups'] });
    },
  });
};

// =============================================
// TESTIMONIALS
// =============================================

export const useTestimonials = (featured = false) => {
  return useQuery({
    queryKey: ['testimonials', featured],
    queryFn: () => api.fetchTestimonials(featured),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};

export const useUpdateTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateTestimonial(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};

export const useDeleteTestimonial = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTestimonial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['testimonials'] });
    },
  });
};

// =============================================
// FAQs
// =============================================

export const useFAQs = (pageKey) => {
  return useQuery({
    queryKey: ['faqs', pageKey],
    queryFn: () => api.fetchFAQs(pageKey),
    enabled: !!pageKey,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useUpdateFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateFAQ(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useDeleteFAQ = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteFAQ,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

// =============================================
// CLIENT LOGOS
// =============================================

export const useClientLogos = () => {
  return useQuery({
    queryKey: ['clientLogos'],
    queryFn: api.fetchClientLogos,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateClientLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createClientLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientLogos'] });
    },
  });
};

export const useUpdateClientLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateClientLogo(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientLogos'] });
    },
  });
};

export const useDeleteClientLogo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteClientLogo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientLogos'] });
    },
  });
};

// =============================================
// TRUST BADGES
// =============================================

export const useTrustBadges = () => {
  return useQuery({
    queryKey: ['trustBadges'],
    queryFn: api.fetchTrustBadges,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// PROCESS STEPS
// =============================================

export const useProcessSteps = () => {
  return useQuery({
    queryKey: ['processSteps'],
    queryFn: api.fetchProcessSteps,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// WHY CHOOSE US
// =============================================

export const useWhyChooseUs = () => {
  return useQuery({
    queryKey: ['whyChooseUs'],
    queryFn: api.fetchWhyChooseUs,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// ABOUT PAGE DATA
// =============================================

export const useCountries = () => {
  return useQuery({
    queryKey: ['countries'],
    queryFn: api.fetchCountries,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useUpdateCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateCountry(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useDeleteCountry = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteCountry,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['countries'] });
    },
  });
};

export const useTimeline = () => {
  return useQuery({
    queryKey: ['timeline'],
    queryFn: api.fetchTimeline,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateTimelineMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTimelineMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useUpdateTimelineMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateTimelineMilestone(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useDeleteTimelineMilestone = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTimelineMilestone,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
};

export const useValues = () => {
  return useQuery({
    queryKey: ['values'],
    queryFn: api.fetchValues,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};

export const useUpdateValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }) => api.updateValue(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};

export const useDeleteValue = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteValue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['values'] });
    },
  });
};

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: api.fetchStats,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// BLOG POSTS
// =============================================

export const useBlogPosts = (status = 'published') => {
  return useQuery({
    queryKey: ['blogPosts', status],
    queryFn: () => api.fetchBlogPosts(status),
    staleTime: 5 * 60 * 1000,
  });
};

export const useBlogPostBySlug = (slug) => {
  return useQuery({
    queryKey: ['blogPost', slug],
    queryFn: () => api.fetchBlogPostBySlug(slug),
    enabled: !!slug,
    staleTime: 5 * 60 * 1000,
  });
};

// =============================================
// MESSAGES (Contact Form)
// =============================================

export const useCreateMessage = () => {
  return useMutation({
    mutationFn: api.createMessage,
  });
};

export const useMessages = (source = null, status = null) => {
  return useQuery({
    queryKey: ['messages', source, status],
    queryFn: () => api.fetchMessages(source, status),
    staleTime: 1 * 60 * 1000, // 1 minute (more frequent for messages)
  });
};

export const useUpdateMessageStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status, notes }) => api.updateMessageStatus(id, status, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

export const useDeleteMessage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });
};

// =============================================
// MEDIA LIBRARY
// =============================================

export const useMedia = (fileType = null) => {
  return useQuery({
    queryKey: ['media', fileType],
    queryFn: () => api.fetchMedia(fileType),
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMedia,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};

export const useDeleteMedia = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, filePath }) => api.deleteMedia(id, filePath),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['media'] });
    },
  });
};


// =============================================
// MARQUEE ITEMS
// =============================================

export const useMarqueeItems = (rowNumber = null) => {
  return useQuery({
    queryKey: ['marqueeItems', rowNumber],
    queryFn: () => api.fetchMarqueeItems(rowNumber),
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
};

export const useAllMarqueeItems = () => {
  return useQuery({
    queryKey: ['allMarqueeItems'],
    queryFn: api.fetchAllMarqueeItems,
    staleTime: 5 * 60 * 1000,
    retry: false,
    throwOnError: false,
  });
};

export const useCreateMarqueeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMarqueeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marqueeItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMarqueeItems'] });
    },
  });
};

export const useUpdateMarqueeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...values }) => api.updateMarqueeItem(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marqueeItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMarqueeItems'] });
    },
  });
};

export const useDeleteMarqueeItem = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMarqueeItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marqueeItems'] });
      queryClient.invalidateQueries({ queryKey: ['allMarqueeItems'] });
    },
  });
};

// =============================================
// PAGE CONTENT (New)
// =============================================

export const usePageContent = (pageKey, sectionKey) => {
  return useQuery({
    queryKey: ['pageContent', pageKey, sectionKey],
    queryFn: () => api.fetchPageContent(pageKey, sectionKey),
    staleTime: 5 * 60 * 1000,
    enabled: !!pageKey,
  });
};

export const useAllPageContent = (pageKey) => {
  return useQuery({
    queryKey: ['pageContent', pageKey],
    queryFn: () => api.fetchAllPageContent(pageKey),
    staleTime: 5 * 60 * 1000,
    enabled: !!pageKey,
  });
};

export const useUpdatePageContent = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.updatePageContent,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['pageContent'] });
    },
  });
};

// =============================================
// SERVICE CATEGORIES (New)
// =============================================

export const useServiceCategories = () => {
  return useQuery({
    queryKey: ['serviceCategories'],
    queryFn: api.fetchServiceCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change rarely)
  });
};

export const useServiceCategory = (slug) => {
  return useQuery({
    queryKey: ['serviceCategory', slug],
    queryFn: () => api.fetchServiceCategory(slug),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
};

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    },
  });
};

export const useUpdateServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.updateServiceCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    },
  });
};

export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteServiceCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['serviceCategories'] });
    },
  });
};


// =============================================
// PROJECT CATEGORIES (New)
// =============================================

export const useProjectCategories = () => {
  return useQuery({
    queryKey: ['projectCategories'],
    queryFn: api.fetchProjectCategories,
    staleTime: 10 * 60 * 1000, // 10 minutes (categories change rarely)
  });
};

export const useProjectCategory = (slug) => {
  return useQuery({
    queryKey: ['projectCategory', slug],
    queryFn: () => api.fetchProjectCategory(slug),
    staleTime: 10 * 60 * 1000,
    enabled: !!slug,
  });
};

export const useCreateProjectCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createProjectCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
};

export const useUpdateProjectCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...data }) => api.updateProjectCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
};

export const useDeleteProjectCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteProjectCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectCategories'] });
    },
  });
};

// =============================================
// MOCKUP CATEGORIES
// =============================================

export const useMockupCategories = () => {
  return useQuery({
    queryKey: ['mockupCategories'],
    queryFn: api.getMockupCategories,
    staleTime: 0, // Always fetch fresh
    cacheTime: 0, // Don't cache
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useMockupCategory = (slug) => {
  return useQuery({
    queryKey: ['mockupCategory', slug],
    queryFn: () => api.getMockupCategoryBySlug(slug),
    enabled: !!slug,
  });
};

export const useCreateMockupCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMockupCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockupCategories'] });
    },
  });
};

export const useUpdateMockupCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...values }) => api.updateMockupCategory(id, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockupCategories'] });
    },
  });
};

export const useDeleteMockupCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMockupCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mockupCategories'] });
    },
  });
};
