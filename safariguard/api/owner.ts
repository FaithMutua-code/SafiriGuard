import api from './client';
import {
  OwnerVehicle,
  OwnerVehicleOverview,
  TripListItem,
  TripDetail,
  PassengerStatsResponse,
  SafetyStatsResponse,
  InsightsResponse,
  AlertItem,
  PaginatedResponse,
} from './types';

export interface CreateVehicleInput {
  number_plate: string;
  make?: string;
  model?: string;
  year?: number;
  seat_capacity: number;
  fare_amount: number;
  route_name?: string;
}

export const ownerApi = {
  // Vehicles
  getVehicles: async (): Promise<OwnerVehicle[]> => {
    const res = await api.get<{ data: OwnerVehicle[] }>('/owner/vehicles');
    return res.data.data;
  },

  getVehicleOverview: async (id: number | string): Promise<OwnerVehicleOverview> => {
    const res = await api.get<{ data: OwnerVehicleOverview }>(`/owner/vehicles/${id}/overview`);
    return res.data.data;
  },

  createVehicle: async (data: CreateVehicleInput) => {
    const res = await api.post('/vehicles', data);
    return res.data;
  },

  updateVehicle: async (id: number | string, data: Partial<CreateVehicleInput>) => {
    const res = await api.patch(`/vehicles/${id}`, data);
    return res.data;
  },

  // Trips
  getTrips: async (params?: { vehicle_id?: number | string; status?: string; page?: number }): Promise<PaginatedResponse<TripListItem>> => {
    const res = await api.get<PaginatedResponse<TripListItem>>('/owner/trips', { params });
    return res.data;
  },

  getTripDetail: async (id: number | string): Promise<TripDetail> => {
    const res = await api.get<{ data: TripDetail }>(`/owner/trips/${id}`);
    return res.data.data;
  },

  // Vehicle Stats
  getVehiclePassengers: async (id: number | string, range: 'today' | 'week' | 'month' = 'today'): Promise<PassengerStatsResponse> => {
    const res = await api.get<PassengerStatsResponse>(`/owner/vehicles/${id}/passengers`, { params: { range } });
    return res.data;
  },

  getVehicleSafety: async (id: number | string, range: 'today' | 'week' | 'month' = 'today'): Promise<SafetyStatsResponse> => {
    const res = await api.get<SafetyStatsResponse>(`/owner/vehicles/${id}/safety`, { params: { range } });
    return res.data;
  },

  // Insights
  getInsights: async (range: 'today' | 'week' | 'month' = 'week'): Promise<InsightsResponse> => {
    const res = await api.get<InsightsResponse>('/owner/insights', { params: { range } });
    return res.data;
  },

  // Alerts
  getAlerts: async (status: 'active' | 'resolved' = 'active', page: number = 1): Promise<PaginatedResponse<AlertItem>> => {
    const res = await api.get<PaginatedResponse<AlertItem>>('/owner/alerts', { params: { status, page } });
    return res.data;
  },

  resolveAlert: async (id: number | string): Promise<AlertItem> => {
    const res = await api.post<{ data: AlertItem }>(`/owner/alerts/${id}/resolve`);
    return res.data.data;
  },

  // Push tokens
  registerPushToken: async (token: string, platform: 'ios' | 'android' | 'web') => {
    const res = await api.post('/owner/push-token', { token, platform });
    return res.data;
  },

  deletePushToken: async (token: string) => {
    const res = await api.delete('/owner/push-token', { data: { token } });
    return res.data;
  },

  // Profile
  getProfile: async () => {
    const res = await api.get<{ user: any }>('/owner/profile');
    return res.data.user;
  },

  updateProfile: async (data: { name: string; phone?: string; email?: string; id_number?: string }) => {
    const res = await api.put<{ message: string; user: any }>('/owner/profile', data);
    return res.data.user;
  },
};
