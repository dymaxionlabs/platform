import React from "react";
import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { withNamespaces } from "../../i18n";
import { routerReplace, routerPush } from "../../utils/router";
import StepContentContainer from "../StepContentContainer";
import FileGallery from "../FileGallery.js";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  errorMsg: {
    color: "red"
  }
});

const useCaseFiles = {
  pools: [{ name: "pools.tif", src: "/static/testdrive/pools/predict1.png" }],
  cattle: [{ name: "cattle.tif", src: "/static/testdrive/cattle/predict1.png" }]
};

class SelectStep extends React.Component {
  state = {
    currentModel: null,
    files: [],
    filesLoaded: false,
    fileSelected: false
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

  _trackEvent = (action, value) => {
    if (this.props.analytics) {
      this.props.analytics.event("testdrive", action, value);
    } 
  }
  
  handleSelect = () => {
    this._trackEvent("SelectStep","buttonClick")
    this._saveSelectedFiles();

    routerPush("/testdrive/predict");
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
    const newModel = { predictionFiles: selectedFiles, ...currentModel };
    window.localStorage.setItem("current", JSON.stringify(newModel));
  }

  render() {
    const { classes, t } = this.props;
    const { fileSelected, files, filesLoaded } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("upload_step.title")}
        </Typography>
        <Typography variant="body2">{t("select_step.text")}</Typography>
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
      </StepContentContainer>
    );
  }
}

SelectStep = withStyles(styles)(SelectStep);
SelectStep = withNamespaces("testdrive")(SelectStep);

export default SelectStep;
