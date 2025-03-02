import React, { useState, useEffect } from 'react';
import { transition1 } from '../../transitions'
import { motion } from 'framer-motion';
import './Loader.css';

export const Loader = () => {
  const [hidden, setHidden] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const totalImages = 18;
  const images = [];

  for (let i = 1; i <= totalImages; i++) {
    images.push(require(`../../assets/images/loader/loader${i}.png`));
  }

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (currentImage === totalImages - 1) {
        setCurrentImage(0); // Reinicia el ciclo de imágenes
        //setHidden(true);
      } else {
        setCurrentImage(currentImage + 1);
      }
      setHidden(false); // Muestra el loader nuevamente
    }, currentImage < 4 ? 180 : 180);

    return () => clearTimeout(timeout);
  }, [currentImage]);

  return (
    <motion.div
      className={`loader-container ${hidden ? 'hidden' : ''}`}

    >
      <motion.img
        src={images[currentImage]} alt="" className="loader-icon"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={false ? { opacity: 0 } : {}}
        transition={transition1}
      />
    </motion.div>
  );
};
