// src/utils/helpers.js

/**
 * Genera una URL de imagen con un parámetro de versión basado en el timestamp actual.
 *
 * @param {string} url - La URL base de la imagen.
 * @returns {string} La URL con el parámetro de versión.
 */
export const getVersionedImageUrl = (url) => {
  //const timestamp = new Date().getTime(); // Obtén el timestamp actual
  const timestamp = "254356";
  return `${url}?v=${timestamp}`;
};