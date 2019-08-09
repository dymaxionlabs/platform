import Button from "@material-ui/core/Button";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import cookie from "js-cookie";
import React from "react";
import FileGallery from "../../../FileGallery.js";
import { i18n, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import { routerPush } from "../../../../utils/router";
import DropzoneArea from "../../../upload/DropzoneArea";
import StepContentContainer from "../StepContentContainer";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3,
    textAlign: "center"
  },
  classesLabel: {
    paddingBottom: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  },
  errorMsg: {
    color: "red"
  },
});

class SelectStep extends React.Component {
  state = {
    files: [],
    previousFiles: [],
    filesLoaded: false,
    predicting: false,
    currentProgress: 0,
    totalProgress: 0
  };

  selectedOrUploadFiles(){
    if(files.length != 0) return true;
    else{
      this.state.previousFiles.map((item, key) =>{
        if(item['selected']){
          return true
        }
      });
      return false;
    }
  }

  handleSubmit = () => {
  };

  handleDropzoneChange = files => {
    this.setState({ files: files });
  };

  handleFileClick = file => {
    this.state.previousFiles.map((item, key) =>{
        if(item['name'] == file){
          item['selected'] = !item['selected'];
        }
    });
    this.setState(
      this.state
    );
  };

  async componentDidMount(){
    const project = cookie.get("project");
    const { token, estimatorId } = this.props;

    const response = await axios.get(
        buildApiUrl(`/files/?project_uuid=${project}`),
        {
            headers: {
            Authorization: token,
            "Accept-Language": i18n.language
            }
        });
    let files = response.data.results;
    for(let i=0; i<files.length; i++){
      this.state.previousFiles.push({
          src: files[i]['file'],
          width: 2,
          height: 2,
          name: files[i]['name'],
          selected: false,
      });
      this.setState(
        this.state
      );
    }
    this.setState({filesLoaded:true});
  }

  render() {
    const { classes, t } = this.props;
    const { previousFiles, filesLoaded, predicting } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("select_step.title")}
        </Typography>
        <Typography variant="body2">
          {t("select_step.explanation")}
        </Typography>
        <DropzoneArea
          dropzoneText={t("select_step.dropzone")}
          filesLimit={10}
          showPreviews={false}
          maxFileSize={2000000000} /* 2gb */
          onChange={this.handleDropzoneChange}
          showFileNamesInPreview={true}
        /> 
        <FileGallery 
          loaded={filesLoaded}
          onFileClick={this.handleFileClick}
          files={previousFiles}
        />
        <Button
          color="primary"
          variant="contained"
          onClick={this.handleSubmit}
        >
          {t("select_step.submit_btn")}
        </Button>
        {predicting && (
          <div>
            <LinearProgress variant="determinate" value={currentProgress} />
            <LinearProgress variant="determinate" value={totalProgress} />
          </div>
        )}
      </StepContentContainer>
    );
  }
}

SelectStep = withStyles(styles)(SelectStep);
SelectStep = withNamespaces("models")(SelectStep);

export default SelectStep;
