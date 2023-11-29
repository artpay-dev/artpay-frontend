/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from "react";
import { Map, Marker, GoogleApiWrapper, IMapProps } from "google-maps-react";

export interface MapProps {
  address: string;
}

class MapContainer extends React.Component {
  // @ts-ignore
  props: IMapProps & MapProps;
  render() {
    // @ts-ignore
    return (
      <Map
        style={{
          width: "100%",
          height: "324px",
          position: "relative",
          borderRadius: "5px",
        }}
        google={this.props.google}
        initialCenter={{ lat: 45.0603541, lng: 7.6911952 }}
        zoom={14}>
        <Marker
          name={"Current location"}
          position={{ lat: 45.0603541, lng: 7.6911952 }}
        />

        {/*<Marker onClick={this.onMarkerClick} name={"Current location"} />
<InfoWindow onClose={() =>}>
          <div>
            <h1>{this.state.selectedPlace.name}</h1>
          </div>
        </InfoWindow>*/}
      </Map>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: "AIzaSyC15eERVyY9lE5QSh3SAK1LsBw8W4wrGxM",
})(MapContainer);
