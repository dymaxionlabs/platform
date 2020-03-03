import "../../static/index.css"; // FIXME Convert to JSX styles
import "../../static/App.css"; // FIXME Convert to JSX styles
import "semantic-ui-css/semantic.css"; // FIXME Move this Layout

import React from "react";
import { withNamespaces, Link } from "../../i18n";
import Head from "next/head";
import dynamic from "next/dynamic";
import {
  Dimmer,
  Loader,
  Button
} from "semantic-ui-react";


var lotsData = {};
const roiData = require("../../static/agri/roi.json");

const TileLayer = dynamic(() => import("../../components/TileLayer"), {
  ssr: true
});

const map_data = {
  pool: {
    vector_data: require("../../static/testdrive/pools/results.json"),
    center: [-34.43283793934236 ,-58.87167763852244],
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
  },
};


// FIXME colors should be in geojson
const lotColors = {
  S: "#67d1ca",
  ST: "#677dca",
  S2: "#cada50",
  M: "#fdae61",
  MT: "#e77148",
  G1: "#b95af0"
};

var initialViewport = {
  center : [-34.43283793934236 ,-58.87167763852244],
  zoom: 16
};

const dymaxionAttribution = "&copy; Dymaxion Labs 2020";

const Map = dynamic(() => import("../../components/Map"), {
  ssr: false,
  loading: withNamespaces()(({ t }) => (
    <Dimmer active>
      <Loader size="big">{t("loading")}</Loader>
    </Dimmer>
  ))
});

const GeoJSON = dynamic(() => import("../../components/GeoJSON"), {
  ssr: false
});

const sentinelModifiedAttribution =
  'Contains modified <a href="http://www.esa.int/Our_Activities/Observing_the_Earth/Copernicus">Copernicus</a> Sentinel data 2019, processed by ESA.';

const rasterLayers = [
  {
    id: "cattle",
    type: "raster",
    url: "https://storage.googleapis.com/dym-tiles/testdrive/cattle/{z}/{x}/{y}.png",
    attribution: sentinelModifiedAttribution
  },
  {
    id: "pools",
    type: "raster",
    url: "https://storage.googleapis.com/dym-tiles/testdrive/pools/{z}/{x}/{y}.png",
    attribution: sentinelModifiedAttribution
  }
];

var SelectedRasterLayer = {};
var key = '';

class LotsLayer extends React.Component {
  _style = feature => {
    const color = lotColors[feature.properties["SIGLA"]] || "#ff0000";

    return {
      color: color,
      fillColor: color,
      opacity: 1,
      fillOpacity: 0.5,
      weight: 2
    };
  };

  _onEachFeature = (feature, layer) => {
    const { t } = this.props;
    const id = feature.properties["SIGLA"];
    const popupContent = `<b>${t(`crop_lots_type_${id}`)}</b>`;
    layer.bindPopup(popupContent, {
      closeButton: false,
      offset: L.point(0, -20)
    });
  };

  render() {
    const { t } = this.props;

    return (
      <div>
        <GeoJSON
          data={lotsData}
          style={this._style}
          attribution={dymaxionAttribution}
          onmouseover={this._onMouseOver}
          onmouseout={this._onMouseOut}
          onEachFeature={this._onEachFeature}
        />
        
      </div>
    );
  }
}

LotsLayer = withNamespaces("testdrive")(LotsLayer);


class MapTestDrive extends React.Component {
  state = {
    viewport: initialViewport,
    selectedLayers: ["true_color"],
    min_zoom: 1,
    max_zoom: 20
  };

  async componentDidMount() {
    var current = JSON.parse(window.localStorage.getItem("current"));
    var useCase = current["useCase"];
    key = useCase;
    if (useCase == "cattle") {
      console.log("loading cattle");
      initialViewport.center = map_data.cattle.center;
      initialViewport.zoom = map_data.cattle.zoom;
      this.setState({min_zoom: map_data.cattle.zoom_min});
      this.setState({max_zoom: map_data.cattle.zoom_max});
      lotsData = map_data.cattle.vector_data;
      SelectedRasterLayer = rasterLayers[0];

    } else if (useCase == "pools") {
      console.log("loading pools");
      initialViewport.center = map_data.pool.center;
      initialViewport.zoom = map_data.pool.zoom;
      this.setState({min_zoom: map_data.pool.zoom_min});
      this.setState({max_zoom: map_data.pool.zoom_max});
      lotsData = map_data.pool.vector_data;
      SelectedRasterLayer = rasterLayers[1];

    } else {
      alert("Use case not found.")
    }

    this.setState({viewport: initialViewport})
  }

  static async getInitialProps() {
    return {
      namespacesRequired: ["testdrive"]
    };
  }

  _trackEvent(action, value) {
    this.props.analytics.event("View-MapTestDrive", action, value);
  }

  _onMapViewportChanged = viewport => {
    this.setState({ viewport });
  };

  _onToggleLayer = layer => {
    const selectedLayers = this._addOrRemove(this.state.selectedLayers, layer);

    if (selectedLayers.includes(layer)) {
      this._trackEvent("enable-layer", layer);
    } else {
      this._trackEvent("disable-layer", layer);
    }

    this.setState({ selectedLayers });
  };

  _addOrRemove(array, item) {
    const include = array.includes(item);
    return include
      ? array.filter(arrayItem => arrayItem !== item)
      : [...array, item];
  }

  render() {
    const { viewport, max_zoom, min_zoom } = this.state;

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
          roiData={roiData}
          minZoom={min_zoom}
          maxZoom={max_zoom}
        >
          <LotsLayer />
          
          <TileLayer key={key} {...SelectedRasterLayer} />

        </Map>
      </div>
    );
  }
}

export default withNamespaces(["testdrive"])(MapTestDrive);
