import React from 'react';
import { Link } from 'react-router-dom';
//import { projects } from '../data/projects';
import { motion } from 'framer-motion';
import { Blurhash } from 'react-blurhash';
import ImageBlurhash from './ImageBlurhash';
import { getVersionedImageUrl } from '../utils/helpers';

export const ListProjects = ({ listState, limit, showEven }) => {
  const formatProjectName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };

  const transition = {
    duration: 0.5,
    ease: 'easeOut',
  };

  return (
    <div className='project-list'>
      {listState.length ? listState.slice(0, limit).map((project, index) => {
        const delay = index * 0.2; // Delay increment for staggered animations

        return (
          <Link to={`/project/Project${project.id}`} key={project.id + Math.random()} className='project-item'>
            <motion.div
              className='project-item-content'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...transition, delay }}
            >
              <h2 className='project-name'>
                {formatProjectName(project.name)}
              </h2>
              <motion.div
                className='mask'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...transition, delay: delay + 0.2 }} // Additional delay for overlay animation
              >

                <ImageBlurhash
                  src={getVersionedImageUrl(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ?
                    `/images/${project.id}/${project.cover_image}` :
                    `${process.env.REACT_APP_PROJECTS_API_URL}${project.cover_image}`)
                  }
                  blurhash={project.blurhash}
                  alt=''
                  className='image-blurhash h-full'
                />
                <div className='overlay'>
                  <h2 className='project-name'>
                    {formatProjectName(project.name)}
                  </h2>
                </div>
              </motion.div>
            </motion.div>
          </Link>
        );
      })
        :
        <>
          <motion.div
            className='project-process'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...transition, delay: 0.2 }}
          >
            <h2 >
              Proyectos en proceso ...
            </h2>
          </motion.div>
        </>}
    </div>
  );
};



/*
export const ListProjects = ({ limit, showEven }) => {
  const filteredProjects = showEven
    ? projects.filter((_, index) => index % 2 === 0)
    : projects.filter((_, index) => index % 2 !== 0);

  const formatProjectName = (name) => {
    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
  };  

  return (
    <div className='project-list'>
      {filteredProjects.slice(0, limit).map((project) => {
        return (
          <article key={project.id} className='project-item'>
            <h2 className='project-name'>
              <div><Link to={`/project/${project.id}`}>{formatProjectName(project.name)}</Link></div>
            </h2>
            <motion.div 
              className='mask'
              whileHover={{scale: 1.3, orginX:0}}
              transition={{type: 'spring', stiffness:50}}
              >
               
              <img src={`/images/${project.id}.jpg`} alt='' />
            </motion.div>
            <span className='project-category'>{formatProjectName(project.category)}</span>

          </article>
        );
      })}
    </div>
  );
};
*/
