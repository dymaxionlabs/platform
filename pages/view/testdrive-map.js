import React from "react";
import { withNamespaces } from "../../i18n";
import Head from "next/head";
import dynamic from "next/dynamic";
import LoadingProgress from "../../components/LoadingProgress";
import ResultsButton from "../../components/testdrive/ResultsButton";
import LayersFab from "../../components/LayersFab";
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ListItem from '@material-ui/core/ListItem';

var lotsData = {};

const TileLayer = dynamic(() => import("../../components/TileLayer"), {
  ssr: true
});

const mapData = {
  pool: {
    vectorData: require("../../static/testdrive/pools/results.json"),
    center: [-34.43283793934236, -58.87167763852244],
    zoom: 16,
    minZoom: 15,
    maxZoom: 18
  },
  cattle: {
    vectorData: require("../../static/testdrive/cattle/results.json"),
    center: [-37.79857199410538, -57.49418322639319],
    zoom: 17,
    minZoom: 16,
    maxZoom: 20
  }
};

var initialViewport = {
  center: [-34.43283793934236, -58.87167763852244],
  zoom: 16
};

const dymaxionAttribution = "&copy; Dymaxion Labs 2020";

const Map = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: LoadingProgress
});

const GeoJSON = dynamic(() => import("../../components/GeoJSON"), {
  ssr: false
});

const rasterLayers = [
  {
    id: "cattle",
    type: "raster",
    url:
      "https://storage.googleapis.com/dym-tiles/testdrive/cattle/{z}/{x}/{y}.png",
    attribution: dymaxionAttribution
  },
  {
    id: "pools",
    type: "raster",
    url:
      "https://storage.googleapis.com/dym-tiles/testdrive/pools/{z}/{x}/{y}.png",
    attribution: dymaxionAttribution
  }
];

var selectedRasterLayer = {};
var key = "";
var metricsData = {}; 

class LotsLayer extends React.Component {
  render() {
    return <GeoJSON data={lotsData} attribution={dymaxionAttribution} />;
  }
}

const Color = ({ value }) => (
  <div>
    <style jsx>{`
      div {
        border: 1px solid #000;
        width: 16px;
        height: 16px;
        background-color: ${value};
        display: inline-block;
        margin-right: 8px;
        margin-bottom: -3px;
      }
    `}</style>
  </div>
);

const LotsLegend = withNamespaces("testdrive")(({ t }) => (
  <div>
    <Paper
      style={{
        position: "fixed",
        left: 20,
        top: 20,
        zIndex: 1000,
        width: 190,
        cursor: "default"
      }}
    >
      <Typography style={{ marginLeft: "15px", marginTop: "15px",marginBottom: "10px" }} variant="h6" component="h3">
        <strong>{t("metrics_title_result")}</strong>
      </Typography>
      <Typography style={{ marginLeft: "15px" , marginBottom: "4px"}} component="p">
        <strong>{t("metrics_title_object")}: </strong>{metricsData["objectCount"]}
      </Typography>
      <Typography style={{ marginLeft: "15px",  marginBottom: "4px" }} component="p">
        <strong>{t("metrics_title_area")}: </strong>{metricsData["area"] + "m²"}
      </Typography>
      <Typography style={{ marginLeft: "15px" }} component="p">
        <strong>{t("metrics_title_class")}: </strong>
      </Typography >
      {metricsData["classes"].map(item => (
        <ListItem style={{ marginLeft: "15px", paddingBottom:"4px", paddingTop: "4px" }}>
          <Typography component="p">
            <Color value={item[2]} />
            <strong>{item[0] + ": "}</strong>{item[1]}
          </Typography>
        </ListItem>
      ))}
      <div style={{  marginLeft: "15px" , marginBottom: "15px", marginTop:"10px" }}>
        <ResultsButton/>
      </div>
    </Paper>
  </div>
));

LotsLayer = withNamespaces("testdrive")(LotsLayer);

class MapTestDrive extends React.Component {
  state = {
    viewport: initialViewport,
    minZoom: 1,
    maxZoom: 20,
    layersOpacity: {
      annotations: 100,
      tiles: 100
    },
    layers: [
      {
        uuid: "annotations",
        name: "Annotations"
      },
      {
        uuid: "tiles",
        name: "Tiles"
      }
    ],
    activeLayers: ["tiles", "annotations"]
  };

  componentDidMount() {
    var current = JSON.parse(window.localStorage.getItem("current"));
    var useCase = current["useCase"];
    key = useCase;
    if (useCase == "cattle") {
      metricsData = require("../../static/testdrive/cattle/metrics_cattle.json");
      console.log("loading cattle");
      initialViewport.center = mapData.cattle.center;
      initialViewport.zoom = mapData.cattle.zoom;
      this.setState({ minZoom: mapData.cattle.minZoom });
      this.setState({ maxZoom: mapData.cattle.maxZoom });
      lotsData = mapData.cattle.vectorData;
      selectedRasterLayer = rasterLayers[0];
    } else if (useCase == "pools") {
      metricsData = require("../../static/testdrive/pools/metrics_pool.json");
      console.log("loading pools");
      initialViewport.center = mapData.pool.center;
      initialViewport.zoom = mapData.pool.zoom;
      this.setState({ minZoom: mapData.pool.minZoom });
      this.setState({ maxZoom: mapData.pool.maxZoom });
      lotsData = mapData.pool.vectorData;
      selectedRasterLayer = rasterLayers[1];
    } else {
      alert("Use case not found.");
    }

    this.setState({ viewport: initialViewport });
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ["testdrive"]
    };
  }

  _onMapViewportChanged = viewport => {
    this.setState({ viewport });
  };

  onToggle = layer => {
    var { activeLayers } = this.state;

    if (activeLayers.includes(layer.uuid)) {
      activeLayers.splice(activeLayers.indexOf(layer.uuid), 1);
    } else {
      activeLayers.push(layer.uuid);
    }

    this.setState({ activeLayers });
  };

  onOpacityChange = (uuid, value) => {
    var { layersOpacity } = this.state;

    layersOpacity[uuid] = value;

    this.setState({ layersOpacity });
  };

  render() {
    const {
      viewport,
      maxZoom,
      minZoom,
      layersOpacity,
      layers,
      activeLayers
    } = this.state;

    return (
      <div className="index">
        <Head>
          <title>Dymaxion Labs Platform</title>
          <link
            rel="shortcut icon"
            type="image/x-icon"
            href="/static/favicon.ico"
          />
          <meta
            name="viewport"
            content="width=device-width, initial-scale=1, shrink-to-fit=no"
          />
        </Head>
        <Map
          viewport={viewport}
          onViewportChanged={this._onMapViewportChanged}
          minZoom={minZoom}
          maxZoom={maxZoom}
        >
          <LayersFab
            layers={layers}
            activeLayers={activeLayers}
            layersOpacity={layersOpacity}
            onToggle={this.onToggle}
            onOpacityChange={this.onOpacityChange}
          />

          {activeLayers.includes("annotations") && (
            <LotsLayer
              style={{ fillOpacity: layersOpacity["annotations"] / 100 }}
            />
          )}
          {activeLayers.includes("tiles") && (
            <TileLayer
              opacity={layersOpacity["tiles"] / 100}
              key={key}
              {...selectedRasterLayer}
            />
          )}

          <LotsLegend />

        </Map>
      </div>
    );
  }
}

export default withNamespaces(["testdrive"])(MapTestDrive);
