import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import axios from "axios";
import React from "react";
import { withNamespaces } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import cookie from "js-cookie";

class ModalContactEmail extends React.Component {
  state = {
    email: "",
    errorMsg: "",
    successMsg: "",
    submitting: false,
    open: false
  };

  componentDidMount() {
    if (!cookie.get('ask_email') && !cookie.get("token")) {
        this.setState({open: true});
    }
  }

  handleEmailChange = event => {
    this.setState({ email: event.target.value });
  };

  handleEnter = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
      submitting: false
    });
  };

  handleClose = () => {
    this.setState({ open: false });
  };

  handleSubmit = async () => {
    const { t, token } = this.props;
    const { email } = this.state;

    const errorMsg = t("new.consult.error_msg", {
      contactLink: "contact@dymaxionlabs.com"
    });

    this.setState({
      errorMsg: "",
      successMsg: "",
      submitting: true
    });

    if (email === "") {
      this.setState({
        errorMsg: errorMsg,
        successMsg: "",
        submitting: false
      });
      return;
    }

    try {
      await axios.post(buildApiUrl("/api_beta/"), {
        email: email,
        landing: 'api-beta'
      });

      this.setState({
        successMsg: t("new.consult.success_msg"),
        email: ""
      });

      cookie.set('ask_email', true, {expires: 365 });

      setTimeout(() => {
        this.setState({
          successMsg: "",
          errorMsg: ""
        });
        this.handleClose();
      }, 3000);
    } catch (error) {
      const response = error.response;
      console.error(response);
      this.setState({
        errorMsg: errorMsg,
        submitting: false,
        successMsg: ""
      });
    }
  };

  render() {
    const { t } = this.props;
    const { submitting, open } = this.state;

    return (
      <Dialog
        onEnter={this.handleEnter}
        onClose={this.handleClose}
        open={open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>{t("title_subscribe")}</DialogTitle>
        <DialogContent>
          <Typography style={{ color: "red" }} variant="body1">
            {this.state.errorMsg}
          </Typography>
          <Typography style={{ color: "green" }} variant="body1">
            {this.state.successMsg}
          </Typography>
          <Typography variant="body1">
            {t("leave_email")}
          </Typography>
          <TextField
            label={t("new.consult.message_label")}
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            onChange={this.handleEmailChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={this.handleClose}>
            {t("new.consult.cancel_btn")}
          </Button>
          <Button
            color="primary"
            onClick={this.handleSubmit}
            disabled={submitting}
          >
            {t("new.consult.send_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ModalContactEmail = withNamespaces("testdrive")(ModalContactEmail);

export default ModalContactEmail;
