import apiClient from "../apiclient";

export const fetchHistory = async () => {
  try {
    const response = await apiClient.get(`/history/my`);
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const fetchReports = async () => {
  try {
    const response = await apiClient.get(`/reports/my`);
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const GenerateReports = async (
  analysis_type: string,
  result_id: string,
  format: string,
) => {
  try {
    const response = await apiClient.post(`/reports/generate`, {
      analysis_type: analysis_type,
      result_id: result_id,
      format: format,
    });
    console.log(response.data);
    return response.data;
  } catch (err) {
    console.error(err);
  }
};

export const DownloadReports = async (id: string, format: string) => {
  const response = await apiClient.get(`/reports/${id}/download`, {
    responseType: format === "pdf" ? "blob" : "json",
  });
  return response.data;
};
