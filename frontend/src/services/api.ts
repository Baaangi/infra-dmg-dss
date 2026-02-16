import axios from 'axios';

const api = axios.create({
  baseURL: 'http://127.0.0.1:8000', // Pointing to your FastAPI Backend
});


export const getInspections = async (): Promise<InspectionResponse[]> => {
  const response = await api.get('/inspections/');
  return response.data;
};


export interface InspectionResponse {
  id: number;
  image_path: string;
  risk_score: number;
  maintenance_priority: string;
  defects: {
      defect_type: string;
      confidence: number;
      severity: string;
      bbox: number[];
  }[];
}

export const uploadInspection = async (formData: FormData): Promise<InspectionResponse> => {
  const response = await api.post('/inspections/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export default api;
