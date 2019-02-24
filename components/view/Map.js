import {
  withLeaflet,
  Map,
  TileLayer,
  ZoomControl,
  GeoJSON
} from "react-leaflet";
import Logo from "../../components/Logo";

import "leaflet/dist/leaflet.css";

const mapContainerStyle = {
  width: "100vw",
  height: "100vh",
  flex: 1
};

//import VectorGridDefault from "react-leaflet-vectorgrid";
//const VectorGrid = withLeaflet(VectorGridDefault);

// const lotsVectorGrid = {
//   type: "protobuf",
//   url: "https://tiler.dymaxionlabs.com/data/smap_2018/{z}/{x}/{y}.pbf",
//   subdomains: "",
//   vectorTileLayerStyles: {
//     style: {
//       weight: 0.5,
//       opacity: 1,
//       color: "#fff",
//       fillColor: "#00b2ff",
//       fillOpacity: 0.6,
//       fill: true,
//       stroke: true
//     },
//     hoverStyle: {
//       fillColor: "#390870",
//       fillOpacity: 1
//     },
//     activeStyle: {
//       fillColor: "#390870",
//       fillOpacity: 1
//     },
//     zIndex: 401
//   }
// };

// FIXME Move this to config/
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZ2Vzc2ljYTExMTIiLCJhIjoiY2pvZnYwYmV0MDhrYjNxanRpc2E3enhydiJ9.fawTIAVKzqpOE41wkVw1Zw";

const styleId = "mapbox.streets-satellite";
const basemapUrl = `https://api.tiles.mapbox.com/v4/${styleId}/{z}/{x}/{y}.png?access_token=${MAPBOX_TOKEN}`;

const ROIPolygon = ({ data }) => (
  <GeoJSON
    data={data}
    style={{
      fillColor: "#000",
      fillOpacity: 0.2,
      color: "#fff",
      weight: 1
    }}
  />
);

const Basemap = ({ url }) => (
  <TileLayer
    attribution='&amp;copy <a href="http://mapbox.com/copyright">Mapbox</a> contributors'
    url={url}
  />
);

class ViewMap extends React.Component {
  render() {
    const { children, roiData, ...extraProps } = this.props;

    return (
      <Map
        ref="map"
        style={mapContainerStyle}
        zoomControl={false}
        {...extraProps}
      >
        {/* <VectorGrid {...lotsVectorGrid} /> */}
        <Basemap url={basemapUrl} />
        {children}
        {roiData && <ROIPolygon data={roiData} />}

        <ZoomControl position="topright" />
      </Map>
    );
  }
}

export default ViewMap;
