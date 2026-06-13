import apiClient from "../apiclient";

export const fetchSuitability = async (latitude: number, longitude: number) => {
    try {
      const response = await apiClient.post(
        `/crop-suitability`,
        {
          latitude: latitude,
          longitude: longitude,
        },
      );
      console.log(response.data);
      return response.data;
    } catch (err) {
      console.error(err);
    } 
  };