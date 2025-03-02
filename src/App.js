
import './App.css';
import { Routers } from './router/Routers';
import videoBg from './assets/video_background.mp4';
import { ContextProvider } from './contexts/ContextProvider';
import { useEffect, useState } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { projectService } from './data/projectService';
import { AnimatePresence } from 'framer-motion';
import { getVersionedImageUrl } from './utils/helpers';

function App() {

  const [currentUrl, setCurrentUrl] = useState("");
  const [modePage, setModePage] = useState("");
  const [loading, setLoading] = useState(false);
  const [srcBackground, setSrcBackground] = useState("");
  const [projectHome, setProjectHome] = useState({});

  const webState = {
    currentUrl,
    modePage,
    loading,
    projectHome,
    setCurrentUrl,
    setModePage,
    setLoading,
    setSrcBackground,
    setProjectHome
  }

  useEffect(() => {
    const fetchData = async () => {
      // Obtener la ruta actual al cargar el componente
      const currentPath = window.location.pathname;
      const urlParts = window.location.pathname.split('/');
      const projectId = urlParts[urlParts.length - 1];


      // Verificar si la ruta actual es "/home"
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
        if (project && project.video) {
          const src = process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ?
            `video::/images/${project.id}/${project.video}` :
            `video::${process.env.REACT_APP_PROJECTS_API_URL}${project.video}`;
          setSrcBackground(src);
        } else if (project && project.cover_image) {
          const src = process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ?
            `/images/${project.id}/${project.cover_image}` :
            `${process.env.REACT_APP_PROJECTS_API_URL}${project.cover_image}`;
          setSrcBackground(src);
        }
      } else if (currentPath === '/contact') {
        setCurrentUrl('contact');
        setModePage('dark');
        //setSrcBackground(`/images/${project.id}/${project.cover_image}`);
      }
      else if (currentPath === '/services') {
        setCurrentUrl('services');
        setModePage('dark');
        //setSrcBackground(`/images/${project.id}/${project.cover_image}`);
      } else {
        setCurrentUrl('');
        setModePage('light');
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <ContextProvider.Provider value={webState}>
        <AnimatePresence initial={true} mode='sync'>
          {currentUrl === "home" && (
            <>
              <video className='videoBg' src={srcBackground} autoPlay loop muted playsInline preload='auto' />
              <div className='bgOverlay'></div>
            </>
          )}
          {currentUrl === "project" && (
            srcBackground.startsWith('video::') ?
              <>
                <video className='videoBg' src={srcBackground.substring('video::'.length)} autoPlay loop muted playsInline preload='auto' disablePictureInPicture />
                <div className='bgOverlay'></div>
              </> :
              <>
                <img className='videoBg' src={getVersionedImageUrl(srcBackground)} />
                <div className='bgOverlay'></div>
              </>
          )}
          {currentUrl === "contact" && (
            <>
              <div className='bgOverlay bg-dark fixed' ></div>
            </>
          )}
          {currentUrl === "services" && (
            <>
              <div className='bgOverlay bg-dark fixed'></div>
            </>
          )}
          <div key={"locations-router"} className='layout'>
            <BrowserRouter>
              <Routers />
            </BrowserRouter>
          </div>
        </AnimatePresence>
      </ContextProvider.Provider>
    </>
  );
}

export default App;
