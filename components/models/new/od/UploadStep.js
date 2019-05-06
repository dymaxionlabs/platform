import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import cookie from "js-cookie";
import React from "react";
import { i18n, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import { routerPush, routerReplace } from "../../../../utils/router";
import DropzoneArea from "../../../upload/DropzoneArea";
import StepContentContainer from "../StepContentContainer";

const styles = theme => ({
  header: {
    marginBottom: theme.spacing.unit * 3
  },
  classesLabel: {
    paddingBottom: theme.spacing.unit
  },
  submit: {
    marginTop: theme.spacing.unit * 3
  },
  errorMsg: {
    color: "red"
  }
});

class UploadStep extends React.Component {
  state = {
    files: [],
    uploading: false,
    uploadProgress: 0
  };

  componentDidMount() {
    const { estimatorId } = this.props;
    if (!estimatorId) {
      console.log("no estimator id");
      routerReplace(`/models/new/od`);
    }
  }

  handleSubmit = async () => {
    const project = cookie.get("project");
    const { estimatorId } = this.props;
    const { files } = this.state;

    if (files.length == 0) return;

    this.setState({ uploading: true, uploadProgress: 0 });

    let count = 0;
    for (const file of files) {
      try {
        await axios.post(
          buildApiUrl(`/files/upload/${file.name}?project_uuid=${project}`),
          file,
          {
            headers: {
              Authorization: this.props.token,
              "Accept-Language": i18n.language
            }
          }
        );
      } catch (err) {
        console.error(err);
      }

      count += 1;
      this.setState({ uploadProgress: (count / files.length) * 100 });
      if (count === files.length) {
        this._setFilesOnEstimator(files, estimatorId);
      }
      if (!this.state.uploading) return;
    }
  };

  _setFilesOnEstimator = (files, estimatorId) => {
    console.log(`Associate ${files} to estimator ${estimatorId}`);

    axios
      .get(buildApiUrl(`/estimators/${estimatorId}/`), {
        headers: {
          Authorization: this.props.token,
          "Accept-Language": i18n.language
        }
      })
      .then(res => {
        const { project, name, image_files } = res.data;
        const newFiles = files.map(file => file.name);
        const uniqueImageFiles = [...new Set(image_files.concat(newFiles))];

        const dataSend = {
          project: project,
          name: name,
          image_files: uniqueImageFiles
        };

        axios
          .put(buildApiUrl(`/estimators/${estimatorId}/`), dataSend, {
            headers: {
              Authorization: this.props.token,
              "Accept-Language": i18n.language
            }
          })
          .then(() => {
            this.setState({ uploading: false });
            routerPush(`/models/new/od/annotate?id=${estimatorId}`);
          })
          .catch(error => {
            console.error(error);
            this.setState({
              //errorMsg: t("upload_step.error_msg", { message: error }),
              errorMsg: JSON.stringify(
                error.response && error.response.data.detail
              ),
              uploading: false
            });
          });
      });
  };

  handleDropzoneChange = files => {
    this.setState({ files: files });
  };

  render() {
    const { classes, t } = this.props;
    const { isUploading } = this.state;

    return (
      <StepContentContainer>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("upload_step.title")}
        </Typography>
        <DropzoneArea
          dropzoneText={t("upload_step.dropzone")}
          filesLimit={10}
          showPreviews={false}
          maxFileSize={2000000000} /* 2gb */
          onChange={this.handleDropzoneChange}
          showFileNamesInPreview={true}
        />
        <Button color="primary" onClick={this.handleSubmit}>
          {t("upload_step.submit_btn")}
        </Button>
        {isUploading && (
          <LinearProgress variant="determinate" value={progress} />
        )}
      </StepContentContainer>
    );
  }
}

UploadStep = withStyles(styles)(UploadStep);
UploadStep = withNamespaces("models")(UploadStep);

export default UploadStep;
