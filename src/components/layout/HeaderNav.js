import React, { useContext, useState, useRef, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import LogoWhite from '../../assets/images/logo_white.png';
import LogoBlack from '../../assets/images/logo_black.png';
import { ContextProvider } from '../../contexts/ContextProvider';
//import { FaBars, FaTimes } from "react-icons/fa";
import './HeaderNav.css';
import { BurguerButton } from './BurguerButton/BurguerButton';
import { useTranslation } from 'react-i18next';
import { easeInOut, motion } from 'framer-motion';

const listVariants = {
  hidden: (i) => ({
    opacity: 0,

  }),
  visible: (i) => ({
    opacity: 1,

    transition: {
      delay: i * 0.2,
      duration: 1,
      ease: easeInOut,
    },
  }),
};

export const HeaderNav = () => {
  const navLinks = [
    { to: '/', label: 'header.home' },
    { to: '/projects', label: 'header.projects' },
    { to: '/services', label: 'header.services' },
    { to: '/contact', label: 'header.letsTalk' }
  ];

  const [showNavbar, setShowNavbar] = useState(false);
  const [typeNav, setTypeNav] = useState(false);
  const { modePage, setModePage, currentUrl } = useContext(ContextProvider);
  const { t } = useTranslation();
  const navRef = useRef();

  const handleShowNavbar = () => {
    setShowNavbar(!showNavbar);
  };

  const closeNavbar = () => {
    setShowNavbar(false);
  };

  const navClassName = ({ isActive }) => {
    let fontColor = modePage === "dark" ? 'font-light-color' : 'font-dark';
    let classActive = isActive ? 'active' : '';

    return `${fontColor} ${classActive}`;
  };

  useEffect(() => {
    /* Control Resize for responsive */
    const handleResize = () => {
      if (window.innerWidth > 966) {
        setShowNavbar(false);
      }
    };

    if (currentUrl === "home" || currentUrl === "project" || currentUrl === "services" || currentUrl === "contact") setModePage('dark');
    else setModePage('light');

    window.addEventListener('resize', handleResize);

    /** Control Scroll*/
    const handleScroll = () => {
      const scrollPosition = window.scrollY;

      // Punto de referencia 0
      if (scrollPosition === 0) {
        // Acción cuando se alcanza el punto de referencia 1
        setTypeNav('');
        if (currentUrl === "home" || currentUrl === "project" || currentUrl === "services" || currentUrl === "contact") setModePage('dark');
        else setModePage('light');
      }

      if (scrollPosition < 10 && scrollPosition > 0) {
        // Acción cuando se alcanza el punto de referencia 1
        setTypeNav('');
        if (currentUrl === "project" || currentUrl == "services" || currentUrl === "contact") setModePage('dark')
        else setModePage('light');
      }

      // Punto de referencia 1
      if (scrollPosition > 10 && scrollPosition <= 200) {
        // Acción cuando se alcanza el punto de referencia 1
        if (currentUrl === "project" || currentUrl === "services" || currentUrl === "contact") {
          setTypeNav('nav-mode-one dark');
          setModePage('dark');
        } else {
          setTypeNav('nav-mode-one');
          setModePage('light');
        }
      }

      // Punto de referencia 2
      if (scrollPosition > 200) {
        // Acción cuando se alcanza el punto de referencia 2
        setTypeNav('nav-mode-one dark');
        setModePage('dark');
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl]);

  return (
    <header className={`nav-bar  ${typeNav ? typeNav : ''} `}>
      <div className='header'>
        <Link className='logo' to="/">
          {modePage === "dark" ? <img src={LogoWhite} className="opacity" alt="" /> : <img src={LogoBlack} alt="" />}
        </Link>
        <nav ref={navRef} className={`${showNavbar && 'active'}`}>
          <ul>
            {showNavbar ? navLinks.map(({ to, label }, i) => (
              <motion.li key={to}
                custom={i}
                initial="hidden"
                animate="visible"
                exit="hidden"
                variants={listVariants}>
                <NavLink
                  to={to}
                  className={navClassName}
                  onClick={closeNavbar}
                >
                  {t(label)}
                </NavLink>
              </motion.li>
            )) :
              navLinks.map(({ to, label }) => (
                <li key={label}>
                  <NavLink
                    to={to}
                    className={navClassName}
                    onClick={closeNavbar}
                  >
                    {t(label)}
                  </NavLink>
                </li>
              ))}
          </ul>
        </nav>
        <div className="nav2-btn">
          <BurguerButton modePage={modePage} showNavbar={showNavbar} handleShowNavbar={handleShowNavbar} />
        </div>
      </div>
    </header>
  );
};
