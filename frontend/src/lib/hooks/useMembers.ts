import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { membersApi, type MembersQuery } from '../api/members.api';
import type { Member } from '../types';

export function useMembersList(query?: MembersQuery) {
  return useQuery({
    queryKey: ['members', 'list', query],
    queryFn: () => membersApi.list(query),
    staleTime: 1000 * 60 * 3,
  });
}

export function useMemberSummary(id: string) {
  return useQuery({
    queryKey: ['members', id, 'summary'],
    queryFn: () => membersApi.getSummary(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMemberAttendance(id: string) {
  return useQuery({
    queryKey: ['members', id, 'attendance'],
    queryFn: () => membersApi.getAttendance(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useMemberOutreach(id: string) {
  return useQuery({
    queryKey: ['members', id, 'outreach'],
    queryFn: () => membersApi.getOutreach(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Member> }) =>
      membersApi.update(id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

export function useUpdateMemberBeltRank() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, beltRank }: { id: string; beltRank: string }) =>
      membersApi.updateBeltRank(id, beltRank),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['members'] });
      queryClient.invalidateQueries({ queryKey: ['members', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
    },
  });
}

