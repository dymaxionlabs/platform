import React from "react";
import { withStyles } from "@material-ui/core/styles";
import { Link, withTranslation } from "../../i18n";
import { routerReplace, routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import FileGallery from "../FileGallery";
import CodeBlock from "../CodeBlock";

import { Button, Typography } from '@material-ui/core';

const styles = theme => ({
  header: {
    marginBottom: theme.spacing(3),
    textAlign: "center"
  },
  errorMsg: {
    color: "red"
  }
});

const useCaseFiles = {
  pools: [{ name: "pools.tif", src: "/static/testdrive/pools/train1.png" }],
  cattle: [{ name: "cattle.tif", src: "/static/testdrive/cattle/train1.png" }]
};

let APIContent = ({ classes, t }) => (
  <div>
    <Typography>
      To upload multiple files, using the Python package, execute:
    </Typography>
    <CodeBlock language="python">
      {`from dymaxionlabs.files import File

for path in files:
    File.upload(path)`}
    </CodeBlock>
    <Link href="/testdrive/annotate">
      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        className={classes.submit}
      >
        {t("next_btn")}
      </Button>
    </Link>
  </div>
);

APIContent = withStyles(styles)(APIContent);
APIContent = withTranslation("testdrive")(APIContent);

class UploadStep extends React.Component {
  state = {
    currentModel: null,
    files: [],
    filesLoaded: false,
    fileSelected: false
  };

  _trackEvent = (action, value) => {
    if (this.props.analytics) {
      this.props.analytics.event("testdrive", action, value);
    }
  };

  componentDidMount() {
    this._loadCurrentModel();
  }

  handleFileClick = file => {
    const { files } = this.state;

    files.map(item => {
      if (item["name"] == file) {
        item["selected"] = !item["selected"];
      }
    });

    this.setState({ ...this.state, fileSelected: false });
    files.forEach(file => {
      if (file["selected"]) {
        this.setState({ ...this.state, fileSelected: true });
      }
    });
  };

  handleSelect = () => {
    this._saveSelectedFiles();
    this._trackEvent("UploadStep", "buttonClick");

    routerPush("/testdrive/annotate");
  };

  _loadCurrentModel() {
    const current = window.localStorage.getItem("current");
    if (!current) {
      routerReplace.replace("/testdrive");
      return;
    }
    const currentModel = JSON.parse(current);
    console.debug(currentModel);

    this.setState({ currentModel }, () => this._loadFiles());
  }

  _loadFiles() {
    console.log("Loading files...");
    const { currentModel } = this.state;
    if (!currentModel || !currentModel["useCase"]) {
      // TODO Throw error and redirect...
      console.error("currentModel is null or invalid");
      return;
    }

    const files = useCaseFiles[currentModel.useCase];
    this.setState({ files, filesLoaded: true });
  }

  _saveSelectedFiles() {
    const { currentModel, files } = this.state;
    const selectedFiles = files.filter(file => file.selected);
    const newModel = { trainingFiles: selectedFiles, ...currentModel };
    window.localStorage.setItem("current", JSON.stringify(newModel));
  }

  render() {
    const { classes, t, apiMode } = this.props;
    const { fileSelected, files, filesLoaded } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("upload_step.title")}
        </Typography>
        {apiMode ? (
          <APIContent />
        ) : (
          <React.Fragment>
            <Typography variant="body2">{t("upload_step.text")}</Typography>
            <FileGallery
              loaded={filesLoaded}
              onFileClick={this.handleFileClick}
              files={files}
            />
            <Button
              color="primary"
              variant="contained"
              onClick={this.handleSelect}
              disabled={!fileSelected}
            >
              {t("upload_step.select_btn")}
            </Button>
          </React.Fragment>
        )}
      </StepContentContainer>
    );
  }
}

UploadStep = withStyles(styles)(UploadStep);
UploadStep = withTranslation("testdrive")(UploadStep);

export default UploadStep;
