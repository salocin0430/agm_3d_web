import React, { useState } from 'react';
import './Contact.css';
import { ArchitectureModel } from './ArchitectureModel';
import { transition1 } from '../../transitions';
import { motion } from 'framer-motion';
import woman from '../../assets/images/woman.png';
import { useTranslation } from 'react-i18next';
import { TfiEmail } from "react-icons/tfi";
import { BsTelephone } from "react-icons/bs";
import axios from 'axios'; // Importar Axios
import { Helmet } from 'react-helmet-async';

export const Contact = () => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');

  // Creamos el formulario
  const handleSubmit = async (e) => { // Marcar la función como async para usar await
    e.preventDefault(); // Evitar que el formulario se envíe de forma predeterminada

    try {
      // Enviar los datos del formulario a Laravel utilizando Axios
      const response = await axios.post(process.env.REACT_APP_API_URL, {
        name,
        surname,
        email,
        phone,
        reason,
      });

      // Limpiar los campos del formulario
      setName('');
      setSurname('');
      setEmail('');
      setPhone('');
      setReason('');

      // Hacer algo con la respuesta si es necesario
      console.log('Respuesta del servidor:', response.data);
    } catch (error) {
      // Manejar errores de la solicitud si es necesario
      console.error('Error al enviar el formulario:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>{t('contact.metatitle')}</title>
        <meta name="description" content={t('contact.metadescription')} />
        <link rel="canonical" href="https://laoarchitects.com/contact" />
      </Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={true ? { opacity: 0 } : {}}
        transition={transition1}
        className='page'
      >
        <div className='contact'>
          <h1 className='heading'>{t('contact.letsTalk')}</h1>
          <motion.div
            initial={{ opacity: 0, x: '-100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={true ? { opacity: 0, x: '-100%' } : {}}
            transition={transition1}
            className='contact-image'
          >
            {/*<img src={woman} className="opacity" alt="" />*/}
            <span className="contact-sub"> <TfiEmail /> contact@laoarchitects.com</span>
            <span className="contact-sub"> <BsTelephone />+57 319 223 2989</span>
          </motion.div>
          <motion.div
            className='section-information'
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={true ? { scale: 0 } : {}}
            transition={transition1}
          >
            <form className='contact-form' onSubmit={handleSubmit}>
              <div className='input-form'>
                <label htmlFor="name">{t('contact.name')}</label>
                <input id="name" className="input" type="text" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className='input-form'>
                <label htmlFor="surname">{t('contact.surname')}</label>
                <input id="surname" className="input" type="text" value={surname} onChange={e => setSurname(e.target.value)} />
              </div>

              <div className='input-form'>
                <label htmlFor="email">{t('contact.email')}</label>
                <input id="email" className="input" type="text" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className='input-form'>
                <label htmlFor="phone">{t('contact.phone')}</label>
                <input id="phone" className="input" type="text" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className='textarea-form'>
                <label htmlFor="reason">{t('contact.reason')}</label>
                <textarea id="reason" className="textarea" value={reason} onChange={e => setReason(e.target.value)} />
              </div>
              <motion.button
                type="submit"
                value="send"
                aria-label="Enviar"
                className="px-4 py-2 border-2 border-white text-white bg-transparent radius-0"
                whileHover={{
                  backgroundColor: 'white',
                  color: 'black',
                  borderColor: 'black',
                  transition: { duration: 0.5 }
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ border: '0px solid white' }}
                animate={{ border: '0.5px solid white' }}
                transition={{ duration: 3 }}
              >
                {t('contact.send')}
              </motion.button>
            </form>
          </motion.div>
        </div >
      </motion.div >
    </>
  );
}
