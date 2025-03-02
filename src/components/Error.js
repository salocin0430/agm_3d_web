import React from 'react'
import AnimatedPhrases from './textAnimate/AnimatedPhrases';
const words = ["error.error404", "error.error404", "error.error404"];
const additionalTexts = [
  "error.pageNotFound",
  "error.pageNotFound",
  "error.pageNotFound",
];

export const Error = () => {
  return (
    <div className='page'>
        <AnimatedPhrases  classes={"margin-auto"} words={words} additionalTexts={additionalTexts}/>
    </div>
  )
}
