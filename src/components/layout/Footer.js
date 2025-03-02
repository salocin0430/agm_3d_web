import React, { useContext, useEffect, useState } from 'react'
import SloganWhite from '../../assets/images/slogan_white.png';
import SloganBlack from '../../assets/images/slogan_black.png';
import YoutubeWhite from '../../assets/images/youtube_white.png';
import YoutubeBlack from '../../assets/images/youtube_black.png';
import WhatsappWhite from '../../assets/images/whatsapp_white.png';
import WhatsappBlack from '../../assets/images/whatsapp_black.png';
import LinkedinWhite from '../../assets/images/linkedin_white.png';
import LinkedinBlack from '../../assets/images/linkedin_black.png';
import InstagramWhite from '../../assets/images/instagram_white.png';
import InstagramBlack from '../../assets/images/instagram_black.png';
import BehanceWhite from '../../assets/images/behance_white.png';
import BehanceBlack from '../../assets/images/behance_black.png';

import { ContextProvider } from '../../contexts/ContextProvider';
import { Link } from 'react-router-dom';
import './Footer.css';

export const Footer = () => {
  const { currentUrl } = useContext(ContextProvider);
  const [modeFooter, setModeFoter] = useState('dark');

  useEffect(() => {
    if (currentUrl === "home" || currentUrl === "services" || currentUrl === "contact") setModeFoter('dark');
    else setModeFoter('light');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUrl]);

  return (
    <footer className='footer'>

      <div className='copy_right'>
        <div className='networks-icon'>
          <Link className='icon' to="/" >
            {modeFooter === "dark" ? <img src={YoutubeWhite} alt="" /> : <img src={YoutubeBlack} alt="" />}
          </Link>
          <Link className='icon' to="https://www.instagram.com/lao.architects/" target="_blank">
            {modeFooter === "dark" ? <img src={InstagramWhite} alt="" /> : <img src={InstagramBlack} alt="" />}
          </Link>
          <Link className='icon' to="/" >
            {modeFooter === "dark" ? <img src={LinkedinWhite} alt="" /> : <img src={LinkedinBlack} alt="" />}
          </Link>
          <Link className='icon behance' to="/" >
            {modeFooter === "dark" ? <img src={BehanceWhite} alt="" /> : <img src={BehanceBlack} alt="" />}
          </Link>
          <Link className='icon' to="/" >
            {modeFooter === "dark" ? <img src={WhatsappWhite} alt="" /> : <img src={WhatsappBlack} alt="" />}
          </Link>
        </div>
        <div className={` text-copyright ${modeFooter === "light" ? "font-dark" : ""}`} to="/" >&copy; COPYRIGHT 2025 - ALL RIGHTS RESERVED</div>
      </div>

      <div className='slogan'>
        {modeFooter === "dark" ? <img src={SloganWhite} alt="" /> : <img src={SloganBlack} alt="" />}
      </div>
    </footer>
  )
}
