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
import MarkdownToHtml from "./MarkdownToHtml";

const modelsSectionStyle = {
  all: "none",
  display: "grid",
  gap: "1rem",
  gridTemplateColumns: "auto 1fr"
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
const hrStyle = {
  marginTop: "1.5rem"
}

export const ModelDetailContent = ({ modelOwner, modelName, token }) => {

  const [model, setModel] = useState(undefined);
  const [modelTitle, setModelTitle] = useState("");


  useEffect(async () => {
    const url = buildApiUrl(`/users/${modelOwner}/models/${modelName}/`);
    await axios.get(url, { headers: { Authorization: token } }).then((response) => {
      setModel(response.data);
    }).catch((err) => {
      console.log(err)
    });
  }, []);

  useEffect(() => {
    if(model){
      setModelTitle(`${model.owner}/${model.name}`)
    }
  }, [model]);


  if (model && modelTitle) {
    return (
      <Container>
        <section id="models-section" style={modelsSectionStyle}>
          <aside>
            <h1>{modelTitle}</h1>
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
        <hr style={hrStyle} />
        <div className="description">
          <MarkdownToHtml markdown={model.description} />
        </div>
      </Container>
    )
  } else {
    return (
      <div>Loading model...</div>
    )
  }
};


export default ModelDetailContent;