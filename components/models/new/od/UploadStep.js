import Button from "@material-ui/core/Button";
import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import cookie from "js-cookie";
import React from "react";
import { i18n, withNamespaces } from "../../../../i18n";
import { buildApiUrl } from "../../../../utils/api";
import { routerPush } from "../../../../utils/router";
import DropzoneArea from "../../../upload/DropzoneArea";

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
    name: "",
    classes: [],
    isSubmitting: false
  };

  handleSubmit = event => {
    event.preventDefault();

    const project = cookie.get("project");
    const { t, token } = this.props;
    const { name, classes } = this.state;

    const dataSend = {
      project: project,
      estimator_type: "OD",
      name: name,
      classes: classes
    };

    // Reset messages
    this.setState({
      errorMsg: "",
      isSubmitting: true
    });

    axios
      .post(buildApiUrl("/estimators/"), dataSend, {
        headers: {
          Authorization: token,
          "Accept-Language": i18n.language
        }
      })
      .then(response => {
        routerPush("/models/new/od/upload");
      })
      .catch(error => {
        console.error(error);
        this.setState({
          //errorMsg: t("upload_step.error_msg", { message: error }),
          errorMsg: JSON.stringify(
            error.response && error.response.data.detail
          ),
          isSubmitting: false
        });
      });
  };

  handleNameChange = e => {
    this.setState({ name: e.target.value });
  };

  handleChangeClasses = chips => {
    this.setState({ classes: chips });
  };

  render() {
    const { classes, t } = this.props;
    const { isSubmitting } = this.state;

    return (
      <>
        <Typography className={classes.header} component="h1" variant="h5">
          {t("upload_step.title")}
        </Typography>
        <DropzoneArea
          dropzoneText={t("upload_step.dropzone")}
          filesLimit={10}
          showPreviews={false}
          maxFileSize={2000000000} /* 2gb */
        />
        <Button color="primary" onClick={this.handleSubmit}>
          {t("upload_step.submit_btn")}
        </Button>
        {isSubmitting && (
          <LinearProgress variant="determinate" value={progress} />
        )}
      </>
    );
  }
}

UploadStep = withStyles(styles)(UploadStep);
UploadStep = withNamespaces("models")(UploadStep);

export default UploadStep;
