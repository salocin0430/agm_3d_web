import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import './Project.css';
import './../../styles/Project.css';
import './../../styles/ProjectDetail.css';
import { projectService } from '../../data/projectService';
import { Gallery } from './Gallery';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TfiAngleDown } from "react-icons/tfi";
import { MdArrowDropDownCircle } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import ProjectViewer3DPure from './ProjectViewer3DPure';

export const Project = () => {
  const [project, setProject] = useState({});
  const params = useParams();
  const contentRef = useRef(null);
  const { t } = useTranslation();

  const [textRef, inView] = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px', // Ajusta el margen según sea necesario
  });
  const textAnimation = useAnimation();

  const [showViewer3D, setShowViewer3D] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const project = await projectService.getProjectById(params.id);
      setProject(project);
    };

    fetchData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (inView) {
      textAnimation.start('visible');
    }
  }, [inView, textAnimation]);

  const textVariants = {
    hidden: {
      opacity: 0,
      y: 50,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
      },
    },
  };

  const scrollToBottom = () => {
    window.scrollTo({
      //top: document.documentElement.scrollHeight,
      top: contentRef.current.offsetTop,
      behavior: 'smooth',
    });
  };

  /*
  const handleScroll = () => {
    const contentSection = contentRef.current;
    const rect = contentSection.getBoundingClientRect();
    const quarterScreenHeight = window.innerHeight / 4;
    const isVisible = rect.top < window.innerHeight - quarterScreenHeight && rect.bottom >= quarterScreenHeight;
    contentSection.classList.toggle('show', isVisible);
  };

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);*/

  const handleView3D = () => {
    console.log("Abriendo visualizador 3D...");
    setShowViewer3D(true);
  };

  if (!project) {
    return <div className="loading">Cargando proyecto...</div>;
  }

  return (
    <>
      <Helmet>
        <title>{t('projects.metatitle') + "|" + project.name}</title>
        <meta name="description" content={t('home.metadescription')} />
        <link rel="canonical" href={`https://laoarchitects.com/project/${params.id}`} />
      </Helmet>
      <motion.div
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{ delay: 0, duration: 2 }}
        className="main-page"
      >
        <div className='page-project'>
          <div className={`title-project font-title`}>
            <div className="btn-scroll-down" onClick={scrollToBottom}>
              <h1 className='font-title'>{project.name}</h1>
              <div>
                <div className="box-animate"><i className="fa fa-angle-down" aria-hidden="true"><TfiAngleDown /></i></div>
              </div>
            </div>
            
            {/* Botón flotante 3D if project id is 22    */}
            {(params.id.replace('Project', '') === '13' || params.id.replace('Project', '') === '20') && (
              <button className="floating-3d-button" onClick={handleView3D}>
                <div className="floating-3d-cube">
                  <div className="cube">
                  <div className="cube-face front"></div>
                  <div className="cube-face back"></div>
                  <div className="cube-face right"></div>
                  <div className="cube-face left"></div>
                  <div className="cube-face top"></div>
                  <div className="cube-face bottom"></div>
                </div>
              </div>
              <span className="floating-3d-text">3D</span>
              </button>
            )}
          </div>
        </div>
        <section ref={contentRef} className={`content-project ${inView ? 'show' : ''}`}>
          <div className='project-description'>
            <div className='title'>
              <motion.h1
                className={`font-title darks`}
                ref={textRef}
                initial="hidden"
                animate={textAnimation}
                variants={textVariants}
              >
                {project.name}
              </motion.h1>
            </div>
            <div className='information'>
              {project.project_small_information && project.project_small_information.map((info, index) => (
                <div className='data' key={index}>
                  <span><b>{t("project." + Object.keys(info)[0])}:</b></span>
                  <span>{Object.values(info)[0]}</span>
                </div>
              ))}
            </div>
          </div>
          {project.images && <Gallery project={project} images={project.images} />}
          {/*
          <button className="catalog-3d-button" onClick={handleView3D}>
            <div className="catalog-3d-content">
              <div className="catalog-3d-cube">
                <div className="cube">
                  <div className="cube-face front"></div>
                  <div className="cube-face back"></div>
                  <div className="cube-face right"></div>
                  <div className="cube-face left"></div>
                  <div className="cube-face top"></div>
                  <div className="cube-face bottom"></div>
                </div>
              </div>
              <span className="catalog-3d-text">Catálogo 3D</span>
            </div>
          </button>
          */}
        </section>
      </motion.div>
      {showViewer3D && (
        <ProjectViewer3DPure 
          modelUrl={`/models/default/robota/scene.gltf`}
          projectId={params.id.replace('Project', '')}
          onClose={() => setShowViewer3D(false)}
        />
      )}
    </>
  );
};
