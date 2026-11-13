/**
 * Mockups React Query hooks
 * Clean, no hacks, proper React Query v5 usage
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from './api';

// ============================================================================
// CATEGORIES
// ============================================================================

export function useMockupCategories() {
  return useQuery({
    queryKey: ['mockup-categories'],
    queryFn: api.fetchMockupCategories,
    gcTime: 10 * 60 * 1000, // 10 minutes (v5 uses gcTime not cacheTime)
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// ============================================================================
// MOCKUPS - PUBLIC
// ============================================================================

export function usePublicMockups(categorySlug = null) {
  return useQuery({
    queryKey: ['public-mockups', categorySlug],
    queryFn: () => api.fetchPublicMockups(categorySlug),
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

export function useFeaturedMockups(limit = 6) {
  return useQuery({
    queryKey: ['featured-mockups', limit],
    queryFn: () => api.fetchFeaturedMockups(limit),
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

export function useMockupBySlug(slug) {
  return useQuery({
    queryKey: ['mockup', slug],
    queryFn: () => api.fetchMockupBySlug(slug),
    enabled: !!slug,
    gcTime: 5 * 60 * 1000,
    staleTime: 2 * 60 * 1000,
  });
}

// ============================================================================
// MOCKUPS - ADMIN
// ============================================================================

export function useAllMockups() {
  return useQuery({
    queryKey: ['all-mockups'],
    queryFn: api.fetchAllMockups,
  });
}

export function useCreateMockup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createMockup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['public-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['featured-mockups'] });
    },
  });
}

export function useUpdateMockup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, updates }) => api.updateMockup(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['public-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['featured-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['mockup'] });
    },
  });
}

export function useDeleteMockup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteMockup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['public-mockups'] });
      queryClient.invalidateQueries({ queryKey: ['featured-mockups'] });
    },
  });
}

// ============================================================================
// FILE UPLOAD
// ============================================================================

export function useUploadImage() {
  return useMutation({
    mutationFn: ({ file, path }) => api.uploadMockupImage(file, path),
  });
}

// ============================================================================
// SYSTEM CHECK
// ============================================================================

export function useSystemCheck() {
  return useMutation({
    mutationFn: api.runSystemCheck,
  });
}
