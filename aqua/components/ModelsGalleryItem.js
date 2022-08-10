import axios from "axios";
import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";
import moment from 'moment';
import {
  Paper,
  Chip
} from "@material-ui/core";
import LoopIcon from "@material-ui/icons/Loop";
import FileUpload from "@material-ui/icons/CloudUpload"


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
function isoStringToDay (isoString) {
  return moment(isoString).fromNow();
};
export const ModelsGalleryItem = ({ model }) => {

  return (
    <Paper>
      <div style={modelStyle}>
        <a style={linkStyle} href={buildApiUrl(`/users/${model.owner}/models/${model.name}`)}><h1 style={h1Style}>{model.owner}/{model.name}</h1></a>
        <p style={{margin: 0, marginBottom: "1rem"}}><span style={{paddingRight: "0.5rem"}}>Tags:</span>{model.tags.map(tag => 
          <Chip color="secondary" size="small" label={tag}/>
        )}</p>
        <span style={{ marginRight: "1rem" }}><Chip size="small" icon={<FileUpload />} label={`Latest version: ${model.latest_version}`} style={{paddingLeft: "0.2rem"}}/></span>
        <span style={{ marginRight: "1rem" }}><Chip icon={<LoopIcon />} label={`Last updated: ${isoStringToDay(model.updated_at)}`} size="small" variant="outlined" /></span>
      </div>
    </Paper>
  )
}


export default ModelsGalleryItem;