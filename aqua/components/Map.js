import {
  Map as LeafletMap,
  TileLayer,
  ZoomControl,
  GeoJSON,
} from "react-leaflet";

import "leaflet/dist/leaflet.css";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  flex: 1,
};

// FIXME Move this to config/
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZ2Vzc2ljYTExMTIiLCJhIjoiY2pvZnYwYmV0MDhrYjNxanRpc2E3enhydiJ9.fawTIAVKzqpOE41wkVw1Zw";

const ROIPolygon = ({ data }) => (
  <GeoJSON
    data={data}
    style={{
      fillColor: "#000",
      fillOpacity: 0.05,
      color: "#fff",
      weight: 2,
    }}
  />
);

const MapboxBasemap = ({ style }) => {
  const styleId = style || "mapbox/satellite-v9";
  return (
    <Basemap
      url={`https://api.mapbox.com/styles/v1/${styleId}/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`}
      attribution='&amp;copy <a href="http://mapbox.com/copyright">Mapbox</a> contributors'
      tileSize={512}
      zoomOffset={-1}
    />
  );
};

const Basemap = (props) => <TileLayer {...props} zIndex={-1} />;

class Map extends React.Component {
  render() {
    const { children, roiData, basemap, ...extraProps } = this.props;

    return (
      <LeafletMap
        ref="map"
        style={mapContainerStyle}
        zoomControl={false}
        {...extraProps}
      >
        {basemap.type == "xyz" ? <Basemap url={basemap.url} attribution={basemap.attribution} /> : <MapboxBasemap style={basemap.style} />}
        {children}
        {roiData && <ROIPolygon data={roiData} />}

        <ZoomControl position="topright" />
      </LeafletMap>
    );
  }
}

export default Map;
