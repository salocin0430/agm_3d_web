import React from 'react'
import AnimatedPhrases from './textAnimate/AnimatedPhrases';

const words = ["maintenance.maintenance", "maintenance.maintenance", "maintenance.maintenance"];
const additionalTexts = [
  "maintenance.text1",
  "maintenance.text1",
  "maintenance.text1",
];

export default function Maintenance() {
  return (
    <div className='page'>
        <AnimatedPhrases  classes={"margin-auto"} words={words} additionalTexts={additionalTexts}/>
    </div>
  )
}
