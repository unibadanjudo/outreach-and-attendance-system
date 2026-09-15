import { useQuery } from '@tanstack/react-query';
import { dashboardApi, type InactiveMembersQuery } from '../api/dashboard.api';

export function useDashboard(query?: InactiveMembersQuery) {
  return useQuery({
    queryKey: ['dashboard', 'consolidated', query],
    queryFn: () => dashboardApi.getDashboard(query),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: () => dashboardApi.getSummary(),
    staleTime: 1000 * 60 * 2, // 2 mins
  });
}

export function useDashboardAttendance() {
  return useQuery({
    queryKey: ['dashboard', 'attendance'],
    queryFn: () => dashboardApi.getAttendance(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDashboardOutreach() {
  return useQuery({
    queryKey: ['dashboard', 'outreach'],
    queryFn: () => dashboardApi.getOutreach(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useInactiveMembers(query?: InactiveMembersQuery) {
  return useQuery({
    queryKey: ['dashboard', 'inactive-members', query],
    queryFn: () => dashboardApi.getInactiveMembers(query),
    staleTime: 1000 * 60 * 2,
  });
}
