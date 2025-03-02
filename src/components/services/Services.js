import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import Slider from './Slider';
import { motion, AnimatePresence } from 'framer-motion';
import { FaAngleRight } from "react-icons/fa";

const Card = ({ description, index }) => {
  return (
    <motion.div
      key={index}
      className="text-sm  xl:text-sm 2xl:text-lg flex items-center w-full justify-center px-4 py-2 rounded-md shadow-md cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1.5, ease: "easeInOut" } }}
    >
      {description.icon && <description.icon className="text-white mr-2" />}
      <p className="mt-0 mb-0 text-white">{description.text}</p>
    </motion.div>
  );
};

export const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      name: t('services.service1.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/14/images/3zmxGFbSfHL7iwiMZnW3ETh5KyCOhtIMd0zfTMKx.png?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service1.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service1.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service1.description3')
        }
      ]
    },
    {
      name: t('services.service2.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/2/images/nHzteqBYPGJjmVU23kYAvsgDIATRTtM6W4aOQCjW.png?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service2.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service2.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service2.description3')
        }
      ]
    },
    {
      name: t('services.service3.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/3/images/JHzpfjC1ueqLqWcU89QDJZ3SA8OVsWKER48pkVnj.jpg?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service3.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service3.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service3.description3')
        }
      ]
    },
    {
      name: t('services.service4.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/12/images/Wp0pWhKgcGG8zLlumAoqdwSEiZawodqLVksJtrBf.png?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service4.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service4.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service4.description3')
        }
      ]
    },
    {
      name: t('services.service5.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/14/images/3zmxGFbSfHL7iwiMZnW3ETh5KyCOhtIMd0zfTMKx.png?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service5.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service5.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service5.description3')
        }
      ]
    },
    {
      name: t('services.service6.title'),
      image: "https://apiboda.laoarchitects.com/storage/1/projects/10/images/52kdlrlYkb65toYc0hO3MCDKggfKCmsiO67qf1wD.png?v=254356",
      descriptions: [
        {
          icon: FaAngleRight,
          text: t('services.service6.description1')
        },
        {
          icon: FaAngleRight,
          text: t('services.service6.description2')
        },
        {
          icon: FaAngleRight,
          text: t('services.service6.description3')
        }
      ]
    }
  ];

  const [currentService, setCurrentService] = useState(services[0]);

  useEffect(() => {
    setCurrentService(currentService);
  }, [currentService]);

  return (
    <>
      <Helmet>
        <title>{t('services.metatitle')}</title>
        <meta name="description" content={t('services.metadescription')} />
        <link rel="canonical" href="https://laoarchitects.com/services" />
      </Helmet>
      <div className='page'>
        <Slider services={services} setCurrentService={setCurrentService} />

        <section className=" min-h-[30vh] md:min-h-[30vh]  lg:min-h-[12vh] ml-[20px] mr-[20px] md:ml-[20px] md:mr-[20px] sm:ml-[20px] sm:mr-[20px] mt-[52vh]  1xl:mt-[55vh] 2xl:mt-[55vh]  flex w-full text-white ">
          <AnimatePresence mode="wait">
            <motion.div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center justify-items-center"
              key={currentService.name}
              initial={{ opacity: 0, position: "absolute" }}
              animate={{ opacity: 1, position: "relative" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            >
              {currentService.descriptions.map((description, index) => (
                <Card key={index} description={description} />
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </>
  );
};
