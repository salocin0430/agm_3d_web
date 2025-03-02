import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import LazyLoad from 'react-lazyload';
import { Blurhash } from 'react-blurhash';
import useOnScreen from '../../hooks/useOnScreen';
//import getVersionedImageUrl from '../../utils/getVersionedImageUrl';
import { getVersionedImageUrl } from '../../utils/helpers';

const ImageItem = ({ i, image, project, viewImage, blurhash }) => {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const imageWrapper = useRef(null);
  const [componentWidth, setComponentWidth] = useState(0);



  const imageUrl = process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0'
    ? `/images/${project.id}/${image.url}`
    : `${process.env.REACT_APP_PROJECTS_API_URL}${image.url}`;

  const versionedImageUrl = getVersionedImageUrl(imageUrl);


  const afterLoad = useCallback(() => {
    setTimeout(() => {
      setIsImageLoaded(true);
    }, 1000);
  }, []);

  const updateComponentWidth = () => {
    if (imageWrapper.current) {
      setComponentWidth((image.height / image.width) * imageWrapper.current.offsetWidth);
    }
  };

  const placeholder = useMemo(() => {
    if (isImageLoaded || !image.blurhash) return null;
    return (
      <Blurhash
        hash={image.blurhash}
        width={"100%"}
        height={componentWidth}
        resolutionX={32}
        resolutionY={32}
        punch={1}
      />
    );
  }, [isImageLoaded, image.blurhash, componentWidth]);

  useEffect(() => {
    // Inicializar el ancho del componente
    updateComponentWidth();

    // Event listener para actualizar el ancho cuando la ventana cambie de tamaño
    window.addEventListener('resize', updateComponentWidth);

    // Cleanup para eliminar el event listener cuando el componente se desmonte
    return () => {
      window.removeEventListener('resize', updateComponentWidth);
    };
  }, []);


  return (
    <div ref={imageWrapper} className="relative mb-2 break-inside-avoid" style={{ height: "auto" }}>
      {placeholder}

      <LazyLoad
        height="100%"
        offset={500}
      >
        <img
          src={versionedImageUrl}
          style={{ width: "100%", height: "auto", display: isImageLoaded ? "block" : "none", cursor: 'pointer' }}
          alt=""
          onLoad={afterLoad}
          onClick={() => viewImage(process.env.REACT_APP_LOAD_PROJECTS_LOCALLY !== '0' ? `/images/${project.id}/${image.url}` : `${process.env.REACT_APP_PROJECTS_API_URL}${image.url}`, i)}
        />
      </LazyLoad>
    </div>
  );
};

export default ImageItem;
