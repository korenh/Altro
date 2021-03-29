import React, { useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import CancelIcon from "@material-ui/icons/Cancel";
import WorkIcon from "@material-ui/icons/Work";
import PersonPinCircleIcon from "@material-ui/icons/PersonPinCircle";
import config from '../../config.json'

export default function Mapview(props) {

  const [locations] = useState(props.locations);
  const [viewport, setViewport] = useState({latitude: props.lat === undefined ? 32.330192 : props.lat,longitude: props.lng === undefined ? 34.9226923 : props.lng,width: "100%",height: "80vh",zoom: 10});

  return (
    <div>
      <ReactMapGL {...viewport} mapboxApiAccessToken={config.MAPBOX_TOKEN} mapStyle={config.MAPBOX_STYLE}
        onViewportChange={(viewport) => setViewport(viewport)} pitch="60" bearing="-60" >
        <CancelIcon onClick={() => props.setMap()} alt="img" style={{cursor: "pointer",fontSize: 45,margin: "5px",color: "white"}}/>
        <Marker offsetTop={-48}offsetLeft={-24} latitude={props.lat === undefined ? 32.330192 : props.lat} longitude={props.lng === undefined ? 34.9226923 : props.lng}>
          <PersonPinCircleIcon style={{ fontSize: 70, color: "#FF4500" }} />
        </Marker>
        {locations.map((v) => (
          <Marker offsetTop={-48} offsetLeft={-24} latitude={v.Oa} longitude={v.Ba}><WorkIcon style={{ fontSize: 40, color: "rgb(45, 123, 212)" }} /></Marker>
        ))}
      </ReactMapGL>
    </div>
  );
}
