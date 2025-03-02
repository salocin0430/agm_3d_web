import React, { useCallback, useState, useRef, useEffect, useMemo } from 'react';
import LazyLoad from 'react-lazyload';
import { Blurhash } from 'react-blurhash';

const ImageBlurhash = ({ src, blurhash, alt, className, Heightblurhash }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [componentWidth, setComponentWidth] = useState(0);
  const imageWrapper = useRef(null);

  const updateComponentWidth = () => {
    if (imageWrapper.current) {
      setComponentWidth(imageWrapper.current.offsetWidth * 0.610);
    }
  };

  const afterLoad = useCallback(() => {
    setTimeout(() => {
      setImageLoaded(true);
    }, 500);
  }, []);

  const placeholder = useMemo(() => {
    if (imageLoaded || !blurhash) return null;
    return (
      <Blurhash
        hash={blurhash}
        width={"100%"}
        height={"100%"}
        resolutionX={32}
        resolutionY={32}
        punch={1}
      />
    );
  }, [imageLoaded, blurhash, componentWidth]);

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
    <div ref={imageWrapper} className={className} style={{ position: 'relative', width: '100%', height: Heightblurhash }}>
      {!imageLoaded && (
        <Blurhash
          hash={blurhash}
          width={"100%"}
          height={"100%"}
          resolutionX={32}
          resolutionY={32}
          punch={1}
        />
      )}
      <LazyLoad
        height="100%"
        offset={500}
        style={{ height: '100%' }}
      >
        <img
          src={src}
          alt={alt}
          onLoad={afterLoad}
          style={{ display: imageLoaded ? 'block' : 'none', width: '100%', height: '100%' }}
        />
      </LazyLoad>
    </div>
  );
};

export default ImageBlurhash;
