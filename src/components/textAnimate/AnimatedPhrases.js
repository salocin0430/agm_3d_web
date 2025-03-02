/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, memo } from "react";
import styled, { keyframes } from "styled-components";
import { useInterval } from 'usehooks-ts';
import { useTranslation } from 'react-i18next';

const AnimatedWord = ({classes, words, additionalTexts}) => {
  const { t , i18n } = useTranslation();
  const[wordItems, setWordItems] = useState(t(words[0]).split(""));
  const [additionalText, setAdditionalText] = useState(t(additionalTexts[0]));
  const[count, setCount] = useState(1);
  const[play, setPlay] = useState(true);
  const[spanish, setSpanish] = useState(i18n.language.startsWith('es'));

  const interval = useInterval(() => {
    setWordItems(t(words[count]).split(""));
    setAdditionalText(t(additionalTexts[count]));
    setCount((count + 1) % 3);
  }, play ? 5000 : null);

  const animation = keyframes`
    0% { opacity: 0; }
    40% { opacity: 1; }
    70% { opacity: 1; }
    80% { opacity: 0; }
    100% { opacity: 0; }
  `;

  const animation2 = keyframes`
  10% { opacity: 0; }
  30% { opacity: 1; }
  70% { opacity: 1; }
  100% { opacity: 0; }
`;
/* eslint-disable-next-line */
  const AdditionalText = styled.div`
    opacity: 0;
    animation-name: ${animation2};
    animation-duration: 5000ms;
    animation-fill-mode: forwards;
    animation-iteration-count: infinite;
    animation-delay: 0.5s;
    transition: opacity 3s; // Agregamos una transición para que se desvanezca lentamente
`;
/* eslint-disable-next-line */
const Wrapper = styled.span`
  display: inline-block;
  span {
    display: inline-block;
    opacity: 0;
    animation-name: ${animation};
    animation-duration: 5000ms;
    animation-fill-mode: forwards;
    animation-iteration-count:infinite;    
    animation-timing-function: cubic-bezier(0.075, 0.82, 0.165, 1);
  }
  span:nth-child(1){
    animation-delay: 0.1s;
  }
  span:nth-child(2){
    animation-delay: 0.2s;
  }
  span:nth-child(3){
    animation-delay: 0.3s;
  }
  span:nth-child(4){
    animation-delay: 0.4s;
  }
  span:nth-child(5){
    animation-delay: 0.5s;
  }
  span:nth-child(6){
    animation-delay: 0.6s;
  }
  span:nth-child(7){
    animation-delay: 0.7s;
  }
  span:nth-child(8){
    animation-delay: 0.8s;
  }
  span:nth-child(9){
    animation-delay: 0.9s;
  }
  span:nth-child(10){
    animation-delay: 1s;
  }
  span:nth-child(11){
    animation-delay: 1.1s;
  }
  span:nth-child(12){
    animation-delay: 1.2s;
  }
  span:nth-child(13){
    animation-delay: 1.3s;
  }
`;

return (
  <div className={`${classes} animated-text`}>
    <Wrapper className="video-word">
      {!spanish &&  <> WE </>}
      {wordItems.map((item, index) => (
        <span key={index}>{item}</span>
      ))}
    </Wrapper>
    <AdditionalText className="video-text">
      {additionalText}
    </AdditionalText>
  </div>
);
};

export default memo(AnimatedWord);
