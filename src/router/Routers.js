import React, { useContext, useEffect } from 'react';
import { Routes, Route, useLocation } from "react-router-dom";
import { Contact } from '../components/contact/Contact';
import { About } from '../components/About';
import { Home } from '../components/home/Home';
import { Footer } from '../components/layout/Footer';
import { HeaderNav } from '../components/layout/HeaderNav';
import { Projects } from '../components/Projects';
import { Services } from '../components/services/Services';
import { Error } from '../components/Error';
import { Project } from '../components/project/Project';
import { ContextProvider } from '../contexts/ContextProvider';
import { Loader } from '../components/loader/Loader';
import { projectService } from '../data/projectService';
import { AnimatePresence } from 'framer-motion';
import videoBg from '../../src/assets/video_background.mp4';
import { ProjectViewer3D } from '../components/project/ProjectViewer3D';

export const Routers = () => {
  const { setCurrentUrl, setModePage, loading, setLoading, setSrcBackground, setProjectHome } = useContext(ContextProvider);
  const location = useLocation();

  useEffect(() => {
    const fetchData = async () => {
      const currentPath = location.pathname;
      const urlParts = window.location.pathname.split('/');
      const projectId = urlParts[urlParts.length - 1];

      if (currentPath === '/' || true) {
        setLoading(true);

        setTimeout(() => {
          setLoading(false);
        }, 2000);
      }

      if (currentPath === '/') {
        setCurrentUrl('home');
        setModePage('dark');
        let _projectHome = await projectService.getProjectHome();
        setProjectHome(_projectHome);
        if (_projectHome && _projectHome.video && process.env.REACT_APP_LOAD_PROJECTS_LOCALLY === '0') {
          setSrcBackground(`${process.env.REACT_APP_PROJECTS_API_URL}${_projectHome.video}`);
        } else setSrcBackground(videoBg);
      } else if (currentPath === '/projects') {
        setCurrentUrl('projects');
        setModePage('light');
      } else if (currentPath.includes('/project/')) {
        setLoading(true);
        let project = await projectService.getProjectById(projectId);
        setTimeout(() => {
          setLoading(false);
        }, 2000);
        setCurrentUrl('project');
        setModePage('dark');
        if (project.video) {
          setSrcBackground(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ? `video::/images/${project.id}/${project.video}` :
            `video::${process.env.REACT_APP_PROJECTS_API_URL}${project.video}`);
        } else {
          setSrcBackground(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ? `/images/${project.id}/${project.cover_image}` :
            `${process.env.REACT_APP_PROJECTS_API_URL}${project.cover_image}`);
        }
      } else if (currentPath === '/contact') {
        setCurrentUrl('contact');
        setModePage('dark');
        //setSrcBackground(`/images/${project.id}/${project.cover_image}`);
      } else if (currentPath === '/services') {
        setCurrentUrl('services');
        setModePage('dark');
        //setSrcBackground(`/images/${project.id}/${project.cover_image}`);
      } else {
        setCurrentUrl('');
        setModePage('light');
      }
    };

    fetchData();
  }, [location]);

  return (
    <>
      {loading ? <Loader /> :
        <>
          <HeaderNav />
          <ContentMemo location={location} loading={loading} setCurrentUrl={setCurrentUrl} />
          <Footer />
        </>
      }

    </>
  );
};

const Content = ({ location, loading, setCurrentUrl }) => {
  return (
    <section className='content'>
      {/*
      <AnimatePresence initial={true} mode='wait'> 
        <Routes key={location.pathname} location={location}>
          <Route path='/' element={<Navigate to="/home" />} />
          <Route path='/home' element={loading ? <Loader /> : <Home />} />
          <Route path='/projects' element={loading ? <Loader /> : <Projects setCurrentUrl={setCurrentUrl} />} />
          <Route path='/services' element={loading ? <Loader /> : <Services />} />
          <Route path='/about' element={loading ? <Loader /> : <About />} />
          <Route path='/contact' element={loading ? <Loader /> : <Contact />} />
          <Route path='/project/:id' element={loading ? <Loader /> : <Project />} />
          <Route path='/*' element={loading ? <Loader /> : <Error />} />
        </Routes>
      </AnimatePresence>
      */}
      <AnimatePresence initial={true} mode='wait'>
        <Routes key={location.pathname} location={location}>
          <Route path='/' element={loading ? <Home /> : <Home />} />
          <Route path='/projects' element={loading ? <Projects setCurrentUrl={setCurrentUrl} /> : <Projects setCurrentUrl={setCurrentUrl} />} />
          <Route path='/services' element={loading ? <Services /> : <Services />} />
          {/*<Route path='/services' element={loading ? <Maintenance /> : <Maintenance />} />*/}
          <Route path='/about' element={loading ? <About /> : <About />} />
          <Route path='/contact' element={loading ? <Contact /> : <Contact />} />
          <Route path='/project/:id' element={loading ? <Project /> : <Project />} />
          <Route path='/*' element={loading ? <Error /> : <Error />} />
        </Routes>
      </AnimatePresence>
    </section>
  );
};

const ContentMemo = React.memo(Content);
