import axios from 'axios'; // Importar Axios

const projects = [
    {
        'id': 'Project1',
        'name': 'APTO TIERRA BELLA',
        "category": 'visualization',
        'cover_image': '01.principal.jpg',
        'project_small_information': [
            { 'area': '80 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Armenia, Colombia' },
            { 'design': 'by Luci Alba' },
        ],
        'video': 'habitacion Alba 31052023.mp4',
        'images': ['01.principal.jpg', '05.jpg', '03.jpg', '04.jpg', '02.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg']
    },
    {
        'id': 'Project2',
        'name': 'JAZE Apto',
        "category": 'interior_design',
        'cover_image': '01.principal.png',
        'project_small_information': [
            { 'area': '90 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'images': ['01.principal.png', '02.png', '03.png', '04.png', '05.png', '06.png', '07.png', '08.png', '09.png']
    },
    {
        'id': 'Project3',
        'name': 'Seren Bedroom',
        "category": 'interior_design',
        'cover_image': '01.principal.jpg',
        'project_small_information': [
            { 'area': '15 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'video': 'habitacion 1 para landing page.mp4',
        'images': ['01.principal.jpg', '02.jpg', '03.jpg', '04.jpg', '06.jpg', '05.jpg', '07.jpg', '08.jpg']
    },
    {
        'id': 'Project4',
        'name': 'Bambusa',
        "category": 'architecture',
        'cover_image': '01.principal.jpg',
        'project_small_information': [
            { 'area': '200 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'video': 'bambusa para landing page sin logo.mp4',
        'images': ['01.principal.jpg', '02.jpg', '03.jpg', '04.jpg', '06.jpg', '05.jpg', '07.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg']
    },
    {
        'id': 'Project5',
        'name': 'Alvora Apto',
        "category": 'interior_design',
        'cover_image': '01.principal.jpg',
        'project_small_information': [
            { 'area': '95 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'video': 'sala comedor wabi  landing page.mp4',
        'images': ['01.principal.jpg', '02.jpg', '03.jpg', '06.jpg', '04.jpg', '07.jpg', '05.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg']
    },
    {
        'id': 'Project6',
        'name': 'MAR bedroom',
        "category": 'interior_design',
        'cover_image': '01.principal.jpg',
        'project_small_information': [
            { 'area': '20 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'video': 'habitacion Mar para landing.mp4',
        'images': ['01.principal.jpg', '02.jpg', '03.jpg', '06.jpg', '04.jpg', '07.jpg', '05.jpg', '08.jpg', '09.jpg', '10.jpg', '11.jpg', '12.jpg', '13.jpg', '14.jpg', '15.jpg']
    },
    {
        'id': 'Project7',
        'name': 'Apto 305',
        "category": 'interior_design',
        'cover_image': '01.principal.png',
        'project_small_information': [
            { 'area': '145 m2' },
            { 'year': '2023' },
            { 'visualization': 'LAO architects' },
            { 'location': 'Pereira, Colombia' },
            { 'design': 'LAO architects' },
        ],
        'video': 'sala 1 para pagina web sin logo.mp4',
        'images': ['01.principal.png', '02.png', '03.png', '06.png', '04.png', '07.png', '05.png', '08.png', '09.png', '10.png', '11.png']
    }
]

export const projectService = {
    getAllProjects: async () => {
        console.log(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY);

        if (process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0') {
            return projects; // Suponiendo que projects es un conjunto de proyectos local
        }
        else {
            try {
                // Obtener proyectos desde el servidor
                const response = await axios.get(process.env.REACT_APP_PROJECTS_API_URL + '/api/projectsByCompany/' + process.env.REACT_APP_COMPANY_ID);
                
                // Filtrar para mostrar SOLO los proyectos con IDs 7, 13 y 20
                response.data = response.data.filter((project) => {
                    console.log(project.id);
                    return project.id == '7' || project.id == '13' || project.id == '20';
                });
                
                console.log(response.data);
                return response.data; // Devolver solo los proyectos filtrados
            } catch (error) {
                console.error('Error al obtener proyectos del servidor:', error);
                return []; // En caso de error, devuelve un arreglo vacío
            }
        }
    },
    getProjectsFilteredByCategory: (category) => {
        projects.filter((project) => {
            return project.category.toLowerCase().includes(category.toLowerCase());
        });
    },
    getProjectById: async (projectId) => {
        if (process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0') {
            return projects.find(project => project.id === projectId);
        }
        else {
            try {
                // Delete of projectId , word 'Project' to get the number of the project
                projectId = projectId.replace('Project', '');
                // Obtener un proyecto desde el servidor
                const response = await axios.get(process.env.REACT_APP_PROJECTS_API_URL + '/api/projectById/' + process.env.REACT_APP_COMPANY_ID + '/' + projectId);
                return response.data; // Suponiendo que la respuesta contiene el proyecto
            } catch (error) {
                console.error('Error al obtener el proyecto del servidor:', error);
                return null; // En caso de error, devuelve null
            }
        }
    },

    // getProjectHome 
    getProjectHome: async () => {
        if (process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0') {
            return projects[6];
        }
        else {
            try {
                // Obtener un proyecto desde el servidor
                const response = await axios.get(process.env.REACT_APP_PROJECTS_API_URL + '/api/homeProject/' + process.env.REACT_APP_COMPANY_ID);
                return response.data; // Suponiendo que la respuesta contiene el proyecto
            } catch (error) {
                console.error('Error al obtener el proyecto del servidor:', error);
                return null; // En caso de error, devuelve null
            }
        }
    }
};