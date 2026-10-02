import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownerApi, CreateVehicleInput } from '@/api/owner';
import { usePollingInterval } from './usePollingInterval';

export function useOwnerVehicles(pollingEnabled: boolean = true) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled);
  return useQuery({
    queryKey: ['owner', 'vehicles'],
    queryFn: () => ownerApi.getVehicles(),
    refetchInterval,
  });
}

export function useOwnerVehicleOverview(id: number | string | undefined, pollingEnabled: boolean = true) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled && !!id);
  return useQuery({
    queryKey: ['owner', 'vehicle', id, 'overview'],
    queryFn: () => ownerApi.getVehicleOverview(id!),
    enabled: !!id,
    refetchInterval,
  });
}

export function useOwnerTrips(
  params?: { vehicle_id?: number | string; status?: string; page?: number },
  pollingEnabled: boolean = true
) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled);
  return useQuery({
    queryKey: ['owner', 'trips', params],
    queryFn: () => ownerApi.getTrips(params),
    refetchInterval,
  });
}

export function useOwnerTripDetail(id: number | string | undefined, pollingEnabled: boolean = true) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled && !!id);
  return useQuery({
    queryKey: ['owner', 'trip', id],
    queryFn: () => ownerApi.getTripDetail(id!),
    enabled: !!id,
    refetchInterval,
  });
}

export function useOwnerPassengers(
  id: number | string | undefined,
  range: 'today' | 'week' | 'month' = 'today',
  pollingEnabled: boolean = true
) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled && !!id);
  return useQuery({
    queryKey: ['owner', 'vehicle', id, 'passengers', range],
    queryFn: () => ownerApi.getVehiclePassengers(id!, range),
    enabled: !!id,
    refetchInterval,
  });
}

export function useOwnerSafety(
  id: number | string | undefined,
  range: 'today' | 'week' | 'month' = 'today',
  pollingEnabled: boolean = true
) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled && !!id);
  return useQuery({
    queryKey: ['owner', 'vehicle', id, 'safety', range],
    queryFn: () => ownerApi.getVehicleSafety(id!, range),
    enabled: !!id,
    refetchInterval,
  });
}

export function useOwnerInsights(
  range: 'today' | 'week' | 'month' = 'week',
  pollingEnabled: boolean = true
) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled);
  return useQuery({
    queryKey: ['owner', 'insights', range],
    queryFn: () => ownerApi.getInsights(range),
    refetchInterval,
  });
}

export function useOwnerAlerts(
  status: 'active' | 'resolved' = 'active',
  page: number = 1,
  pollingEnabled: boolean = true
) {
  const refetchInterval = usePollingInterval(5000, pollingEnabled);
  return useQuery({
    queryKey: ['owner', 'alerts', status, page],
    queryFn: () => ownerApi.getAlerts(status, page),
    refetchInterval,
  });
}

export function useResolveAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number | string) => ownerApi.resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'alerts'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['owner', 'vehicle'] });
    },
  });
}

export function useCreateVehicle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateVehicleInput) => ownerApi.createVehicle(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['owner', 'vehicles'] });
    },
  });
}

export function useOwnerProfile() {
  return useQuery({
    queryKey: ['owner', 'profile'],
    queryFn: () => ownerApi.getProfile(),
  });
}

export function useUpdateOwnerProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; phone?: string; email?: string; id_number?: string }) =>
      ownerApi.updateProfile(data),
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['owner', 'profile'], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['owner', 'profile'] });
    },
  });
}
