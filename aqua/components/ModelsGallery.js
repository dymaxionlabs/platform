import axios from "axios";
import React, { useState, useEffect } from "react";
import { buildApiUrl } from "../utils/api";
import {
  Paper,
} from "@material-ui/core";
import ModelsGalleryItem from "./ModelsGalleryItem";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridAutoRows: "8.5rem",
  gridTemplateColumns: "repeat(auto-fill, minmax(35rem, 1fr))"
};
export const ModelsGallery = () => {
  // const [models, setModels] = useState([]);

  const models = {
    "count": 1,
    "next": null,
    "previous": null,
    "results": [
      {
        "owner": "lucas",
        "latest_version": "test_version",
        "created_at": "2022-07-11T20:51:48.554132Z",
        "updated_at": "2022-07-11T20:51:48.554153Z",
        "name": "test_model",
        "description": "",
        "tags": [
          "tag1"
        ],
        "repo_url": null,
        "is_public": false
      },
      {
        "owner": "damián",
        "latest_version": "test_version",
        "created_at": "2022-07-11T20:51:48.554132Z",
        "updated_at": "2022-07-11T20:51:48.554153Z",
        "name": "test_model_2",
        "description": "",
        "tags": [
          "tag2"
        ],
        "repo_url": null,
        "is_public": false
      }
    ]
  }

  useEffect(async () => {
    const url = buildApiUrl("/models/")
    await axios.get(url).then((response) => console.log(response)).catch((err) => {
      console.log(err)
    });
  }, []);

  return (
    <section id="models-section" style={modelsSectionStyle}>
      {models.results.map(model =>
        <ModelsGalleryItem model={model} />
      )}
    </section>
  )
}


export default ModelsGallery;