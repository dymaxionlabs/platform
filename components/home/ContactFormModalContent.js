import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogTitle from "@material-ui/core/DialogTitle";
import { withStyles } from "@material-ui/core/styles";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import PropTypes from "prop-types";
import React from "react";
import { withNamespaces } from "../../i18n";
import { buildApiUrl } from "../../utils/api";

const styles = theme => ({
  container: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit
  },
  dense: {
    marginTop: 16
  },
  menu: {
    width: 200
  }
});

class ContactFormModalContent extends React.Component {
  state = {
    message: "",
    isSubmitting: false
  };

  handleMessageChange = event => {
    this.setState({ message: event.target.value });
  };

  handleOnEnter = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
      isSubmitting: true
    });
  };

  handleSubmit = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
      isSubmitting: true
    });

    if (this.state.message == "") {
      this.setState({
        errorMsg: this.props.t("error_msg"),
        successMsg: "",
        isSubmitting: false
      });
      return;
    }

    axios
      .get(buildApiUrl("/auth/user/"), {
        headers: { Authorization: this.props.datos.token }
      })
      .then(response => {
        axios
          .post(buildApiUrl("/contact/"), {
            email: response.data.email,
            username: response.data.username,
            message: "Mensaje desde /models/new: " + this.state.message
          })
          .then(() => {
            this.setState({
              successMsg: this.props.t("success_msg"),
              message: ""
            });
            setTimeout(() => {
              this.setState({
                successMsg: "",
                errorMsg: "",
                message: "",
                open: false
              });
              this.props.handleClose();
            }, 2000);
          })
          .catch(err => {
            const response = err.response;
            console.error(response);
            this.setState({
              errorMsg: this.props.t("error_sending"),
              isSubmitting: false,
              successMsg: ""
            });
          });
      });
  };
  render() {
    const { classes, t } = this.props;

    return (
      <Dialog
        onEnter={this.handleOnEnter}
        open={this.props.open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">{t("title_consult")}</DialogTitle>

        <Typography style={{ color: "red" }} variant="subtitle1" align="center">
          {this.state.errorMsg}
        </Typography>
        <Typography
          style={{ color: "green" }}
          variant="subtitle1"
          align="center"
        >
          {this.state.successMsg}
        </Typography>

        <TextField
          align="center"
          id="filled-multiline-static"
          label={t("label_msg")}
          multiline
          rows="4"
          className={classes.textField}
          margin="normal"
          variant="filled"
          onChange={this.handleMessageChange}
        />
        <DialogActions>
          <Button onClick={this.props.handleClose} color="primary">
            {t("cancel_btn")}
          </Button>
          <Button onClick={this.handleSubmit} color="primary">
            {t("send_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}
ContactFormModalContent.propTypes = {
  classes: PropTypes.object.isRequired
};
ContactFormModalContent = withNamespaces("models")(ContactFormModalContent);

export default withStyles(styles)(ContactFormModalContent);
