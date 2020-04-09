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
    submitting: false
  };

  handleEmailChange = event => {
    this.setState({ email: event.target.value });
  };

  onKeyDown = event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      event.stopPropagation();
      this.handleSubmit();
    }
  };

  handleEnter = () => {
    this.setState({
      errorMsg: "",
      successMsg: "",
      submitting: false
    });
  };

  handleSubmit = async () => {
    const { t } = this.props;
    const { email } = this.state;

    const errorMsg = t("subscribe.error_msg", {
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
      await axios.post(buildApiUrl("/subscribe/api_beta/"), {
        email: email
      });

      this.setState({
        successMsg: t("subscribe.success_msg"),
        email: ""
      });

      cookie.set("testdrive-subscribed", true, { expires: 365 });

      setTimeout(() => {
        this.setState({
          successMsg: "",
          errorMsg: ""
        });
        this.props.onClose();
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
    const { t, open, onClose } = this.props;
    const { submitting } = this.state;

    return (
      <Dialog
        onEnter={this.handleEnter}
        onClose={onClose}
        open={open}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle>{t("subscribe.title")}</DialogTitle>
        <DialogContent>
          <Typography style={{ color: "red" }} variant="body1">
            {this.state.errorMsg}
          </Typography>
          <Typography style={{ color: "green" }} variant="body1">
            {this.state.successMsg}
          </Typography>
          <Typography variant="body1">{t("subscribe.body")}</Typography>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Email Address"
            type="email"
            fullWidth
            onChange={this.handleEmailChange}
            onKeyDown={this.onKeyDown}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>{t("subscribe.cancel_btn")}</Button>
          <Button color="primary" disabled={submitting} type="submit">
            {t("subscribe.submit_btn")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ModalContactEmail = withNamespaces("testdrive")(ModalContactEmail);

export default ModalContactEmail;
