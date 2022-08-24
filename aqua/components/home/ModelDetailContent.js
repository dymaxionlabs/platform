import axios from "axios";
import React, { useState, useEffect } from "react";
import {
  Chip,
  Paper,
  Container
} from "@material-ui/core";
import { isoStringToDay, generateSnippet } from "../../utils/utils";
import { buildApiUrl } from "../../utils/api";
import LoopIcon from "@material-ui/icons/Loop";
import Tag from "@material-ui/icons/Label";
import { CopyBlock, atomOneDark } from "react-code-blocks";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridTemplateRows: "8.5rem 9rem",
  gridTemplateColumns: "18rem 1fr"
};
const snippetStyle = {
  margin: "1rem",
  borderRadius: "9px",
  backgroundColor: "#252729",
  color: "white"
};
const mainStyle = {
  marginTop: "3rem"
}
export const ModelDetailContent = () => {
  // const [models, setModels] = useState([]);

  const model = {
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
  }

  useEffect(async () => {
    const url = buildApiUrl("/models/")
    await axios.get(url).then((response) => console.log(response)).catch((err) => {
      console.log(err)
    });
  }, []);

  const modelName = `${model.owner}/${model.name}`;

  return (
    <Container>
      <section id="models-section" style={modelsSectionStyle}>
        <aside>
          <h1>{modelName}</h1>
          <p style={{ marginRight: "1rem" }}><Chip size="small" icon={<Tag />} label={`Latest version: ${model.latest_version}`} style={{ paddingLeft: "0.2rem" }} /></p>
          <p style={{ marginRight: "1rem" }}><Chip icon={<LoopIcon />} label={`Last updated: ${isoStringToDay(model.updated_at)}`} size="small" /></p>
        </aside>
        <main>
          <div class="snippet" style={mainStyle}>
            <CopyBlock
              text={generateSnippet(modelName, model.latest_version)}
              language={"python"}
              theme={atomOneDark}
            />
          </div>
        </main>
      </section>
    </Container>
  )
}


export default ModelDetailContent;