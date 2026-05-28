import apiClient from "../apiclient";

export const fetchYieldPrediction = async (selectedCrop:string, fertilizerType: string, irrigation: boolean, drawnLandSize: number, selectedLocation: { lat: number; lng: number }) => {
    try {
      const response = await apiClient.post(
        `/yield-prediction/${selectedCrop}`,
        {
          fertilizer_type: fertilizerType,
          irrigation,
          land_size: Number(drawnLandSize.toFixed(2)),
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        },
      );
      return response.data;
    } catch (error) {
      console.error(error);
    } 
  };