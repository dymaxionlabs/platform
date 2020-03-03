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


const lotsData = require( "../../static/testdrive/pools/results.json");
const roiData = require("../../static/agri/roi.json");

const data = {
  "pool": {
    "raster_url": "https://…",
    "vector_url": "https://…",
    "center": [12312,123123],
    "zoom": 17
  },
  "cattle": {
    "raster_url": "https://…",
    "vector_url": "https://…",
    "center": [12312,123123],
    "zoom": 17
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

const initialViewport = {
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


class MapPool extends React.Component {
  state = {
    viewport: initialViewport,
    selectedLayers: ["true_color"]
  };

  static async getInitialProps() {
    return {
      namespacesRequired: ["testdrive"]
    };
  }

  _trackEvent(action, value) {
    this.props.analytics.event("View-MapPool", action, value);
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
    const { viewport, selectedLayers } = this.state;

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
          minZoom={1}
          maxZoom={20}
        >
          <LotsLayer />
          
          
        </Map>
      </div>
    );
  }
}

export default withNamespaces(["testdrive"])(MapPool);
