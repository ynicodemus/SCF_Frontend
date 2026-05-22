import axios from "axios";

const axiosSC = axios.create({
  baseURL: "https://scf-backend-92qq.onrender.com",
});

axiosSC.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("citizenToken");
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Token ${token}`, // change to `Bearer` if backend expects Bearer
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosSC.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("citizenToken");
      window.location.href = "/Account";
    }
    return Promise.reject(error);
  }
);

export default axiosSC;
