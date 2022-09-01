import {
  Chip, Paper
} from "@material-ui/core";
import Tag from "@material-ui/icons/Label";
import LoopIcon from "@material-ui/icons/Loop";
import React from "react";
import { isoStringToDay } from "../utils/utils";

const modelStyle = {
  padding: "1rem"
}
const h1Style = {
  margin: 0,
  marginBottom: "0.4rem"
}
const linkStyle = {
  all: "inherit",
  margin: 0,
  padding: 0,
  cursor: "pointer",
}

export const ModelsGalleryItem = ({ model }) => {
  return (
    <Paper>
      <div style={modelStyle}>
        <a style={linkStyle} href={`/home/models/${model.owner}/${model.name}`}><h1 style={h1Style}>{model.owner}/{model.name}</h1></a>
        <div style={{ margin: 0, marginBottom: "1rem" }}>
          <span style={{ paddingRight: "0.5rem" }}>Tags:</span>
          {model.tags.map(tag => <Chip key={tag} color="secondary" size="small" label={tag} />)}
        </div>
        <span style={{ marginRight: "1rem" }}><Chip size="small" icon={<Tag />} label={`Latest version: ${model.latest_version}`} style={{ paddingLeft: "0.2rem" }} /></span>
        <span style={{ marginRight: "1rem" }}><Chip icon={<LoopIcon />} label={`Last updated: ${isoStringToDay(model.updated_at)}`} size="small" variant="outlined" /></span>
      </div>
    </Paper>
  )
}

export default ModelsGalleryItem;