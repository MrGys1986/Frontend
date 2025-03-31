import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL; // Cambia esto después del deploy

// Crear instancia de Axios con la base de la API
const api = axios.create({
    baseURL: API_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

// Interceptor para solicitudes (request)
api.interceptors.request.use(
  (config) => {
    // Obtener token desde localStorage
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Obtener rol del usuario (opcional, si lo necesitas para validaciones de permisos en backend)
    const userRole = localStorage.getItem("role"); // 👈 Corregí "userRole" a "role" para que coincida con LoginPage.jsx
    if (userRole) {
      config.headers["user-role"] = userRole;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor para respuestas (response)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, config } = error.response;

      if (status === 401) {
        console.error("⚠️ No autorizado (401).");

        // Excepción: NO redirige si viene de /register
        if (!config.url.includes("/api/auth/register") && !config.url.includes("/api/login/verify-security-questions") ) {
          localStorage.clear();
          window.location.href = "/login";
        }
      } else if (status === 403) {
        console.error("🚫 Acceso denegado (403). Verifica permisos.");
      } else if (status === 500) {
        console.error("🔥 Error interno del servidor (500).");
      }
    }
    
    return Promise.reject(error);
  }
);

export default api;
