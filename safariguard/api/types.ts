export interface OwnerVehicle {
  id: number;
  number_plate: string;
  make: string | null;
  model: string | null;
  year: number | null;
  seat_capacity: number;
  fare_amount: string;
  route_name: string | null;
  status: 'active' | 'idle' | 'offline';
  occupancy: {
    people: number;
    capacity: number;
  };
  today: {
    trips: number;
  };
  safety_score: number | null;
  device_connected: boolean;
  last_seen_at: string | null;
  last_location: {
    lat: number;
    lng: number;
  } | null;
}

export interface OwnerVehicleOverview {
  vehicle: {
    id: number;
    number_plate: string;
    make: string | null;
    model: string | null;
    year: number | null;
    seat_capacity: number;
    fare_amount: string;
    route_name: string | null;
  };
  status: 'active' | 'idle' | 'offline';
  location: {
    lat: number;
    lng: number;
  } | null;
  occupancy: {
    people: number;
    capacity: number;
  };
  today: {
    trips: number;
    passengers_estimate: number;
    distance_km: string;
    revenue_estimate: string;
  };
  safety: {
    score: number | null;
    events_today: number;
  };
}

export interface TripListItem {
  id: number;
  vehicle_id: number;
  vehicle_plate?: string;
  route_name?: string;
  status: 'ongoing' | 'completed';
  started_at: string | null;
  ended_at: string | null;
  distance_km: string | null;
  duration_minutes: number | null;
  boardings_estimate: number | null;
  revenue_estimate: string | null;
}

export interface TripDetail extends TripListItem {
  route_points?: Array<{
    lat: number;
    lng: number;
    speed: number;
    recorded_at: string;
  }>;
  occupancy_timeline?: Array<{
    people: number;
    recorded_at: string;
  }>;
  events?: Array<{
    id: number;
    type: 'harsh_braking' | 'sudden_acceleration' | 'sharp_cornering';
    severity: number;
    lat: number;
    lng: number;
    recorded_at: string;
  }>;
}

export interface PassengerBucket {
  label: string;
  value: number;
}

export interface PassengerStatsResponse {
  vehicle_id: number;
  range: 'today' | 'week' | 'month';
  total_passengers_estimate: number;
  avg_per_trip: number;
  current_occupancy: number;
  capacity: number;
  buckets: PassengerBucket[];
  peak_bucket: PassengerBucket | null;
  per_trip: Array<{
    trip_id: number;
    boardings_estimate: number;
    started_at: string;
    ended_at: string | null;
  }>;
}

export interface SafetyStatsResponse {
  vehicle_id: number;
  range: 'today' | 'week' | 'month';
  score: number | null;
  counts: {
    harsh_braking: number;
    sudden_acceleration: number;
    sharp_cornering: number;
  };
  events: Array<{
    id: number;
    type: 'harsh_braking' | 'sudden_acceleration' | 'sharp_cornering';
    severity: number;
    lat: number;
    lng: number;
    recorded_at: string;
  }>;
}

export interface InsightItem {
  type: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}

export interface InsightsResponse {
  range: 'today' | 'week' | 'month';
  totals: {
    trips: number;
    passengers_estimate: number;
    distance_km: string;
    revenue_estimate: string;
  };
  insights: InsightItem[];
}

export interface AlertItem {
  id: number;
  vehicle_id: number;
  vehicle_plate?: string;
  type: 'harsh_braking' | 'sudden_acceleration' | 'sharp_cornering' | 'speeding' | 'device_offline' | 'over_capacity';
  severity: 'critical' | 'warning' | 'info';
  description: string;
  suggested_action: string | null;
  location: {
    lat: number;
    lng: number;
  } | null;
  resolved_at: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  links?: any;
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
}
