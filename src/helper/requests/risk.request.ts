import apiClient from "../apiclient";

export const fetchRiskScore = async (
  crop: string,
  landSize: number,
  latitude: number,
  longitude: number,
  marketAccess: string,
) => {
  console.log("Initiating risk score fetch with parameters:", {
    crop,
    landSize,
    latitude,
    longitude,
    marketAccess,
  });
  const { data } = await apiClient.post("/risk-score", {
    crop,
    land_size: landSize,
    latitude,
    longitude,
    market_access: marketAccess,
  });
  return data;
};
