 
import React, { useEffect, useRef, useState } from "react";
import { Typography } from "@mui/material";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { Status, Wrapper } from "@googlemaps/react-wrapper";

export interface MapProps {
  address: string;
}

const MapComponent: React.FC<MapProps> = ({ address }) => {
  const [map, setMap] = useState<google.maps.Map>();
  const ref = useRef<HTMLDivElement>();

  const [markerCluster, setMarkerClusters] = useState<MarkerClusterer>();
  const [coordinates, setCoordinates] = useState<{ lat: number, lng: number }>();


  useEffect(() => {
    //TODO
    setCoordinates({ lat: 45.0603541, lng: 7.6911952 });
  }, [address]);

  useEffect(() => {
    if (ref.current && !map && coordinates) {
      setMap(new window.google.maps.Map(ref.current, {
        center: { ...coordinates },
        zoom: 14
      }));
    }
    if (map && !markerCluster && coordinates) {
      setMarkerClusters(new MarkerClusterer({
        map, markers: [
          new window.google.maps.Marker({ position: { ...coordinates } })
        ]
      }));
    }
  }, [coordinates, map, markerCluster]);

  return (
    <>
      <div ref={ref as any} style={{ height: "100%", width: "100%", minHeight: "400px" }}></div>
    </>
  );
};

const MapWrapper: React.FC<MapProps> = (props) => {
  const render = (status: Status) => {
    if (status === "SUCCESS") {
      return <MapComponent {...props} />;
    }
    return <Typography variant="body1" color="textSecondary">{status}</Typography>;
  };

  return <Wrapper apiKey={"AIzaSyC15eERVyY9lE5QSh3SAK1LsBw8W4wrGxM"} render={render}>

  </Wrapper>;
};

export default MapWrapper;

/*
export default GoogleApiWrapper({
  apiKey: "AIzaSyC15eERVyY9lE5QSh3SAK1LsBw8W4wrGxM",
})(MapContainer);
*/