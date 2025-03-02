import React, { useState, useEffect } from "react";
import "./TextAnimate.css";
import { useTranslation } from "react-i18next";

const AnimatedText = () => {
  const [text, setText] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [additionalText, setAdditionalText] = useState("");
  const [additionalTextVisible, setAdditionalTextVisible] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    const words = [" CREATE ", " BELIEVE ", " TRANSFORM "];
    const additionalTexts = [
      "spaces that captivate the senses",
      "in architecture that transcends boundaries",
      "dreams into realities",
    ];
    let currentWordIndex = 0;
    let currentLetterIndex = 0;
    let animationRunning = false; // Flag to prevent concurrent animations

    const animateText = () => {
      if (animationRunning) return;
      animationRunning = true;

      setIsAnimating(true);

      const interval = setInterval(() => {
        if (currentLetterIndex < words[currentWordIndex].length - 1) {
          setText((prevText) => prevText + words[currentWordIndex][currentLetterIndex]);
          currentLetterIndex++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setAdditionalText(additionalTexts[currentWordIndex]);
            setAdditionalTextVisible(true);
            setTimeout(() => {
              let newText = text.slice(0, -words[currentWordIndex].length);
              currentWordIndex = (currentWordIndex + 1) % words.length;
              currentLetterIndex = 0;
              setIsAnimating(false);
              setTimeout(() => {
                setText(newText);
                setAdditionalTextVisible(false);
                setTimeout(() => {
                  animationRunning = false;
                  animateText();
                }, 1);
              }, 100 * words[currentWordIndex].length);
            }, 1000);
          }, 100);
        }
      }, 100);
      return () => clearInterval(interval);
    };

    animateText();

    return () => clearTimeout();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <React.Fragment>
      <div className="animated-text">
        <div>
          <span className="video-word">
            WE &nbsp;
            {text.split("").map((letter, index) => (
              <span
                key={index}
                style={{
                  opacity: isAnimating ? 1 : 0,
                  transition: "opacity 0.4s ease-in-out",
                  transitionDelay: isAnimating ? `${index * 40}ms` : `${index * 100}ms`,
                }}
              >
                {letter}
              </span>
            ))}
          </span>
        </div>
        <div
          className="video-text"
          style={{
            opacity: additionalTextVisible ? 1 : 0,
            transition: "opacity 0.9s ease-in-out",
          }}
        >
          {additionalText}
        </div>
      </div>
    </React.Fragment>
  );
};

export default AnimatedText;