import axios from "axios";
import React, { useState, useEffect, useMemo } from "react";
import {
  Chip,
  Paper,
  Grid,
  Button,
  Container
} from "@material-ui/core";
import { isoStringToDay, generateSnippet } from "../../utils/utils";
import { buildApiUrl } from "../../utils/api";
import LoopIcon from "@material-ui/icons/Loop";
import Tag from "@material-ui/icons/Label";
import { CopyBlock, atomOneDark } from "react-code-blocks";
import MarkdownToHtml from "./MarkdownToHtml";
import { Link } from '../../i18n'

const modelsSectionStyle = {
  padding: "1em"
};

export const ModelDetailContent = ({ modelOwner, modelName, token }) => {
  const [model, setModel] = useState(null);
  const [latestModelVersion, setLatestModelVersion] = useState(null);
  const [modelTitle, setModelTitle] = useState("");

  const fetchModel = async () => {
    const url = buildApiUrl(`/users/${modelOwner}/models/${modelName}/`);
    try {
      const response = await axios.get(url, { headers: { Authorization: token } })
      setModel(response.data);
    } catch (err) {
      console.log(err)
    }
  }

  const fetchLatestModelVersion = async (version) => {
    const url = buildApiUrl(`/users/${modelOwner}/models/${modelName}/versions/${version}/`);
    try {
      const response = await axios.get(url, { headers: { Authorization: token } })
      setLatestModelVersion(response.data);
    } catch (err) {
      console.log(err)
    }
  }

  const hasPredictParameters = useMemo(() =>
    latestModelVersion && latestModelVersion.params['predict'], [latestModelVersion])

  useEffect(() => { fetchModel() }, []);
  useEffect(() => {
    if (model) {
      setModelTitle(`${model.owner}/${model.name}`)
      fetchLatestModelVersion(model.latest_version)
    }
  }, [model]);

  if (model && modelTitle) {
    return (
      <Container>
        <Paper elevation={1} id="models-section" style={modelsSectionStyle}>
          <h1>{modelTitle}</h1>
          <Grid container spacing={3}>
            <Grid item xs>
              <aside>
                <div style={{ marginRight: "1em", display: "inline-block" }}><Chip size="small" icon={<Tag />} label={`Latest version: ${model.latest_version}`} style={{ paddingLeft: "0.2rem" }} /></div>
                <div style={{ marginRight: "1em", display: "inline-block" }}><Chip icon={<LoopIcon />} label={`Last updated: ${isoStringToDay(model.updated_at)}`} size="small" /></div>
                {hasPredictParameters && (<div style={{ marginTop: "1em" }}>
                  <Link href={`/home/models/${model.owner}/${model.name}/${model.latest_version}/predict`}>
                    <Button variant="contained" color="primary">Predict</Button>
                  </Link>
                </div>)}
              </aside>
            </Grid>
            <Grid item xs={6}>
              <div className="snippet">
                <span>Copy the following Python code to load this model:</span>
                <CopyBlock
                  text={generateSnippet(modelName, model.latest_version)}
                  language={"python"}
                  theme={atomOneDark}
                />
              </div>
            </Grid>
          </Grid>
        </Paper>
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