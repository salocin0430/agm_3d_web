import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { ContextProvider } from '../../contexts/ContextProvider';
import { useTranslation } from 'react-i18next';

const Slider = ({ services, setCurrentService }) => {
  const [images, setImages] = useState([
    'https://apiboda.laoarchitects.com/storage/1/projects/14/images/3zmxGFbSfHL7iwiMZnW3ETh5KyCOhtIMd0zfTMKx.png?v=254356',
    'https://apiboda.laoarchitects.com/storage/1/projects/2/images/nHzteqBYPGJjmVU23kYAvsgDIATRTtM6W4aOQCjW.png?v=254356',
    'https://apiboda.laoarchitects.com/storage/1/projects/10/images/GsD5A0OCv8mhNMMgTgdgrxprqcGkaDJ1SdDedFgR.png',
    'https://apiboda.laoarchitects.com/storage/1/projects/12/images/palo%20alto%207.jpg',
    'https://apiboda.laoarchitects.com/storage/1/projects/4/images/PZ7PaDechRE4Dz8XCzknhwpCegOm6q3eYbJcb6XN.jpg',
    'https://apiboda.laoarchitects.com/storage/1/projects/13/images/TX97M9aMBAtbdvbixL0zzoTfSCAC8JlmO1uCtgSR.png'
  ]);
  const { t } = useTranslation();

  const { loading, setLoading } = useContext(ContextProvider);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [fiveZindex, setfiveZindex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isLoaded, setIsLoaded] = useState(false);
  // const isNext 
  const [isNext, setIsNext] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768); // Define mobile breakpoint

  const [activeButton, setActiveButton] = useState(null);

  const handlePrevClick = () => {
    setActiveButton('prev');
    handlePrev();
  };

  const handleNextClick = () => {
    setActiveButton('next');
    handleNext();
  };

  useEffect(() => {

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };


  }, []);

  const handlePrev = () => {
    setIsNext(false);
    setfiveZindex(1);
    let index = currentIndex === 0 ? services.length - 1 : currentIndex - 1;
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? services.length - 1 : prevIndex - 1));
    setCurrentService(services[index]);
  };

  const handleNext = () => {
    setIsNext(true);
    setfiveZindex(-5);
    let index = currentIndex === services.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex((prevIndex) => (prevIndex === services.length - 1 ? 0 : prevIndex + 1));
    setCurrentService(services[index]);
  };

  const handleImageClick = (index) => {
    setCurrentIndex(index);
    setCurrentService(services[index]);
  };

  const getCircularIndex = (index) => {
    return (index + services.length) % services.length;
  };


  return (
    <div className="flex flex-col items-center h-screen" style={{ position: 'absolute', top: 0, left: 0 }}>
      <div className='absolute flex w-screen h-[60%] overflow-hidden'></div>
      <motion.section
        className="relative flex w-screen h-[60%] overflow-hidden"
      >
        <motion.div className="relative flex w-screen h-full overflow-hidden"
          initial={{ y: '100%', height: '100%', opacity: 0 }}
          animate={{ y: '0%', height: '100%', opacity: 1 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          onAnimationComplete={() => setIsLoaded(true)}
        >
          {services.map((src, index) => {
            const circularIndex = getCircularIndex(currentIndex + index);
            const oneItem = circularIndex === currentIndex;
            const secondItem = circularIndex === getCircularIndex(currentIndex + 1);
            const threeItem = circularIndex === getCircularIndex(currentIndex + 2);
            const fourItem = circularIndex === getCircularIndex(currentIndex + 3);
            const fiveItem = circularIndex === getCircularIndex(currentIndex + 4);
            const lastItem = circularIndex === getCircularIndex(currentIndex + images.length - 1);
            let size = '60%';
            let zIndex = -5;

            if (oneItem) {
              size = '60%';
              zIndex = 1;
            } else if (secondItem) {
              size = '20%';
              zIndex = 1;
            } else if (threeItem) {
              size = '10%';
              zIndex = 1;
            } else if (fourItem) {
              size = '10%';
              zIndex = 1;
            } else if (fiveItem) {
              size = '10%';
              zIndex = fiveZindex;
            } else if (lastItem) {
              size = '60%';
              zIndex = -5;
            }

            const position = oneItem ? { x: 0 } :
              secondItem ? { x: windowWidth * 0.6 } :
                threeItem ? { x: windowWidth * 0.8 } :
                  fourItem ? { x: windowWidth * 0.9 } :
                    fiveItem ? { x: windowWidth * (1) } :
                      lastItem ? { x: windowWidth * -0.6 } :
                        { x: windowWidth * 1 };

            return (
              <motion.div
                key={circularIndex}
                src={services[circularIndex].image}
                className="object-cover opacity-80 cursor-pointer absolute"
                style={{ zIndex }}
                onClick={() => handleImageClick(circularIndex)}
                animate={true ? {
                  width: size,
                  height: '100%',
                  opacity: oneItem ? 1 : 1,
                  filter: oneItem ? 'contrast(120%)' : 'contrast(120%)',
                  ...position
                } : {}}
                transition={isLoaded ? { duration: 1.5, ease: 'easeInOut' } : { duration: 0, ease: 'easeInOut' }}
                initial={true ? { y: 0, height: '100%', width: '100%', opacity: 10 } : {}}>
                <motion.img
                  key={circularIndex}
                  src={images[circularIndex]}
                  className="object-cover w-full h-full"

                />

                {/** Div overlay  */}
                <div className="absolute inset-0 bg-black opacity-35"> </div>
                {/** Text overlay  , if is oneItem show full else show only first chard*/}
                <motion.div
                  className="absolute inset-0 flex items-end  text-white  w-full"
                  initial={{
                    opacity: 0,
                    x: oneItem || lastItem ? '5%' : '50%',
                  }}
                  animate={{
                    opacity: oneItem ? 1 : 1,
                    x: oneItem || lastItem ? '5%' : '35%',
                  }}
                  transition={{ duration: 2, ease: 'easeInOut' }}
                >
                  <motion.h1 className="sm:text-lg   md:text-4xl    font-bold w-full overflow-hidden whitespace-nowrap tracking-widest"
                    initial={{
                      width: oneItem || lastItem ? '100%' : isMobile ? '13.5px' : '26px'
                    }}
                    animate={{
                      width: oneItem || lastItem ? '500px' : isMobile ? '13.5px' : '26px',
                    }}
                    transition={{ duration: isMobile ? 1 : 1, ease: 'easeInOut' }}
                  >{oneItem || lastItem ? services[circularIndex].name : services[circularIndex].name}</motion.h1>
                </motion.div>

              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      <div className='flex justify-end w-full'>
        <div className=" md:w-1/4  flex justify-between items-center mt-4 relative mr-7">
          <button
            onClick={handlePrevClick}
            className="text-white p-2 focus:outline-none bg-transparent  hover:bg-transparent font-semibold"
          >
            {t('services.prev')}
          </button>
          <motion.div
            className="absolute left-0 right-0 h-1 bg-gray-400"
            initial={{ width: 0, top: '15px' }}
            animate={{
              width: activeButton ? '50%' : '50%',
              left: activeButton === 'prev' ? '3%' : '50%',
              right: activeButton === 'next' ? '3%' : '50%',
              top: '15px'
            }}
            transition={{ duration: 1.3 }}
          />
          <button
            onClick={handleNextClick}
            className="text-white p-2 focus:outline-none bg-transparent  hover:bg-transparent font-semibold"
          >
            {t('services.next')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Slider;
