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
import CloseIcon from "@material-ui/icons/Close";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import axios from "axios";
import cookie from "js-cookie";
import { withSnackbar } from "notistack";
import PropTypes from "prop-types";
import React from "react";
import Moment from "react-moment";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { i18n, withTranslation } from "../../i18n";
import { buildApiUrl } from "../../utils/api";
import { logout } from "../../utils/auth";
import FileDownload from "../../utils/file-download";

const styles = (theme) => ({
  root: {
    width: "100%",
    overflowX: "auto",
  },
  table: {
    minWidth: 700,
  },
  title: {
    marginBottom: theme.spacing.units * 10,
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

class FilesContent extends React.Component {
  state = {
    loading: true,
    files: [],
    notImplementedOpen: false,
    showFileDialogOpen: false,
    beta: false,
  };

  async componentDidMount() {
    await this.getFiles();
    await this.getBetaFlag();

    this.setState({ loading: false });
  }

  async getFiles() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/storage/files/"), {
        params: { project: projectId, path: "*" },
        headers: { Authorization: this.props.token },
      });
      if (response.status == 200) {
        this.setState({ files: response.data });
      }
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get files", {
          variant: "error",
        });
      }
    }
  }

  async getBetaFlag() {
    const { token } = this.props;
    try {
      const response = await axios.get(buildApiUrl("/auth/user/"), {
        headers: {
          "Accept-Language": i18n.language,
          Authorization: token,
        },
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

  handleFileURL = (file) => {
    const projectId = cookie.get("project");
    axios
      .get(buildApiUrl(`/storage/download/`), {
        params: { project: projectId, path: file.path },
        headers: { Authorization: this.props.token },
        responseType: "blob",
      })
      .then((response) => {
        FileDownload(response.data, file.name);
        this.props.enqueueSnackbar(
          "Preparing download. Please wait a few seconds..."
        );
      });
  };

  onDialogResult = async (action) => {
    this.setState({
      showFileDialogOpen: false,
    });
    this.componentDidMount();
  };

  UploadImages = () => {
    this.setState({
      showFileDialogOpen: true,
    });
  };

  render() {
    const { t, classes } = this.props;
    const { loading, files, notImplementedOpen } = this.state;

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
              {loading && <TableRowSkeleton cols={2} />}
              {!loading && files.length === 0 && (
                <TableRow>
                  <TableCell>There are no files in storage.</TableCell>
                </TableRow>
              )}
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
  classes: PropTypes.object.isRequired,
};

FilesContent = withStyles(styles)(FilesContent);
FilesContent = withTranslation("me")(FilesContent);
FilesContent = withSnackbar(FilesContent);

export default FilesContent;
