import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import LinearProgress from "@material-ui/core/LinearProgress";
import { withStyles } from "@material-ui/core/styles";
import CloudUploadIcon from "@material-ui/icons/CloudUpload";
import axios from "axios";
import cookie from "js-cookie";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { withTranslation } from "../i18n";
import { buildApiUrl } from "../utils/api";
import DropzoneDialog from "./upload/DropzoneDialog";

const styles = theme => ({
  button: {
    margin: theme.spacing(1),
  },
  leftIcon: {
    marginRight: theme.spacing(1)
  },
  rightIcon: {
    marginLeft: theme.spacing(1)
  },
  iconSmall: {
    fontSize: 20
  }
});

class UploadProgressDialog extends Component {
  handleClose = event => {
    const { onClose } = this.props;
    if (onClose) onClose(event);
  };

  render() {
    const { t, open, progress } = this.props;

    return (
      <Dialog
        open={open}
        onClose={this.handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">
          {t("upload_progress.title")}
        </DialogTitle>
        <DialogContent>
          <LinearProgress variant="determinate" value={progress} />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose} color="primary">
            {t("cancel_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

UploadProgressDialog = withStyles(styles)(UploadProgressDialog);
UploadProgressDialog = withTranslation("image_upload_dialog")(
  UploadProgressDialog
);

class FileUploadDialog extends Component {
  state = {
    open: false,
    uploading: false,
    uploadProgress: 0
  };

  handleClose = () => {
    // FIXME if uploading, ask user if she wants to cancel...
    this.setState({ open: false, uploading: false });
  };

  handleSave = async (files, dirname) => {
    const project = cookie.get("project");

    if (files.length == 0) return;

    this.setState({ uploading: true, uploadProgress: 0 });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      const formData = new FormData();
      formData.append("file", file);
      formData.append("path", `${dirname}${file.name}`);
      formData.append("project", project)

      try {
        const response = await axios.post(
          buildApiUrl(`/storage/upload/?project=${project}`),
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: this.props.token,
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              this.setState({ uploadProgress: percentCompleted });
              console.log("File upload progress:", percentCompleted);
            },
          }
        )
        console.log("File", i, response.data)
      } catch (err) {
        console.error(err);
      }
    }

    this.setState({ open: false, uploading: false });
  };

  handleOpen = () => {
    this.setState({
      open: true
    });
  };

  handleUploadCancel = () => {
    this.setState({ uploading: false });
  };

  render() {
    const { t, className, classes } = this.props;
    const { open, uploading, uploadProgress } = this.state;

    return (
      <div className={className}>
        <Button onClick={this.handleOpen} variant="contained">
          <CloudUploadIcon className={classes.leftIcon} />
          Upload
        </Button>
        <DropzoneDialog
          title="Upload files"
          submitButtonText={t("dialog.submit")}
          cancelButtonText={t("dialog.cancel")}
          dropzoneText="Drag and drop your files here, or click to select them."
          open={open}
          onSave={this.handleSave}
          acceptedFiles={[]}
          filesLimit={100}
          maxFileSize={2000000000} /* 2gb */
          showPreviews={true}
          onClose={this.handleClose}
        />
        <UploadProgressDialog
          onClose={this.handleUploadCancel}
          open={uploading}
          progress={uploadProgress}
        />
      </div>
    );
  }
}

FileUploadDialog.propTypes = {
  classes: PropTypes.object.isRequired
};

FileUploadDialog = withStyles(styles)(FileUploadDialog);
FileUploadDialog = withTranslation("image_upload_dialog")(FileUploadDialog);

export default FileUploadDialog;
