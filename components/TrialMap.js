import {
  Map,
  TileLayer,
  ZoomControl,
  FeatureGroup,
  Rectangle
} from "react-leaflet";
import GeocoderControl from "./GeocoderControl";
import DrawControl from "./DrawControl";

import "leaflet/dist/leaflet.css";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  flex: 1
};

// FIXME Move this to config/
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZ2Vzc2ljYTExMTIiLCJhIjoiY2pvZnYwYmV0MDhrYjNxanRpc2E3enhydiJ9.fawTIAVKzqpOE41wkVw1Zw";

const styleId = "mapbox.streets-satellite";
const basemapUrl = `https://api.tiles.mapbox.com/v4/${styleId}/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;

const drawOptions = {
  polyline: false,
  circle: false,
  rectangle: {
    shapeOptions: {
      clickable: true
    }
  },
  marker: false,
  circlemarker: false
};

function boundsKey(bounds) {
  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();
  return `${ne.lng},${ne.lat}-${sw.lng},${sw.lat}`;
}

export default ({
  children,
  center,
  zoom,
  onFeatureGroupClick,
  onClick,
  onGeocoderResult
}) => (
  <Map
    style={mapContainerStyle}
    center={center}
    zoom={zoom}
    zoomControl={false}
    animate={true}
    onClick={onClick}
  >
    <TileLayer
      attribution='&amp;copy <a href="http://mapbox.com/copyright">Mapbox</a> contributors'
      url={basemapUrl}
    />
    <ZoomControl position="topright" />
    <GeocoderControl
      accessToken={MAPBOX_TOKEN}
      onResult={onGeocoderResult}
      collapsed={false}
      position="topleft"
      placeholder="Buscar ciudad..."
      errorMessage="No se han encontrado resultados."
    />
    <FeatureGroup onClick={onFeatureGroupClick}>
      <DrawControl position="topleft" draw={drawOptions} />
    </FeatureGroup>

    {children}
  </Map>
);
