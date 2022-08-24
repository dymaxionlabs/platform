import axios from "axios";
import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";
import {
  Paper,
} from "@material-ui/core";
import ModelsGalleryItem from "./ModelsGalleryItem";
// import ModelsGalleryItem from "/ModelsGalleryItem";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridAutoRows: "8.5rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(35rem, 1fr))"
};
export const ModelsGallery = ({token}) => {
  // const [models, setModels] = useState([]);
  const [models, setModels] = useState([]);

  useEffect(async () => {
    const url = buildApiUrl("/models/")
    await axios.get(url, {headers: {Authorization: token}}).then((response) => {
      setModels(response.data.results);
    }).catch((err) => {
      console.log(err)
    });
  }, []);

  return (
    <section id="models-section" style={modelsSectionStyle}>
      {models.map(model =>
        <ModelsGalleryItem model={model} />
      )}
    </section>
  )
}


export default ModelsGallery;