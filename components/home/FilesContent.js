import React from "react";
import PropTypes from "prop-types";

import { withStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import IconButton from "@material-ui/core/IconButton";
import Snackbar from "@material-ui/core/Snackbar";
import Tooltip from "@material-ui/core/Tooltip";

import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import CloseIcon from "@material-ui/icons/Close";

import { i18n, withNamespaces } from "../../i18n";
import { logout } from "../../utils/auth";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import Moment from "react-moment";
import cookie from "js-cookie";
import FileDownload from "../../utils/file-download";

const styles = theme => ({
  root: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  },
  title: {
    marginBottom: theme.spacing.units * 10
  }
});

class NotImplementedSnackbar extends React.Component {
  render() {
    const { classes, open, onClose } = this.props;

    return (
      <Snackbar
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right"
        }}
        open={open}
        autoHideDuration={2000}
        onClose={onClose}
        ContentProps={{
          "aria-describedby": "message-id"
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
          </IconButton>
        ]}
      />
    );
  }
}

NotImplementedSnackbar = withStyles(styles)(NotImplementedSnackbar);

class FilesContent extends React.Component {
  state = {
    files: [],
    notImplementedOpen: false,
    showFileDialogOpen: false,
    beta: false
  };

  componentDidMount() {
    const projectId = cookie.get("project");

    axios
      .get(buildApiUrl("/files/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token }
      })
      .then(response => {
        this.setState({ files: response.data.results });
      })
      .catch(err => {
        const response = err.response;
        if (response && response.status === 401) {
          logout();
        } else {
          console.error(response);
        }
      });

    this.getBetaFlag();
  }

  async getBetaFlag() {
    const { token } = this.props;
    try {
      const response = await axios.get(buildApiUrl("/auth/user/"), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token
        }
      });
      const userData = response.data;
      this.setState({ beta: userData.profile.beta });
    } catch (error) {
      console.error(error);
    }
  }

  handleNotImplementedClose = () => {
    this.setState({ notImplementedOpen: false });
  };

  handleFileURL = file => {
    const projectId = cookie.get("project");
    axios
      .get(buildApiUrl(`/files/download/${file.name}`), {
        params: { project: projectId },
        headers: { Authorization: this.props.token }
      })
      .then(response => {
        FileDownload(response.data, file.name);
      });
  };

  onDialogResult = async action => {
    this.setState({
      showFileDialogOpen: false
    });
    this.componentDidMount();
  };

  UploadImages = () => {
    this.setState({
      showFileDialogOpen: true
    });
  };

  render() {
    const { t, classes } = this.props;
    const { files, notImplementedOpen } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography
          className={classes.title}
          variant="h4"
          gutterBottom
          component="h2"
        >
          {t("files.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("files.created_at")}</TableCell>
                <TableCell>{t("files.name")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {files.map((file, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {file.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell component="th" scope="row">
                    {file.name}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title={t("download")}>
                      <IconButton
                        onClick={() => this.handleFileURL(file)}
                        className={classes.button}
                        aria-label={t("download")}
                      >
                        <CloudDownloadIcon />
                      </IconButton>
                    </Tooltip>
                    {/* <Tooltip title={t("delete")}>
                      <IconButton
                        className={classes.button}
                        aria-label={t("delete")}
                        onClick={() => this.handleDeleteClick(layer)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip> */}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <NotImplementedSnackbar
          open={notImplementedOpen}
          onClose={this.handleNotImplementedClose}
        />
      </div>
    );
  }
}

FilesContent.propTypes = {
  classes: PropTypes.object.isRequired
};

FilesContent = withStyles(styles)(FilesContent);
FilesContent = withNamespaces("me")(FilesContent);

export default FilesContent;
