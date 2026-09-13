import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5001";

export const submitCode = async (formData, options = {}) => {
  try {
    const query = options.wait ? "?base64_encoded=true&wait=true" : "?base64_encoded=true";
    const response = await axios.post(`${API_BASE_URL}/submissions${query}`, formData);
    return { success: true, data: response.data };
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return { success: false, err: message, status: err.response?.status };
  }
};

export const checkStatus = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/submissions/${token}?base64_encoded=true`);
    const statusId = response.data.status?.id;

    if (statusId === 1 || statusId === 2) {
      // In Queue or Processing - poll after 400ms
      await new Promise((r) => setTimeout(r, 400));
      return checkStatus(token);
    }
    return { success: true, data: response.data };
  } catch (err) {
    const message = err.response?.data?.message || err.message;
    return { success: false, err: message };
  }
};

const apiService = {
  submitCode,
  checkStatus,
};

export default apiService;