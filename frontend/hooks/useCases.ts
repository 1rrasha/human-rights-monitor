import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesService, CasesQueryParams, CreateCaseData, UpdateCaseData } from '../services/cases.service';

export const useCases = (params?: CasesQueryParams) => {
  const queryClient = useQueryClient();

  const { data: cases, isLoading, error } = useQuery({
    queryKey: ['cases', params],
    queryFn: () => casesService.getCases(params),
  });

  const createCaseMutation = useMutation({
    mutationFn: (data: CreateCaseData) => casesService.createCase(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
    },
    onError: (error) => {
      console.error('Failed to create case:', error);
    },
  });

  const updateCaseMutation = useMutation({
    mutationFn: ({ caseId, data }: { caseId: string; data: UpdateCaseData }) =>
      casesService.updateCase(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case'] });
    },
    onError: (error) => {
      console.error('Failed to update case:', error);
    },
  });

  const deleteCaseMutation = useMutation({
    mutationFn: (caseId: string) => casesService.deleteCase(caseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cases'] });
      queryClient.invalidateQueries({ queryKey: ['case'] }); // Invalidate specific case
    },
    onError: (error) => {
      console.error('Failed to delete case:', error);
    },
  });

  return {
    cases,
    isLoading,
    error,
    createCase: createCaseMutation.mutate,
    updateCase: updateCaseMutation.mutate,
    deleteCase: deleteCaseMutation.mutate,
    isCreating: createCaseMutation.isPending,
    isUpdating: updateCaseMutation.isPending,
    isDeleting: deleteCaseMutation.isPending,
    createError: createCaseMutation.error,
    updateError: updateCaseMutation.error,
    deleteError: deleteCaseMutation.error,
  };
};

export const useCase = (caseId: string) => {
  const { data: caseData, isLoading, error } = useQuery({
    queryKey: ['case', caseId],
    queryFn: () => casesService.getCase(caseId),
    enabled: !!caseId,
  });

  return {
    case: caseData,
    isLoading,
    error,
  };
};