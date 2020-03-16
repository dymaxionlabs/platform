import React from "react";
import { withNamespaces } from "../../i18n";
import Head from "next/head";
import dynamic from "next/dynamic";
import LoadingProgress from "../../components/LoadingProgress";
import ResultsButton from "../../components/testdrive/ResultsButton";
import LayersFab from "../../components/LayersFab";

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

class LotsLayer extends React.Component {
  render() {
    return <GeoJSON data={lotsData} attribution={dymaxionAttribution} />;
  }
}

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
      console.log("loading cattle");
      initialViewport.center = mapData.cattle.center;
      initialViewport.zoom = mapData.cattle.zoom;
      this.setState({ minZoom: mapData.cattle.minZoom });
      this.setState({ maxZoom: mapData.cattle.maxZoom });
      lotsData = mapData.cattle.vectorData;
      selectedRasterLayer = rasterLayers[0];
    } else if (useCase == "pools") {
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

          <ResultsButton />
        </Map>
      </div>
    );
  }
}

export default withNamespaces(["testdrive"])(MapTestDrive);
