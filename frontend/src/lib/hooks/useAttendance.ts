import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { attendanceApi } from '../api/attendance.api';
import type { AttendanceFilters, CreateAttendanceDto, UpdateAttendanceDto } from '../types';

export function useAttendanceList(filters?: AttendanceFilters) {
  return useQuery({
    queryKey: ['attendance', 'list', filters],
    queryFn: () => attendanceApi.list(filters),
    staleTime: 1000 * 60,
  });
}

export function useRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAttendanceDto) => attendanceApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useBatchRecordAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (records: CreateAttendanceDto[]) => attendanceApi.recordBatch(records),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['members'] });
    },
  });
}

export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateAttendanceDto }) =>
      attendanceApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    },
  });
}
