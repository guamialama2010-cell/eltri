// Configuración de la API
const API_URL = "https://eltri-va03.onrender.com";

// Función para hacer peticiones a la API
const apiCall = async (endpoint, options = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ==================== AUTENTICACIÓN ====================

export const authAPI = {
  register: (data) => apiCall("/auth/registro", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  login: (data) => apiCall("/auth/login", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  getProfile: () => apiCall("/auth/perfil", {
    method: "GET",
  }),
};

// ==================== ESTUDIANTES ====================

export const estudianteAPI = {
  getPanel: () => apiCall("/estudiante/panel", {
    method: "GET",
  }),

  getMaterias: () => apiCall("/estudiante/materias", {
    method: "GET",
  }),

  getTareas: () => apiCall("/estudiante/tareas", {
    method: "GET",
  }),

  getCalificaciones: () => apiCall("/estudiante/calificaciones", {
    method: "GET",
  }),

  getPromedios: () => apiCall("/estudiante/promedios", {
    method: "GET",
  }),

  // ==================== ASISTENTE IA ====================

  chatIA: (mensaje) => apiCall("/ia/chat", {
    method: "POST",
    body: JSON.stringify({
      mensaje,
    }),
  }),

  enviarTarea: (tareaId, archivo) => {
    const formData = new FormData();
    formData.append("archivo", archivo);

    return fetch(`${API_URL}/estudiante/tareas/${tareaId}/enviar`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
      },
      body: formData,
    }).then(async (res) => {
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Error: ${res.status}`);
      }

      return data;
    });
  },
};

// ==================== PROFESORES ====================

export const profesorAPI = {
  getPanel: () => apiCall("/profesor/panel", {
    method: "GET",
  }),

  getMaterias: () => apiCall("/profesor/materias", {
    method: "GET",
  }),

  getEstudiantes: (materiaId) => apiCall(
    `/profesor/materias/${materiaId}/estudiantes`,
    {
      method: "GET",
    }
  ),

  getPromedios: (materiaId) => apiCall(
    `/profesor/materias/${materiaId}/promedios`,
    {
      method: "GET",
    }
  ),

  crearMateria: (data) => apiCall("/materias", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  crearTarea: (data) => apiCall("/tareas", {
    method: "POST",
    body: JSON.stringify(data),
  }),

  getTareas: (materiaId) => apiCall(
    `/profesor/tareas/materia/${materiaId}`,
    {
      method: "GET",
    }
  ),

  calificar: (tareaId, estudiante, calificacion) => apiCall(
    "/profesor/calificar",
    {
      method: "POST",
      body: JSON.stringify({
        tareaId,
        estudiante,
        calificacion,
      }),
    }
  ),
};

// ==================== MATERIAS ====================

export const materiasAPI = {
  getAll: () => apiCall("/materias", {
    method: "GET",
  }),

  getById: (id) => apiCall(`/materias/${id}`, {
    method: "GET",
  }),

  crear: (data) => apiCall("/materias", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// ==================== TAREAS ====================

export const tareasAPI = {
  getAll: () => apiCall("/tareas", {
    method: "GET",
  }),

  getById: (id) => apiCall(`/tareas/${id}`, {
    method: "GET",
  }),

  crear: (data) => apiCall("/tareas", {
    method: "POST",
    body: JSON.stringify(data),
  }),
};

// ==================== CALIFICACIONES ====================

export const calificacionesAPI = {
  getAll: () => apiCall("/calificaciones", {
    method: "GET",
  }),

  getByEstudiante: (estudianteId) => apiCall(
    `/calificaciones/estudiante/${estudianteId}`,
    {
      method: "GET",
    }
  ),
};

export default apiCall;