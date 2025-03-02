import React, { useState, useEffect } from 'react';
import { ListProjects } from './ListProjects';
import TextAnimate from './textAnimate/TextAnimate';
import { motion } from 'framer-motion';
import { Filter } from './Filter';
import AnimatedPhrases from './textAnimate/AnimatedPhrases';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const words = ["projects.textAnimate.create", "projects.textAnimate.believe", "projects.textAnimate.transform"];
const additionalTexts = [
  "projects.textAnimate.additionalTexts1",
  "projects.textAnimate.additionalTexts2",
  "projects.textAnimate.additionalTexts3",
];

export const Projects = ({ setCurrentUrl }) => {
  const [isSingleColumn, setIsSingleColumn] = useState(false);
  const [listState, setListState] = useState([]);
  const [showListProjects, setShowListProjects] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setShowListProjects(true);
  }, [listState]);

  useEffect(() => {
    //setCurrentUrl("projects");
    const handleResize = () => {
      setIsSingleColumn(window.innerWidth <= 966);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Establecer el estado inicial al cargar el componente

    return () => {
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  return (
    <>
      <Helmet>
        <title>{t('projects.metatitle')}</title>
        <meta name="description" content={t('projects.metadescription')} />
        <link rel="canonical" href="https://laoarchitects.com/projects" />
      </Helmet>
      <div className={`page-projects projects ${isSingleColumn ? 'single-column' : ''}`}>
        <motion.div className='grid-container'
          initial={{
            opacity: 0,
          }}
          animate={{
            opacity: 1,
          }}
          transition={{ delay: 0, duration: 1.5 }}
        >

          <AnimatedPhrases words={words} additionalTexts={additionalTexts} />
          <Filter listState={listState} setListState={setListState} />
          {showListProjects && <ListProjects listState={listState} limit={100} showEven={true} />}
        </motion.div>
      </div>
    </>
  );
};
