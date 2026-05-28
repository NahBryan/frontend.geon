import apiClient from "../apiclient";

export const fetchForecast = async (duration: number, durationType: string, selectedCrop: string) => {
    try {
      const response = await apiClient.post(
        `/price-forecasting/${selectedCrop}`,
        {
          duration,
          duration_type: durationType,
        },
      );
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
    } 
  };