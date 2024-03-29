import axios from "axios";
import dynamic from "next/dynamic";
import Head from "next/head";
import PropTypes from "prop-types";
import React from "react";
import LayersFab from "../components/LayersFab";
import LayersLegendExpansionPanel from "../components/LayersLegendExpansionPanel";
import LoadingProgress from "../components/LoadingProgress";
import { withTranslation } from "../i18n";
import { buildApiUrl } from "../utils/api";
import { withAuthSync } from "../utils/auth";

const TILER_URL = process.env.NEXT_PUBLIC_TILER_URL;

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

class Maps extends React.Component {
  state = {
    map: null,
    bounds: null,
    activeLayers: [],
    viewport: {
      center: [-36.179114636463652, -62.846142338298094],
      zoom: 12
    },
    layersOpacity: {},
    basemap: {
      "name": "Satélite (Mapbox)",
      "type": "mapbox",
      "style": "mapbox/satellite-v9"
    }
  };

  static async getInitialProps({ query }) {
    return {
      query,
      namespacesRequired: ["common"]
    };
  }

  componentDidMount() {
    const { token } = this.props;
    const { uuid } = this.props.query;

    const headers = token ? { Authorization: token } : {};

    axios
      .get(buildApiUrl(`/maps/${uuid}/`), { headers: headers }, { params: { limit: 500 }})
      .then(response => {
        const map = response.data;

        const center = map && map.extra_fields && map.extra_fields.center;
        const zoom = map && map.extra_fields && map.extra_fields.zoom;

        const basemaps = map && map.extra_fields && map.extra_fields.basemaps;
        const basemap = basemaps && basemaps[0];

        if (center && zoom) {
          console.log("Custom center and zoom:", center, zoom);
          this.setState({ map, viewport: { center, zoom }, basemap });
        } else {
          const minBounds = [map.extent[1], map.extent[0]];
          const maxBounds = [map.extent[3], map.extent[2]];
          const bounds = [minBounds, maxBounds];

          this.setState({ map, bounds, basemap });
        }

        this._toggleActiveLayers(map.layers);
      })
      .catch(err => {
        const response = err.response;
        if (response) {
          if (response.status === 404) {
            alert("Map was not found.");
          } else {
            alert(
              "An error ocurred when trying to load map. Please try accessing again later."
            );
          }
          window.location.href = "/";
        } else {
          console.error(err);
        }
      });
  }

  _toggleActiveLayers(layers) {
    const activeLayers = layers
      .filter(mapLayer => mapLayer.is_active)
      .map(mapLayer => mapLayer.layer.uuid);
    this.setState({ activeLayers });
  }

  _trackEvent(action, value) {
    this.props.analytics.event("Layers", action, value);
  }

  handleMapViewportChanged = viewport => {
    this.setState({ viewport });
  };

  handleToggleLayer = layer => {
    if (!layer) return; // just in case

    const uuid = layer.uuid;
    const activeLayers = this._addOrRemove(this.state.activeLayers, uuid);

    if (activeLayers.includes(uuid)) {
      this._trackEvent("enable-layer", uuid);
    } else {
      this._trackEvent("disable-layer", uuid);
    }

    this.setState({ activeLayers: activeLayers });
  };

  _addOrRemove(array, item) {
    const include = array.includes(item);
    return include
      ? array.filter(arrayItem => arrayItem !== item)
      : [...array, item];
  }

  handleOpacityChange = (uuid, value) => {
    this.setState({
      layersOpacity: {
        ...this.state.layersOpacity,
        [uuid]: value
      }
    });
  };

  handleBasemapChange = (basemap) => {
    this.setState({ basemap: basemap })
  }

  render() {
    const { token } = this.props;
    const { viewport, bounds, map, activeLayers, layersOpacity, basemap } = this.state;

    const layers = map
      ? map.layers
        .sort((a, b) => a.order - b.order)
        .map(mapLayer => mapLayer.layer)
      : [];

    // Sorted active layers
    const sortedActiveLayers = layers.filter(layer =>
      activeLayers.includes(layer.uuid)
    );

    // Build tile layers from active layers: use TileLayer or VectorTileLayer based on layer type
    let tileLayers = [];
    if (map) {
      for (let i = 0; i < sortedActiveLayers.length; i++) {
        const layer = sortedActiveLayers[i];

        const zIndex = sortedActiveLayers.length - i;
        const opacity = (layersOpacity[layer.uuid] || 100) / 100;
        const maxZoom =
          (layer.extra_fields && layer.extra_fields.maxZoom) || 18;
        const url = layer.use_cog_tiles ? `${TILER_URL}/layer/${layer.uuid}/{z}/{x}/{y}.png` : layer.tiles_url;

        if (layer.layer_type === "R") {
          tileLayers.push(
            <TileLayer
              key={layer.uuid}
              type="raster"
              url={url}
              maxNativeZoom={maxZoom}
              opacity={opacity}
              zIndex={zIndex}
            />
          );
        } else {
          const styles = layer.extra_fields && layer.extra_fields["styles"];

          tileLayers.push(
            <VectorTileLayer
              key={layer.uuid}
              type="protobuf"
              url={url}
              subdomains=""
              maxNativeZoom={maxZoom}
              opacity={opacity}
              vectorTileLayerStyles={styles}
              zIndex={zIndex}
            />
          );
        }
      }
    }

    const layersWithLegend = layers.filter(
      layer =>
        activeLayers.includes(layer.uuid) &&
        layer.extra_fields &&
        layer.extra_fields.legend
    );

    const basemaps = map && map.extra_fields && map.extra_fields.basemaps;

    let areaData;
    if (
      map &&
      map.extra_fields &&
      map.extra_fields["showAreaExtent"] &&
      layers.length > 0
    ) {
      const layer = layers[0];
      areaData = layer.area_geom;
    }

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
          onViewportChanged={this.handleMapViewportChanged}
          basemap={basemap}
          roiData={areaData}
        >
          <LayersFab
            layers={layers}
            activeLayers={activeLayers}
            layersOpacity={layersOpacity}
            onToggle={this.handleToggleLayer}
            onOpacityChange={this.handleOpacityChange}
            basemaps={basemaps}
            onBasemapChange={this.handleBasemapChange}
            currentBasemap={basemap}
          />
          <LayersLegendExpansionPanel layers={layersWithLegend} />
          {tileLayers}
        </Map>
      </div>
    );
  }
}

Maps.propTypes = {
  t: PropTypes.func.isRequired
};

Maps = withTranslation()(Maps);
Maps = withAuthSync(Maps, { redirect: false });

export default Maps;
