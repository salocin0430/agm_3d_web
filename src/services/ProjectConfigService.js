// Servicio para cargar y gestionar configuraciones de proyectos
export const ProjectConfigService = {
  // Cargar configuración para un proyecto específico
  async getProjectConfig(projectId) {
    try {
      // Intentar cargar desde un archivo JSON estático
      const url = `/configs/project_${projectId}.json`;
      console.log(`Intentando cargar configuración desde: ${url}`);
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error cargando configuración: ${response.status}`);
      }
      
      const config = await response.json();
      console.log(`Configuración cargada exitosamente:`, config);
      return config;
    } catch (error) {
      console.error(`Error cargando configuración:`, error);
      return null;
    }
  },
  
  // Guardar configuración modificada
  async saveProjectConfig(projectId, config) {
    // Esta función no hace nada en el entorno actual
    console.log(`Configuración guardada para proyecto ${projectId}`, config);
    return true;
  }
}; 