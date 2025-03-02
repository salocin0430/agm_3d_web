import React, { useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ContextProvider } from '../../contexts/ContextProvider';
import { motion } from 'framer-motion';
import { transition1 } from '../../transitions'
import './Home.css';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';

export const Home = () => {

  const { setCurrentUrl, projectHome } = useContext(ContextProvider);
  const { t } = useTranslation();

  useEffect(() => {
    setCurrentUrl("home");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Helmet>
        <title>{t('home.metatitle')}</title>
        <meta name="description" content={t('home.metadescription')} />
        <link rel="canonical" href="https://laoarchitects.com/" />
        <script type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "name": "LAO Architects",
              "url": "https://laoarchitects.com/",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+57-3192232989",
                "contactType": "customer service"
              },
              "mainEntity": {
                "@type": "Organization",
                "name": "Lao Architects",
                "url": "https://laoarchitects.com"
              }
            })
          }}
        />
      </Helmet>
      <motion.div
        key={123}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        transition={{ delay: 0, duration: 4.5 }}
        className='home'>


        <section className='last-projects'>
          <h2 className='project-name'> {t('home.residential')} {t('home.interior')} {t('home.design')}</h2>
          <Link to={"/project/Project" + projectHome.id}>{t('home.viewProject')}</Link>

          <div className='projects'>

          </div>
        </section>

      </motion.div>
    </>
  )
}
