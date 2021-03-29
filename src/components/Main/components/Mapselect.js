import React, { useState } from "react";
import ReactMapGL, { Marker } from "react-map-gl";
import config from '../../../config.json'

export default function Mapselect(props) {

  const [mark, setMark] = useState([props.lat === undefined ? 32.330192 : props.lat,props.lng === undefined ? 34.9226923 : props.lng]);
  const [viewport, setViewport] = useState({latitude: props.lat === undefined ? 32.330192 : props.lat,longitude: props.lng === undefined ? 34.9226923 : props.lng,width: "100%",height: "40vh",zoom: 10});

  const onMarkerclick = (e) => {
    setMark(e.lngLat);
    props.parentCallback(e.lngLat);
  };

  return (
    <div>
      <ReactMapGL {...viewport} mapboxApiAccessToken={config.MAPBOX_TOKEN} mapStyle={config.MAPBOX_STYLE} 
        onViewportChange={(viewport) => setViewport(viewport)} onClick={(e) => onMarkerclick(e)} pitch="60" bearing="-60" >
        <Marker offsetTop={-48}offsetLeft={-24}latitude={mark[1]}longitude={mark[0]}><img src=" https://img.icons8.com/color/48/000000/marker.png" alt="img"/></Marker>
      </ReactMapGL>
    </div>
  );
}
