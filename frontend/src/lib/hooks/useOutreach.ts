import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { outreachApi, type OutreachQueueQuery } from '../api/outreach.api';
import type { CreateOutreachDto, UpdateOutreachDto } from '../types';

export function useOutreachQueue(params?: OutreachQueueQuery) {
  return useQuery({
    queryKey: ['outreach', 'queue', params],
    queryFn: () => outreachApi.getQueue(params),
    staleTime: 1000 * 60,
  });
}

export function useOutreachList(params?: { memberId?: string; status?: string }) {
  return useQuery({
    queryKey: ['outreach', 'list', params],
    queryFn: () => outreachApi.list(params),
    staleTime: 1000 * 60,
  });
}

export function useCreateOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOutreachDto) => outreachApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateOutreach() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateOutreachDto }) =>
      outreachApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['outreach'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}
