import {
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import BlockIcon from "@material-ui/icons/Block";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import cookie from "js-cookie";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import ConfirmationDialog from "../ConfirmationDialog";
import NewKeyDialogForm from "../NewKeyDialog";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  table: {
    minWidth: 700,
  },
  btnRight: {
    float: "right",
  },
});

class NotImplementedSnackbar extends React.Component {
  render() {
    const { classes, open, onClose } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        open={open}
        autoHideDuration={2000}
        onClose={onClose}
        ContentProps={{
          "aria-describedby": "message-id",
        }}
        message={<span id="message-id">Disponible pronto</span>}
        action={[
          <IconButton
            key="close"
            aria-label="Close"
            color="inherit"
            className={classes.close}
            onClick={onClose}
          >
            <CloseIcon />
          </IconButton>,
        ]}
      />
    );
  }
}

NotImplementedSnackbar = withStyles(styles)(NotImplementedSnackbar);

class KeysContent extends React.Component {
  state = {
    loading: true,
    keys: [],
    openConfirmationDialog: false,
    keyToRevoke: null,
  };

  componentDidMount() {
    this.getApiKeys();
  }

  getApiKeys = async () => {
    const project = cookie.get("project");

    this.setState({ loading: true });
    try {
      const response = await axios.get(buildApiUrl(`/api_keys/`), {
        params: { project },
        headers: { Authorization: this.props.token },
      });

      this.setState({ keys: response.data });
    } catch (err) {
      console.error(err);
      this.props.enqueueSnackbar("Failed to get keys", {
        variant: "error",
      });
    }
    this.setState({ loading: false });
  };

  revoke = (prefix) => {
    this.setState({
      keyToRevoke: prefix,
      openConfirmationDialog: true,
    });
  };

  onCloseDialog = () => {
    this.setState({
      keyToRevoke: null,
      openConfirmationDialog: false,
    });
  };

  onConfirmDialog = async () => {
    const { keyToRevoke } = this.state;
    this.onCloseDialog()
    await axios.patch(
      buildApiUrl(`/api_keys/${keyToRevoke}`),
      { revoked: true },
      { headers: { Authorization: this.props.token } }
    );
    this.getApiKeys();
  }

  render() {
    const { t, classes, token } = this.props;
    const { loading, keys, openConfirmationDialog } = this.state;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          <NewKeyDialogForm
            token={token}
            created={this.getApiKeys}
          ></NewKeyDialogForm>
          {t("keys.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("keys.name")}</TableCell>
                <TableCell>{t("keys.prefix")}</TableCell>
                <TableCell>{t("keys.state")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowSkeleton cols={3} />}
              {!loading && keys.length === 0 && (
                <TableRow>
                  <TableCell>There are no API keys defined.</TableCell>
                </TableRow>
              )}
              {keys.map((key, i) => (
                <TableRow key={i}>
                  <TableCell component="th" scope="row">
                    {key.name}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {key.prefix}
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {!key.revoked && t("keys.active")}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("keys.revoke")}>
                      <IconButton
                        onClick={() => {
                          this.revoke(key.prefix);
                        }}
                        className={classes.button}
                        aria-label={t("keys.revoke")}
                      >
                        <BlockIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <ConfirmationDialog
          onClose={this.onCloseDialog}
          onConfirm={this.onConfirmDialog}
          open={openConfirmationDialog}
          title={t("keys.confirmTitle")}
          content={t("keys.confirmContent")}
        />
      </div>
    );
  }
}

KeysContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

KeysContent = withStyles(styles)(KeysContent);
KeysContent = withTranslation("me")(KeysContent);
KeysContent = withSnackbar(KeysContent);

export default KeysContent;
