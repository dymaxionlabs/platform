import React from "react";
import {
  RadioGroup,
  FormLabel,
  FormControlLabel,
  Radio
} from '@material-ui/core';

class MapSelector extends React.Component {
  render() {
    const { classes, value, onChange, basemaps, currentBasemap, onBasemapChange } = this.props;

    return (
      <div>
        <FormLabel component="legend">Seleccionar Mapa</FormLabel>
        <RadioGroup value={currentBasemap.id} aria-label="gender" name="customized-radios">
          {basemaps.map(basemap => (
            <FormControlLabel
              value={basemap.id}
              control={<Radio onClick={() => onBasemapChange(basemap)} />}
              label={basemap.name} />
          ))}
        </RadioGroup>
      </div>
    );
  }
}

export default MapSelector;
