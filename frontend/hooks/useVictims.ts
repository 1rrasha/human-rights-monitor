import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { victimsService, CreateVictimData, UpdateVictimData } from '../services/victims.service';

export const useVictim = (victimId: string) => {
  const { data: victim, isLoading, error } = useQuery({
    queryKey: ['victim', victimId],
    queryFn: () => victimsService.getVictim(victimId),
    enabled: !!victimId,
  });

  return {
    victim,
    isLoading,
    error,
  };
};

export const useCaseVictims = (caseId: string) => {
  const { data: victims, isLoading, error } = useQuery({
    queryKey: ['case-victims', caseId],
    queryFn: () => victimsService.getCaseVictims(caseId),
    enabled: !!caseId,
  });

  return {
    victims,
    isLoading,
    error,
  };
};

export const useVictimMutations = () => {
  const queryClient = useQueryClient();

  const createVictimMutation = useMutation({
    mutationFn: (data: CreateVictimData) => victimsService.createVictim(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['case-victims'] });
    },
  });

  const updateVictimMutation = useMutation({
    mutationFn: ({ victimId, data }: { victimId: string; data: UpdateVictimData }) =>
      victimsService.updateVictim(victimId, data),
    onSuccess: (_, { victimId }) => {
      queryClient.invalidateQueries({ queryKey: ['victim', victimId] });
      queryClient.invalidateQueries({ queryKey: ['case-victims'] });
    },
  });

  return {
    createVictim: createVictimMutation.mutate,
    updateVictim: updateVictimMutation.mutate,
    isCreating: createVictimMutation.isPending,
    isUpdating: updateVictimMutation.isPending,
  };
}; 