export interface ForecastPoint {
  date: string;
  price_xaf: number;
  lower_ci: number;
  upper_ci: number;
}

export interface ForecastResponse {
  crop: string;
  forecast_period: string;
  currency: string;
  predictions: ForecastPoint[];
  model_used: string;
  accuracy: {
    rmse: number;
    mape: number;
    forecast_bias: number;
  };
  subscription_tier: "free" | "medium" | "premium";
  cached: boolean;
  generated_at: string;
}

export interface CropConfig {
  name: string;
  label: string;
  color: string;
}

export interface RegionConfig {
  name: string;
  lat: number;
  lon: number;
  rain: number;
  temp: number;
  elev: number;
  risk: number;
}

export const CROPS: CropConfig[] = [
  { name: "maize",     label: "Maize",     color: "#EAB308" },
  { name: "rice",      label: "Rice",      color: "#84CC16" },
  { name: "cassava",   label: "Cassava",   color: "#D97706" },
  { name: "cocoyam",   label: "Cocoyam",   color: "#10B981" },
  { name: "plantain",  label: "Plantain",  color: "#F59E0B" },
  { name: "cocoa",     label: "Cocoa",     color: "#78350F" },
  { name: "coffee",    label: "Coffee",    color: "#451A03" },
  { name: "groundnut", label: "Groundnut", color: "#B45309" },
  { name: "beans",     label: "Beans",     color: "#22C55E" },
  { name: "tomato",    label: "Tomato",    color: "#EF4444" },
  { name: "onion",     label: "Onion",     color: "#A855F7" },
  { name: "potato",    label: "Potato",    color: "#FBBF24" },
  { name: "palm_oil",  label: "Palm Oil",  color: "#F97316" },
  { name: "sorghum",   label: "Sorghum",   color: "#CA8A04" },
];

export const REGIONS: RegionConfig[] = [
  { name: "North West", lat: 5.96,  lon: 10.16, rain: 1800, temp: 19, elev: 1500, risk: 0.45 },
  { name: "South West", lat: 4.15,  lon: 9.23,  rain: 3500, temp: 25, elev: 400,  risk: 0.35 },
  { name: "West",       lat: 5.47,  lon: 10.42, rain: 1600, temp: 20, elev: 1200, risk: 0.38 },
  { name: "Littoral",   lat: 4.05,  lon: 9.77,  rain: 2800, temp: 27, elev: 50,   risk: 0.42 },
  { name: "Adamawa",    lat: 7.33,  lon: 13.58, rain: 1200, temp: 22, elev: 900,  risk: 0.62 },
  { name: "Far North",  lat: 11.85, lon: 14.32, rain: 500,  temp: 32, elev: 300,  risk: 0.85 },
  { name: "Centre",     lat: 3.87,  lon: 11.52, rain: 1600, temp: 25, elev: 700,  risk: 0.40 },
  { name: "East",       lat: 4.05,  lon: 14.82, rain: 1700, temp: 24, elev: 600,  risk: 0.38 },
  { name: "North",      lat: 8.60,  lon: 13.68, rain: 800,  temp: 30, elev: 400,  risk: 0.78 },
  { name: "South",      lat: 3.12,  lon: 11.35, rain: 1800, temp: 26, elev: 500,  risk: 0.35 },
];

export const BASE_PRICES: Record<string, number> = {
  maize: 250, rice: 450, cassava: 120, cocoyam: 200, plantain: 150,
  cocoa: 1200, coffee: 900, groundnut: 600, beans: 700, tomato: 300,
  onion: 400, potato: 280, palm_oil: 1000, sorghum: 220,
};

export const YIELD_BASES: Record<string, number> = {
  maize: 1.8, rice: 2.2, cassava: 10, cocoyam: 5, plantain: 8,
  cocoa: .45, coffee: .35, groundnut: 1.2, beans: .8, tomato: 15,
  onion: 12, potato: 9, palm_oil: 3.5, sorghum: 1.0,
};

export const FIN_RISK: Record<string, number> = {
  tomato: 0.82, onion: 0.75, plantain: 0.65, cassava: 0.40, cocoa: 0.60, coffee: 0.58,
  maize: 0.45, rice: 0.50, cocoyam: 0.42, groundnut: 0.55, beans: 0.48, potato: 0.60, palm_oil: 0.45, sorghum: 0.38,
};

// in types.ts
export interface HistoryItem {
  request_id: string;
  result_id: string;
  analysis_type: string;
  is_cached_hit: boolean;
  created_at: string;
  crop: string;
  summary: string;
  meta: Record<string, unknown>;
}

export interface HistoryResponse {
  user_id: string;
  total_activities: number;
  history: HistoryItem[];
}

export interface ReportStatus {
  report_id: string;
  report_type: string;
  format: string;
  is_ready: boolean;
  download_url: string;
  created_at: string;
  status?: string;
}

export interface RiskScoreResponse {
  overall_risk_score: number;
  risk_level: string;
  region: string;
  financial_risk: number;
  climate_risk: number;
  agronomic_risk: number;
  risk_factors: string[];
  recommendations: string[];
  metrics: { rmse: number; f1_score: number };
  subscription_tier: string;
  cached: boolean;
  generated_at: string;
}

export interface SuitabilityResponse {
  best_crops: string[];
  suitability_scores: Record<string, number>;
  recommended_crop: string;
  soil_ph: number;
  rainfall: number;
  humidity: number;
  temperature: number;
  elevation: number;
  region_estimate: string;
  model_used: string;
  metrics: Record<string, number>;
  subscription_tier: string;
  cached: boolean;
  generated_at: string;
}

export interface LocationPayload {
  lat: number;
  lng: number;
  name: string;
}