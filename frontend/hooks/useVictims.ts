import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { victimsService, VictimsQueryParams, CreateVictimData, UpdateVictimData } from '../services/victims.service';
import { casesService, CasesQueryParams } from '../services/cases.service';

export const useVictims = (caseId: string, params?: VictimsQueryParams) => {
  const queryClient = useQueryClient();

  const { data: victims, isLoading, error } = useQuery({
    queryKey: ['victims', caseId, params],
    queryFn: () => victimsService.getVictimsByCase(caseId, params),
    enabled: !!caseId,
  });

  const createVictimMutation = useMutation({
    mutationFn: (data: CreateVictimData) => victimsService.createVictim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['victims', caseId] });
    },
    onError: (error) => {
      console.error('Failed to create victim:', error);
    },
  });

  const updateVictimMutation = useMutation({
    mutationFn: ({ victimId, data }: { victimId: string; data: UpdateVictimData }) =>
      victimsService.updateVictim(victimId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['victims', caseId] });
      queryClient.invalidateQueries({ queryKey: ['victim'] });
    },
    onError: (error) => {
      console.error('Failed to update victim:', error);
    },
  });

  return {
    victims,
    isLoading,
    error,
    createVictim: createVictimMutation.mutate,
    updateVictim: updateVictimMutation.mutate,
    isCreating: createVictimMutation.isPending,
    isUpdating: updateVictimMutation.isPending,
    createError: createVictimMutation.error,
    updateError: updateVictimMutation.error,
  };
};

export const useVictim = (victimId: string) => {
  const { data: victimData, isLoading, error } = useQuery({
    queryKey: ['victim', victimId],
    queryFn: () => victimsService.getVictim(victimId),
    enabled: !!victimId,
  });

  return {
    victim: victimData,
    isLoading,
    error,
  };
};

export const useCasesForVictimSelection = (params?: CasesQueryParams) => {
  const { data: cases, isLoading, error } = useQuery({
    queryKey: ['cases', params],
    
    queryFn: () => casesService.getCases(params),
  });

  return {
    cases,
    isLoading,
    error,
  };
};