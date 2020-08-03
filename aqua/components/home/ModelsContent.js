import {
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import EditIcon from "@material-ui/icons/Edit";
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
import { routerPush } from "../../utils/router";
import ConfirmationDialog from "../ConfirmationDialog";
import ShowUuidDialog from "../ShowUuidDialog";

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
  modelBtn: {
    float: "right",
  },
  chip: {
    marginRight: theme.spacing(1),
  },
});

class ModelsContent extends React.Component {
  state = {
    loading: true,
    models: [],
    contextualMenuOpen: null,
    showUuidDialogOpen: false,
    deleteDialogOpen: false,
    currentModel: null,
  };

  async getModels() {
    const projectId = cookie.get("project");

    try {
      const response = await axios.get(buildApiUrl("/estimators/"), {
        params: { project: projectId },
        headers: { Authorization: this.props.token },
      });
      this.setState({
        models: response.data.results,
        deleteDialogOpen: false,
      });
    } catch (err) {
      const response = err.response;
      if (response && response.status === 401) {
        logout();
      } else {
        console.error(response);
        this.props.enqueueSnackbar("Failed to get models", {
          variant: "error",
        });
      }
    }
  }

  async componentDidMount() {
    await this.getModels();
    this.setState({ loading: false });
  }

  estimatorTypeName(model) {
    const { t } = this.props;
    return t(`models.types.${model.estimator_type}`);
  }

  handleContextualMenuClick = (event, model) => {
    this.setState({
      contextualMenuOpen: event.currentTarget,
      currentModel: model,
    });
  };

  handleContextualMenuClose = () => {
    this.setState({ contextualMenuOpen: null });
  };

  onDialogResult = () => {
    this.setState({
      showUuidDialogOpen: false,
      deleteDialogOpen: false,
    });
  };

  handleShowUUIDClick = () => {
    this.setState({
      showUuidDialogOpen: true,
      contextualMenuOpen: null,
    });
  };

  handleDeleteClick = () => {
    this.setState({
      deleteDialogOpen: true,
      contextualMenuOpen: null,
    });
  };

  onDeleteDialogClose = () => {
    this.setState({
      deleteDialogOpen: false,
    });
  };

  onDeleteDialogConfirm = async () => {
    const { currentModel } = this.state;

    try {
      await axios.delete(buildApiUrl(`/estimators/${currentModel.uuid}`), {
        headers: { Authorization: this.props.token },
      });
      this.props.enqueueSnackbar(`Model deleted`, {
        variant: "success",
      });
      this.getModels();
    } catch (error) {
      console.error(error);
      this.props.enqueueSnackbar(
        `Failed to delete model: ${JSON.stringify(error)}`,
        {
          variant: "error",
        }
      );
    }

    this.setState({
      deleteDialogOpen: false,
    });
  };

  estimatorAddImages = (model) => {
    routerPush(`/models/new/od/upload?id=${model.uuid}`);
  };

  estimatorAddAnnotations = (model) => {
    routerPush(`/models/new/od/annotate?id=${model.uuid}`);
  };

  render() {
    const { t, classes } = this.props;
    const {
      loading,
      models,
      contextualMenuOpen,
      showUuidDialogOpen,
      currentModel,
      deleteDialogOpen,
    } = this.state;

    const locale = i18n.language;

    return (
      <div>
        <Typography variant="h6" gutterBottom component="h2">
          {t("models.title")}
        </Typography>
        <Paper className={classes.root}>
          <Table className={classes.table}>
            <TableHead>
              <TableRow>
                <TableCell>{t("models.name")}</TableCell>
                <TableCell>{t("models.estimator_type")}</TableCell>
                <TableCell>{t("models.classes")}</TableCell>
                <TableCell>{t("models.created_at")}</TableCell>
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && <TableRowSkeleton cols={4} />}
              {!loading && models.length === 0 && (
                <TableRow>
                  <TableCell>There are no models.</TableCell>
                </TableRow>
              )}
              {models.map((model) => (
                <TableRow key={model.uuid}>
                  <TableCell component="th" scope="row">
                    {model.name}
                  </TableCell>
                  <TableCell>{this.estimatorTypeName(model)}</TableCell>
                  <TableCell>
                    {model.classes.map((cls) => (
                      <Chip className={classes.chip} key={cls} label={cls} />
                    ))}
                  </TableCell>
                  <TableCell>
                    <Moment locale={locale} fromNow>
                      {model.created_at}
                    </Moment>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      className={classes.button}
                      aria-label="Edit"
                      aria-controls="simple-menu"
                      aria-haspopup="true"
                      onClick={(e) => this.handleContextualMenuClick(e, model)}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>
        <Menu
          id="edit-estimator-menu"
          anchorEl={contextualMenuOpen}
          keepMounted
          open={Boolean(contextualMenuOpen)}
          onClose={this.handleContextualMenuClose}
        >
          <MenuItem onClick={this.handleShowUUIDClick}>
            {t("models.uuid")}
          </MenuItem>
          <MenuItem onClick={this.handleDeleteClick}>
            {t("models.delete_models")}
          </MenuItem>
        </Menu>
        <ShowUuidDialog
          onClose={this.onDialogResult}
          open={showUuidDialogOpen}
          title={"UUID"}
          content={currentModel && currentModel.uuid}
        />
        <ConfirmationDialog
          onClose={this.onDeleteDialogClose}
          onConfirm={this.onDeleteDialogConfirm}
          open={deleteDialogOpen}
          title={t("models.title_delete")}
          content={
            <div>
              <Typography variant="body1">{t("models.text_delete")}</Typography>
              <Typography variant="body1">
                <strong>{t("models.text_delete_warning")}</strong>
              </Typography>
            </div>
          }
        />
      </div>
    );
  }
}

ModelsContent.propTypes = {
  classes: PropTypes.object.isRequired,
};

ModelsContent = withStyles(styles)(ModelsContent);
ModelsContent = withTranslation("me")(ModelsContent);
ModelsContent = withSnackbar(ModelsContent);

export default ModelsContent;
