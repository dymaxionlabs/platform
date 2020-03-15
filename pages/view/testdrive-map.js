import React from "react";
import { withNamespaces } from "../../i18n";
import Head from "next/head";
import dynamic from "next/dynamic";
import LoadingProgress from "../../components/LoadingProgress";
import ResultsButton from "../../components/testdrive/ResultsButton";
import LayersFab from "../../components/LayersFab";
import { Segment, Header, List } from "semantic-ui-react";

var lotsData = {};

const TileLayer = dynamic(() => import("../../components/TileLayer"), {
  ssr: true
});

const map_data = {
  pool: {
    vector_data: require("../../static/testdrive/pools/results.json"),
    center: [-34.43283793934236, -58.87167763852244],
    zoom: 16,
    zoom_min: 15,
    zoom_max: 18
  },
  cattle: {
    vector_data: require("../../static/testdrive/cattle/results.json"),
    center: [-37.79857199410538, -57.49418322639319],
    zoom: 17,
    zoom_min: 16,
    zoom_max: 20
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

var SelectedRasterLayer = {};
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

const LotsLegend = withNamespaces("case_study__agri")(({ t }) => (
  <div>
    <Segment
      style={{
        position: "fixed",
        left: 20,
        top: 20,
        zIndex: 1000,
        width: 190,
        cursor: "default"
      }}
    >
      <Header style={{ marginBottom: "0.2em" }}>
        {"Resultados"}
      </Header>
      <Header as="h5" style={{ margin: 0 }}>
        {"Objetos Detectados: " + metricsData["objectCount"]}
      </Header>
      <Header as="h5" style={{ margin: 0 }}>
        {"Área: " + metricsData["area"] + " m^2"}
      </Header>
      <Header as="h5" style={{ margin: 0 }}>
        {"Clases detectadas:"}
      </Header>
      {metricsData["classes"].map(item => (
        <List.Item style={{ marginBottom: "3px" }}>
          <List.Content>
            <List.Header>
              <Color value={item[2]} />
              {item[0] + ": " + item[1]}
            </List.Header>
          </List.Content>
        </List.Item>
      ))}
      <ResultsButton />
    </Segment>
  </div>
));

LotsLayer = withNamespaces("testdrive")(LotsLayer);

class MapTestDrive extends React.Component {
  state = {
    viewport: initialViewport,
    min_zoom: 1,
    max_zoom: 20,
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
      initialViewport.center = map_data.cattle.center;
      initialViewport.zoom = map_data.cattle.zoom;
      this.setState({ min_zoom: map_data.cattle.zoom_min });
      this.setState({ max_zoom: map_data.cattle.zoom_max });
      lotsData = map_data.cattle.vector_data;
      SelectedRasterLayer = rasterLayers[0];
    } else if (useCase == "pools") {
      console.log("loading pools");
      metricsData = require("../../static/testdrive/pools/metrics_pool.json");
      initialViewport.center = map_data.pool.center;
      initialViewport.zoom = map_data.pool.zoom;
      this.setState({ min_zoom: map_data.pool.zoom_min });
      this.setState({ max_zoom: map_data.pool.zoom_max });
      lotsData = map_data.pool.vector_data;
      SelectedRasterLayer = rasterLayers[1];  
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
      max_zoom,
      min_zoom,
      layersOpacity,
      layers,
      activeLayers
    } = this.state;
    const { token, t } = this.props;

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
          minZoom={min_zoom}
          maxZoom={max_zoom}
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
              {...SelectedRasterLayer}
            />
          )}

          <LotsLegend />

        </Map>
      </div>
    );
  }
}

export default withNamespaces(["testdrive"])(MapTestDrive);
