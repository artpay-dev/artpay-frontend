import React, { useEffect, useState } from "react";
import DefaultLayout from '../components/DefaultLayout';
import VerticalSlider from "../components/VerticalSlider.tsx";

export interface ArtistsProps {

}

const Artists: React.FC<ArtistsProps> = ({}) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true)
  }, []);

  return (<DefaultLayout pageLoading={!isReady} maxWidth={false}>
    <VerticalSlider/>
  </DefaultLayout>);
};

export default Artists;
