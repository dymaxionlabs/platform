import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@material-ui/core";
import PropTypes from "prop-types";
import React from "react";
import { withTranslation } from "../i18n";

class ConfirmationDialog extends React.Component {
  render() {
    const { open, onClose, onConfirm, title, content, t } = this.props;

    return (
      <Dialog
        maxWidth="xs"
        aria-labelledby="confirmation-dialog-title"
        open={open}
        onClose={onClose}
      >
        <DialogTitle id="confirmation-dialog-title">{title}</DialogTitle>
        <DialogContent>{content}</DialogContent>
        <DialogActions>
          <Button onClick={onClose} color="primary">
            {t("confirmation.cancel")}
          </Button>
          <Button onClick={onConfirm} color="primary">
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    );
  }
}

ConfirmationDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string.isRequired,
};

ConfirmationDialog = withTranslation("common")(ConfirmationDialog);

export default ConfirmationDialog;
