import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Masonry, { ResponsiveMasonry } from "react-responsive-masonry"
import { FaAngleLeft } from "react-icons/fa";
import { FaAngleRight } from "react-icons/fa";
import { RxCross1 } from "react-icons/rx";
import './Gallery.css';
import { Blurhash } from 'react-blurhash';

/*
const images2 = [
    "https://picsum.photos/2000/3000",
    "https://picsum.photos/3000/2000",
    "https://picsum.photos/4000/3000",
    "https://picsum.photos/1500/2000",
    "https://picsum.photos/2000/1500",
    "https://picsum.photos/4000/3000",    
    "https://picsum.photos/4010/1000",
    "https://picsum.photos/1510/1000",
]
*/
/*
const images = [
    "https://picsum.photos/2000/3000",
    "https://picsum.photos/2000/2000",
    "https://picsum.photos/2000/3000",
    "https://picsum.photos/2000/2000",
    "https://picsum.photos/2000/1500",
    "https://picsum.photos/2000/3000",    
    "https://picsum.photos/2000/1000",
    "https://picsum.photos/2000/1000",
]*/

export const Gallery = ({ project, images }) => {
  const [data, setData] = useState({ img: '', i: 0 });
  const [galleryRef, inView] = useInView({
    triggerOnce: true,
    rootMargin: '-100px 0px', // Ajusta el margen según sea necesario
  });
  const textAnimation = useAnimation();

  const viewImage = (img, i) => {
    setData({ img, i });
    document.body.classList.add('no-scroll');
  }

  const imgAction = (action) => {
    let i = data.i;
    if (action === 'next-img') {
      if (i === images.length - 1) i = -1;
      setData({
        img: process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ? `/images/${project.id}/${images[i + 1].url}` :
          `${process.env.REACT_APP_PROJECTS_API_URL}${images[i + 1].url}`, i: i + 1
      })
    }
    if (action === 'previous-img') {
      if (i === 0) i = images.length;
      setData({
        img: process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ? `/images/${project.id}/${images[i - 1].url}` :
          `${process.env.REACT_APP_PROJECTS_API_URL}${images[i - 1].url}`, i: i - 1
      })
    }
    if (!action) {
      setData({ img: '', i: 0 })
    }
  }

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

  useEffect(() => {
    if (data.img === '' || data.img === undefined) document.body.classList.remove('no-scroll');
  }, [data]);


  return (
    <>

      <AnimatePresence>
        {data.img && (
          <motion.div
            className='image-open'
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span onClick={() => imgAction()} className='close-btn'>
              <RxCross1 />
            </span>
            <div className='gallery-left' onClick={() => imgAction('previous-img')}>
              <motion.button className='btn-left'>
                <FaAngleLeft />
              </motion.button>
            </div>
            <div className='gallery-right' onClick={() => imgAction('next-img')}>
              <motion.button className='btn-right'>
                <FaAngleRight />
              </motion.button>
            </div>
            <motion.img
              alt=''
              src={data.img}
              key={data.i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <motion.div className='gallery'
        ref={galleryRef}
        initial="hidden"
        animate={textAnimation}
        variants={textVariants}>
        <ResponsiveMasonry
          columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}
        >
          <Masonry gutter='10px'>
            {images.map((image, i) => (

              <div key={i} style={{ position: 'relative', width: '100%', height: `${(image.height / image.width) * 100}%`, overflow: 'hidden' }}>
                <img
                  src={process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ?
                    `/images/${project.id}/${image.url}` :
                    `${process.env.REACT_APP_PROJECTS_API_URL}${image.url}`
                  }
                  style={{ width: "100%", height: "auto", display: "block", cursor: 'pointer' }}
                  alt=""
                  onClick={() => viewImage(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ?
                    `/images/${project.id}/${image.url}` : `${process.env.REACT_APP_PROJECTS_API_URL}${image.url}`, i)}
                />
                <Blurhash
                  hash={image.blurhash} // Proporcionar el valor BlurHash de la imagen
                  width={image.width} // Ancho de la previsualización
                  height={image.height} // Alto de la previsualización
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: -1 }} // Asegura que la previsualización de BlurHash cubra toda el área del contenedor y esté detrás de la imagen
                />
              </div>
            ))}
          </Masonry>
        </ResponsiveMasonry>
      </motion.div>
    </>
  )
}
