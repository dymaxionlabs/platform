import {
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import CloudDownloadIcon from "@material-ui/icons/CloudDownload";
import DeleteForeverIcon from "@material-ui/icons/DeleteForever";
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
import FileUploadDialog from '../../components/FileUploadDialog'
import ConfirmationDialog from "../ConfirmationDialog";

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
  fileUpload: {
    margin: theme.spacing(1)
  }
});

class FilesContent extends React.Component {
  state = {
    loading: true,
    files: [],
    filesBeingDeleted: [],
    fileToDelete: null,
    openDeleteConfirmationDialog: false,
  };

  async componentDidMount() {
    await this.getFiles();

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

  handleFileDownload = (file) => {
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

  handleFileDelete = async (file) => {
    this.setState({
      fileToDelete: file,
      openDeleteConfirmationDialog: true
    })
  }

  deleteFile = async (file) => {
    const projectId = cookie.get("project");
    this.setState((prevState) => ({
      filesBeingDeleted: [...prevState.filesBeingDeleted, file]
    }));
    try {
      await axios.delete(buildApiUrl(`/storage/file/`), {
        params: { project: projectId, path: file.path },
        headers: { Authorization: this.props.token },
      })
      this.setState((prevState) => ({ files: prevState.files.filter(f => f !== file) }))
      this.props.enqueueSnackbar(`File '${file.path}' deleted`, {
        variant: "success"
      });
    } catch (err) {
      console.error(err)
      this.props.enqueueSnackbar(`Failed to delete file '${file.path}'`, {
        variant: "error"
      });
    }
    this.setState((prevState) => ({
      filesBeingDeleted: prevState.filesBeingDeleted.filter(f => f !== file)
    }));
  }

  handleUploadDone = (newFiles) => {
    this.setState((prevState) => ({ files: [...prevState.files, ...newFiles] }))
  }

  handleCloseDeleteConfirmationDialog = () => {
    this.setState({
      fileToDelete: null,
      openDeleteConfirmationDialog: false
    })
  }

  handleConfirmDeleteConfirmationDialog = () => {
    const file = this.state.fileToDelete
    this.handleCloseDeleteConfirmationDialog()
    this.deleteFile(file)
  }

  render() {
    const { t, classes, token } = this.props;
    const { loading, filesBeingDeleted, files, openDeleteConfirmationDialog } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("files.title")}
        </Typography>
        <Paper className={classes.root}>
          <FileUploadDialog
            className={classes.fileUpload}
            token={token}
            onUploadDone={this.handleUploadDone} />
          <ConfirmationDialog
            onClose={this.handleCloseDeleteConfirmationDialog}
            onConfirm={this.handleConfirmDeleteConfirmationDialog}
            open={openDeleteConfirmationDialog}
            title="Delete file"
            content="Are you sure you want to delete this file? This process is *irreversible*."
          />
          <Table className={classes.table} size="small">
            <TableHead>
              <TableRow>
                <TableCell>{t("files.name")}</TableCell>
                <TableCell>{t("files.created_at")}</TableCell>
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
                  <TableCell component="th" scope="row">
                    {file.path}
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {file.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Delete">
                      <IconButton size="small"
                        onClick={() => this.handleFileDelete(file)}
                        className={classes.button}
                        disabled={filesBeingDeleted.includes(file)}
                        aria-label="Delete"
                      >
                        <DeleteForeverIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("download")}>
                      <IconButton size="small"
                        onClick={() => this.handleFileDownload(file)}
                        className={classes.button}
                        disabled={filesBeingDeleted.includes(file)}
                        aria-label={t("download")}
                      >
                        <CloudDownloadIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
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
