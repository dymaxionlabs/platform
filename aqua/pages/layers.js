import axios from "axios";
import dynamic from "next/dynamic";
import Head from "next/head";
import React from "react";
import LoadingProgress from "../components/LoadingProgress";
import LayersLegendExpansionPanel from "../components/LayersLegendExpansionPanel";
import { withTranslation } from "../i18n";
import { buildApiUrl } from "../utils/api";
import { logout, withAuthSync } from "../utils/auth";

const TILER_URL = process.env.NEXT_PUBLIC_TILER_URL;

const initialViewport = {
  center: [-36.179114636463652, -62.846142338298094],
  zoom: 12
};

// const sentinelModifiedAttribution =
//   'Contains modified <a href="http://www.esa.int/Our_Activities/Observing_the_Earth/Copernicus">Copernicus</a> Sentinel data 2019, processed by ESA.';
// const dymaxionAttribution = "&copy; Dymaxion Labs 2019";

// Dynamically load TrialMap component as it only works on browser
const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: LoadingProgress
});

const TileLayer = dynamic(() => import("../components/TileLayer"), {
  ssr: false
});

const VectorTileLayer = dynamic(() => import("../components/VectorTileLayer"), {
  ssr: false
});

class Layers extends React.Component {
  state = {
    layer: null,
    bounds: null,
    viewport: initialViewport
  };

  static async getInitialProps({ query }) {
    return {
      query,
      namespacesRequired: ["common"]
    };
  }

  componentDidMount() {
    const { uuid } = this.props.query;

    axios
      .get(buildApiUrl(`/layers/${uuid}/`), {
        headers: { Authorization: this.props.token }
      })
      .then(response => {
        const layer = response.data;
        const minBounds = [layer.extent[1], layer.extent[0]];
        const maxBounds = [layer.extent[3], layer.extent[2]];
        const bounds = [minBounds, maxBounds];
        this.setState({ layer: layer, bounds: bounds });
      })
      .catch(err => {
        const response = err.response;
        if (!response || response.status >= 400) {
          logout();
        }
      });
  }

  _trackEvent(action, value) {
    this.props.analytics.event("Layers", action, value);
  }

  _onMapViewportChanged = viewport => {
    this.setState({ viewport });
  };

  render() {
    const { viewport, bounds, layer } = this.state;

    // Build tile layer: use TileLayer or VectorTileLayer based on layer type
    let tileLayer;
    if (layer) {
      const url = layer.use_cog_tiles ? `${TILER_URL}/layer/${layer.uuid}/{z}/{x}/{y}.png` : layer.tiles_url;
      const maxZoom = (layer.extra_fields && layer.extra_fields.maxZoom) || 18;

      if (layer.layer_type === "R") {
        tileLayer = (
          <TileLayer type="raster" url={url} maxZoom={maxZoom} />
        );
      } else {
        const styles = layer.extra_fields && layer.extra_fields["styles"];

        tileLayer = (
          <VectorTileLayer
            id="layer"
            type="protobuf"
            url={url}
            subdomains=""
            maxNativeZoom={maxZoom}
            vectorTileLayerStyles={styles}
          />
        );
      }
    }

    // Get area polygon
    const areaData = layer && layer.area_geom;

    const layersWithLegend = layers.filter(
      layer =>
        activeLayers.includes(layer.uuid) &&
        layer.extra_fields &&
        layer.extra_fields.legend
    );

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
          bounds={bounds}
          viewport={viewport}
          onViewportChanged={this._onMapViewportChanged}
          roiData={areaData}
        >
          {tileLayer}
          {legend}
          <LayersLegendExpansionPanel layers={layersWithLegend} />
        </Map>
      </div>
    );
  }
}

Layers = withTranslation()(Layers);
Layers = withAuthSync(Layers);

export default Layers;
