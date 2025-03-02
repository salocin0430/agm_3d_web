import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../data/projectService';
import { useTranslation } from 'react-i18next';

export const Filter = ({ listState, setListState }) => {
  const [category, setCategory] = useState('all'); // Estado para controlar el enlace activo
  const { t } = useTranslation();


  useEffect(() => {
    const fetchProjects = async () => {
      if (category !== 'all') {
        const projects = await projectService.getAllProjects();
        const projectsFiltered = projects.filter((project) => {
          return project.category.toLowerCase().includes(category.toLowerCase());
        });
        setListState(projectsFiltered);
      } else {
        const projects = await projectService.getAllProjects();
        setListState(projects);
      }
    };

    fetchProjects();
  }, [category, setListState]);

  const filterProjects = (_category, e) => {
    e.preventDefault(); // Evitar la navegación o carga de página predeterminada    
    setCategory(_category); // Actualizar el enlace activo
  };

  return (
    <div className="filter">
      <nav className='category'>
        <ul>
          <li>
            <Link to="#" onClick={(e) => filterProjects('all', e)}
              className={category === 'all' ? 'active' : ''} >
              {t('projects.all')}
            </Link>
          </li>
          <li>
            <Link to="#" onClick={(e) => filterProjects('interior_design', e)}
              className={category === 'interior_design' ? 'active' : ''} >
              {t('projects.interior_design')}
            </Link>
          </li>
          <li>
            <Link to="#" onClick={(e) => filterProjects('comercial', e)}
              className={category === 'comercial' ? 'active' : ''}>
              {t('projects.comercial')}
            </Link>
          </li>
          <li>
            <Link to="#" onClick={(e) => filterProjects('architect', e)}
              className={category === 'architect' ? 'active' : ''}>
              {t('projects.architect')}
            </Link>
          </li>
          <li>
            <Link to="#" onClick={(e) => filterProjects('visualization', e)}
              className={category === 'visualization' ? 'active' : ''}>
              {t('projects.visualization')}
            </Link>
          </li>
        </ul>
      </nav>
    </div>
  );
};
