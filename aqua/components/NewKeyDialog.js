import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import cookie from "js-cookie";

import { withStyles } from "@material-ui/core/styles";
import { CopyToClipboard } from "react-copy-to-clipboard";

import { withTranslation } from "../i18n";
import { buildApiUrl } from "../utils/api";

import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@material-ui/core';

const styles = _theme => ({
  btnRight: {
    float: "right"
  }
});

class NewKeyDialogForm extends React.Component {
  state = {
    open: false,
    created: false,
    keyname: "",
    generated_apikey: ""
  };

  handleClickOpen = () => {
    this.setState({ open: true });
  };

  handleClose = () => {
    this.setState({ open: false, created: false, keyname: "" });
  };

  submit = async () => {
    const { keyname } = this.state;
    const project = cookie.get("project");

    try {
      await axios
        .post(
          buildApiUrl(`/api_keys/`),
          { name: keyname || "Default", project },
          { headers: { Authorization: this.props.token } }
        )
        .then(response => {
          let apikey = response.data.key;
          this.setState({
            generated_apikey: apikey,
            created: true
          });
          this.props.created();
        });
    } catch (err) {
      console.error(err);
    }
  };

  render() {
    const { open, created, generated_apikey } = this.state;
    const { t, classes } = this.props;
    return (
      <div className={classes.btnRight}>
        <Button onClick={this.handleClickOpen}>{t(`keys_new.button`)}</Button>
        <Dialog
          open={open}
          onClose={this.handleClose}
          aria-labelledby="form-dialog-title"
        >
          <DialogTitle id="form-dialog-title">
            {t(`keys_new.title`)}
          </DialogTitle>
          {!created ? (
            <DialogContent>
              <DialogContentText>{t(`keys_new.content`)}</DialogContentText>
              <TextField
                autoFocus
                margin="dense"
                id="name"
                label={t(`keys_new.label`)}
                type="text"
                fullWidth
                placeholder="Default"
                value={this.state.keyname}
                onChange={e => this.setState({ keyname: e.target.value })}
              />
            </DialogContent>
          ) : (
            <DialogContent>
              <DialogContentText>
                {t(`keys_new.content_result`)}
              </DialogContentText>
              <TextField
                InputProps={{
                  readOnly: true
                }}
                id="apikey"
                defaultValue={generated_apikey}
                fullWidth
                margin="normal"
                variant="outlined"
              />
            </DialogContent>
          )}
          <DialogActions>
            <Button onClick={this.handleClose} color="primary">
              {!created ? t(`keys_new.cancel`) : t(`keys_new.close`)}
            </Button>
            {!created ? (
              <Button onClick={this.submit} color="primary">
                {t(`keys_new.create`)}
              </Button>
            ) : (
              <CopyToClipboard text={generated_apikey}>
                <Button onClick={this.copy} color="primary">
                  {t(`keys_new.copy`)}
                </Button>
              </CopyToClipboard>
            )}
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

NewKeyDialogForm.propTypes = {
  classes: PropTypes.object.isRequired
};

NewKeyDialogForm = withStyles(styles)(NewKeyDialogForm);
NewKeyDialogForm = withTranslation("me")(NewKeyDialogForm);

export default NewKeyDialogForm;
