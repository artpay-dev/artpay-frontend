import React, { useState } from "react";
import { Box, BoxProps } from "@mui/material";

import animationData from "../assets/animations/Loading.json";
import loopAnimationData from "../assets/animations/Loader_2_2.json";

import Lottie, { Options } from "react-lottie";

export interface LoaderProps {
  sx?: BoxProps["sx"];
  onIntroComplete?: () => void;
}


const Loader: React.FC<LoaderProps> = ({ sx, onIntroComplete }) => {

  const [showLoop, setShowLoop] = useState(false);

  const introOptions: Options = {
    loop: false,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };
  const loopOptions: Options = {
    loop: true,
    autoplay: false,
    animationData: loopAnimationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice"
    }
  };


  const handleIntroComplete = () => {
    setShowLoop(true);
    if (onIntroComplete) {
      onIntroComplete();
    }

    //setTimeout(() => setShowLoop(true), 500)
  };

  return (
    <Box sx={{ ...sx, overflow: "hidden", display: "flex" }}>
      {showLoop ?
        <Lottie
          options={loopOptions}
          height={800}
          width={800}
        /> :
        <Lottie
          options={introOptions}
          eventListeners={[
            { callback: () => console.log("started"), eventName: "segmentStart" },
            { callback: () => handleIntroComplete(), eventName: "complete" }
          ]}
          height={800}
          width={800}
        />}
    </Box>
  );
};

export default Loader;
